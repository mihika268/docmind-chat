# DocMind AI

> 🤖 AI-powered PDF document intelligence with grounded answers and source citations.

**🌐 Live Demo:** [DocMind AI](https://docmind-chat-dusky.vercel.app/)

DocMind AI is a Retrieval-Augmented Generation (RAG) application that allows users to upload PDF documents, search their content semantically, and ask questions in natural language. It retrieves relevant document passages and generates AI-powered answers with page-level source references.

## 🎯 Problem Statement

Large PDF documents can be difficult and time-consuming to search manually. Traditional keyword search may also fail when a user's question is expressed differently from the wording used in the document.

DocMind AI solves this problem by converting document content into a searchable semantic representation, retrieving relevant passages, and using them to generate grounded answers.

## ✨ Key Features

- 📄 Upload and process PDF documents
- 🔎 Semantic document search
- 💬 Natural-language question answering
- 📚 Multi-document querying
- 📌 Page-level source citations
- 📝 Relevant passage excerpts
- ⚡ Vector similarity search
- 🔐 Session-scoped document processing
- 🤖 AI-generated, document-grounded responses
- 📱 Responsive web interface
- 📜 Privacy Policy, Terms of Service, AI Disclaimer, and Copyright pages

## ⚙️ How It Works

```text
PDF Upload
     ↓
Text Extraction
     ↓
Document Chunking
     ↓
Vector Embeddings
     ↓
Semantic Search
     ↓
Relevant Context Retrieval
     ↓
AI Response Generation
     ↓
Answer + Source Citations


🔍 RAG Pipeline :-

1. Extract — Extract text from PDF pages.
2. Chunk — Divide document text into overlapping sections while preserving context.
3. Embed — Convert document chunks into vector embeddings.
4. Retrieve — Match the user's question against relevant document passages using vector similarity.
5. Answer — Generate a grounded response using the retrieved document context.


🛠️ Tech Stack :-

-Frontend: React, TypeScript
-Framework: TanStack Start
-Build Tool: Vite
-Styling: Tailwind CSS
-AI: Google Gemini
-Database: Supabase / PostgreSQL
-Vector Search: PostgreSQL vector similarity search
-PDF Processing: PDF.js
-Deployment: Vercel


📁 Project Structure :-

docmind-chat/
├── public/
├── src/
│   ├── pages/
│   │   ├── AIDisclaimer.tsx
│   │   ├── Copyright.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   └── TermsOfService.tsx
│   ├── routes/
│   │   ├── ai-disclaimer.tsx
│   │   ├── copyright.tsx
│   │   ├── privacy.tsx
│   │   ├── terms.tsx
│   │   └── index.tsx
│   └── ...
├── supabase/
├── package.json
├── README.md
└── .gitignore


🚀 Getting Started :-

1. Clone the Repository
    git clone https://github.com/mihika268/docmind-chat.git
    cd docmind-chat

2. Install Dependencies
    npm install

3. Configure Environment Variables
    Create a .env file in the project root:

GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

    ⚠️ Important: Never commit .env files or secret API keys to GitHub. The Supabase service-role key must remain server-side and must never be exposed to the browser.

4. Start the Development Server
    npm run dev

Open the local URL displayed in the terminal.

5. Build for Production
    npm run build

Preview the production build:
    npx vite preview


🔐 Security & Responsible Use :-
DocMind AI follows security-conscious development practices, including:
    🔑 Environment variables for sensitive configuration
    🔒 Separation of client and server functionality
    🛡️ Session-scoped document processing
    🔐 Protected server-side operations
    ✅ Input validation
    🛡️ CSRF protection
    🔑 Secure authentication and session handling where applicable
    🗄️ Security-conscious database access
Users are responsible for ensuring that they have the necessary rights and permissions to upload documents.
AI-generated responses may contain errors. Important information should always be verified against the original document.


📜 Legal & Privacy :-
DocMind AI provides:
    -Privacy Policy
    -Terms of Service
    -AI Disclaimer
    -Copyright Notice
These pages are accessible from the application's footer.


🌐 Deployment :-
    The application is deployed using Vercel.
    Live Application: https://docmind-chat-dusky.vercel.app/
    The main branch is used for the production deployment.


🔮 Future Improvements :-
    👤 User authentication and personal document libraries
    🗑️ Document deletion and retention controls
    💬 Improved streaming responses
    🔗 Advanced citation navigation
    🖼️ OCR support for scanned PDFs
    📊 Retrieval evaluation and performance monitoring
    📝 Conversation history
    📂 Support for additional document formats


📄 License :-
    Copyright © 2026 DocMind AI. All rights reserved.
    This repository is a portfolio project. Third-party libraries, frameworks, APIs, and services remain subject to their respective licenses and terms.


👨‍💻 Author
Mihika Pal