-- Criar índices para melhorar performance das consultas de relatórios de estoque
-- Esses índices ajudam nas queries frequentes de produtos, pedidos e movimentações

-- Índice para produtos que controlam estoque
CREATE INDEX IF NOT EXISTS idx_products_controlar_estoque 
ON public.products(controlar_estoque) 
WHERE controlar_estoque = true;

-- Índice para produtos por categoria
CREATE INDEX IF NOT EXISTS idx_products_category 
ON public.products(category_id);

-- Índice para pedidos por data de criação (usado em relatórios de vendas)
CREATE INDEX IF NOT EXISTS idx_pedidos_data_criacao 
ON public.pedidos(data_criacao DESC);

-- Índice para pedidos por status e data (filtros comuns)
CREATE INDEX IF NOT EXISTS idx_pedidos_status_data 
ON public.pedidos(status, data_criacao DESC);

-- Índice composto para movimentações de estoque por produto e data
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto_data 
ON public.movimentacoes_estoque(produto_id, data_movimentacao DESC);

-- Índice para movimentações por tipo
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo 
ON public.movimentacoes_estoque(tipo_movimentacao);

-- Índice para ordenação de produtos (usado em listagens)
CREATE INDEX IF NOT EXISTS idx_products_order_name 
ON public.products(order_index, name);

-- Índice para product_stats (usado em buscas e relatórios)
CREATE INDEX IF NOT EXISTS idx_product_stats_product 
ON public.product_stats(product_id);

COMMENT ON INDEX idx_products_controlar_estoque IS 'Melhora queries que filtram produtos com controle de estoque';
COMMENT ON INDEX idx_pedidos_data_criacao IS 'Acelera relatórios de vendas por período';
COMMENT ON INDEX idx_movimentacoes_produto_data IS 'Otimiza histórico de movimentações por produto';