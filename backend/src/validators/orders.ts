import { z } from 'zod'

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id_producto_color: z.coerce.number().int().positive(),
        cantidad: z.coerce.number().int().positive(),
      }),
    )
    .min(1, 'Cart is empty'),
})

export const updateOrderStatusSchema = z.object({
  estado: z.enum(['Pendiente', 'Pagada', 'Enviada', 'Entregada', 'Cancelada', 'Devuelta']),
})
