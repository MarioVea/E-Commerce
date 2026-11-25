import { z } from 'zod'

export const variantSchema = z.object({
  id_talla: z.coerce.number().int().positive(),
  id_color: z.coerce.number().int().positive(),
  precio_compra: z.coerce.number().min(0).default(0),
  precio_venta: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().min(0).default(0),
})

export const createProductSchema = z.object({
  nombre_producto: z.string().min(2, 'Product name is too short'),
  descripcion_producto: z.string().optional(),
  id_tipo: z.coerce.number().int().positive(),
  imagen_url: z.string().url().optional(),
  // Single-variant convenience fields (used by the admin form).
  id_talla: z.coerce.number().int().positive().optional(),
  id_color: z.coerce.number().int().positive().optional(),
  precio_compra: z.coerce.number().min(0).optional(),
  precio_venta: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  variantes: z.array(variantSchema).optional(),
})

export const updateProductSchema = z.object({
  nombre_producto: z.string().min(2).optional(),
  descripcion_producto: z.string().optional(),
  id_tipo: z.coerce.number().int().positive().optional(),
  imagen_url: z.string().url().nullable().optional(),
  activo: z.boolean().optional(),
})
