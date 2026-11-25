import { supabaseAdmin } from '../config/supabase'
import { ApiError } from '../utils/http'

/**
 * Resolves the numeric primary key of a catalog row from a human-readable value.
 * Example: table `tipo_usuario`, id column `id_tipo_usuario`, name column
 * `nombre_tipo_usuario`, value `Cliente` → 1.
 */
export async function getIdByValue(
  table: string,
  idColumn: string,
  nameColumn: string,
  value: string,
): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select(`${idColumn}, ${nameColumn}`)
    .eq(nameColumn, value)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new ApiError(500, error.message)
  }

  if (!data) {
    throw new ApiError(500, `No se encontró "${value}" en ${table}.${nameColumn}`)
  }

  return Number((data as unknown as Record<string, unknown>)[idColumn])
}

export const lookups = {
  tipoCliente: () =>
    getIdByValue('tipo_usuario', 'id_tipo_usuario', 'nombre_tipo_usuario', 'Cliente'),
  tipoAdministrador: () =>
    getIdByValue('tipo_usuario', 'id_tipo_usuario', 'nombre_tipo_usuario', 'Administrador'),
  estadoActivo: () =>
    getIdByValue('estado_usuario', 'id_estado_usuario', 'nombre_estado_usuario', 'Activo'),
  estadoVenta: (nombre: string) =>
    getIdByValue('estado_venta', 'id_estado', 'nombre_estado', nombre),
  tipoGorra: () => getIdByValue('tipo_producto', 'id_tipo', 'nombre_tipo', 'Gorra'),
  tallaUnica: () => getIdByValue('talla', 'id_talla', 'clave_talla', 'UNICA'),
}
