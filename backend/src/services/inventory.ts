import { supabaseAdmin } from '../config/supabase'
import { ApiError } from '../utils/http'

export async function getOrCreateDemoProvider(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('proveedor')
    .select('id_proveedor')
    .eq('nombre_proveedor', 'Proveedor Demo')
    .limit(1)
    .maybeSingle()

  if (error) throw new ApiError(500, error.message)
  if (data) return Number(data.id_proveedor)

  const { data: created, error: createError } = await supabaseAdmin
    .from('proveedor')
    .insert({ nombre_proveedor: 'Proveedor Demo' })
    .select('id_proveedor')
    .single()

  if (createError) throw new ApiError(400, createError.message)
  return Number(created.id_proveedor)
}

export async function decrementStock(
  idProductoColor: number,
  cantidad: number,
): Promise<void> {
  const { data: rows, error } = await supabaseAdmin
    .from('inventario')
    .select('id_inventario, stock')
    .eq('id_producto_color', idProductoColor)
    .order('stock', { ascending: false })

  if (error) throw new ApiError(500, error.message)

  let remaining = cantidad

  for (const row of rows ?? []) {
    if (remaining <= 0) break
    const available = Number(row.stock)
    if (available <= 0) continue

    const take = Math.min(available, remaining)
    const { error: updateError } = await supabaseAdmin
      .from('inventario')
      .update({ stock: available - take })
      .eq('id_inventario', row.id_inventario)

    if (updateError) throw new ApiError(500, updateError.message)
    remaining -= take
  }

  if (remaining > 0) {
    throw new ApiError(400, 'Insufficient stock')
  }
}

export async function incrementStock(
  idProductoColor: number,
  cantidad: number,
): Promise<void> {
  const { data: rows, error } = await supabaseAdmin
    .from('inventario')
    .select('id_inventario, stock')
    .eq('id_producto_color', idProductoColor)
    .order('stock', { ascending: false })
    .limit(1)

  if (error) throw new ApiError(500, error.message)

  if (rows && rows.length > 0) {
    const row = rows[0]
    const { error: updateError } = await supabaseAdmin
      .from('inventario')
      .update({ stock: Number(row.stock) + cantidad })
      .eq('id_inventario', row.id_inventario)

    if (updateError) throw new ApiError(500, updateError.message)
    return
  }

  const provider = await getOrCreateDemoProvider()
  const { error: insertError } = await supabaseAdmin.from('inventario').insert({
    id_producto_color: idProductoColor,
    id_proveedor: provider,
    stock: cantidad,
    minimo: 0,
  })

  if (insertError) throw new ApiError(500, insertError.message)
}
