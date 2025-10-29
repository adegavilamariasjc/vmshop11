
import { supabase } from './client';
import { SupabasePedido } from './types';
import { z } from 'zod';

export let lastPedidoError: string | null = null;

// Runtime validation to prevent bad payloads from reaching DB
const pedidoItemSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().nonnegative(),
  category: z.string().optional(),
  ice: z.any().optional(),
  alcohol: z.string().optional().nullable(),
  balyFlavor: z.string().optional().nullable(),
  energyDrink: z.string().optional().nullable(),
  energyDrinkFlavor: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
});

const pedidoSchema = z.object({
  codigo_pedido: z.string().trim().min(1),
  cliente_nome: z.string().trim().min(1),
  cliente_endereco: z.string().trim().min(1),
  cliente_numero: z.string().trim().min(1).nullable().optional(),
  cliente_complemento: z.string().trim().nullable().optional(),
  cliente_referencia: z.string().trim().nullable().optional(),
  cliente_bairro: z.string().trim().min(1),
  taxa_entrega: z.number().nonnegative(),
  cliente_whatsapp: z.string().trim().min(1),
  forma_pagamento: z.string().trim().min(1),
  troco: z.string().trim().nullable().optional(),
  observacao: z.string().nullable().optional(),
  itens: z.array(pedidoItemSchema).min(1),
  total: z.number().nonnegative(),
  status: z.string().trim().min(1),
  discount_amount: z.number().nonnegative().optional(),
  entregador: z.string().nullable().optional(),
});

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
    // Normalize numeric fields to avoid type issues
    const payload: any = {
      ...pedido,
      total: Number((pedido as any).total ?? 0),
      taxa_entrega: Number((pedido as any).taxa_entrega ?? 0),
      discount_amount: typeof (pedido as any).discount_amount === 'number' 
        ? (pedido as any).discount_amount 
        : Number((pedido as any).discount_amount ?? 0)
    };

    lastPedidoError = null;
    // Validate payload before sending to DB
    try {
      pedidoSchema.parse(payload);
    } catch (e: any) {
      const msg = e?.errors ? JSON.stringify(e.errors, null, 2) : String(e);
      console.error('Validação do pedido falhou:', e);
      lastPedidoError = `Validação do pedido falhou:\n${msg}`;
      return null;
    }

    // Primeiro tenta via Edge Function (usa Service Role e evita problemas de RLS do cliente)
    const { data: funcData, error: funcError } = await supabase.functions.invoke('create-pedido', {
      body: payload,
    });

    if (funcError) {
      console.warn('Edge function create-pedido falhou, tentando insert direto:', funcError);
      const { data, error } = await supabase
        .from('pedidos')
        .insert([payload])
        .select()
        .single();

      if (error) {
        const errObj = { 
          message: (error as any).message, 
          details: (error as any).details, 
          hint: (error as any).hint,
          code: (error as any).code,
          status: (error as any).status
        };
        console.error('Erro ao salvar pedido (fallback insert direto):', errObj);
        lastPedidoError = JSON.stringify(errObj, null, 2);
        return null;
      }
      
      return data as SupabasePedido;
    }

    // Sucesso pela Edge Function
    if (funcData?.success && funcData?.pedido) {
      return funcData.pedido as SupabasePedido;
    }

    // Caso a função retorne formato diferente
    if (funcData?.data) {
      return funcData.data as SupabasePedido;
    }

    if (funcData?.error) {
      const errObj = funcData.error;
      console.error('Erro ao salvar pedido (edge):', errObj);
      lastPedidoError = JSON.stringify(errObj, null, 2);
      return null;
    }

    return null;
  } catch (err: any) {
    console.error('Erro ao salvar pedido:', err);
    lastPedidoError = err?.message ? err.message : JSON.stringify(err);
    return null;
  }
};
