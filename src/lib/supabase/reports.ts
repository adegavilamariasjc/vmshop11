import { supabase } from './client';
import { StockReport, TopSellingProduct, StockTurnover, StockAlert } from '@/types/stock';

// Relatório de estoque atual
export const getStockReport = async (): Promise<StockReport[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        quantidade_estoque,
        estoque_minimo,
        custo_compra,
        price,
        margem_lucro,
        unidade_medida,
        category_id,
        categories (name)
      `)
      .eq('controlar_estoque', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar relatório de estoque:', error);
      return [];
    }

    return (data || []).map(product => {
      const valorEstoque = product.quantidade_estoque * product.custo_compra;
      const valorPotencial = product.quantidade_estoque * product.price;
      
      let status: 'ok' | 'atencao' | 'critico' = 'ok';
      if (product.quantidade_estoque === 0) {
        status = 'critico';
      } else if (product.quantidade_estoque <= product.estoque_minimo) {
        status = 'atencao';
      }

      return {
        produto_id: product.id,
        produto_nome: product.name,
        categoria: (product.categories as any)?.name || 'Sem categoria',
        quantidade: product.quantidade_estoque,
        estoque_minimo: product.estoque_minimo,
        custo_unitario: product.custo_compra,
        valor_estoque: valorEstoque,
        valor_potencial: valorPotencial,
        status,
        margem_lucro: product.margem_lucro,
        unidade_medida: product.unidade_medida
      };
    });
  } catch (err) {
    console.error('Erro ao buscar relatório de estoque:', err);
    return [];
  }
};

// Produtos mais vendidos
export const getTopSellingProducts = async (days: number = 30): Promise<TopSellingProduct[]> => {
  try {
    const { data, error } = await supabase.rpc('get_top_selling_products', { days });

    if (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Erro ao buscar produtos mais vendidos:', err);
    return [];
  }
};

// Giro de estoque
export const getStockTurnover = async (days: number = 30): Promise<StockTurnover[]> => {
  try {
    const { data, error } = await supabase.rpc('get_stock_turnover', { days });

    if (error) {
      console.error('Erro ao buscar giro de estoque:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Erro ao buscar giro de estoque:', err);
    return [];
  }
};

// Alertas de estoque baixo
export const getStockAlerts = async (): Promise<StockAlert[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, quantidade_estoque, estoque_minimo')
      .eq('controlar_estoque', true)
      .order('quantidade_estoque', { ascending: true });

    if (error) {
      console.error('Erro ao buscar alertas de estoque:', error);
      return [];
    }

    return (data || [])
      .filter(product => product.quantidade_estoque <= product.estoque_minimo)
      .map(product => ({
        produto_id: product.id,
        produto_nome: product.name,
        quantidade_atual: product.quantidade_estoque,
        estoque_minimo: product.estoque_minimo,
        diferenca: product.estoque_minimo - product.quantidade_estoque,
        status: product.quantidade_estoque === 0 ? 'critico' as const : 'atencao' as const
      }));
  } catch (err) {
    console.error('Erro ao buscar alertas de estoque:', err);
    return [];
  }
};

// Resumo financeiro do estoque
export const getStockFinancialSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('quantidade_estoque, custo_compra, price')
      .eq('controlar_estoque', true);

    if (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      return {
        totalInvestido: 0,
        valorPotencial: 0,
        lucroEstimado: 0,
        margemMedia: 0
      };
    }

    const totalInvestido = (data || []).reduce(
      (sum, p) => sum + (p.quantidade_estoque * p.custo_compra), 
      0
    );
    
    const valorPotencial = (data || []).reduce(
      (sum, p) => sum + (p.quantidade_estoque * p.price), 
      0
    );

    const lucroEstimado = valorPotencial - totalInvestido;
    const margemMedia = totalInvestido > 0 ? (lucroEstimado / totalInvestido) * 100 : 0;

    return {
      totalInvestido,
      valorPotencial,
      lucroEstimado,
      margemMedia
    };
  } catch (err) {
    console.error('Erro ao buscar resumo financeiro:', err);
    return {
      totalInvestido: 0,
      valorPotencial: 0,
      lucroEstimado: 0,
      margemMedia: 0
    };
  }
};
