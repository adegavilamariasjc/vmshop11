export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      migrate_initial_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
