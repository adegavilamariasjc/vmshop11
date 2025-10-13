-- Corrigir search_path das funções para segurança
DROP FUNCTION IF EXISTS public.normalize_text(text);
CREATE OR REPLACE FUNCTION public.normalize_text(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path = public
AS $function$
  SELECT lower(unaccent($1));
$function$;

-- Recriar função de busca com search_path correto
DROP FUNCTION IF EXISTS public.search_products(text);
CREATE OR REPLACE FUNCTION public.search_products(search_term text)
RETURNS TABLE (
  id integer,
  name text,
  price numeric,
  category_id integer,
  category_name text,
  is_paused boolean,
  relevance real
) 
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;