-- ============================================
-- FASE 1: SISTEMA DE ESTOQUE - ESTRUTURA DB
-- ============================================

-- 1.1 Adicionar colunas de estoque à tabela products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS quantidade_estoque integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS estoque_minimo integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS custo_compra numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS margem_lucro numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS controlar_estoque boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS unidade_medida text DEFAULT 'un' NOT NULL;

-- 1.2 Criar tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tipo_movimentacao text NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida', 'ajuste', 'venda')),
  quantidade integer NOT NULL,
  quantidade_anterior integer NOT NULL,
  quantidade_nova integer NOT NULL,
  custo_unitario numeric,
  valor_total numeric,
  motivo text,
  pedido_id uuid REFERENCES public.pedidos(id) ON DELETE SET NULL,
  usuario_id uuid,
  data_movimentacao timestamp with time zone DEFAULT now() NOT NULL,
  observacao text
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON public.movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON public.movimentacoes_estoque(data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON public.movimentacoes_estoque(tipo_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_pedido ON public.movimentacoes_estoque(pedido_id);

-- 1.3 Ativar RLS na tabela movimentacoes_estoque
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem gerenciar todas as movimentações
CREATE POLICY "Admins can manage stock movements"
ON public.movimentacoes_estoque
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Política: Leitura pública para relatórios (opcional, ajustar conforme necessidade)
CREATE POLICY "Public can view stock movements"
ON public.movimentacoes_estoque
FOR SELECT
TO authenticated
USING (true);

-- 1.4 Função para calcular margem de lucro automaticamente
CREATE OR REPLACE FUNCTION public.calculate_profit_margin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.custo_compra > 0 THEN
    NEW.margem_lucro = ((NEW.price - NEW.custo_compra) / NEW.custo_compra) * 100;
  ELSE
    NEW.margem_lucro = 0;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para calcular margem automaticamente
DROP TRIGGER IF EXISTS trigger_calculate_profit_margin ON public.products;
CREATE TRIGGER trigger_calculate_profit_margin
BEFORE INSERT OR UPDATE OF price, custo_compra ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.calculate_profit_margin();

-- 1.5 Função para registrar vendas no estoque automaticamente
CREATE OR REPLACE FUNCTION public.registrar_venda_estoque()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  produto record;
BEGIN
  -- Percorrer todos os itens do pedido
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.itens)
  LOOP
    -- Buscar o produto
    SELECT * INTO produto FROM public.products WHERE id = (item->>'id')::integer;
    
    -- Se o produto existe e controla estoque
    IF FOUND AND produto.controlar_estoque THEN
      -- Registrar movimentação de venda
      INSERT INTO public.movimentacoes_estoque (
        produto_id,
        tipo_movimentacao,
        quantidade,
        quantidade_anterior,
        quantidade_nova,
        custo_unitario,
        valor_total,
        pedido_id,
        motivo
      ) VALUES (
        produto.id,
        'venda',
        (item->>'qty')::integer,
        produto.quantidade_estoque,
        GREATEST(0, produto.quantidade_estoque - (item->>'qty')::integer),
        produto.custo_compra,
        (item->>'price')::numeric * (item->>'qty')::integer,
        NEW.id,
        'Venda automática - Pedido ' || NEW.codigo_pedido
      );
      
      -- Atualizar quantidade em estoque
      UPDATE public.products 
      SET quantidade_estoque = GREATEST(0, quantidade_estoque - (item->>'qty')::integer)
      WHERE id = produto.id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger para registrar vendas automaticamente
DROP TRIGGER IF EXISTS trigger_venda_estoque ON public.pedidos;
CREATE TRIGGER trigger_venda_estoque
AFTER INSERT ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.registrar_venda_estoque();

-- 1.6 Função para obter produtos mais vendidos
CREATE OR REPLACE FUNCTION public.get_top_selling_products(days integer DEFAULT 30)
RETURNS TABLE (
  produto_id integer,
  produto_nome text,
  total_vendido bigint,
  receita_total numeric,
  quantidade_pedidos bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (item->>'id')::integer as produto_id,
    item->>'name' as produto_nome,
    SUM((item->>'qty')::integer) as total_vendido,
    SUM((item->>'price')::numeric * (item->>'qty')::integer) as receita_total,
    COUNT(DISTINCT p.id) as quantidade_pedidos
  FROM public.pedidos p,
       jsonb_array_elements(p.itens) as item
  WHERE p.data_criacao >= NOW() - (days || ' days')::interval
    AND p.status != 'cancelado'
  GROUP BY produto_id, produto_nome
  ORDER BY total_vendido DESC
  LIMIT 20;
END;
$$;

-- 1.7 Função para calcular giro de estoque
CREATE OR REPLACE FUNCTION public.get_stock_turnover(days integer DEFAULT 30)
RETURNS TABLE (
  produto_id integer,
  produto_nome text,
  estoque_atual integer,
  vendas_periodo bigint,
  giro numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id as produto_id,
    pr.name as produto_nome,
    pr.quantidade_estoque as estoque_atual,
    COALESCE(vendas.total, 0) as vendas_periodo,
    CASE 
      WHEN pr.quantidade_estoque > 0 
      THEN ROUND(COALESCE(vendas.total, 0)::numeric / pr.quantidade_estoque::numeric, 2)
      ELSE 0
    END as giro
  FROM public.products pr
  LEFT JOIN (
    SELECT 
      (item->>'id')::integer as prod_id,
      SUM((item->>'qty')::integer) as total
    FROM public.pedidos p,
         jsonb_array_elements(p.itens) as item
    WHERE p.data_criacao >= NOW() - (days || ' days')::interval
      AND p.status != 'cancelado'
    GROUP BY prod_id
  ) vendas ON vendas.prod_id = pr.id
  WHERE pr.controlar_estoque = true
  ORDER BY giro DESC;
END;
$$;

-- 1.8 Comentários para documentação
COMMENT ON TABLE public.movimentacoes_estoque IS 'Registra todas as movimentações de estoque (entradas, saídas, ajustes e vendas)';
COMMENT ON COLUMN public.products.quantidade_estoque IS 'Quantidade atual disponível em estoque';
COMMENT ON COLUMN public.products.estoque_minimo IS 'Quantidade mínima para alerta de estoque baixo';
COMMENT ON COLUMN public.products.custo_compra IS 'Custo de aquisição/compra do produto';
COMMENT ON COLUMN public.products.margem_lucro IS 'Margem de lucro em porcentagem (calculada automaticamente)';
COMMENT ON COLUMN public.products.controlar_estoque IS 'Flag para ativar/desativar controle de estoque por produto';
COMMENT ON COLUMN public.products.unidade_medida IS 'Unidade de medida (un, kg, L, etc)';