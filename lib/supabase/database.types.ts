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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          categoria: string | null
          created_at: string
          curso: string | null
          email: string
          id: string
          matricula: string | null
          nome: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["profile_status"]
          telefone: string | null
          unidade_campus: string | null
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          curso?: string | null
          email: string
          id: string
          matricula?: string | null
          nome: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          telefone?: string | null
          unidade_campus?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          curso?: string | null
          email?: string
          id?: string
          matricula?: string | null
          nome?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          telefone?: string | null
          unidade_campus?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          cancelado_em: string | null
          cancelado_por: string | null
          created_at: string
          data_hora_fim: string
          data_hora_inicio: string
          finalidade: string
          id: string
          observacoes: string | null
          resource_id: string
          resource_unit_id: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelado_em?: string | null
          cancelado_por?: string | null
          created_at?: string
          data_hora_fim: string
          data_hora_inicio: string
          finalidade: string
          id?: string
          observacoes?: string | null
          resource_id: string
          resource_unit_id?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelado_em?: string | null
          cancelado_por?: string | null
          created_at?: string
          data_hora_fim?: string
          data_hora_inicio?: string
          finalidade?: string
          id?: string
          observacoes?: string | null
          resource_id?: string
          resource_unit_id?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_cancelado_por_fkey"
            columns: ["cancelado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_resource_unit_id_fkey"
            columns: ["resource_unit_id"]
            isOneToOne: false
            referencedRelation: "resource_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_units: {
        Row: {
          codigo: string
          created_at: string
          id: string
          resource_id: string
          status: Database["public"]["Enums"]["unit_status"]
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: string
          resource_id: string
          status?: Database["public"]["Enums"]["unit_status"]
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: string
          resource_id?: string
          status?: Database["public"]["Enums"]["unit_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_units_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          antecedencia_minima_minutos: number
          ativo: boolean
          created_at: string
          descricao: string | null
          duracao_maxima_minutos: number | null
          horario_abertura: string | null
          horario_fechamento: string | null
          id: string
          imagens: string[]
          is_shared_space: boolean
          local: string | null
          modelo_3d_url: string | null
          nome: string
          orientacoes_seguranca: string[] | null
          slug: string
          tipo: Database["public"]["Enums"]["resource_type"]
          updated_at: string
        }
        Insert: {
          antecedencia_minima_minutos?: number
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          duracao_maxima_minutos?: number | null
          horario_abertura?: string | null
          horario_fechamento?: string | null
          id?: string
          imagens?: string[]
          is_shared_space?: boolean
          local?: string | null
          modelo_3d_url?: string | null
          nome: string
          orientacoes_seguranca?: string[] | null
          slug: string
          tipo: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
        }
        Update: {
          antecedencia_minima_minutos?: number
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          duracao_maxima_minutos?: number | null
          horario_abertura?: string | null
          horario_fechamento?: string | null
          id?: string
          imagens?: string[]
          is_shared_space?: boolean
          local?: string | null
          modelo_3d_url?: string | null
          nome?: string
          orientacoes_seguranca?: string[] | null
          slug?: string
          tipo?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_reservation: {
        Args: { p_reservation_id: string }
        Returns: {
          cancelado_em: string | null
          cancelado_por: string | null
          created_at: string
          data_hora_fim: string
          data_hora_inicio: string
          finalidade: string
          id: string
          observacoes: string | null
          resource_id: string
          resource_unit_id: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_reservation: {
        Args: {
          p_data_hora_fim: string
          p_data_hora_inicio: string
          p_finalidade: string
          p_observacoes?: string
          p_resource_id: string
        }
        Returns: {
          cancelado_em: string | null
          cancelado_por: string | null
          created_at: string
          data_hora_fim: string
          data_hora_inicio: string
          finalidade: string
          id: string
          observacoes: string | null
          resource_id: string
          resource_unit_id: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      profile_status: "active" | "deleted"
      reservation_status: "ATIVA" | "CANCELADA"
      resource_type:
        | "laboratorio"
        | "equipamento"
        | "impressora_3d"
        | "kit"
        | "espaco_compartilhado"
      unit_status: "disponivel" | "manutencao" | "inativa"
      user_role: "user" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      profile_status: ["active", "deleted"],
      reservation_status: ["ATIVA", "CANCELADA"],
      resource_type: [
        "laboratorio",
        "equipamento",
        "impressora_3d",
        "kit",
        "espaco_compartilhado",
      ],
      unit_status: ["disponivel", "manutencao", "inativa"],
      user_role: ["user", "admin"],
    },
  },
} as const
