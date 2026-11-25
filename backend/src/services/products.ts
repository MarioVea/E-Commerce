import { supabaseAdmin } from '../config/supabase'
import { ApiError } from '../utils/http'
import type { Producto, ProductResponse } from '../types/domain'
import { getIdByValue, lookups } from './lookups'
import { getOrCreateDemoProvider } from './inventory'

const PRODUCT_SELECT = `
  id_producto, id_tipo, nombre_producto, descripcion_producto, imagen_url, activo,
  tipo_producto ( id_tipo, nombre_tipo ),
  producto_color (
    id_producto_color, id_producto_talla, id_color, id_producto, disponible,
    precio_compra, precio_venta, margen_ganancia,
    color ( id_color, nombre_color ),
    producto_talla ( id_producto_talla, id_talla, talla ( id_talla, clave_talla, nombre_talla ) ),
    inventario ( id_inventario, id_producto_color, id_proveedor, stock, minimo )
  )
`

function shapeProduct(product: Producto): ProductResponse {
  const variantes = (product.producto_color ?? []).map((variant) => ({
    id_producto_color: variant.id_producto_color,
    color: variant.color?.nombre_color ?? null,
    talla: variant.producto_talla?.talla?.clave_talla ?? null,
    precio_venta: Number(variant.precio_venta),
    stock: (variant.inventario ?? []).reduce((sum, row) => sum + Number(row.stock), 0),
    disponible: variant.disponible,
  }))

  const prices = variantes.map((variant) => variant.precio_venta).filter((price) => price > 0)

  return {
    id_producto: product.id_producto,
    nombre_producto: product.nombre_producto,
    descripcion_producto: product.descripcion_producto,
    imagen_url: product.imagen_url,
    activo: product.activo,
    tipo: product.tipo_producto?.nombre_tipo ?? null,
    id_tipo: product.id_tipo,
    precio: prices.length ? Math.min(...prices) : 0,
    stock: variantes.reduce((sum, variant) => sum + variant.stock, 0),
    variantes,
  }
}

export async function listProducts(params: {
  q?: string
  tipo?: string
  idTipo?: number
  includeInactive?: boolean
}): Promise<ProductResponse[]> {
  let query = supabaseAdmin
    .from('producto')
    .select(PRODUCT_SELECT)
    .order('id_producto', { ascending: true })

  if (!params.includeInactive) {
    query = query.eq('activo', true)
  }

  if (params.idTipo) {
    query = query.eq('id_tipo', params.idTipo)
  } else if (params.tipo) {
    const tipoId = await getIdByValue(
      'tipo_producto',
      'id_tipo',
      'nombre_tipo',
      params.tipo,
    )
    query = query.eq('id_tipo', tipoId)
  }

  if (params.q) {
    const q = params.q.replace(/[%,()]/g, ' ').trim()
    if (q) {
      query = query.or(`nombre_producto.ilike.%${q}%,descripcion_producto.ilike.%${q}%`)
    }
  }

  const { data, error } = await query
  if (error) throw new ApiError(500, error.message)

  return ((data ?? []) as unknown as Producto[]).map(shapeProduct)
}

export async function getProduct(id: number): Promise<ProductResponse> {
  const { data, error } = await supabaseAdmin
    .from('producto')
    .select(PRODUCT_SELECT)
    .eq('id_producto', id)
    .maybeSingle()

  if (error) throw new ApiError(500, error.message)
  if (!data) throw new ApiError(404, 'Product not found')

  return shapeProduct(data as unknown as Producto)
}

export interface CreateProductInput {
  nombre_producto: string
  descripcion_producto?: string
  id_tipo: number
  imagen_url?: string
  id_talla?: number
  id_color?: number
  precio_compra?: number
  precio_venta?: number
  stock?: number
  variantes?: {
    id_talla: number
    id_color: number
    precio_compra: number
    precio_venta: number
    stock: number
  }[]
}

export async function createProduct(input: CreateProductInput): Promise<ProductResponse> {
  const { data: product, error } = await supabaseAdmin
    .from('producto')
    .insert({
      id_tipo: input.id_tipo,
      nombre_producto: input.nombre_producto,
      descripcion_producto: input.descripcion_producto ?? null,
      imagen_url: input.imagen_url ?? null,
    })
    .select('id_producto')
    .single()

  if (error) throw new ApiError(400, error.message)

  const variants =
    input.variantes && input.variantes.length > 0
      ? input.variantes
      : [
          {
            id_talla: input.id_talla ?? (await lookups.tallaUnica()),
            id_color: input.id_color ?? 1,
            precio_compra: input.precio_compra ?? 0,
            precio_venta: input.precio_venta ?? 0,
            stock: input.stock ?? 0,
          },
        ]

  const provider = await getOrCreateDemoProvider()

  for (const variant of variants) {
    let productoColorId: number | undefined

    const { data: existingTalla } = await supabaseAdmin
      .from('producto_talla')
      .select('id_producto_talla')
      .eq('id_producto', product.id_producto)
      .eq('id_talla', variant.id_talla)
      .maybeSingle()

    let productoTallaId = existingTalla?.id_producto_talla

    if (!productoTallaId) {
      const { data: createdTalla, error: tallaError } = await supabaseAdmin
        .from('producto_talla')
        .insert({ id_producto: product.id_producto, id_talla: variant.id_talla })
        .select('id_producto_talla')
        .single()

      if (tallaError) throw new ApiError(400, tallaError.message)
      productoTallaId = createdTalla.id_producto_talla
    }

    const { data: createdColor, error: colorError } = await supabaseAdmin
      .from('producto_color')
      .insert({
        id_producto_talla: productoTallaId,
        id_color: variant.id_color,
        id_producto: product.id_producto,
        disponible: true,
        precio_compra: variant.precio_compra,
        precio_venta: variant.precio_venta,
        margen_ganancia: variant.precio_venta - variant.precio_compra,
      })
      .select('id_producto_color')
      .single()

    if (colorError) throw new ApiError(400, colorError.message)
    productoColorId = createdColor.id_producto_color

    if (variant.stock > 0) {
      const { error: inventoryError } = await supabaseAdmin.from('inventario').insert({
        id_producto_color: productoColorId,
        id_proveedor: provider,
        stock: variant.stock,
        minimo: 0,
      })

      if (inventoryError) throw new ApiError(400, inventoryError.message)
    }
  }

  return getProduct(Number(product.id_producto))
}

export async function updateProduct(
  id: number,
  input: {
    nombre_producto?: string
    descripcion_producto?: string
    id_tipo?: number
    imagen_url?: string | null
    activo?: boolean
  },
): Promise<ProductResponse> {
  const patch: Record<string, unknown> = {}

  if (input.nombre_producto !== undefined) patch.nombre_producto = input.nombre_producto
  if (input.descripcion_producto !== undefined) {
    patch.descripcion_producto = input.descripcion_producto
  }
  if (input.id_tipo !== undefined) patch.id_tipo = input.id_tipo
  if (input.imagen_url !== undefined) patch.imagen_url = input.imagen_url
  if (input.activo !== undefined) patch.activo = input.activo

  if (Object.keys(patch).length > 0) {
    const { data, error } = await supabaseAdmin
      .from('producto')
      .update(patch)
      .eq('id_producto', id)
      .select('id_producto')
      .maybeSingle()

    if (error) throw new ApiError(400, error.message)
    if (!data) throw new ApiError(404, 'Product not found')
  }

  return getProduct(id)
}

export async function deactivateProduct(id: number): Promise<ProductResponse> {
  return updateProduct(id, { activo: false })
}
