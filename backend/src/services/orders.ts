import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '../config/supabase'
import { ApiError } from '../utils/http'
import type { Venta, VentaDetalle } from '../types/domain'
import { getOrCreateProfile } from './users'
import { lookups } from './lookups'
import { decrementStock, incrementStock } from './inventory'

const ORDER_SELECT = `
  id_venta, id_estado_venta, id_usuario, total_venta,
  fecha_envio, fecha_entrega, fecha_cancelacion, fecha_devolucion, fecha_creacion,
  estado_venta ( id_estado, nombre_estado ),
  usuario ( id_usuario, nombre, primer_apellido, segundo_apellido ),
  venta_detalle (
    id_venta_detalle, id_venta, id_producto, id_producto_color, cantidad, precio, subtotal,
    producto ( id_producto, nombre_producto, imagen_url )
  )
`

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function shapeOrder(order: Venta): Venta {
  return {
    ...order,
    total_venta: Number(order.total_venta),
    venta_detalle: (order.venta_detalle ?? []).map((detail: VentaDetalle) => ({
      ...detail,
      precio: Number(detail.precio),
      subtotal: Number(detail.subtotal),
    })),
  }
}

export async function getOrder(id: number): Promise<Venta> {
  const { data, error } = await supabaseAdmin
    .from('venta')
    .select(ORDER_SELECT)
    .eq('id_venta', id)
    .maybeSingle()

  if (error) throw new ApiError(500, error.message)
  if (!data) throw new ApiError(404, 'Order not found')

  return shapeOrder(data as unknown as Venta)
}

export async function listOrders(user: User, isAdmin: boolean): Promise<Venta[]> {
  let query = supabaseAdmin
    .from('venta')
    .select(ORDER_SELECT)
    .order('fecha_creacion', { ascending: false })

  if (!isAdmin) {
    const profile = await getOrCreateProfile(user)
    query = query.eq('id_usuario', profile.id_usuario)
  }

  const { data, error } = await query
  if (error) throw new ApiError(500, error.message)

  return ((data ?? []) as unknown as Venta[]).map(shapeOrder)
}

export async function getOrderForUser(
  user: User,
  id: number,
  isAdmin: boolean,
): Promise<Venta> {
  const order = await getOrder(id)

  if (!isAdmin) {
    const profile = await getOrCreateProfile(user)
    if (order.id_usuario !== profile.id_usuario) {
      throw new ApiError(403, 'This order does not belong to you')
    }
  }

  return order
}

export interface OrderItemInput {
  id_producto_color: number
  cantidad: number
}

export async function createOrder(user: User, items: OrderItemInput[]): Promise<Venta> {
  if (items.length === 0) {
    throw new ApiError(400, 'Cart is empty')
  }

  const profile = await getOrCreateProfile(user)
  const estadoPendiente = await lookups.estadoVenta('Pendiente')

  const ids = items.map((item) => item.id_producto_color)

  const { data: variants, error: variantError } = await supabaseAdmin
    .from('producto_color')
    .select(
      `
      id_producto_color, id_producto, precio_venta, disponible,
      inventario ( id_inventario, stock )
    `,
    )
    .in('id_producto_color', ids)

  if (variantError) throw new ApiError(500, variantError.message)

  const variantMap = new Map(
    ((variants ?? []) as Array<{
      id_producto_color: number
      id_producto: number
      precio_venta: string | number
      disponible: boolean
      inventario?: { id_inventario: number; stock: number }[]
    }>).map((variant) => [variant.id_producto_color, variant]),
  )

  let total = 0

  const details = items.map((item) => {
    const variant = variantMap.get(item.id_producto_color)

    if (!variant || !variant.disponible) {
      throw new ApiError(400, `Product variant ${item.id_producto_color} is not available`)
    }

    const stock = (variant.inventario ?? []).reduce(
      (sum, row) => sum + Number(row.stock),
      0,
    )

    if (stock < item.cantidad) {
      throw new ApiError(
        400,
        `Insufficient stock for variant ${item.id_producto_color}`,
      )
    }

    const precio = Number(variant.precio_venta)
    total += precio * item.cantidad

    return {
      id_producto: variant.id_producto,
      id_producto_color: variant.id_producto_color,
      cantidad: item.cantidad,
      precio,
    }
  })

  const { data: sale, error: saleError } = await supabaseAdmin
    .from('venta')
    .insert({
      id_estado_venta: estadoPendiente,
      id_usuario: profile.id_usuario,
      total_venta: total,
    })
    .select('id_venta')
    .single()

  if (saleError) throw new ApiError(400, saleError.message)

  const { error: detailError } = await supabaseAdmin.from('venta_detalle').insert(
    details.map((detail) => ({
      id_venta: sale.id_venta,
      id_producto: detail.id_producto,
      id_producto_color: detail.id_producto_color,
      cantidad: detail.cantidad,
      precio: detail.precio,
      subtotal: detail.precio * detail.cantidad,
    })),
  )

  if (detailError) {
    await supabaseAdmin.from('venta').delete().eq('id_venta', sale.id_venta)
    throw new ApiError(400, detailError.message)
  }

  for (const item of items) {
    await decrementStock(item.id_producto_color, item.cantidad)
  }

  return getOrder(Number(sale.id_venta))
}

export async function cancelOrder(
  user: User,
  id: number,
  isAdmin: boolean,
): Promise<Venta> {
  const order = await getOrderForUser(user, id, isAdmin)
  const state = order.estado_venta?.nombre_estado

  if (state !== 'Pendiente' && state !== 'Pagada') {
    throw new ApiError(400, 'This order can no longer be cancelled')
  }

  const estadoCancelada = await lookups.estadoVenta('Cancelada')

  const { error } = await supabaseAdmin
    .from('venta')
    .update({
      id_estado_venta: estadoCancelada,
      fecha_cancelacion: today(),
    })
    .eq('id_venta', id)

  if (error) throw new ApiError(400, error.message)

  for (const detail of order.venta_detalle ?? []) {
    if (detail.id_producto_color) {
      await incrementStock(detail.id_producto_color, detail.cantidad)
    }
  }

  return getOrder(id)
}

export async function returnOrder(
  user: User,
  id: number,
  isAdmin: boolean,
): Promise<Venta> {
  const order = await getOrderForUser(user, id, isAdmin)
  const state = order.estado_venta?.nombre_estado

  if (state !== 'Entregada') {
    throw new ApiError(400, 'Only delivered orders can be returned')
  }

  const estadoDevuelta = await lookups.estadoVenta('Devuelta')

  const { error } = await supabaseAdmin
    .from('venta')
    .update({
      id_estado_venta: estadoDevuelta,
      fecha_devolucion: today(),
    })
    .eq('id_venta', id)

  if (error) throw new ApiError(400, error.message)

  for (const detail of order.venta_detalle ?? []) {
    if (detail.id_producto_color) {
      await incrementStock(detail.id_producto_color, detail.cantidad)
    }
  }

  return getOrder(id)
}

export async function updateOrderStatus(id: number, estado: string): Promise<Venta> {
  const order = await getOrder(id)
  const estadoId = await lookups.estadoVenta(estado)

  const patch: Record<string, unknown> = { id_estado_venta: estadoId }

  if (estado === 'Enviada') patch.fecha_envio = today()
  if (estado === 'Entregada') patch.fecha_entrega = today()
  if (estado === 'Cancelada') patch.fecha_cancelacion = today()
  if (estado === 'Devuelta') patch.fecha_devolucion = today()

  const { error } = await supabaseAdmin
    .from('venta')
    .update(patch)
    .eq('id_venta', id)

  if (error) throw new ApiError(400, error.message)

  // Restore stock only when transitioning from a non-cancelled/non-returned state.
  const previous = order.estado_venta?.nombre_estado
  if (
    (estado === 'Cancelada' || estado === 'Devuelta') &&
    previous !== 'Cancelada' &&
    previous !== 'Devuelta'
  ) {
    for (const detail of order.venta_detalle ?? []) {
      if (detail.id_producto_color) {
        await incrementStock(detail.id_producto_color, detail.cantidad)
      }
    }
  }

  return getOrder(id)
}

export async function listOrdersByStates(states: string[]): Promise<Venta[]> {
  const ids = await Promise.all(states.map((state) => lookups.estadoVenta(state)))

  const { data, error } = await supabaseAdmin
    .from('venta')
    .select(ORDER_SELECT)
    .in('id_estado_venta', ids)
    .order('fecha_creacion', { ascending: false })

  if (error) throw new ApiError(500, error.message)

  return ((data ?? []) as unknown as Venta[]).map(shapeOrder)
}

export async function getStats() {
  const [salesResult, productsResult, usersResult] = await Promise.all([
    supabaseAdmin.from('venta').select('total_venta, id_estado_venta'),
    supabaseAdmin
      .from('producto')
      .select('id_producto', { count: 'exact', head: true })
      .eq('activo', true),
    supabaseAdmin.from('usuario').select('id_usuario', { count: 'exact', head: true }),
  ])

  if (salesResult.error) throw new ApiError(500, salesResult.error.message)
  if (productsResult.error) throw new ApiError(500, productsResult.error.message)
  if (usersResult.error) throw new ApiError(500, usersResult.error.message)

  const stateIds = {
    Pendiente: await lookups.estadoVenta('Pendiente'),
    Pagada: await lookups.estadoVenta('Pagada'),
    Enviada: await lookups.estadoVenta('Enviada'),
    Entregada: await lookups.estadoVenta('Entregada'),
    Cancelada: await lookups.estadoVenta('Cancelada'),
    Devuelta: await lookups.estadoVenta('Devuelta'),
  }

  const sales = salesResult.data ?? []
  const countByState = (stateId: number) =>
    sales.filter((sale) => sale.id_estado_venta === stateId).length

  return {
    productos: productsResult.count ?? 0,
    usuarios: usersResult.count ?? 0,
    ventas: {
      total: sales.length,
      ingresos: sales.reduce((sum, sale) => sum + Number(sale.total_venta), 0),
      pendientes: countByState(stateIds.Pendiente),
      pagadas: countByState(stateIds.Pagada),
      enviadas: countByState(stateIds.Enviada),
      entregadas: countByState(stateIds.Entregada),
      canceladas: countByState(stateIds.Cancelada),
      devueltas: countByState(stateIds.Devuelta),
    },
  }
}
