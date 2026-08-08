## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mihika268/docmind-chat.git
cd docmind-chat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

> **Important:** Never commit `.env` or any API keys to GitHub.

### 4. Run the Application

```bash
npm run dev
```

Open the application at:

[Open DocMind AI](https://docmind-chat-dusky.vercel.app/workspace)

If port `3000` is already in use, use the `Local` URL shown in the terminal.

## Production Build

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npx vite preview
```

## Project Goal

DocMind AI aims to simplify interaction with lengthy PDF documents.

Instead of manually searching through pages, users can ask questions in natural language and receive relevant, document-grounded answers with source references.