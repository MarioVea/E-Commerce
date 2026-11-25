import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '../config/supabase'
import { ApiError } from '../utils/http'
import type { Usuario } from '../types/domain'
import { lookups } from './lookups'

export interface ProfileInput {
  nombre: string
  primerApellido: string
  segundoApellido?: string | null
  fechaNacimiento?: string | null
}

export function splitFullName(fullName?: string | null): {
  nombre: string
  primerApellido: string
} {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return { nombre: 'Cliente', primerApellido: 'Sin apellido' }
  }

  if (parts.length === 1) {
    return { nombre: parts[0], primerApellido: 'Sin apellido' }
  }

  return { nombre: parts[0], primerApellido: parts.slice(1).join(' ') }
}

export function calculateAge(fechaNacimiento?: string | null): number | null {
  if (!fechaNacimiento) return null

  const birth = new Date(fechaNacimiento)
  if (Number.isNaN(birth.getTime())) return null

  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1
  }

  return age >= 0 ? age : null
}

export async function createProfile(
  authId: string,
  input: ProfileInput,
  role: 'customer' | 'admin',
): Promise<Usuario> {
  const tipoUsuario =
    role === 'admin' ? await lookups.tipoAdministrador() : await lookups.tipoCliente()
  const estadoActivo = await lookups.estadoActivo()

  const { data, error } = await supabaseAdmin
    .from('usuario')
    .insert({
      auth_id: authId,
      tipo_usuario: tipoUsuario,
      nombre: input.nombre,
      primer_apellido: input.primerApellido,
      segundo_apellido: input.segundoApellido ?? null,
      fecha_nacimiento: input.fechaNacimiento ?? null,
      edad: calculateAge(input.fechaNacimiento),
      id_estado: estadoActivo,
    })
    .select('*')
    .single()

  if (error) {
    throw new ApiError(400, error.message)
  }

  return data as Usuario
}

export async function getProfileByAuthId(authId: string): Promise<Usuario | null> {
  const { data, error } = await supabaseAdmin
    .from('usuario')
    .select(
      `
      *,
      tipo_usuario ( id_tipo_usuario, nombre_tipo_usuario ),
      estado_usuario ( id_estado_usuario, nombre_estado_usuario )
    `,
    )
    .eq('auth_id', authId)
    .maybeSingle()

  if (error) {
    throw new ApiError(500, error.message)
  }

  return (data as Usuario | null) ?? null
}

export async function getOrCreateProfile(user: User): Promise<Usuario> {
  const existing = await getProfileByAuthId(user.id)
  if (existing) return existing

  const { nombre, primerApellido } = splitFullName(
    (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0],
  )

  return createProfile(
    user.id,
    { nombre, primerApellido },
    user.app_metadata?.role === 'admin' ? 'admin' : 'customer',
  )
}

export function profileResponse(user: User, profile: Usuario | null) {
  const role = user.app_metadata?.role === 'admin' ? 'admin' : 'customer'

  return {
    id: user.id,
    email: user.email,
    role,
    fullName: profile
      ? `${profile.nombre} ${profile.primer_apellido}`.trim()
      : ((user.user_metadata?.full_name as string | undefined) ?? ''),
    profile,
  }
}
