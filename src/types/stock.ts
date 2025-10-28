export interface StockMovement {
  id: string;
  produto_id: number;
  tipo_movimentacao: 'entrada' | 'saida' | 'ajuste' | 'venda';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_nova: number;
  custo_unitario?: number;
  valor_total?: number;
  motivo?: string;
  pedido_id?: string;
  usuario_id?: string;
  data_movimentacao: string;
  observacao?: string;
}

export interface StockReport {
  produto_id: number;
  produto_nome: string;
  categoria: string;
  quantidade: number;
  estoque_minimo: number;
  custo_unitario: number;
  valor_estoque: number;
  valor_potencial: number;
  status: 'ok' | 'atencao' | 'critico';
  margem_lucro: number;
  unidade_medida: string;
}

export interface TopSellingProduct {
  produto_id: number;
  produto_nome: string;
  total_vendido: number;
  receita_total: number;
  quantidade_pedidos: number;
}

export interface StockTurnover {
  produto_id: number;
  produto_nome: string;
  estoque_atual: number;
  vendas_periodo: number;
  giro: number;
}

export interface StockAlert {
  produto_id: number;
  produto_nome: string;
  quantidade_atual: number;
  estoque_minimo: number;
  diferenca: number;
  status: 'critico' | 'atencao';
}

export type MovementType = 'entrada' | 'saida' | 'ajuste' | 'venda';
