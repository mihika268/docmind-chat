import { Link, createFileRoute } from "@tanstack/react-router";
import { FileText, MessageSquareText, Quote, ShieldCheck, Layers, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DocMind AI — Chat with your PDFs, grounded in citations" },
      {
        name: "description",
        content:
          "DocMind AI turns any PDF into a searchable knowledge base. Upload, index, and ask questions — every answer cites the page it came from.",
      },
      { property: "og:title", content: "DocMind AI — Chat with your PDFs" },
      {
        property: "og:description",
        content: "Retrieval-augmented document intelligence: upload a PDF, ask anything, get answers with page citations.",
      },
    ],
  }),
  component: Landing,
});

const PIPELINE = [
  { step: "01", title: "Extract", body: "Page-accurate text extraction runs in your browser — the file never leaves your device." },
  { step: "02", title: "Chunk", body: "Overlapping windows preserve context across paragraph and page boundaries." },
  { step: "03", title: "Embed", body: "Each chunk becomes a 1536-dimension vector in a cosine-indexed store." },
  { step: "04", title: "Retrieve", body: "Your question is embedded and matched against the closest passages." },
  { step: "05", title: "Answer", body: "A grounded model composes the reply and cites the page it used." },
];

const FEATURES = [
  { icon: Layers, title: "Multi-document memory", body: "Index several PDFs at once and query across all of them in a single conversation." },
  { icon: Quote, title: "Source citations", body: "Every answer ships with the exact passages and page numbers behind it." },
  { icon: ShieldCheck, title: "Private by design", body: "PDF bytes stay in the browser. Only extracted text is indexed, scoped to your session." },
  { icon: Zap, title: "Fast retrieval", body: "Vector similarity search with an HNSW index returns context in milliseconds." },
];

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <FileText className="size-5" strokeWidth={2.2} />
          </span>
          <span className="text-lg font-semibold tracking-tight">DocMind AI</span>
        </div>
        <Link
          to="/workspace"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-raised"
        >
          Open workspace
        </Link>
      </header>

      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
          <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Retrieval-augmented document intelligence
          </p>
          <h1 className="animate-rise mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            Stop scrolling PDFs. <span className="text-gradient">Ask them instead.</span>
          </h1>
          <p className="animate-rise mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            DocMind AI reads your documents, builds a semantic index of every passage, and answers your
            questions with the receipts — page numbers and quoted excerpts included.
          </p>
          <div className="animate-rise mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/workspace"
              className="shadow-glow inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <MessageSquareText className="size-4" />
              Upload a PDF and start chatting
            </Link>
            <span className="text-sm text-muted-foreground">No account required · 20 MB per file</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">The pipeline</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PIPELINE.map((item) => (
            <article key={item.step} className="glass-panel rounded-2xl p-5 transition-colors hover:border-primary/40">
              <span className="font-mono text-xs text-primary">{item.step}</span>
              <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article key={title} className="glass-panel shadow-panel rounded-2xl p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-surface-raised text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>DocMind AI — document intelligence portfolio project.</span>
          <Link to="/workspace" className="text-primary hover:underline">
            Launch the workspace →
          </Link>
        </div>
      </footer>
    </main>
  );
}
