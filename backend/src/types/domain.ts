export interface Color {
  id_color: number
  nombre_color: string
}

export interface Talla {
  id_talla: number
  clave_talla: string
  nombre_talla: string
}

export interface TipoProducto {
  id_tipo: number
  nombre_tipo: string
}

export interface Inventario {
  id_inventario: number
  id_producto_color: number
  id_proveedor: number
  stock: number
  minimo: number
}

export interface ProductoTalla {
  id_producto_talla: number
  id_producto: number
  id_talla: number
  talla?: Talla
}

export interface ProductoColor {
  id_producto_color: number
  id_producto_talla: number
  id_color: number
  id_producto: number
  disponible: boolean
  precio_compra: string | number
  precio_venta: string | number
  margen_ganancia: string | number
  color?: Color
  producto_talla?: ProductoTalla
  inventario?: Inventario[]
}

export interface Producto {
  id_producto: number
  id_tipo: number
  nombre_producto: string
  descripcion_producto: string | null
  imagen_url: string | null
  activo: boolean
  tipo_producto?: TipoProducto
  producto_color?: ProductoColor[]
}

export interface Usuario {
  id_usuario: number
  tipo_usuario: number
  nombre: string
  primer_apellido: string
  segundo_apellido: string | null
  fecha_nacimiento: string | null
  edad: number | null
  fecha_creacion: string
  id_estado: number
  auth_id: string | null
  tipo_usuario_rel?: { id_tipo_usuario: number; nombre_tipo_usuario: string }
  estado_usuario?: { id_estado_usuario: number; nombre_estado_usuario: string }
}

export interface VentaDetalle {
  id_venta_detalle: number
  id_venta: number
  id_producto: number
  id_producto_color: number | null
  cantidad: number
  precio: string | number
  subtotal: string | number
  producto?: { id_producto: number; nombre_producto: string; imagen_url: string | null }
}

export interface Venta {
  id_venta: number
  id_estado_venta: number
  id_usuario: number
  total_venta: string | number
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
  venta_detalle?: VentaDetalle[]
}

export interface ProductVariantResponse {
  id_producto_color: number
  color: string | null
  talla: string | null
  precio_venta: number
  stock: number
  disponible: boolean
}

export interface ProductResponse {
  id_producto: number
  nombre_producto: string
  descripcion_producto: string | null
  imagen_url: string | null
  activo: boolean
  tipo: string | null
  id_tipo: number
  precio: number
  stock: number
  variantes: ProductVariantResponse[]
}
