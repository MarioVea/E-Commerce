import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '../config/supabase'
import { ApiError } from '../utils/http'
import type { Usuario } from '../types/domain'
import type {
  CreateAdminUserInput,
  UpdateAdminUserInput,
} from '../validators/users'
import { lookups } from './lookups'

const USER_SELECT = `
  *,
  tipo_usuario_rel: tipo_usuario ( id_tipo_usuario, nombre_tipo_usuario ),
  estado_usuario ( id_estado_usuario, nombre_estado_usuario )
`

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
      tipo_usuario_rel: tipo_usuario ( id_tipo_usuario, nombre_tipo_usuario ),
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

/* ------------------------------------------------------------------ */
/* Admin user management                                               */
/* ------------------------------------------------------------------ */

export interface AdminUserResponse extends Usuario {
  email: string | null
}

async function getTipoUsuario(idTipoUsuario: number): Promise<{
  nombre: string
  role: 'customer' | 'admin'
}> {
  const { data, error } = await supabaseAdmin
    .from('tipo_usuario')
    .select('nombre_tipo_usuario')
    .eq('id_tipo_usuario', idTipoUsuario)
    .maybeSingle()

  if (error) throw new ApiError(500, error.message)
  if (!data) throw new ApiError(400, 'El tipo de usuario seleccionado no existe')

  const nombre = data.nombre_tipo_usuario as string
  return { nombre, role: /admin/i.test(nombre) ? 'admin' : 'customer' }
}

async function getEstadoUsuario(idEstadoUsuario: number): Promise<{
  nombre: string
  activo: boolean
}> {
  const { data, error } = await supabaseAdmin
    .from('estado_usuario')
    .select('nombre_estado_usuario')
    .eq('id_estado_usuario', idEstadoUsuario)
    .maybeSingle()

  if (error) throw new ApiError(500, error.message)
  if (!data) throw new ApiError(400, 'El estado de usuario seleccionado no existe')

  const nombre = data.nombre_estado_usuario as string
  return { nombre, activo: nombre.trim().toLowerCase() === 'activo' }
}

function fullName(nombre: string, primerApellido: string): string {
  return `${nombre} ${primerApellido}`.trim()
}

/** Bans the auth account when the profile state is not "Activo". */
function createBanDuration(activo: boolean): string | undefined {
  return activo ? undefined : '876000h'
}

function updateBanDuration(activo: boolean): string {
  return activo ? 'none' : '876000h'
}

async function authEmailsByAuthId(): Promise<Map<string, string>> {
  const emails = new Map<string, string>()

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    })

    if (error) throw new ApiError(500, error.message)

    for (const user of data.users) {
      if (user.email) emails.set(user.id, user.email)
    }

    if (data.users.length < 1000) break
  }

  return emails
}

export async function listUsersWithEmail(): Promise<AdminUserResponse[]> {
  const { data, error } = await supabaseAdmin
    .from('usuario')
    .select(USER_SELECT)
    .order('id_usuario')

  if (error) throw new ApiError(500, error.message)

  const emails = await authEmailsByAuthId()

  return (data ?? []).map((row) => ({
    ...(row as Usuario),
    email: row.auth_id ? emails.get(row.auth_id as string) ?? null : null,
  }))
}

export async function createAdminUser(
  input: CreateAdminUserInput,
): Promise<AdminUserResponse> {
  const tipo = await getTipoUsuario(input.idTipoUsuario)
  const estado = await getEstadoUsuario(input.idEstadoUsuario)
  const nombreCompleto = fullName(input.nombre, input.primerApellido)

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    app_metadata: { role: tipo.role },
    user_metadata: { full_name: nombreCompleto },
    ban_duration: createBanDuration(estado.activo),
  })

  if (error) throw new ApiError(400, error.message)

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('usuario')
    .insert({
      auth_id: data.user.id,
      tipo_usuario: input.idTipoUsuario,
      nombre: input.nombre,
      primer_apellido: input.primerApellido,
      segundo_apellido: input.segundoApellido ?? null,
      fecha_nacimiento: input.fechaNacimiento ?? null,
      edad: calculateAge(input.fechaNacimiento),
      id_estado: input.idEstadoUsuario,
    })
    .select(USER_SELECT)
    .single()

  if (profileError) {
    // Avoid orphan auth users if the profile could not be created.
    await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    throw new ApiError(400, profileError.message)
  }

  return { ...(profile as Usuario), email: data.user.email ?? null }
}

export async function updateAdminUser(
  idUsuario: number,
  input: UpdateAdminUserInput,
): Promise<AdminUserResponse> {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('usuario')
    .select('id_usuario, auth_id')
    .eq('id_usuario', idUsuario)
    .maybeSingle()

  if (fetchError) throw new ApiError(500, fetchError.message)
  if (!existing) throw new ApiError(404, 'Usuario no encontrado')

  const tipo = await getTipoUsuario(input.idTipoUsuario)
  const estado = await getEstadoUsuario(input.idEstadoUsuario)
  const nombreCompleto = fullName(input.nombre, input.primerApellido)
  const email = input.email?.trim() || undefined
  const password = input.password?.trim() || undefined

  let authId = (existing.auth_id as string | null) ?? null
  let resolvedEmail: string | null = null

  if (authId) {
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(authId)

    if (authError) throw new ApiError(400, authError.message)

    const patch: {
      email?: string
      password?: string
      app_metadata: { role: string }
      user_metadata: { full_name: string }
      ban_duration: string
    } = {
      app_metadata: { role: tipo.role },
      user_metadata: { full_name: nombreCompleto },
      ban_duration: updateBanDuration(estado.activo),
    }

    if (email && email !== authData.user.email) patch.email = email
    if (password) patch.password = password

    const { data: updated, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(authId, patch)

    if (updateError) throw new ApiError(400, updateError.message)
    resolvedEmail = updated.user.email ?? null
  } else if (email || password) {
    if (!email || !password) {
      throw new ApiError(
        400,
        'Para vincular una cuenta nueva se requieren correo y contraseña',
      )
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: tipo.role },
      user_metadata: { full_name: nombreCompleto },
      ban_duration: createBanDuration(estado.activo),
    })

    if (error) throw new ApiError(400, error.message)
    authId = data.user.id
    resolvedEmail = data.user.email ?? null
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('usuario')
    .update({
      auth_id: authId,
      tipo_usuario: input.idTipoUsuario,
      nombre: input.nombre,
      primer_apellido: input.primerApellido,
      segundo_apellido: input.segundoApellido ?? null,
      fecha_nacimiento: input.fechaNacimiento ?? null,
      edad: calculateAge(input.fechaNacimiento),
      id_estado: input.idEstadoUsuario,
    })
    .eq('id_usuario', idUsuario)
    .select(USER_SELECT)
    .single()

  if (profileError) throw new ApiError(400, profileError.message)

  return { ...(profile as Usuario), email: resolvedEmail }
}
