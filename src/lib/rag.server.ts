/**
 * DocMind AI - Retrieval-Augmented Generation
 *
 * Server-only RAG pipeline:
 * PDF text → chunks → Gemini embeddings → Supabase pgvector
 * → semantic retrieval → Gemini answer.
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
    embedDocuments,
    embedQuery,
    generateAnswer,
} from "./gemini-rag";

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 200;
const EMBED_BATCH = 32;

export type PageText = {
    page: number;
    text: string;
};

export type Chunk = {
    page: number;
    index: number;
    content: string;
};

export type Source = {
    document: string;
    page: number;
    snippet: string;
};

export class RAGError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "RAGError";
        this.status = status;
    }
}

/**
 * Splits PDF text into overlapping chunks.
 */
export function chunkPages(pages: PageText[]): Chunk[] {
    const chunks: Chunk[] = [];
    let index = 0;

    for (const { page, text } of pages) {
        const clean = text.replace(/\s+/g, " ").trim();

        if (clean.length < 30) {
            continue;
        }

        let cursor = 0;

        while (cursor < clean.length) {
            let end = Math.min(cursor + CHUNK_SIZE, clean.length);

            if (end < clean.length) {
                const boundary = clean.lastIndexOf(". ", end);

                if (boundary > cursor + CHUNK_SIZE * 0.5) {
                    end = boundary + 1;
                }
            }

            const content = clean.slice(cursor, end).trim();

            if (content.length > 30) {
                chunks.push({
                    page,
                    index: index++,
                    content,
                });
            }

            if (end >= clean.length) {
                break;
            }

            cursor = Math.max(end - CHUNK_OVERLAP, cursor + 1);
        }
    }

    return chunks;
}

/**
 * Generates embeddings in batches.
 */
async function embedTexts(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = [];

    for (let i = 0; i < texts.length; i += EMBED_BATCH) {
        const batch = texts.slice(i, i + EMBED_BATCH);

        const batchVectors = await embedDocuments(batch);

        if (batchVectors.length !== batch.length) {
            throw new RAGError(
                500,
                "Gemini returned an unexpected number of embeddings.",
            );
        }

        for (const vector of batchVectors) {
            if (vector.length !== 1536) {
                throw new RAGError(
                    500,
                    `Invalid embedding dimension: expected 1536, received ${vector.length}.`,
                );
            }

            vectors.push(vector);
        }
    }

    return vectors;
}

/**
 * Ingests a PDF into the vector database.
 */
export async function ingest(params: {
    sessionId: string;
    name: string;
    sizeBytes: number;
    pages: PageText[];
}) {
    const chunks = chunkPages(params.pages);

    if (chunks.length === 0) {
        throw new RAGError(
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

    if (docError || !doc) {
        throw new RAGError(
            500,
            docError?.message ?? "Could not save the document.",
        );
    }

    try {
        const vectors = await embedTexts(chunks.map((chunk) => chunk.content));

        const rows = chunks.map((chunk, index) => ({
            document_id: doc.id,
            session_id: params.sessionId,
            content: chunk.content,
            page: chunk.page,
            chunk_index: chunk.index,

            // Supabase pgvector accepts the vector as an array/string representation.
            embedding: JSON.stringify(vectors[index]),
        }));

        for (let i = 0; i < rows.length; i += 100) {
            const { error } = await supabaseAdmin
                .from("chunks")
                .insert(rows.slice(i, i + 100));

            if (error) {
                throw new RAGError(500, error.message);
            }
        }

        const { error: updateError } = await supabaseAdmin
            .from("documents")
            .update({
                status: "ready",
            })
            .eq("id", doc.id);

        if (updateError) {
            throw new RAGError(500, updateError.message);
        }
    } catch (error) {
        await supabaseAdmin
            .from("documents")
            .delete()
            .eq("id", doc.id);

        throw error;
    }

    return {
        id: doc.id,
        chunkCount: chunks.length,
        pageCount: params.pages.length,
    };
}

/**
 * Answers a question using semantic retrieval + Gemini.
 */
export async function answer(params: {
    sessionId: string;
    question: string;
}) {
    const queryVector = await embedQuery(params.question);

    const { data: matches, error } = await supabaseAdmin.rpc(
        "match_chunks",
        {
            query_embedding: JSON.stringify(queryVector),
            p_session_id: params.sessionId,
            p_document_ids: null,
            match_count: 6,
        },
    );

    if (error) {
        throw new RAGError(500, error.message);
    }

    const hits = matches ?? [];

    if (hits.length === 0) {
        return {
            content:
                "I couldn't find anything relevant in your documents. Try rephrasing the question, or upload a PDF that covers this topic.",
            sources: [] as Source[],
        };
    }

    const documentIds = [
        ...new Set(hits.map((hit) => hit.document_id)),
    ];

    const { data: documents, error: documentsError } = await supabaseAdmin
        .from("documents")
        .select("id, name")
        .in("id", documentIds);

    if (documentsError) {
        throw new RAGError(500, documentsError.message);
    }

    const nameById = new Map(
        (documents ?? []).map((document) => [
            document.id,
            document.name,
        ]),
    );

    const context = hits
        .map(
            (hit, index) =>
                `[${index + 1}] ${nameById.get(hit.document_id) ?? "Document"
                } — page ${hit.page}\n${hit.content}`,
        )
        .join("\n\n---\n\n");

    const { data: history, error: historyError } = await supabaseAdmin
        .from("messages")
        .select("role, content")
        .eq("session_id", params.sessionId)
        .order("created_at", {
            ascending: false,
        })
        .limit(8);

    if (historyError) {
        throw new RAGError(500, historyError.message);
    }

    const priorTurns = (history ?? [])
        .reverse()
        .map((message) => ({
            role:
                message.role === "user"
                    ? ("user" as const)
                    : ("model" as const),
            content: message.content,
        }));

  const systemInstruction =
  "You are DocMind AI, a precise and helpful document analyst. " +
  "Use the provided document excerpts as your primary and only factual source. " +
  "Answer the user's question naturally, including paraphrased questions and questions asking about meaning, importance, purpose, implications, or summaries. " +
  "Cite factual statements supported by the excerpts with bracketed numbers such as [1] or [2]. " +
  "You may make reasonable inferences only when they follow directly from information explicitly stated in the document. " +
  "Clearly label an inference when it goes beyond what the document explicitly states. " +
  "Do not infer facts from the PDF filename, file name, URL, metadata, or assumptions about an organization, company, person, course, certification, or institution unless that information is explicitly present in the document excerpts. " +
  "Do not invent names, dates, scores, qualifications, organizations, relationships, purposes, or events. " +
  "Avoid strong claims such as 'official proof', 'guarantees', 'authenticates', 'proves identity', or 'prevents fraud' unless the document explicitly supports that claim. " +
  "If the document does not provide enough information to establish something, say that it cannot be determined from the provided document. " +
  "For questions about why a document or piece of information may be important, explain its significance using the information supported by the document and distinguish factual evidence from inference. " +
  "Do not refuse a question merely because the document does not contain the exact wording of the answer. " +
  "Use concise markdown with short paragraphs and bullet lists where helpful.";
    const conversation = [
        ...priorTurns,
        {
            role: "user" as const,
            content: `Document excerpts:

${context}

Question: ${params.question}`,
        },
    ];

    const content = await generateAnswer(
        systemInstruction,
        conversation,
    );

    const sources: Source[] = hits.map((hit) => ({
        document:
            nameById.get(hit.document_id) ?? "Document",
        page: hit.page,
        snippet: hit.content.slice(0, 260),
    }));

    return {
        content,
        sources,
    };
}