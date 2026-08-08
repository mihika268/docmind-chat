import { GoogleGenAI } from "@google/genai";

const apiKey = process.env["GEMINI_API_KEY"];

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing.");
}

export const gemini = new GoogleGenAI({
  apiKey,
});

export const CHAT_MODEL = "gemini-3.6-flash";
export const EMBEDDING_MODEL = "gemini-embedding-001";

const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate embeddings for document chunks.
 */
export async function embedDocuments(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const response = await gemini.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const embeddings = (response.embeddings ?? []).map(
    (embedding) => embedding.values ?? [],
  );

  for (const embedding of embeddings) {
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Gemini returned an invalid document embedding dimension. ` +
        `Expected ${EMBEDDING_DIMENSIONS}, received ${embedding.length}.`,
      );
    }
  }

  if (embeddings.length !== texts.length) {
    throw new Error(
      `Gemini returned ${embeddings.length} embeddings for ${texts.length} documents.`,
    );
  }

  return embeddings;
}

/**
 * Generate an embedding for the user's question.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const cleanText = text.trim();

  if (!cleanText) {
    throw new Error("Cannot create an embedding for an empty question.");
  }

  const response = await gemini.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: cleanText,
    config: {
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const values = response.embeddings?.[0]?.values;

  if (!values || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Gemini returned an invalid query embedding. ` +
      `Expected ${EMBEDDING_DIMENSIONS} dimensions.`,
    );
  }

  return values;
}

/**
 * Generate an answer using Gemini and the retrieved document context.
 */
export async function generateAnswer(
  systemInstruction: string,
  conversation: {
    role: "user" | "model";
    content: string;
  }[],
): Promise<string> {
  if (conversation.length === 0) {
    throw new Error("No conversation provided.");
  }

  const response = await gemini.models.generateContent({
    model: CHAT_MODEL,

    contents: conversation.map((message) => ({
      role: message.role,
      parts: [{ text: message.content }],
    })),

    config: {
      systemInstruction,
    },
  });

  const answer = response.text?.trim();

  if (!answer) {
    throw new Error("Gemini returned an empty response.");
  }

  return answer;
}