CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  page_count INTEGER NOT NULL DEFAULT 0,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ready',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX documents_session_idx ON public.documents (session_id, created_at DESC);
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  content TEXT NOT NULL,
  page INTEGER NOT NULL DEFAULT 1,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX chunks_document_idx ON public.chunks (document_id);
CREATE INDEX chunks_embedding_idx ON public.chunks USING hnsw (embedding vector_cosine_ops);
GRANT ALL ON public.chunks TO service_role;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX messages_session_idx ON public.messages (session_id, created_at);
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding vector(1536),
  p_session_id TEXT,
  p_document_ids UUID[],
  match_count INT DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  page INTEGER,
  similarity FLOAT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.document_id, c.content, c.page,
         1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.chunks c
  WHERE c.session_id = p_session_id
    AND (p_document_ids IS NULL OR c.document_id = ANY(p_document_ids))
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;