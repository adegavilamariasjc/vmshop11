export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alcohol_options: {
        Row: {
          extra_cost: number
          id: number
          name: string
        }
        Insert: {
          extra_cost?: number
          id?: number
          name: string
        }
        Update: {
          extra_cost?: number
          id?: number
          name?: string
        }
        Relationships: []
      }
      bairros: {
        Row: {
          id: number
          nome: string
          order_index: number | null
          taxa: number
        }
        Insert: {
          id?: number
          nome: string
          order_index?: number | null
          taxa: number
        }
        Update: {
          id?: number
          nome?: string
          order_index?: number | null
          taxa?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          order_index: number
        }
        Insert: {
          id?: number
          name: string
          order_index?: number
        }
        Update: {
          id?: number
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      client_origins: {
        Row: {
          created_at: string | null
          id: string
          origin: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          origin: string
        }
        Update: {
          created_at?: string | null
          id?: string
          origin?: string
        }
        Relationships: []
      }
      ice_flavors: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      motoboy_chat_messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          pedido_id: string
          sender_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          pedido_id: string
          sender_type: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          pedido_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "motoboy_chat_messages_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      motoboy_payments: {
        Row: {
          created_at: string
          delivery_fee: number
          id: string
          motoboy_name: string
          payment_status: string
          pedido_id: string
        }
        Insert: {
          created_at?: string
          delivery_fee?: number
          id?: string
          motoboy_name: string
          payment_status?: string
          pedido_id: string
        }
        Update: {
          created_at?: string
          delivery_fee?: number
          id?: string
          motoboy_name?: string
          payment_status?: string
          pedido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "motoboy_payments_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      page_visits: {
        Row: {
          acao: string
          data_hora: string | null
          detalhes: Json | null
          id: string
          pagina: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          data_hora?: string | null
          detalhes?: Json | null
          id?: string
          pagina: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          data_hora?: string | null
          detalhes?: Json | null
          id?: string
          pagina?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      pedido_comprovantes: {
        Row: {
          id: string
          image_analysis: Json | null
          image_url: string
          pedido_id: string
          uploaded_at: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          id?: string
          image_analysis?: Json | null
          image_url: string
          pedido_id: string
          uploaded_at?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          id?: string
          image_analysis?: Json | null
          image_url?: string
          pedido_id?: string
          uploaded_at?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_comprovantes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_bairro: string
          cliente_complemento: string | null
          cliente_endereco: string
          cliente_nome: string
          cliente_numero: string | null
          cliente_referencia: string | null
          cliente_whatsapp: string
          codigo_pedido: string
          data_criacao: string
          discount_amount: number | null
          entregador: string | null
          forma_pagamento: string
          id: string
          itens: Json
          observacao: string | null
          status: string
          taxa_entrega: number
          total: number
          troco: string | null
        }
        Insert: {
          cliente_bairro: string
          cliente_complemento?: string | null
          cliente_endereco: string
          cliente_nome: string
          cliente_numero?: string | null
          cliente_referencia?: string | null
          cliente_whatsapp: string
          codigo_pedido: string
          data_criacao?: string
          discount_amount?: number | null
          entregador?: string | null
          forma_pagamento: string
          id?: string
          itens: Json
          observacao?: string | null
          status?: string
          taxa_entrega: number
          total: number
          troco?: string | null
        }
        Update: {
          cliente_bairro?: string
          cliente_complemento?: string | null
          cliente_endereco?: string
          cliente_nome?: string
          cliente_numero?: string | null
          cliente_referencia?: string | null
          cliente_whatsapp?: string
          codigo_pedido?: string
          data_criacao?: string
          discount_amount?: number | null
          entregador?: string | null
          forma_pagamento?: string
          id?: string
          itens?: Json
          observacao?: string | null
          status?: string
          taxa_entrega?: number
          total?: number
          troco?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: number | null
          id: number
          is_paused: boolean
          name: string
          order_index: number | null
          price: number
        }
        Insert: {
          category_id?: number | null
          id?: number
          is_paused?: boolean
          name: string
          order_index?: number | null
          price: number
        }
        Update: {
          category_id?: number | null
          id?: number
          is_paused?: boolean
          name?: string
          order_index?: number | null
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          id: number
          key: string
          value: string
        }
        Insert: {
          id?: number
          key: string
          value: string
        }
        Update: {
          id?: number
          key?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      migrate_initial_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      normalize_text: {
        Args: { "": string }
        Returns: string
      }
      search_products: {
        Args: { search_term: string }
        Returns: {
          category_id: number
          category_name: string
          id: number
          is_paused: boolean
          name: string
          price: number
          relevance: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
