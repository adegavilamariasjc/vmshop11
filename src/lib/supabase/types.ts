
// Type definitions for Supabase tables

// Product type
export type SupabaseProduct = {
  id: number;
  name: string;
  price: number;
  category_id: number;
  created_at?: string;
  is_paused: boolean;
  order_index?: number;
};

// Category type
export type SupabaseCategory = {
  id: number;
  name: string;
  order_index: number;
  created_at?: string;
};

// Bairro type (neighborhood)
export type SupabaseBairro = {
  id: number;
  nome: string;
  taxa: number;
  created_at?: string;
  order_index?: number;
};

// Pedido type (order)
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
