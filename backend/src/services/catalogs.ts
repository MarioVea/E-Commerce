import { supabaseAdmin } from '../config/supabase'
import { ApiError } from '../utils/http'

interface CatalogConfig {
  table: string
  pk: string
  fields: string[]
}

const CATALOGS: Record<string, CatalogConfig> = {
  'tipos-producto': {
    table: 'tipo_producto',
    pk: 'id_tipo',
    fields: ['nombre_tipo'],
  },
  colores: {
    table: 'color',
    pk: 'id_color',
    fields: ['nombre_color'],
  },
  tallas: {
    table: 'talla',
    pk: 'id_talla',
    fields: ['clave_talla', 'nombre_talla'],
  },
  proveedores: {
    table: 'proveedor',
    pk: 'id_proveedor',
    fields: ['nombre_proveedor', 'activo'],
  },
}

function getConfig(key: string): CatalogConfig {
  const config = CATALOGS[key]
  if (!config) {
    throw new ApiError(404, `Unknown catalog: ${key}`)
  }
  return config
}

function pick(body: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const field of fields) {
    if (body[field] !== undefined) {
      payload[field] = body[field]
    }
  }
  return payload
}

export function catalogKeys(): string[] {
  return Object.keys(CATALOGS)
}

export async function listCatalog(key: string) {
  const config = getConfig(key)
  const { data, error } = await supabaseAdmin
    .from(config.table)
    .select('*')
    .order(config.pk)

  if (error) throw new ApiError(500, error.message)
  return data ?? []
}

export async function createCatalogItem(key: string, body: Record<string, unknown>) {
  const config = getConfig(key)
  const payload = pick(body, config.fields)

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, 'No valid fields provided')
  }

  const { data, error } = await supabaseAdmin
    .from(config.table)
    .insert(payload)
    .select('*')
    .single()

  if (error) throw new ApiError(400, error.message)
  return data
}

export async function updateCatalogItem(
  key: string,
  id: number,
  body: Record<string, unknown>,
) {
  const config = getConfig(key)
  const payload = pick(body, config.fields)

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, 'No valid fields provided')
  }

  const { data, error } = await supabaseAdmin
    .from(config.table)
    .update(payload)
    .eq(config.pk, id)
    .select('*')
    .maybeSingle()

  if (error) throw new ApiError(400, error.message)
  if (!data) throw new ApiError(404, 'Catalog item not found')
  return data
}

export async function deleteCatalogItem(key: string, id: number) {
  const config = getConfig(key)

  const { data, error } = await supabaseAdmin
    .from(config.table)
    .delete()
    .eq(config.pk, id)
    .select(config.pk)
    .maybeSingle()

  if (error) throw new ApiError(400, error.message)
  if (!data) throw new ApiError(404, 'Catalog item not found')
  return { deleted: true }
}
