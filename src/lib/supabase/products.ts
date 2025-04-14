import { supabase } from './client';
import { SupabaseProduct } from './types';

// Fetch products by category
export const fetchProducts = async (categoryId: number): Promise<SupabaseProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    return [];
  }
};

// Fetch all products
export const fetchAllProducts = async (): Promise<SupabaseProduct[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar todos os produtos:', error);
    return [];
  }
  
  return data || [];
};

// Add a new product
export const addProduct = async (product: Omit<SupabaseProduct, 'id' | 'created_at'>): Promise<SupabaseProduct | null> => {
  const productWithPaused = { ...product, is_paused: false };
  const { data, error } = await supabase
    .from('products')
    .insert([productWithPaused])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar produto:', error);
    return null;
  }
  
  return data;
};

// Update an existing product
export const updateProduct = async (id: number, updates: Partial<Omit<SupabaseProduct, 'id' | 'created_at'>>): Promise<boolean> => {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao atualizar produto:', error);
    return false;
  }
  
  return true;
};

// Delete a product
export const deleteProduct = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir produto:', error);
    return false;
  }
  
  return true;
};

// Toggle product pause state
export const toggleProductPause = async (id: number, isPaused: boolean): Promise<boolean> => {
  const { error } = await supabase
    .from('products')
    .update({ is_paused: isPaused })
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao alterar estado do produto:', error);
    return false;
  }
  
  return true;
};
