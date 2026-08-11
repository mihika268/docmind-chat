export default function AIDisclaimer() {
  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">AI Disclaimer</h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: August 11, 2026
        </p>

        <div className="mt-10 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              AI-Generated Responses
            </h2>
            <p className="mt-3">
              DocMind AI uses artificial intelligence to generate answers based
              on information retrieved from uploaded documents. AI-generated
              responses may contain inaccuracies, omissions, or
              misunderstandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              Verify Important Information
            </h2>
            <p className="mt-3">
              Users should verify important information against the original
              document before relying on an AI-generated response. Source and
              page citations are provided to help users review the underlying
              document content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              No Professional Advice
            </h2>
            <p className="mt-3">
              DocMind AI does not provide legal, medical, financial, academic,
              or other professional advice. AI-generated information should not
              be treated as a substitute for advice from a qualified
              professional.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              User Responsibility
            </h2>
            <p className="mt-3">
              Users are responsible for evaluating the accuracy and suitability
              of AI-generated responses and for making decisions based on
              appropriate verification of the original source material.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}