export interface CatalogField {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'checkbox'
}

export interface CatalogConfig {
  key: string
  label: string
  pk: string
  fields: CatalogField[]
}

export const CATALOGS: CatalogConfig[] = [
  {
    key: 'tipos-producto',
    label: 'Tipos de producto',
    pk: 'id_tipo',
    fields: [{ name: 'nombre_tipo', label: 'Nombre' }],
  },
  {
    key: 'colores',
    label: 'Colores',
    pk: 'id_color',
    fields: [{ name: 'nombre_color', label: 'Nombre' }],
  },
  {
    key: 'tallas',
    label: 'Tallas',
    pk: 'id_talla',
    fields: [
      { name: 'clave_talla', label: 'Clave (XS, S, M...)' },
      { name: 'nombre_talla', label: 'Nombre' },
    ],
  },
  {
    key: 'proveedores',
    label: 'Proveedores',
    pk: 'id_proveedor',
    fields: [
      { name: 'nombre_proveedor', label: 'Nombre' },
      { name: 'numero_telefono', label: 'Número de teléfono', type: 'tel' },
      { name: 'direccion', label: 'Dirección' },
      { name: 'correo_electronico', label: 'Correo electrónico', type: 'email' },
      { name: 'activo', label: 'Activo', type: 'checkbox' },
    ],
  },
  {
    key: 'tipos-usuario',
    label: 'Tipos de usuario',
    pk: 'id_tipo_usuario',
    fields: [{ name: 'nombre_tipo_usuario', label: 'Nombre' }],
  },
  {
    key: 'estados-usuario',
    label: 'Estados de usuario',
    pk: 'id_estado_usuario',
    fields: [{ name: 'nombre_estado_usuario', label: 'Nombre' }],
  },
  {
    key: 'estados-venta',
    label: 'Estados de venta',
    pk: 'id_estado',
    fields: [{ name: 'nombre_estado', label: 'Nombre' }],
  },
]
