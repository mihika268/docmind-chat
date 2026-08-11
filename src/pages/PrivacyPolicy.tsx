export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: August 11, 2026
        </p>

        <div className="mt-10 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              1. Overview
            </h2>
            <p className="mt-3">
              DocMind AI is an AI-powered document analysis application that
              allows users to upload PDF documents and ask questions about
              their content. This Privacy Policy explains how information is
              processed when you use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              2. Information We Process
            </h2>
            <p className="mt-3">
              Depending on how you use DocMind AI, the service may process
              uploaded document content, extracted text, document chunks,
              questions, generated answers, source references, and technical
              information required to operate the application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              3. Uploaded Documents
            </h2>
            <p className="mt-3">
              PDF files are processed in the browser to extract their text.
              Extracted document content and related information may be stored
              in the application's database to provide document search and
              question-answering functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              4. AI Processing
            </h2>
            <p className="mt-3">
              DocMind AI uses Google Gemini to generate embeddings and
              AI-generated answers. Relevant document content and user
              questions may be sent to the AI service to generate responses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              5. Data Storage
            </h2>
            <p className="mt-3">
              Document-related information, including extracted content,
              embeddings, questions, answers, and source information, may be
              stored using Supabase and PostgreSQL services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              6. Data Security
            </h2>
            <p className="mt-3">
              Reasonable technical measures are used to protect information
              processed by the application. However, no internet-based service
              can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              7. User Responsibility
            </h2>
            <p className="mt-3">
              Users should avoid uploading confidential, highly sensitive, or
              legally protected information unless they are authorized to do
              so and understand the risks associated with processing such
              information through an online AI service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              8. Data Retention and Deletion
            </h2>
            <p className="mt-3">
              Information may remain in the application's storage for as long
              as required to provide the service. Where deletion functionality
              is available, users may use it to remove their document-related
              information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              9. Third-Party Services
            </h2>
            <p className="mt-3">
              DocMind AI relies on third-party services, including Google
              Gemini and Supabase, to provide AI processing, database, and
              application functionality. Their respective policies may apply
              to information processed through their services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              10. Changes to This Policy
            </h2>
            <p className="mt-3">
              This Privacy Policy may be updated from time to time. Any
              material changes will be reflected by updating the date shown at
              the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">
              11. Contact
            </h2>
            <p className="mt-3">
              For privacy-related questions or requests, please contact the
              DocMind AI project owner through the contact information provided
              with the service.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}