
// Re-export types from the auto-generated Supabase types file
export type {
  Tables,
  Database
} from '@/integrations/supabase/types';

// Type aliases for convenience - using the auto-generated types
import type { Tables } from '@/integrations/supabase/types';

export type SupabaseProduct = Tables<'products'>;
export type SupabaseCategory = Tables<'categories'>;
export type SupabaseBairro = Tables<'bairros'>;
export type SupabasePedido = Tables<'pedidos'>;

// Additional types for cart items and pedido items
export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  ice?: string;
  alcohol?: string;
  observation?: string;
}

export interface PedidoItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  ice?: string;
  alcohol?: string;
  observation?: string;
}
