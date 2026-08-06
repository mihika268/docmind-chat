/**
 * DocMind AI - retrieval-augmented generation core (server only).
 *
 * Responsibilities:
 *  - chunk extracted PDF text into overlapping windows
 *  - generate embeddings through the Lovable AI Gateway
 *  - persist / query vectors in Postgres (pgvector)
 *  - build a grounded answer with citations
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const EMBEDDING_MODEL = "openai/text-embedding-3-small";
const CHAT_MODEL = "google/gemini-3.5-flash";

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 200;
const EMBED_BATCH = 64;

export type PageText = { page: number; text: string };
export type Chunk = { page: number; index: number; content: string };
export type Source = { document: string; page: number; snippet: string };

export class GatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function apiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new GatewayError(500, "AI is not configured for this project.");
  return key;
}

function friendlyGatewayError(status: number, body: string): GatewayError {
  if (status === 429) return new GatewayError(429, "Too many requests right now. Please retry in a moment.");
  if (status === 402) return new GatewayError(402, "AI credits are exhausted. Add credits to keep chatting.");
  return new GatewayError(status, `AI request failed (${status}). ${body.slice(0, 200)}`);
}

/** Split page text into overlapping character windows on sentence-ish boundaries. */
export function chunkPages(pages: PageText[]): Chunk[] {
  const chunks: Chunk[] = [];
  let index = 0;

  for (const { page, text } of pages) {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length < 30) continue;

    let cursor = 0;
    while (cursor < clean.length) {
      let end = Math.min(cursor + CHUNK_SIZE, clean.length);
      if (end < clean.length) {
        const boundary = clean.lastIndexOf(". ", end);
        if (boundary > cursor + CHUNK_SIZE * 0.5) end = boundary + 1;
      }
      const content = clean.slice(cursor, end).trim();
      if (content.length > 30) chunks.push({ page, index: index++, content });
      if (end >= clean.length) break;
      cursor = end - CHUNK_OVERLAP;
    }
  }

  return chunks;
}

async function embed(inputs: string[]): Promise<number[][]> {
  const vectors: number[][] = [];

  for (let i = 0; i < inputs.length; i += EMBED_BATCH) {
    const batch = inputs.slice(i, i + EMBED_BATCH);
    const res = await fetch(`${GATEWAY}/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey() },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: batch }),
    });

    if (!res.ok) throw friendlyGatewayError(res.status, await res.text());

    const json = (await res.json()) as { data: { index: number; embedding: number[] }[] };
    const ordered = [...json.data].sort((a, b) => a.index - b.index);
    for (const item of ordered) vectors.push(item.embedding);
  }

  return vectors;
}

export async function ingest(params: {
  sessionId: string;
  name: string;
  sizeBytes: number;
  pages: PageText[];
}) {
  const chunks = chunkPages(params.pages);
  if (chunks.length === 0) {
    throw new GatewayError(
      422,
      "No selectable text found in this PDF. Scanned documents need OCR before they can be indexed.",
    );
  }

  const { data: doc, error: docError } = await supabaseAdmin
    .from("documents")
    .insert({
      session_id: params.sessionId,
      name: params.name,
      size_bytes: params.sizeBytes,
      page_count: params.pages.length,
      chunk_count: chunks.length,
      status: "indexing",
    })
    .select("id")
    .single();

  if (docError || !doc) throw new Error(docError?.message ?? "Could not save the document.");

  try {
    const vectors = await embed(chunks.map((c) => c.content));

    const rows = chunks.map((chunk, i) => ({
      document_id: doc.id,
      session_id: params.sessionId,
      content: chunk.content,
      page: chunk.page,
      chunk_index: chunk.index,
      embedding: JSON.stringify(vectors[i]),
    }));

    for (let i = 0; i < rows.length; i += 100) {
      const { error } = await supabaseAdmin.from("chunks").insert(rows.slice(i, i + 100));
      if (error) throw new Error(error.message);
    }

    await supabaseAdmin.from("documents").update({ status: "ready" }).eq("id", doc.id);
  } catch (error) {
    await supabaseAdmin.from("documents").delete().eq("id", doc.id);
    throw error;
  }

  return { id: doc.id, chunkCount: chunks.length, pageCount: params.pages.length };
}

export async function answer(params: { sessionId: string; question: string }) {
  const [queryVector] = await embed([params.question]);

  const { data: matches, error } = await supabaseAdmin.rpc("match_chunks", {
    query_embedding: JSON.stringify(queryVector) as unknown as string,
    p_session_id: params.sessionId,
    p_document_ids: null as unknown as string[],
    match_count: 6,
  });

  if (error) throw new Error(error.message);

  const hits = matches ?? [];
  if (hits.length === 0) {
    return {
      content:
        "I couldn't find anything relevant in your documents. Try rephrasing the question, or upload a PDF that covers this topic.",
      sources: [] as Source[],
    };
  }

  const docIds = [...new Set(hits.map((h) => h.document_id))];
  const { data: docs } = await supabaseAdmin.from("documents").select("id, name").in("id", docIds);
  const nameById = new Map((docs ?? []).map((d) => [d.id, d.name]));

  const context = hits
    .map(
      (hit, i) =>
        `[${i + 1}] ${nameById.get(hit.document_id) ?? "Document"} — page ${hit.page}\n${hit.content}`,
    )
    .join("\n\n---\n\n");

  const { data: history } = await supabaseAdmin
    .from("messages")
    .select("role, content")
    .eq("session_id", params.sessionId)
    .order("created_at", { ascending: false })
    .limit(8);

  const priorTurns = (history ?? [])
    .reverse()
    .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey() },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are DocMind AI, a precise document analyst. Answer ONLY from the provided excerpts. " +
            "Cite the excerpts you use with bracketed numbers like [1] or [2]. " +
            "If the excerpts do not contain the answer, say so plainly instead of guessing. " +
            "Use concise markdown with short paragraphs and bullet lists where helpful.",
        },
        ...priorTurns,
        { role: "user", content: `Excerpts:\n\n${context}\n\nQuestion: ${params.question}` },
      ],
    }),
  });

  if (!res.ok) throw friendlyGatewayError(res.status, await res.text());

  const json = (await res.json()) as { choices: { message: { content: string } }[] };
  const content = json.choices?.[0]?.message?.content?.trim() || "I couldn't generate an answer.";

  const sources: Source[] = hits.map((hit) => ({
    document: nameById.get(hit.document_id) ?? "Document",
    page: hit.page,
    snippet: hit.content.slice(0, 260),
  }));

  return { content, sources };
}
