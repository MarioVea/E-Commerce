export type Role = 'customer' | 'admin'

export interface UserProfile {
  id_usuario: number
  nombre: string
  primer_apellido: string
  segundo_apellido: string | null
  fecha_nacimiento: string | null
  edad: number | null
  tipo_usuario_rel?: { id_tipo_usuario: number; nombre_tipo_usuario: string }
  estado_usuario?: { id_estado_usuario: number; nombre_estado_usuario: string }
}

export interface User {
  id: string
  email: string
  role: Role
  fullName?: string
  profile?: UserProfile | null
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: unknown
}

export interface AuthResponse {
  user: User
  session: Session
}

export interface ProductVariant {
  id_producto_color: number
  color: string | null
  talla: string | null
  precio_venta: number
  stock: number
  disponible: boolean
}

export interface Product {
  id_producto: number
  nombre_producto: string
  descripcion_producto: string | null
  imagen_url: string | null
  activo: boolean
  tipo: string | null
  id_tipo: number
  precio: number
  stock: number
  variantes: ProductVariant[]
}

export interface CartItem {
  id_producto_color: number
  id_producto: number
  nombre_producto: string
  color: string | null
  talla: string | null
  precio: number
  imagen_url: string | null
  cantidad: number
  stock: number
}

export interface OrderDetail {
  id_venta_detalle: number
  id_venta: number
  id_producto: number
  id_producto_color: number | null
  cantidad: number
  precio: number
  subtotal: number
  producto?: { id_producto: number; nombre_producto: string; imagen_url: string | null }
}

export interface Order {
  id_venta: number
  id_estado_venta: number
  id_usuario: number
  total_venta: number
  fecha_envio: string | null
  fecha_entrega: string | null
  fecha_cancelacion: string | null
  fecha_devolucion: string | null
  fecha_creacion: string
  estado_venta?: { id_estado: number; nombre_estado: string }
  usuario?: {
    id_usuario: number
    nombre: string
    primer_apellido: string
    segundo_apellido: string | null
  }
  venta_detalle?: OrderDetail[]
}

export interface CatalogItem {
  [key: string]: string | number | boolean | null
}

export interface TipoProducto {
  id_tipo: number
  nombre_tipo: string
}

export interface Color {
  id_color: number
  nombre_color: string
}

export interface Talla {
  id_talla: number
  clave_talla: string
  nombre_talla: string
}

export interface Proveedor {
  id_proveedor: number
  nombre_proveedor: string
  activo: boolean
}
