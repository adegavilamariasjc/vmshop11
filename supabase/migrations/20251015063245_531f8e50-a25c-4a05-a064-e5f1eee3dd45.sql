-- Drop and recreate the search function with proper aliases to fix ambiguous column reference
DROP FUNCTION IF EXISTS public.search_products_enhanced(text);

CREATE OR REPLACE FUNCTION public.search_products_enhanced(search_term text)
RETURNS TABLE(
  id integer,
  name text,
  price numeric,
  category_id integer,
  category_name text,
  is_paused boolean,
  views integer,
  cart_additions integer,
  purchases integer,
  relevance_score real
) LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE
  normalized_search text;
  max_popularity real;
BEGIN
  normalized_search := normalize_text(search_term);
  
  -- Calculate max popularity first to avoid subquery in main query
  SELECT COALESCE(MAX(ps.cart_additions * 3.0 + ps.purchases * 5.0 + ps.views * 0.5), 1)
  INTO max_popularity
  FROM product_stats ps;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.category_id,
    c.name as category_name,
    p.is_paused,
    COALESCE(ps.views, 0)::integer as views,
    COALESCE(ps.cart_additions, 0)::integer as cart_additions,
    COALESCE(ps.purchases, 0)::integer as purchases,
    (
      -- Base text similarity (0-1) * 100 for 0-100 range
      GREATEST(
        similarity(normalize_text(p.name), normalized_search) * 2.0,
        similarity(normalize_text(c.name), normalized_search) * 1.5,
        CASE 
          WHEN normalize_text(p.name) ILIKE normalized_search || '%' THEN 1.5
          WHEN normalize_text(p.name) ILIKE '%' || normalized_search || '%' THEN 1.0
          ELSE 0.3
        END
      ) * 100.0 +
      -- Popularity boost (normalized to 0-50 range)
      (
        (COALESCE(ps.cart_additions, 0) * 3.0) +
        (COALESCE(ps.purchases, 0) * 5.0) +
        (COALESCE(ps.views, 0) * 0.5)
      ) / max_popularity * 50.0
    )::real as relevance_score
  FROM products p
  JOIN categories c ON p.category_id = c.id
  LEFT JOIN product_stats ps ON p.id = ps.product_id
  WHERE 
    p.is_paused = false
    AND (
      normalize_text(p.name) % normalized_search
      OR normalize_text(c.name) % normalized_search
      OR normalize_text(p.name) ILIKE '%' || normalized_search || '%'
      OR normalize_text(c.name) ILIKE '%' || normalized_search || '%'
    )
  ORDER BY relevance_score DESC, p.name ASC
  LIMIT 10;
END;
$$;