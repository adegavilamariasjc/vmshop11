
import { supabase } from './client';
import { SupabaseCategory } from './types';

// Fetch all categories
export const fetchCategories = async (): Promise<SupabaseCategory[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order_index');
  
  if (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
  
  return data || [];
};

// Add a new category
export const addCategory = async (category: Omit<SupabaseCategory, 'id' | 'created_at'>): Promise<SupabaseCategory | null> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar categoria:', error);
    return null;
  }
  
  return data;
};

// Update an existing category
export const updateCategory = async (id: number, updates: Partial<Omit<SupabaseCategory, 'id' | 'created_at'>>): Promise<boolean> => {
  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao atualizar categoria:', error);
    return false;
  }
  
  return true;
};

// Delete a category
export const deleteCategory = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir categoria:', error);
    return false;
  }
  
  return true;
};
