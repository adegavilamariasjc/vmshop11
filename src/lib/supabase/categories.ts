
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

// Reorder a category (move up or down)
export const reorderCategory = async (id: number, direction: 'up' | 'down'): Promise<boolean> => {
  try {
    // First get all categories ordered by current order_index
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('order_index');
    
    if (fetchError || !categories) {
      console.error('Erro ao buscar categorias para reordenação:', fetchError);
      return false;
    }
    
    // Find current category and its index
    const currentIndex = categories.findIndex(c => c.id === id);
    if (currentIndex === -1) {
      console.error('Categoria não encontrada');
      return false;
    }
    
    // Calculate target index based on direction
    const targetIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(categories.length - 1, currentIndex + 1);
    
    // If no change needed (already at top/bottom), return success
    if (targetIndex === currentIndex) {
      return true;
    }
    
    // Get the category to swap with
    const targetCategory = categories[targetIndex];
    const currentCategory = categories[currentIndex];
    
    // Swap order_index values
    const { error: updateError1 } = await supabase
      .from('categories')
      .update({ order_index: targetCategory.order_index })
      .eq('id', currentCategory.id);
    
    const { error: updateError2 } = await supabase
      .from('categories')
      .update({ order_index: currentCategory.order_index })
      .eq('id', targetCategory.id);
    
    if (updateError1 || updateError2) {
      console.error('Erro ao atualizar ordem das categorias:', updateError1 || updateError2);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro inesperado ao reordenar categoria:', error);
    return false;
  }
};
