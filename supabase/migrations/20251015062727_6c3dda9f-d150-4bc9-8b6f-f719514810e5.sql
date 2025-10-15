-- Create product statistics table
CREATE TABLE IF NOT EXISTS public.product_stats (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  views INTEGER DEFAULT 0,
  cart_additions INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  last_added_to_cart_at TIMESTAMP WITH TIME ZONE,
  last_purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Create unique index on product_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_stats_product_id ON public.product_stats(product_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_stats_popularity ON public.product_stats(cart_additions DESC, purchases DESC, views DESC);

-- Create GIN index for better text search on products
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON public.products USING gin(name gin_trgm_ops);

-- Enable RLS
ALTER TABLE public.product_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for product_stats"
ON public.product_stats FOR SELECT
USING (true);

-- Allow public insert/update for tracking
CREATE POLICY "Allow public insert for product_stats"
ON public.product_stats FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update for product_stats"
ON public.product_stats FOR UPDATE
USING (true);

-- Create or replace the enhanced search function
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
BEGIN
  normalized_search := normalize_text(search_term);
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.category_id,
    c.name as category_name,
    p.is_paused,
    COALESCE(ps.views, 0) as views,
    COALESCE(ps.cart_additions, 0) as cart_additions,
    COALESCE(ps.purchases, 0) as purchases,
    (
      -- Base text similarity (0-1)
      GREATEST(
        similarity(normalize_text(p.name), normalized_search) * 2.0,
        similarity(normalize_text(c.name), normalized_search) * 1.5,
        CASE 
          WHEN normalize_text(p.name) ILIKE normalized_search || '%' THEN 1.5
          WHEN normalize_text(p.name) ILIKE '%' || normalized_search || '%' THEN 1.0
          ELSE 0.3
        END
      ) * 100 +
      -- Popularity boost (normalized to 0-50 range)
      (
        (COALESCE(ps.cart_additions, 0) * 3.0) +
        (COALESCE(ps.purchases, 0) * 5.0) +
        (COALESCE(ps.views, 0) * 0.5)
      ) / 
      GREATEST(
        (SELECT MAX(cart_additions * 3.0 + purchases * 5.0 + views * 0.5) FROM product_stats),
        1
      ) * 50
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

-- Function to track product view
CREATE OR REPLACE FUNCTION public.track_product_view(p_product_id integer)
RETURNS void LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO product_stats (product_id, views, last_viewed_at)
  VALUES (p_product_id, 1, now())
  ON CONFLICT (product_id) 
  DO UPDATE SET 
    views = product_stats.views + 1,
    last_viewed_at = now(),
    updated_at = now();
END;
$$;

-- Function to track cart addition
CREATE OR REPLACE FUNCTION public.track_cart_addition(p_product_id integer)
RETURNS void LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO product_stats (product_id, cart_additions, last_added_to_cart_at)
  VALUES (p_product_id, 1, now())
  ON CONFLICT (product_id) 
  DO UPDATE SET 
    cart_additions = product_stats.cart_additions + 1,
    last_added_to_cart_at = now(),
    updated_at = now();
END;
$$;

-- Function to track purchase
CREATE OR REPLACE FUNCTION public.track_purchase(p_product_id integer)
RETURNS void LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO product_stats (product_id, purchases, last_purchased_at)
  VALUES (p_product_id, 1, now())
  ON CONFLICT (product_id) 
  DO UPDATE SET 
    purchases = product_stats.purchases + 1,
    last_purchased_at = now(),
    updated_at = now();
END;
$$;