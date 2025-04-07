import { createClient } from '@supabase/supabase-js';

// Check for environment variables and provide better error messages
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Throw a more helpful error if the environment variables are missing
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL environment variable is not set');
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY environment variable is not set');
}

// Create a mock client if we're in development and missing credentials
const createMockClient = () => {
  console.warn('Using mock Supabase client. Database operations will not work.');
  
  // Return a mock client that logs operations but doesn't actually connect to Supabase
  return {
    from: (table: string) => ({
      select: () => {
        console.log(`Mock: Selecting from ${table}`);
        return { data: [], error: null };
      },
      insert: () => {
        console.log(`Mock: Inserting into ${table}`);
        return { data: null, error: null };
      },
      update: () => {
        console.log(`Mock: Updating ${table}`);
        return { data: null, error: null };
      },
      delete: () => {
        console.log(`Mock: Deleting from ${table}`);
        return { data: null, error: null };
      },
      eq: () => ({
        order: () => ({ data: [], error: null }),
        select: () => ({ data: [], error: null }),
      }),
      order: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
      neq: () => ({ data: [], error: null }),
    }),
  };
};

// Create either a real client or a mock client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any;

// Tipos para as tabelas
export type SupabaseProduct = {
  id: number;
  name: string;
  price: number;
  category_id: number;
  created_at?: string;
};

export type SupabaseCategory = {
  id: number;
  name: string;
  order_index: number;
  created_at?: string;
};

export type SupabaseBairro = {
  id: number;
  name: string;
  taxa: number;
  created_at?: string;
};

// Funções para produtos
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

export const addProduct = async (product: Omit<SupabaseProduct, 'id' | 'created_at'>): Promise<SupabaseProduct | null> => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar produto:', error);
    return null;
  }
  
  return data;
};

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

// Funções para categorias
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

// Funções para bairros
export const fetchBairros = async (): Promise<SupabaseBairro[]> => {
  const { data, error } = await supabase
    .from('bairros')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar bairros:', error);
    return [];
  }
  
  return data || [];
};

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

// Função de migração de dados
export const migrateDataToSupabase = async (
  localCategories: string[], 
  localProducts: Record<string, { name: string; price: number }[]>,
  localBairros: { nome: string; taxa: number }[]
): Promise<boolean> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Não é possível migrar dados: credenciais do Supabase não configuradas');
    return false;
  }

  try {
    // Limpar tabelas existentes para migração fresca
    await supabase.from('products').delete().neq('id', 0);
    await supabase.from('categories').delete().neq('id', 0);
    await supabase.from('bairros').delete().neq('id', 0);
    
    // Inserir categorias
    const categoryMap = new Map<string, number>();
    for (let i = 0; i < localCategories.length; i++) {
      const categoryName = localCategories[i];
      const { data: categoryData } = await supabase
        .from('categories')
        .insert({ name: categoryName, order_index: i })
        .select()
        .single();
      
      if (categoryData) {
        categoryMap.set(categoryName, categoryData.id);
      }
    }
    
    // Inserir produtos
    for (const [categoryName, products] of Object.entries(localProducts)) {
      const categoryId = categoryMap.get(categoryName);
      if (categoryId) {
        for (const product of products) {
          await supabase
            .from('products')
            .insert({
              name: product.name,
              price: product.price,
              category_id: categoryId
            });
        }
      }
    }
    
    // Inserir bairros
    for (const bairro of localBairros) {
      await supabase
        .from('bairros')
        .insert({
          name: bairro.nome,
          taxa: bairro.taxa
        });
    }
    
    return true;
  } catch (error) {
    console.error('Erro na migração de dados:', error);
    return false;
  }
};
