import { supabase } from './client';
import { StockMovement } from '@/types/stock';

// Registrar movimentação de estoque
export const registerStockMovement = async (
  movement: Omit<StockMovement, 'id' | 'data_movimentacao'>
): Promise<StockMovement | null> => {
  try {
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .insert([movement])
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar movimentação:', error);
      return null;
    }

    return data as StockMovement;
  } catch (err) {
    console.error('Erro ao registrar movimentação:', err);
    return null;
  }
};

// Buscar movimentações com filtros
export const fetchStockMovements = async (filters?: {
  produto_id?: number;
  tipo_movimentacao?: string;
  data_inicio?: string;
  data_fim?: string;
  limit?: number;
}): Promise<StockMovement[]> => {
  try {
    let query = supabase
      .from('movimentacoes_estoque')
      .select('*')
      .order('data_movimentacao', { ascending: false });

    if (filters?.produto_id) {
      query = query.eq('produto_id', filters.produto_id);
    }

    if (filters?.tipo_movimentacao) {
      query = query.eq('tipo_movimentacao', filters.tipo_movimentacao);
    }

    if (filters?.data_inicio) {
      query = query.gte('data_movimentacao', filters.data_inicio);
    }

    if (filters?.data_fim) {
      query = query.lte('data_movimentacao', filters.data_fim);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar movimentações:', error);
      return [];
    }

    return (data || []) as StockMovement[];
  } catch (err) {
    console.error('Erro ao buscar movimentações:', err);
    return [];
  }
};

// Ajustar estoque manualmente
export const adjustStock = async (
  produto_id: number,
  tipo: 'entrada' | 'saida' | 'ajuste',
  quantidade: number,
  motivo?: string,
  observacao?: string,
  custo_unitario?: number
): Promise<boolean> => {
  try {
    // Buscar produto atual
    const { data: produto, error: produtoError } = await supabase
      .from('products')
      .select('quantidade_estoque, custo_compra')
      .eq('id', produto_id)
      .single();

    if (produtoError || !produto) {
      console.error('Produto não encontrado:', produtoError);
      return false;
    }

    const quantidadeAnterior = produto.quantidade_estoque;
    let quantidadeNova = quantidadeAnterior;

    if (tipo === 'entrada') {
      quantidadeNova = quantidadeAnterior + quantidade;
    } else if (tipo === 'saida') {
      quantidadeNova = Math.max(0, quantidadeAnterior - quantidade);
    } else if (tipo === 'ajuste') {
      quantidadeNova = quantidade;
    }

    const custoUnit = custo_unitario || produto.custo_compra;
    const valorTotal = custoUnit * quantidade;

    // Registrar movimentação
    const { error: movError } = await supabase
      .from('movimentacoes_estoque')
      .insert([{
        produto_id,
        tipo_movimentacao: tipo,
        quantidade,
        quantidade_anterior: quantidadeAnterior,
        quantidade_nova: quantidadeNova,
        custo_unitario: custoUnit,
        valor_total: valorTotal,
        motivo: motivo || `Ajuste manual - ${tipo}`,
        observacao,
        usuario_id: (await supabase.auth.getUser()).data.user?.id
      }]);

    if (movError) {
      console.error('Erro ao registrar movimentação:', movError);
      return false;
    }

    // Atualizar estoque
    const updates: any = { quantidade_estoque: quantidadeNova };
    
    // Se for entrada e tiver custo, atualizar custo do produto
    if (tipo === 'entrada' && custo_unitario) {
      updates.custo_compra = custo_unitario;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', produto_id);

    if (updateError) {
      console.error('Erro ao atualizar estoque:', updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erro ao ajustar estoque:', err);
    return false;
  }
};

// Buscar últimas movimentações de um produto
export const fetchProductMovements = async (
  produto_id: number,
  limit: number = 10
): Promise<StockMovement[]> => {
  return fetchStockMovements({ produto_id, limit });
};
