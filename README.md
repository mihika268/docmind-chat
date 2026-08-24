# 🤖 DocMind AI

### AI-Powered PDF Document Intelligence with Grounded Answers

DocMind AI is a **Retrieval-Augmented Generation (RAG)** application that allows users to upload PDF documents, search their content semantically, and ask questions in natural language.

The application retrieves relevant document passages and generates AI-powered answers with **page-level source citations**.

## 🌐 Live Demo

🚀 **[DocMind AI](https://docmind-chat-dusky.vercel.app/)**

---

## 🎯 Problem Statement

Searching through large PDF documents manually can be time-consuming, while traditional keyword search may fail when questions are phrased differently from the document.

DocMind AI uses semantic search and retrieval-based AI to find relevant information and generate answers grounded in the uploaded documents.

---

## ✨ Features

* 📄 PDF document upload and processing
* 🔎 Semantic document search
* 💬 Natural-language question answering
* 📚 Multi-document querying
* 📌 Page-level source citations
* 📝 Relevant passage excerpts
* ⚡ Vector similarity search
* 🔐 Session-scoped document processing
* 📱 Responsive web interface

---

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
Context Retrieval
    ↓
AI Response Generation
    ↓
Answer + Source Citations
```

### RAG Pipeline

1. **Extract** — Extract text from PDF pages.
2. **Chunk** — Divide the text into smaller overlapping sections.
3. **Embed** — Convert document chunks into vector embeddings.
4. **Retrieve** — Find relevant passages using vector similarity.
5. **Answer** — Generate an answer using the retrieved context.

---

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript
* **Framework:** TanStack Start
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **AI:** Google Gemini
* **Database:** Supabase / PostgreSQL
* **Vector Search:** PostgreSQL vector similarity search
* **PDF Processing:** PDF.js
* **Deployment:** Vercel

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/mihika268/docmind-chat.git
cd docmind-chat
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

> ⚠️ Never commit `.env` files or secret API keys to GitHub.

### Run Locally

```bash
npm run dev
```

Open the local URL shown in the terminal.

---

## 📁 Project Structure

```text
docmind-chat/
├── public/
├── src/
│   ├── pages/
│   ├── routes/
│   └── ...
├── supabase/
├── package.json
├── README.md
└── .gitignore
```

---

## 🔐 Security

The application follows security-conscious development practices, including:

* Environment-based secret management
* Client/server separation
* Session-scoped document processing
* Input validation
* CSRF protection
* Protected server-side operations
* Security-conscious database access

> AI-generated responses may contain errors. Important information should be verified against the original document and cited source pages.

---

## 🔮 Future Improvements

* 👤 User authentication and personal document libraries
* 🗑️ Document deletion and retention controls
* 💬 Improved streaming responses
* 🔗 Advanced citation navigation
* 🖼️ OCR support for scanned PDFs
* 📊 Retrieval evaluation and performance monitoring
* 📝 Conversation history
* 📂 Support for additional document formats

---

## 👨‍💻 Author

**Mihika Pal**

B.Tech CSE Student · Full-Stack Developer · Security & AI Enthusiast
