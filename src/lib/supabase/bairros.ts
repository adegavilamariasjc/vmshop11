
import { supabase } from './client';
import { SupabaseBairro } from './types';

// Fetch all bairros
export const fetchBairros = async (): Promise<SupabaseBairro[]> => {
  const { data, error } = await supabase
    .from('bairros')
    .select('*')
    .order('order_index', { ascending: true, nullsFirst: false });
  
  if (error) {
    console.error('Erro ao buscar bairros:', error);
    return [];
  }
  
  return data || [];
};

// Add a new bairro
export const addBairro = async (bairro: Omit<SupabaseBairro, 'id' | 'created_at'>): Promise<SupabaseBairro | null> => {
  const { data, error } = await supabase
    .from('bairros')
    .insert([bairro])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar bairro:', error);
    return null;
  }
  
  return data;
};

// Update an existing bairro
export const updateBairro = async (id: number, updates: Partial<Omit<SupabaseBairro, 'id' | 'created_at'>>): Promise<boolean> => {
  const { error } = await supabase
    .from('bairros')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao atualizar bairro:', error);
    return false;
  }
  
  return true;
};

// Delete a bairro
export const deleteBairro = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('bairros')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir bairro:', error);
    return false;
  }
  
  return true;
};

// Update bairro order
export const updateBairroOrder = async (id: number, order_index: number): Promise<boolean> => {
  const { error } = await supabase
    .from('bairros')
    .update({ order_index })
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao atualizar ordem do bairro:', error);
    return false;
  }
  
  return true;
};
