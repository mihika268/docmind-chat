REVOKE ALL ON FUNCTION public.match_chunks(vector, TEXT, UUID[], INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_chunks(vector, TEXT, UUID[], INT) TO service_role;