/**
 * Browser-side PDF text extraction (PyMuPDF equivalent for the web runtime).
 * Runs entirely on the client so file bytes never leave the user's machine —
 * only the extracted text is sent to the server for embedding.
 */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_PAGES = 400;

export type PageText = { page: number; text: string };

export function validatePdf(file: File): string | null {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files are supported.";
  }
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_FILE_BYTES) return "PDFs must be smaller than 20 MB.";
  return null;
}

export async function extractPdfText(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<PageText[]> {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const total = Math.min(doc.numPages, MAX_PAGES);
  const pages: PageText[] = [];

  for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pages.push({ page: pageNumber, text });
    onProgress?.(pageNumber / total);
    page.cleanup();
  }

  await doc.destroy();
  return pages;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
