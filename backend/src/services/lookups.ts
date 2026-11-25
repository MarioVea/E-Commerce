import { supabaseAdmin } from '../config/supabase'
import { ApiError } from '../utils/http'

export async function getIdByValue(
  table: string,
  column: string,
  value: string,
): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select(column)
    .eq(column, value)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new ApiError(500, error.message)
  }

  if (!data) {
    throw new ApiError(500, `No se encontró "${value}" en ${table}.${column}`)
  }

  return Number((data as unknown as Record<string, unknown>)[column])
}

export const lookups = {
  tipoCliente: () => getIdByValue('tipo_usuario', 'nombre_tipo_usuario', 'Cliente'),
  tipoAdministrador: () =>
    getIdByValue('tipo_usuario', 'nombre_tipo_usuario', 'Administrador'),
  estadoActivo: () => getIdByValue('estado_usuario', 'nombre_estado_usuario', 'Activo'),
  estadoVenta: (nombre: string) => getIdByValue('estado_venta', 'nombre_estado', nombre),
  tipoGorra: () => getIdByValue('tipo_producto', 'nombre_tipo', 'Gorra'),
  tallaUnica: () => getIdByValue('talla', 'clave_talla', 'UNICA'),
}
