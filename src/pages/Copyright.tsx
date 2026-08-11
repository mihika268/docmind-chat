export default function Copyright() {
  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">Copyright Notice</h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: August 11, 2026
        </p>

        <div className="mt-10 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              Copyright
            </h2>
            <p className="mt-3">
              © 2026 DocMind AI. All rights reserved.
            </p>
            <p className="mt-3">
              The original DocMind AI website, interface, branding, and
              original content are protected by applicable copyright and
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              User-Uploaded Content
            </h2>
            <p className="mt-3">
              Users retain responsibility for the documents and other content
              they upload. Users must have the necessary rights and permissions
              to use and process that content through DocMind AI.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              Third-Party Content
            </h2>
            <p className="mt-3">
              DocMind AI may rely on third-party software, libraries, APIs, and
              services. Such third-party materials remain subject to their
              respective licenses and terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              Permission
            </h2>
            <p className="mt-3">
              Reproduction, redistribution, or commercial use of original
              DocMind AI materials without appropriate permission may violate
              applicable intellectual property rights.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}