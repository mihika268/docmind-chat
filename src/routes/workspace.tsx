import { useCallback, useEffect, useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUp, Download, FileText, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { MessageBubble, ThinkingIndicator, type ChatMessage, type Source } from "@/components/docmind/message";
import { UploadZone } from "@/components/docmind/upload-zone";
import { extractPdfText, formatBytes } from "@/lib/pdf";
import { getSessionId } from "@/lib/session";
import {
  askQuestion,
  clearChat,
  deleteDocument,
  ingestDocument,
  listDocuments,
  listMessages,
} from "@/lib/docmind.functions";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — DocMind AI" },
      { name: "description", content: "Upload PDFs, index them, and chat with your documents using cited answers." },
      { property: "og:title", content: "DocMind AI Workspace" },
      { property: "og:description", content: "Upload a PDF and ask questions with page-level citations." },
    ],
  }),
  component: Workspace,
});

type DocRow = {
  id: string;
  name: string;
  size_bytes: number;
  page_count: number;
  chunk_count: number;
};

const SUGGESTIONS = [
  "Summarise this document in five bullet points",
  "What are the key dates and deadlines?",
  "List every obligation or requirement mentioned",
];

function Workspace() {
  const [sessionId, setSessionId] = useState("");
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ label: string; value: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runIngest = useServerFn(ingestDocument);
  const runList = useServerFn(listDocuments);
  const runDelete = useServerFn(deleteDocument);
  const runAsk = useServerFn(askQuestion);
  const runHistory = useServerFn(listMessages);
  const runClear = useServerFn(clearChat);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    void (async () => {
      const [documents, history] = await Promise.all([
        runList({ data: { sessionId } }),
        runHistory({ data: { sessionId } }),
      ]);
      setDocs(documents as DocRow[]);
      setMessages(
        history.map((row) => ({
          id: row.id,
          role: row.role === "user" ? "user" : "assistant",
          content: row.content,
          sources: (row.sources ?? []) as Source[],
        })),
      );
    })();
  }, [sessionId, runList, runHistory]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (!thinking && !uploading) textareaRef.current?.focus();
  }, [thinking, uploading]);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!sessionId) return;
      setUploading(true);

      for (const file of files) {
        try {
          setProgress({ label: `Reading ${file.name}…`, value: 0.05 });
          const pages = await extractPdfText(file, (ratio) =>
            setProgress({ label: `Extracting text — page ${Math.round(ratio * 100)}%`, value: ratio * 0.6 }),
          );

          setProgress({ label: "Generating embeddings…", value: 0.75 });
          const result = await runIngest({
            data: { sessionId, name: file.name, sizeBytes: file.size, pages },
          });

          if (!result.ok) {
            toast.error(result.error);
            continue;
          }

          setProgress({ label: "Indexed", value: 1 });
          toast.success(`${file.name} indexed — ${result.chunkCount} passages across ${result.pageCount} pages.`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `Could not process ${file.name}.`);
        }
      }

      setDocs((await runList({ data: { sessionId } })) as DocRow[]);
      setProgress(null);
      setUploading(false);
    },
    [sessionId, runIngest, runList],
  );

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || thinking || !sessionId) return;

      setInput("");
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: trimmed, sources: [] },
      ]);
      setThinking(true);

      try {
        const result = await runAsk({ data: { sessionId, question: trimmed } });
        if (!result.ok) {
          toast.error(result.error);
          setMessages((prev) => prev.slice(0, -1));
          setInput(trimmed);
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.content,
            sources: result.sources,
            animate: true,
          },
        ]);
      } catch {
        toast.error("The assistant is unreachable right now. Please try again.");
        setMessages((prev) => prev.slice(0, -1));
        setInput(trimmed);
      } finally {
        setThinking(false);
      }
    },
    [sessionId, thinking, runAsk],
  );

  const removeDoc = useCallback(
    async (doc: DocRow) => {
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      const result = await runDelete({ data: { sessionId, documentId: doc.id } });
      if (!result.ok) toast.error("Could not delete that document.");
      else toast.success(`${doc.name} removed from the index.`);
    },
    [sessionId, runDelete],
  );

  const resetChat = useCallback(async () => {
    setMessages([]);
    await runClear({ data: { sessionId } });
  }, [sessionId, runClear]);

  const downloadTranscript = useCallback(() => {
    const body = messages
      .map((m) => {
        const head = m.role === "user" ? "You" : "DocMind AI";
        const cites = m.sources.map((s, i) => `  [${i + 1}] ${s.document}, page ${s.page}`).join("\n");
        return `${head}:\n${m.content}${cites ? `\n\nSources:\n${cites}` : ""}`;
      })
      .join("\n\n---\n\n");

    const url = URL.createObjectURL(new Blob([body], { type: "text/markdown" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `docmind-chat-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:overflow-hidden">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-4" strokeWidth={2.2} />
          </span>
          <span className="font-semibold tracking-tight">DocMind AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadTranscript}
            disabled={messages.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            type="button"
            onClick={resetChat}
            disabled={messages.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Clear chat</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <aside className="scroll-slim shrink-0 space-y-4 border-b border-border p-4 sm:p-6 lg:w-80 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <UploadZone busy={uploading} progress={progress} onFiles={handleFiles} onError={toast.error} />

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Indexed documents
            </h2>
            {docs.length === 0 ? (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Nothing indexed yet. Add a PDF to build your knowledge base.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {docs.map((doc) => (
                  <li
                    key={doc.id}
                    className="group flex items-start gap-2 rounded-xl border border-border bg-surface p-3"
                  >
                    <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" title={doc.name}>
                        {doc.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.7rem] text-muted-foreground">
                        {doc.page_count}p · {doc.chunk_count} chunks · {formatBytes(doc.size_bytes)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDoc(doc)}
                      aria-label={`Remove ${doc.name}`}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-raised hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className="flex flex-1 flex-col lg:min-h-0">
          <div ref={scrollRef} className="scroll-slim flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:min-h-0">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.length === 0 && !thinking ? (
                <div className="animate-rise pt-10 text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface text-primary shadow-glow">
                    <FileText className="size-6" />
                  </span>
                  <h1 className="mt-5 text-2xl font-semibold tracking-tight">Ask your documents anything</h1>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {docs.length === 0
                      ? "Upload a PDF on the left to build the vector index, then ask away."
                      : "Your index is ready. Try one of these to get started."}
                  </p>
                  {docs.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => send(s)}
                          className="rounded-full border border-border bg-surface px-3.5 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                messages.map((message) => <MessageBubble key={message.id} message={message} />)
              )}

              {thinking && <ThinkingIndicator label="Searching your documents…" />}
            </div>
          </div>

          <div className="border-t border-border px-4 py-4 sm:px-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-primary/60"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder={docs.length === 0 ? "Upload a PDF to begin…" : "Ask about your documents…"}
                className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                aria-label="Send question"
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              >
                {thinking ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
              </button>
            </form>
            <p className="mx-auto mt-2 max-w-3xl text-center text-[0.7rem] text-muted-foreground">
              Answers are generated from your uploaded documents and cite their source pages.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
