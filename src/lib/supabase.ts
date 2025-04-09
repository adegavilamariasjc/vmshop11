
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Usar diretamente as credenciais do Supabase
const supabaseUrl = "https://zdtuvslyqayjedjsfvwa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdHV2c2x5cWF5amVkanNmdndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MzU1NjIsImV4cCI6MjA1OTQxMTU2Mn0.vBugMM69TLwKbWwlPpEfTEER7Rjh2emQS44dlAEfByM";

// Criar cliente Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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

// Corrigir tipo do bairro para usar 'nome' em vez de 'name'
export type SupabaseBairro = {
  id: number;
  nome: string;
  taxa: number;
  created_at?: string;
};

// Tipo para pedidos
export type SupabasePedido = {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_endereco: string;
  cliente_numero?: string;
  cliente_complemento?: string;
  cliente_referencia?: string;
  cliente_bairro: string;
  taxa_entrega: number;
  cliente_whatsapp: string;
  forma_pagamento: string;
  troco?: string;
  itens: any;
  total: number;
  status: string;
  data_criacao: string;
  observacao?: string;
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
    .order('nome');
  
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

// Funções para pedidos
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

// Função de migração de dados
export const migrateDataToSupabase = async (
  localCategories: string[], 
  localProducts: Record<string, { name: string; price: number }[]>,
  localBairros: { nome: string; taxa: number }[]
): Promise<boolean> => {
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
    
    // Inserir bairros - atualizado para usar o campo nome corretamente
    for (const bairro of localBairros) {
      await supabase
        .from('bairros')
        .insert({
          nome: bairro.nome,
          taxa: bairro.taxa
        });
    }
    
    return true;
  } catch (error) {
    console.error('Erro na migração de dados:', error);
    return false;
  }
};

// Função para salvar pedido no banco de dados
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
