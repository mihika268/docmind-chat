import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, Quote } from "lucide-react";

export type Source = { document: string; page: number; snippet: string };
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: Source[];
  animate?: boolean;
};

function useTypewriter(text: string, enabled: boolean) {
  const [shown, setShown] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      return;
    }
    let i = 0;
    const step = Math.max(3, Math.ceil(text.length / 90));
    const timer = setInterval(() => {
      i += step;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [text, enabled]);

  return shown;
}


export function MessageBubble({ message }: { message: ChatMessage }) {
  const [showSources, setShowSources] = useState(false);
  const typed = useTypewriter(message.content, Boolean(message.animate));

  if (message.role === "user") {
    return (
      <div className="animate-rise flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground sm:max-w-[70%]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise space-y-3">
      <div className="md-body max-w-none text-[0.95rem] text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{typed}</ReactMarkdown>
      </div>

      {message.sources.length > 0 && (
        <div className="rounded-xl border border-border bg-surface">
          <button
            type="button"
            onClick={() => setShowSources((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <Quote className="size-3.5 text-cite" />
              {message.sources.length} source{message.sources.length > 1 ? "s" : ""} cited
            </span>
            <ChevronDown className={`size-4 transition-transform ${showSources ? "rotate-180" : ""}`} />
          </button>

          {showSources && (
            <ul className="space-y-2 border-t border-border p-3">
              {message.sources.map((source, i) => (
                <li key={`${source.document}-${source.page}-${i}`} className="rounded-lg bg-surface-raised p-3">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="rounded bg-cite px-1.5 py-0.5 font-mono text-[0.65rem] text-cite-foreground">
                      {i + 1}
                    </span>
                    <span className="truncate text-foreground">{source.document}</span>
                    <span className="shrink-0 text-muted-foreground">page {source.page}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{source.snippet}…</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function ThinkingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-think size-1.5 rounded-full bg-primary"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      {label}
    </div>
  );
}
