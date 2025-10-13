-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Criar função para normalizar texto (remover acentos e converter para minúsculas)
CREATE OR REPLACE FUNCTION normalize_text(text) RETURNS text AS $$
  SELECT lower(unaccent($1));
$$ LANGUAGE SQL IMMUTABLE;