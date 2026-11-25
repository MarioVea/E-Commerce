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
  'tipos-usuario': {
    table: 'tipo_usuario',
    pk: 'id_tipo_usuario',
    fields: ['nombre_tipo_usuario'],
  },
  'estados-usuario': {
    table: 'estado_usuario',
    pk: 'id_estado_usuario',
    fields: ['nombre_estado_usuario'],
  },
  'estados-venta': {
    table: 'estado_venta',
    pk: 'id_estado',
    fields: ['nombre_estado'],
  },
}

function getConfig(key: string): CatalogConfig {
  const config = CATALOGS[key]
  if (!config) {
    throw new ApiError(404, `Unknown catalog: ${key}`)
  }
  return config
}

function isBooleanField(field: string): boolean {
  return field === 'activo'
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  return value === 'true' || value === 1 || value === '1'
}

/**
 * Copies only the allowed fields, trims strings and rejects empty required
 * values. On create (`partial = false`) every non-boolean field is required.
 */
function buildPayload(
  config: CatalogConfig,
  body: Record<string, unknown>,
  partial: boolean,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  for (const field of config.fields) {
    if (body[field] === undefined) continue

    if (isBooleanField(field)) {
      payload[field] = normalizeBoolean(body[field])
      continue
    }

    const value = body[field]
    if (typeof value !== 'string' || value.trim() === '') {
      throw new ApiError(400, `El campo "${field}" es obligatorio`)
    }
    payload[field] = value.trim()
  }

  if (!partial) {
    for (const field of config.fields) {
      if (isBooleanField(field)) continue
      if (payload[field] === undefined) {
        throw new ApiError(400, `Falta el campo "${field}"`)
      }
    }
  }

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, 'No se enviaron campos válidos')
  }

  return payload
}

/**
 * Translates Postgres/PostgREST errors into friendly API errors.
 * 23505 = unique violation, 23503 = foreign key violation.
 */
function toApiError(error: { code?: string; message: string }): ApiError {
  if (error.code === '23505') {
    return new ApiError(409, 'Ya existe un registro con ese valor')
  }
  if (error.code === '23503') {
    return new ApiError(
      409,
      'No se puede eliminar: el registro está en uso por otros datos',
    )
  }
  return new ApiError(400, error.message)
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

  if (error) throw toApiError(error)
  return data ?? []
}

export async function createCatalogItem(key: string, body: Record<string, unknown>) {
  const config = getConfig(key)
  const payload = buildPayload(config, body, false)

  const { data, error } = await supabaseAdmin
    .from(config.table)
    .insert(payload)
    .select('*')
    .single()

  if (error) throw toApiError(error)
  return data
}

export async function updateCatalogItem(
  key: string,
  id: number,
  body: Record<string, unknown>,
) {
  const config = getConfig(key)
  const payload = buildPayload(config, body, true)

  const { data, error } = await supabaseAdmin
    .from(config.table)
    .update(payload)
    .eq(config.pk, id)
    .select('*')
    .maybeSingle()

  if (error) throw toApiError(error)
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

  if (error) throw toApiError(error)
  if (!data) throw new ApiError(404, 'Catalog item not found')
  return { deleted: true }
}
