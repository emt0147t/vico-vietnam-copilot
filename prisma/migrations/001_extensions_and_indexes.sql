-- VICO Database Extensions & Indexes
-- Run this migration after Prisma schema is applied
-- PostgreSQL/Supabase compatible

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable pgvector for embedding storage and similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- TRIGRAM INDEXES (Fuzzy Name Search)
-- ============================================================================

-- Company name fuzzy search
CREATE INDEX IF NOT EXISTS idx_company_name_trgm 
ON "Company" USING GIN (name gin_trgm_ops);

-- Company legal name fuzzy search
CREATE INDEX IF NOT EXISTS idx_company_legalname_trgm 
ON "Company" USING GIN ("legalName" gin_trgm_ops);

-- Company alias fuzzy search
CREATE INDEX IF NOT EXISTS idx_alias_name_trgm 
ON "CompanyAlias" USING GIN (alias gin_trgm_ops);

-- ============================================================================
-- FULL-TEXT SEARCH (News)
-- ============================================================================

-- Add tsvector column for news full-text search
ALTER TABLE "News" 
ADD COLUMN IF NOT EXISTS ts tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(summary, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(content, '')), 'C')
) STORED;

-- GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_news_ts ON "News" USING GIN (ts);

-- ============================================================================
-- VECTOR EMBEDDING COLUMN & INDEX
-- ============================================================================

-- Add vector column to VectorEmbedding table
-- Dimension 1536 is standard for OpenAI/Gemini embeddings
ALTER TABLE "VectorEmbedding" 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- IVFFlat index for approximate nearest neighbor search
-- lists = sqrt(n) where n is expected number of vectors
-- Start with 100, adjust based on dataset size
CREATE INDEX IF NOT EXISTS idx_vec_embedding_ivfflat 
ON "VectorEmbedding" 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Alternative: HNSW index (faster queries, slower inserts)
-- Uncomment if you prefer HNSW over IVFFlat
-- CREATE INDEX IF NOT EXISTS idx_vec_embedding_hnsw 
-- ON "VectorEmbedding" 
-- USING hnsw (embedding vector_cosine_ops)
-- WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Fuzzy company search with trigram similarity
CREATE OR REPLACE FUNCTION search_companies_fuzzy(
  search_query TEXT,
  min_similarity FLOAT DEFAULT 0.3,
  max_results INT DEFAULT 20
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  industry TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.industry,
    similarity(c.name, search_query) AS similarity
  FROM "Company" c
  WHERE similarity(c.name, search_query) > min_similarity
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function: Search news with full-text
CREATE OR REPLACE FUNCTION search_news_fulltext(
  search_query TEXT,
  company_id TEXT DEFAULT NULL,
  max_results INT DEFAULT 50
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  summary TEXT,
  "publishedAt" TIMESTAMP,
  sentiment FLOAT,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.summary,
    n."publishedAt",
    n.sentiment,
    ts_rank(n.ts, plainto_tsquery('simple', search_query)) AS rank
  FROM "News" n
  WHERE 
    n.ts @@ plainto_tsquery('simple', search_query)
    AND (company_id IS NULL OR n."companyId" = company_id)
  ORDER BY rank DESC, n."publishedAt" DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function: Vector similarity search
CREATE OR REPLACE FUNCTION search_vectors_similar(
  query_embedding vector(1536),
  source_filter TEXT DEFAULT NULL,
  max_results INT DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  "companyId" TEXT,
  "newsId" TEXT,
  source TEXT,
  text TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v."companyId",
    v."newsId",
    v.source,
    v.text,
    1 - (v.embedding <=> query_embedding) AS similarity
  FROM "VectorEmbedding" v
  WHERE 
    v.embedding IS NOT NULL
    AND (source_filter IS NULL OR v.source = source_filter)
  ORDER BY v.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS (Optional - for denormalization)
-- ============================================================================

-- Trigger function: Update company news stats after news insert
CREATE OR REPLACE FUNCTION update_company_news_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Company"
  SET 
    "newsCount" = (
      SELECT COUNT(*) FROM "News" WHERE "companyId" = NEW."companyId"
    ),
    "latestNewsAt" = NEW."publishedAt",
    "headlineSnapshot" = LEFT(NEW.title, 280),
    "latestNewsSentiment" = (
      SELECT AVG(sentiment) 
      FROM (
        SELECT sentiment 
        FROM "News" 
        WHERE "companyId" = NEW."companyId" AND sentiment IS NOT NULL
        ORDER BY "publishedAt" DESC 
        LIMIT 10
      ) recent
    ),
    "updatedAt" = NOW()
  WHERE id = NEW."companyId";
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (uncomment to enable auto-updates)
-- DROP TRIGGER IF EXISTS trigger_update_company_news_stats ON "News";
-- CREATE TRIGGER trigger_update_company_news_stats
-- AFTER INSERT ON "News"
-- FOR EACH ROW
-- EXECUTE FUNCTION update_company_news_stats();

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Example 1: Fuzzy search for companies
-- SELECT * FROM search_companies_fuzzy('Vin Group', 0.3, 10);

-- Example 2: Full-text search for news
-- SELECT * FROM search_news_fulltext('AI đầu tư', NULL, 20);

-- Example 3: Vector similarity search (requires embedding)
-- SELECT * FROM search_vectors_similar('[0.1, 0.2, ...]'::vector, 'news', 5);

-- Example 4: Manual trigram search
-- SELECT id, name, similarity(name, 'FPT Corp') AS sim
-- FROM "Company"
-- WHERE name % 'FPT Corp'
-- ORDER BY sim DESC
-- LIMIT 10;
