-- Criar índices GIN para busca por similaridade mais rápida
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS categories_name_trgm_idx ON categories USING gin (name gin_trgm_ops);

-- Criar função de busca inteligente com ranking
CREATE OR REPLACE FUNCTION search_products(search_term text)
RETURNS TABLE (
  id integer,
  name text,
  price numeric,
  category_id integer,
  category_name text,
  is_paused boolean,
  relevance real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.category_id,
    c.name as category_name,
    p.is_paused,
    GREATEST(
      similarity(normalize_text(p.name), normalize_text(search_term)),
      similarity(normalize_text(c.name), normalize_text(search_term)) * 0.7
    ) as relevance
  FROM products p
  JOIN categories c ON p.category_id = c.id
  WHERE 
    p.is_paused = false
    AND (
      normalize_text(p.name) % normalize_text(search_term)
      OR normalize_text(c.name) % normalize_text(search_term)
      OR normalize_text(p.name) ILIKE '%' || normalize_text(search_term) || '%'
      OR normalize_text(c.name) ILIKE '%' || normalize_text(search_term) || '%'
    )
  ORDER BY relevance DESC, p.name ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;