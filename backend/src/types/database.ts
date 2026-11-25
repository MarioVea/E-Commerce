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
    PostgrestVersion: "14.18"
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
      color: {
        Row: {
          id_color: number
          nombre_color: string
        }
        Insert: {
          id_color?: number
          nombre_color: string
        }
        Update: {
          id_color?: number
          nombre_color?: string
        }
        Relationships: []
      }
      estado_usuario: {
        Row: {
          id_estado_usuario: number
          nombre_estado_usuario: string
        }
        Insert: {
          id_estado_usuario?: number
          nombre_estado_usuario: string
        }
        Update: {
          id_estado_usuario?: number
          nombre_estado_usuario?: string
        }
        Relationships: []
      }
      estado_venta: {
        Row: {
          id_estado: number
          nombre_estado: string
        }
        Insert: {
          id_estado?: number
          nombre_estado: string
        }
        Update: {
          id_estado?: number
          nombre_estado?: string
        }
        Relationships: []
      }
      historial_precios: {
        Row: {
          fecha_registro: string
          id_producto_color: number
          margen_ganancia: number
          precio_compra: number
          precio_venta: number
        }
        Insert: {
          fecha_registro?: string
          id_producto_color: number
          margen_ganancia?: number
          precio_compra: number
          precio_venta: number
        }
        Update: {
          fecha_registro?: string
          id_producto_color?: number
          margen_ganancia?: number
          precio_compra?: number
          precio_venta?: number
        }
        Relationships: [
          {
            foreignKeyName: "historial_precios_id_producto_color_fkey"
            columns: ["id_producto_color"]
            isOneToOne: false
            referencedRelation: "producto_color"
            referencedColumns: ["id_producto_color"]
          },
        ]
      }
      inventario: {
        Row: {
          id_inventario: number
          id_producto_color: number
          id_proveedor: number
          minimo: number
          stock: number
        }
        Insert: {
          id_inventario?: number
          id_producto_color: number
          id_proveedor: number
          minimo?: number
          stock?: number
        }
        Update: {
          id_inventario?: number
          id_producto_color?: number
          id_proveedor?: number
          minimo?: number
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventario_id_producto_color_fkey"
            columns: ["id_producto_color"]
            isOneToOne: false
            referencedRelation: "producto_color"
            referencedColumns: ["id_producto_color"]
          },
          {
            foreignKeyName: "inventario_id_proveedor_fkey"
            columns: ["id_proveedor"]
            isOneToOne: false
            referencedRelation: "proveedor"
            referencedColumns: ["id_proveedor"]
          },
        ]
      }
      producto: {
        Row: {
          activo: boolean
          descripcion_producto: string | null
          id_producto: number
          id_tipo: number
          imagen_url: string | null
          nombre_producto: string
        }
        Insert: {
          activo?: boolean
          descripcion_producto?: string | null
          id_producto?: number
          id_tipo: number
          imagen_url?: string | null
          nombre_producto: string
        }
        Update: {
          activo?: boolean
          descripcion_producto?: string | null
          id_producto?: number
          id_tipo?: number
          imagen_url?: string | null
          nombre_producto?: string
        }
        Relationships: [
          {
            foreignKeyName: "producto_id_tipo_fkey"
            columns: ["id_tipo"]
            isOneToOne: false
            referencedRelation: "tipo_producto"
            referencedColumns: ["id_tipo"]
          },
        ]
      }
      producto_color: {
        Row: {
          disponible: boolean
          id_color: number
          id_producto: number
          id_producto_color: number
          id_producto_talla: number
          margen_ganancia: number
          precio_compra: number
          precio_venta: number
        }
        Insert: {
          disponible?: boolean
          id_color: number
          id_producto: number
          id_producto_color?: number
          id_producto_talla: number
          margen_ganancia?: number
          precio_compra?: number
          precio_venta?: number
        }
        Update: {
          disponible?: boolean
          id_color?: number
          id_producto?: number
          id_producto_color?: number
          id_producto_talla?: number
          margen_ganancia?: number
          precio_compra?: number
          precio_venta?: number
        }
        Relationships: [
          {
            foreignKeyName: "producto_color_id_color_fkey"
            columns: ["id_color"]
            isOneToOne: false
            referencedRelation: "color"
            referencedColumns: ["id_color"]
          },
          {
            foreignKeyName: "producto_color_id_producto_fkey"
            columns: ["id_producto"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id_producto"]
          },
          {
            foreignKeyName: "producto_color_id_producto_talla_fkey"
            columns: ["id_producto_talla"]
            isOneToOne: false
            referencedRelation: "producto_talla"
            referencedColumns: ["id_producto_talla"]
          },
        ]
      }
      producto_talla: {
        Row: {
          id_producto: number
          id_producto_talla: number
          id_talla: number
        }
        Insert: {
          id_producto: number
          id_producto_talla?: number
          id_talla: number
        }
        Update: {
          id_producto?: number
          id_producto_talla?: number
          id_talla?: number
        }
        Relationships: [
          {
            foreignKeyName: "producto_talla_id_producto_fkey"
            columns: ["id_producto"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id_producto"]
          },
          {
            foreignKeyName: "producto_talla_id_talla_fkey"
            columns: ["id_talla"]
            isOneToOne: false
            referencedRelation: "talla"
            referencedColumns: ["id_talla"]
          },
        ]
      }
      proveedor: {
        Row: {
          activo: boolean
          id_proveedor: number
          nombre_proveedor: string
        }
        Insert: {
          activo?: boolean
          id_proveedor?: number
          nombre_proveedor: string
        }
        Update: {
          activo?: boolean
          id_proveedor?: number
          nombre_proveedor?: string
        }
        Relationships: []
      }
      talla: {
        Row: {
          clave_talla: string
          id_talla: number
          nombre_talla: string
        }
        Insert: {
          clave_talla: string
          id_talla?: number
          nombre_talla: string
        }
        Update: {
          clave_talla?: string
          id_talla?: number
          nombre_talla?: string
        }
        Relationships: []
      }
      tipo_producto: {
        Row: {
          id_tipo: number
          nombre_tipo: string
        }
        Insert: {
          id_tipo?: number
          nombre_tipo: string
        }
        Update: {
          id_tipo?: number
          nombre_tipo?: string
        }
        Relationships: []
      }
      tipo_usuario: {
        Row: {
          id_tipo_usuario: number
          nombre_tipo_usuario: string
        }
        Insert: {
          id_tipo_usuario?: number
          nombre_tipo_usuario: string
        }
        Update: {
          id_tipo_usuario?: number
          nombre_tipo_usuario?: string
        }
        Relationships: []
      }
      usuario: {
        Row: {
          auth_id: string | null
          edad: number | null
          fecha_creacion: string
          fecha_nacimiento: string | null
          id_estado: number
          id_usuario: number
          nombre: string
          primer_apellido: string
          segundo_apellido: string | null
          tipo_usuario: number
        }
        Insert: {
          auth_id?: string | null
          edad?: number | null
          fecha_creacion?: string
          fecha_nacimiento?: string | null
          id_estado: number
          id_usuario?: number
          nombre: string
          primer_apellido: string
          segundo_apellido?: string | null
          tipo_usuario: number
        }
        Update: {
          auth_id?: string | null
          edad?: number | null
          fecha_creacion?: string
          fecha_nacimiento?: string | null
          id_estado?: number
          id_usuario?: number
          nombre?: string
          primer_apellido?: string
          segundo_apellido?: string | null
          tipo_usuario?: number
        }
        Relationships: [
          {
            foreignKeyName: "usuario_id_estado_fkey"
            columns: ["id_estado"]
            isOneToOne: false
            referencedRelation: "estado_usuario"
            referencedColumns: ["id_estado_usuario"]
          },
          {
            foreignKeyName: "usuario_tipo_usuario_fkey"
            columns: ["tipo_usuario"]
            isOneToOne: false
            referencedRelation: "tipo_usuario"
            referencedColumns: ["id_tipo_usuario"]
          },
        ]
      }
      venta: {
        Row: {
          fecha_cancelacion: string | null
          fecha_creacion: string
          fecha_devolucion: string | null
          fecha_entrega: string | null
          fecha_envio: string | null
          id_estado_venta: number
          id_usuario: number
          id_venta: number
          total_venta: number
        }
        Insert: {
          fecha_cancelacion?: string | null
          fecha_creacion?: string
          fecha_devolucion?: string | null
          fecha_entrega?: string | null
          fecha_envio?: string | null
          id_estado_venta: number
          id_usuario: number
          id_venta?: number
          total_venta?: number
        }
        Update: {
          fecha_cancelacion?: string | null
          fecha_creacion?: string
          fecha_devolucion?: string | null
          fecha_entrega?: string | null
          fecha_envio?: string | null
          id_estado_venta?: number
          id_usuario?: number
          id_venta?: number
          total_venta?: number
        }
        Relationships: [
          {
            foreignKeyName: "venta_id_estado_venta_fkey"
            columns: ["id_estado_venta"]
            isOneToOne: false
            referencedRelation: "estado_venta"
            referencedColumns: ["id_estado"]
          },
          {
            foreignKeyName: "venta_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      venta_detalle: {
        Row: {
          cantidad: number
          id_producto: number
          id_producto_color: number | null
          id_venta: number
          id_venta_detalle: number
          precio: number
          subtotal: number
        }
        Insert: {
          cantidad: number
          id_producto: number
          id_producto_color?: number | null
          id_venta: number
          id_venta_detalle?: number
          precio: number
          subtotal?: number
        }
        Update: {
          cantidad?: number
          id_producto?: number
          id_producto_color?: number | null
          id_venta?: number
          id_venta_detalle?: number
          precio?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "venta_detalle_id_producto_color_fkey"
            columns: ["id_producto_color"]
            isOneToOne: false
            referencedRelation: "producto_color"
            referencedColumns: ["id_producto_color"]
          },
          {
            foreignKeyName: "venta_detalle_id_producto_fkey"
            columns: ["id_producto"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id_producto"]
          },
          {
            foreignKeyName: "venta_detalle_id_venta_fkey"
            columns: ["id_venta"]
            isOneToOne: false
            referencedRelation: "venta"
            referencedColumns: ["id_venta"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
