import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { MAX_FILE_BYTES, validatePdf } from "@/lib/pdf";

type Props = {
  busy: boolean;
  progress: { label: string; value: number } | null;
  onFiles: (files: File[]) => void;
  onError: (message: string) => void;
};

export function UploadZone({ busy, progress, onFiles, onError }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (fileList: FileList | null) => {
      const files = Array.from(fileList ?? []);
      if (files.length === 0) return;

      const valid: File[] = [];
      for (const file of files) {
        const problem = validatePdf(file);
        if (problem) onError(`${file.name}: ${problem}`);
        else valid.push(file);
      }
      if (valid.length > 0) onFiles(valid);
    },
    [onError, onFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!busy) handle(e.dataTransfer.files);
      }}
      className={`rounded-2xl border border-dashed p-5 text-center transition-colors ${
        dragging ? "border-primary bg-surface-raised" : "border-border bg-surface"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        hidden
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />

      {busy && progress ? (
        <div className="space-y-3 py-2">
          <Loader2 className="mx-auto size-5 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">{progress.label}</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${Math.round(progress.value * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <span className="mx-auto grid size-10 place-items-center rounded-xl bg-surface-raised text-primary">
            <FileUp className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium">Drop PDFs here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            or{" "}
            <button type="button" onClick={() => inputRef.current?.click()} className="text-primary hover:underline">
              browse files
            </button>{" "}
            · max {Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB
          </p>
        </>
      )}
    </div>
  );
}
