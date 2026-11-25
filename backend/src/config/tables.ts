/**
 * Real table names from the Supabase schema (confirmed with `supabase db pull`).
 */
export const TABLES = {
  producto: 'producto',
  productoColor: 'producto_color',
  productoTalla: 'producto_talla',
  color: 'color',
  talla: 'talla',
  tipoProducto: 'tipo_producto',
  tipoUsuario: 'tipo_usuario',
  estadoUsuario: 'estado_usuario',
  estadoVenta: 'estado_venta',
  usuario: 'usuario',
  venta: 'venta',
  ventaDetalle: 'venta_detalle',
  inventario: 'inventario',
  proveedor: 'proveedor',
} as const
