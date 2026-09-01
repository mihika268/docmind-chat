/**
 * Server-only model access for DocMind AI.
 *
 * Runtime notes:
 * - This code runs inside a serverless Worker runtime, so we use plain `fetch`
 *   instead of a Node-oriented SDK (the SDK's Node transport is what surfaced
 *   as the opaque "TypeError: fetch failed" in production).
 * - Every credential is read INSIDE the functions, never at module scope,
 *   because env is injected per request in production.
 */

export const CHAT_MODEL = "google/gemini-3-flash";
export const EMBEDDING_MODEL = "google/gemini-embedding-001";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const EMBEDDING_DIMENSIONS = 1536;
const REQUEST_TIMEOUT_MS = 60_000;

export class ModelError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ModelError";
    this.status = status;
  }
}

function getApiKey(): string {
  const key =
    process.env["LOVABLE_API_KEY"] ?? process.env["GEMINI_API_KEY"];

  if (!key) {
    throw new ModelError(
      500,
      "The AI service is not configured on the server (missing API key). Add LOVABLE_API_KEY in Project Settings → Secrets.",
    );
  }

  return key;
}

/**
 * fetch with a timeout + human-readable network errors.
 */
async function callGateway(
  path: string,
  body: unknown,
): Promise<any> {
  const apiKey = getApiKey();
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response: Response;

  try {
    response = await fetch(`${GATEWAY_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "AbortError"
        ? "the request timed out"
        : error instanceof Error
          ? error.message
          : "unknown network error";

    console.error("[docmind] AI request failed", path, reason);

    throw new ModelError(
      503,
      `Could not reach the AI service (${reason}). Please try again in a moment.`,
    );
  } finally {
    clearTimeout(timer);
  }

  const raw = await response.text();

  if (!response.ok) {
    console.error(
      "[docmind] AI request rejected",
      path,
      response.status,
      raw.slice(0, 500),
    );

    if (response.status === 429) {
      throw new ModelError(
        429,
        "AI rate limit reached. Wait a few seconds and try again.",
      );
    }

    if (response.status === 402) {
      throw new ModelError(
        402,
        "AI credits are exhausted for this workspace. Add credits to continue.",
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new ModelError(
        500,
        "The AI service rejected the server credentials. Check the API key in Project Settings → Secrets.",
      );
    }

    throw new ModelError(
      502,
      `The AI service returned an error (HTTP ${response.status}).`,
    );
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new ModelError(
      502,
      "The AI service returned an unreadable response.",
    );
  }
}

async function embed(
  texts: string[],
): Promise<number[][]> {
  const payload = await callGateway("/embeddings", {
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  const rows: { index?: number; embedding?: number[] }[] =
    payload?.data ?? [];

  if (rows.length !== texts.length) {
    throw new ModelError(
      502,
      `The embedding service returned ${rows.length} vectors for ${texts.length} chunks.`,
    );
  }

  const vectors = rows
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((row) => row.embedding ?? []);

  for (const vector of vectors) {
    if (vector.length !== EMBEDDING_DIMENSIONS) {
      throw new ModelError(
        502,
        `Invalid embedding dimension: expected ${EMBEDDING_DIMENSIONS}, received ${vector.length}.`,
      );
    }
  }

  return vectors;
}

/**
 * Generate embeddings for document chunks.
 */
export async function embedDocuments(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  return embed(texts);
}

/**
 * Generate an embedding for the user's question.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const cleanText = text.trim();

  if (!cleanText) {
    throw new ModelError(
      400,
      "Cannot create an embedding for an empty question.",
    );
  }

  const [vector] = await embed([cleanText]);

  if (!vector) {
    throw new ModelError(
      502,
      "The embedding service returned no vector for the question.",
    );
  }

  return vector;
}

/**
 * Generate an answer using the retrieved document context.
 */
export async function generateAnswer(
  systemInstruction: string,
  conversation: {
    role: "user" | "model";
    content: string;
  }[],
): Promise<string> {
  if (conversation.length === 0) {
    throw new ModelError(400, "No conversation provided.");
  }

  const payload = await callGateway("/chat/completions", {
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemInstruction },
      ...conversation.map((message) => ({
        role: message.role === "model" ? "assistant" : "user",
        content: message.content,
      })),
    ],
  });

  const answer: string | undefined =
    payload?.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new ModelError(
      502,
      "The AI service returned an empty answer.",
    );
  }

  return answer;
}
