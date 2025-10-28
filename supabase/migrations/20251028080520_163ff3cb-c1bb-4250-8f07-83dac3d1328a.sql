-- Performance indexes for reports and admin screens
CREATE INDEX IF NOT EXISTS idx_products_controlar_estoque ON public.products(controlar_estoque) WHERE controlar_estoque = true;
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_order_name ON public.products(order_index, name);

CREATE INDEX IF NOT EXISTS idx_pedidos_data_criacao ON public.pedidos(data_criacao);
CREATE INDEX IF NOT EXISTS idx_pedidos_status_data ON public.pedidos(status, data_criacao);

-- Only if table exists; safe to run even if empty
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto_data ON public.movimentacoes_estoque(produto_id, data_movimentacao);

CREATE INDEX IF NOT EXISTS idx_product_stats_product ON public.product_stats(product_id);
