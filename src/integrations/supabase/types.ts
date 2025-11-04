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
      movimentacoes_estoque: {
        Row: {
          custo_unitario: number | null
          data_movimentacao: string
          id: string
          motivo: string | null
          observacao: string | null
          pedido_id: string | null
          produto_id: number
          quantidade: number
          quantidade_anterior: number
          quantidade_nova: number
          tipo_movimentacao: string
          usuario_id: string | null
          valor_total: number | null
        }
        Insert: {
          custo_unitario?: number | null
          data_movimentacao?: string
          id?: string
          motivo?: string | null
          observacao?: string | null
          pedido_id?: string | null
          produto_id: number
          quantidade: number
          quantidade_anterior: number
          quantidade_nova: number
          tipo_movimentacao: string
          usuario_id?: string | null
          valor_total?: number | null
        }
        Update: {
          custo_unitario?: number | null
          data_movimentacao?: string
          id?: string
          motivo?: string | null
          observacao?: string | null
          pedido_id?: string | null
          produto_id?: number
          quantidade?: number
          quantidade_anterior?: number
          quantidade_nova?: number
          tipo_movimentacao?: string
          usuario_id?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      product_stats: {
        Row: {
          cart_additions: number | null
          created_at: string | null
          id: number
          last_added_to_cart_at: string | null
          last_purchased_at: string | null
          last_viewed_at: string | null
          product_id: number
          purchases: number | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          cart_additions?: number | null
          created_at?: string | null
          id?: number
          last_added_to_cart_at?: string | null
          last_purchased_at?: string | null
          last_viewed_at?: string | null
          product_id: number
          purchases?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          cart_additions?: number | null
          created_at?: string | null
          id?: number
          last_added_to_cart_at?: string | null
          last_purchased_at?: string | null
          last_viewed_at?: string | null
          product_id?: number
          purchases?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: number | null
          controlar_estoque: boolean
          custo_compra: number
          description: string
          estoque_minimo: number
          id: number
          is_paused: boolean
          margem_lucro: number
          name: string
          order_index: number | null
          price: number
          quantidade_estoque: number
          unidade_medida: string
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          controlar_estoque?: boolean
          custo_compra?: number
          description?: string
          estoque_minimo?: number
          id?: number
          is_paused?: boolean
          margem_lucro?: number
          name: string
          order_index?: number | null
          price: number
          quantidade_estoque?: number
          unidade_medida?: string
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          controlar_estoque?: boolean
          custo_compra?: number
          description?: string
          estoque_minimo?: number
          id?: number
          is_paused?: boolean
          margem_lucro?: number
          name?: string
          order_index?: number | null
          price?: number
          quantidade_estoque?: number
          unidade_medida?: string
          updated_at?: string | null
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
      profiles: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome_completo: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id: string
          nome_completo: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome_completo?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_stock_turnover: {
        Args: { days?: number }
        Returns: {
          estoque_atual: number
          giro: number
          produto_id: number
          produto_nome: string
          vendas_periodo: number
        }[]
      }
      get_top_selling_products: {
        Args: { days?: number }
        Returns: {
          produto_id: number
          produto_nome: string
          quantidade_pedidos: number
          receita_total: number
          total_vendido: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      migrate_initial_data: { Args: never; Returns: undefined }
      normalize_text: { Args: { "": string }; Returns: string }
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
      search_products_enhanced: {
        Args: { search_term: string }
        Returns: {
          cart_additions: number
          category_id: number
          category_name: string
          id: number
          is_paused: boolean
          name: string
          price: number
          purchases: number
          relevance_score: number
          views: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      track_cart_addition: {
        Args: { p_product_id: number }
        Returns: undefined
      }
      track_product_view: { Args: { p_product_id: number }; Returns: undefined }
      track_purchase: { Args: { p_product_id: number }; Returns: undefined }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "motoboy" | "balcao"
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
    Enums: {
      app_role: ["admin", "motoboy", "balcao"],
    },
  },
} as const
