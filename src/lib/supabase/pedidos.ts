
import { supabase } from './client';
import { SupabasePedido } from './types';

// Fetch all pedidos
export const fetchPedidos = async (): Promise<SupabasePedido[]> => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('data_criacao', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    return [];
  }
};

// Fetch a specific pedido by ID
export const fetchPedidoById = async (id: string): Promise<SupabasePedido | null> => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar pedido por ID:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Erro ao buscar pedido por ID:', err);
    return null;
  }
};

// Update the status of a pedido
export const updatePedidoStatus = async (id: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Erro ao atualizar status do pedido:', err);
    return false;
  }
};

// Update deliverer assignment for a pedido
export const updatePedidoDeliverer = async (id: string, entregador: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pedidos')
      .update({ entregador })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar entregador do pedido:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Erro ao atualizar entregador do pedido:', err);
    return false;
  }
};

// Delete a pedido
export const deletePedido = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir pedido:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Erro ao excluir pedido:', err);
    return false;
  }
};

// Save a new pedido
export const savePedido = async (pedido: Omit<SupabasePedido, 'id' | 'data_criacao'>): Promise<SupabasePedido | null> => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert(pedido)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar pedido:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Erro ao salvar pedido:', err);
    return null;
  }
};
