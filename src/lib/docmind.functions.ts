/**
 * Typed RPC boundary between the DocMind AI browser client and the server.
 * Every handler is scoped to the caller's anonymous workspace session id.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const sessionSchema = z.string().uuid();

const IngestInput = z.object({
  sessionId: sessionSchema,
  name: z.string().min(1).max(300),
  sizeBytes: z.number().int().min(0),
  pages: z
    .array(
      z.object({
        page: z.number().int().min(1),
        text: z.string(),
      }),
    )
    .min(1)
    .max(400),
});

const AskInput = z.object({
  sessionId: sessionSchema,
  question: z.string().min(1).max(2000),
});

export const ingestDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => IngestInput.parse(data))
  .handler(async ({ data }) => {
    const { ingest, RAGError } = await import("./rag.server");

    try {
      return {
        ok: true as const,
        ...(await ingest(data)),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Indexing failed.";

      console.error("[docmind] ingest failed", message);

      return {
        ok: false as const,
        error: message,
        status: error instanceof RAGError ? error.status : 500,
      };
    }
  });

export const listDocuments = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ sessionId: sessionSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { data: docs, error } = await supabaseAdmin
      .from("documents")
      .select(
        "id, name, size_bytes, page_count, chunk_count, created_at",
      )
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "[docmind] listDocuments failed",
        error.message,
      );

      return [];
    }

    return docs ?? [];
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        sessionId: sessionSchema,
        documentId: z.string().uuid(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", data.documentId)
      .eq("session_id", data.sessionId);

    if (error) {
      return {
        ok: false as const,
        error: error.message,
      };
    }

    return {
      ok: true as const,
    };
  });

export const listMessages = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ sessionId: sessionSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin
      .from("messages")
      .select("id, role, content, sources, created_at")
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(
        "[docmind] listMessages failed",
        error.message,
      );

      return [];
    }

    return rows ?? [];
  });

export const clearChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ sessionId: sessionSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    await supabaseAdmin
      .from("messages")
      .delete()
      .eq("session_id", data.sessionId);

    return {
      ok: true as const,
    };
  });

export const askQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => AskInput.parse(data))
  .handler(async ({ data }) => {
    const { answer, RAGError } = await import("./rag.server");

    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("documents")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("session_id", data.sessionId);

    if (!count) {
      return {
        ok: false as const,
        error:
          "Upload a PDF first — there is nothing to search yet.",
        status: 400,
      };
    }

    try {
      const result = await answer(data);

      const { error: userError } = await supabaseAdmin
        .from("messages")
        .insert({
          session_id: data.sessionId,
          role: "user",
          content: data.question,
        });

      if (userError) {
        console.error(
          "[docmind] saving user message failed",
          userError.message,
        );
      }

      const { error: aiError } = await supabaseAdmin
        .from("messages")
        .insert({
          session_id: data.sessionId,
          role: "assistant",
          content: result.content,
          sources: result.sources,
        });

      if (aiError) {
        console.error(
          "[docmind] saving assistant message failed",
          aiError.message,
        );
      }

      return {
        ok: true as const,
        ...result,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The assistant could not answer.";

      console.error("[docmind] ask failed", message);

      return {
        ok: false as const,
        error: message,
        status: error instanceof RAGError ? error.status : 500,
      };
    }
  });