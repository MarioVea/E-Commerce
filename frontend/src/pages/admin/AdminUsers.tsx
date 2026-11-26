import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import type { EstadoUsuario, TipoUsuario } from '../../types'

interface AdminUser {
  id_usuario: number
  nombre: string
  primer_apellido: string
  segundo_apellido: string | null
  fecha_nacimiento: string | null
  fecha_creacion: string
  id_tipo_usuario?: number
  id_estado?: number
  tipo_usuario?: number
  auth_id: string | null
  email: string | null
  tipo_usuario_rel?: { id_tipo_usuario: number; nombre_tipo_usuario: string }
  estado_usuario?: { id_estado_usuario: number; nombre_estado_usuario: string }
}

const EMPTY_FORM = {
  nombre: '',
  primerApellido: '',
  segundoApellido: '',
  fechaNacimiento: '',
  email: '',
  password: '',
  idTipoUsuario: '',
  idEstadoUsuario: '',
}

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get<AdminUser[]>('/admin/users')
      return res.data
    },
  })

  const tiposQuery = useQuery({
    queryKey: ['catalogs', 'tipos-usuario'],
    queryFn: async () => {
      const res = await api.get<TipoUsuario[]>('/admin/catalogs/tipos-usuario')
      return res.data
    },
  })

  const estadosQuery = useQuery({
    queryKey: ['catalogs', 'estados-usuario'],
    queryFn: async () => {
      const res = await api.get<EstadoUsuario[]>('/admin/catalogs/estados-usuario')
      return res.data
    },
  })

  useEffect(() => {
    setForm((current) => {
      const next = { ...current }
      if (!next.idTipoUsuario && tiposQuery.data?.[0]) {
        next.idTipoUsuario = String(tiposQuery.data[0].id_tipo_usuario)
      }
      if (!next.idEstadoUsuario && estadosQuery.data?.[0]) {
        next.idEstadoUsuario = String(estadosQuery.data[0].id_estado_usuario)
      }
      return next
    })
  }, [tiposQuery.data, estadosQuery.data])

  useEffect(() => {
    if (!isModalOpen) return

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') closeModal()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }

  function closeModal() {
    setEditing(null)
    setError('')
    setIsModalOpen(false)
    setForm({ ...EMPTY_FORM })
  }

  function openCreate() {
    setEditing(null)
    setError('')
    setIsModalOpen(true)
    setForm({
      ...EMPTY_FORM,
      idTipoUsuario: tiposQuery.data?.[0]
        ? String(tiposQuery.data[0].id_tipo_usuario)
        : '',
      idEstadoUsuario: estadosQuery.data?.[0]
        ? String(estadosQuery.data[0].id_estado_usuario)
        : '',
    })
  }

  function startEdit(user: AdminUser) {
    setEditing(user)
    setError('')
    setIsModalOpen(true)
    setForm({
      nombre: user.nombre,
      primerApellido: user.primer_apellido,
      segundoApellido: user.segundo_apellido ?? '',
      fechaNacimiento: user.fecha_nacimiento?.slice(0, 10) ?? '',
      email: user.email ?? '',
      password: '',
      idTipoUsuario: String(
        user.tipo_usuario_rel?.id_tipo_usuario ??
          user.id_tipo_usuario ??
          user.tipo_usuario ??
          '',
      ),
      idEstadoUsuario: String(
        user.estado_usuario?.id_estado_usuario ?? user.id_estado ?? '',
      ),
    })
  }

  function buildPayload() {
    return {
      nombre: form.nombre,
      primerApellido: form.primerApellido,
      segundoApellido: form.segundoApellido,
      fechaNacimiento: form.fechaNacimiento,
      email: form.email || undefined,
      password: form.password || undefined,
      idTipoUsuario: Number(form.idTipoUsuario),
      idEstadoUsuario: Number(form.idEstadoUsuario),
    }
  }

  const createUser = useMutation({
    mutationFn: async () => {
      await api.post('/admin/users', buildPayload())
    },
    onSuccess: () => {
      closeModal()
      invalidate()
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo crear el usuario')
    },
  })

  const updateUser = useMutation({
    mutationFn: async () => {
      if (!editing) return
      await api.put(`/admin/users/${editing.id_usuario}`, buildPayload())
    },
    onSuccess: () => {
      closeModal()
      invalidate()
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo actualizar el usuario')
    },
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (editing) {
      updateUser.mutate()
    } else {
      createUser.mutate()
    }
  }

  const isSaving = createUser.isPending || updateUser.isPending

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Nuevo usuario
        </button>
      </div>

      {error && !isModalOpen && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg bg-white dark:bg-gray-800 shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Cuenta vinculada</th>
              <th className="p-3">Registro</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(usersQuery.data ?? []).map((user) => (
              <tr key={user.id_usuario}>
                <td className="p-3">{user.id_usuario}</td>
                <td className="p-3">
                  {user.nombre} {user.primer_apellido} {user.segundo_apellido ?? ''}
                </td>
                <td className="p-3">{user.email ?? '—'}</td>
                <td className="p-3">{user.tipo_usuario_rel?.nombre_tipo_usuario ?? '—'}</td>
                <td className="p-3">{user.estado_usuario?.nombre_estado_usuario ?? '—'}</td>
                <td className="p-3">{user.auth_id ? 'Sí' : 'No'}</td>
                <td className="p-3">{user.fecha_creacion}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => startEdit(user)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usersQuery.isLoading && (
          <p className="p-4 text-sm text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
        )}

        {!usersQuery.isLoading && (usersQuery.data ?? []).length === 0 && (
          <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No hay usuarios registrados.</p>
        )}
      </div>

      {isModalOpen && (
        <div
          role="presentation"
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="user-modal-title" className="text-lg font-bold">
                {editing ? 'Editar usuario' : 'Nuevo usuario'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar"
                className="text-xl leading-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  Nombre(s)
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="mt-1 block w-full rounded border p-3 text-gray-900 dark:text-gray-100"
                    required
                  />
                </label>

                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  Primer apellido
                  <input
                    value={form.primerApellido}
                    onChange={(e) =>
                      setForm({ ...form, primerApellido: e.target.value })
                    }
                    className="mt-1 block w-full rounded border p-3 text-gray-900 dark:text-gray-100"
                    required
                  />
                </label>

                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  Segundo apellido
                  <input
                    value={form.segundoApellido}
                    onChange={(e) =>
                      setForm({ ...form, segundoApellido: e.target.value })
                    }
                    className="mt-1 block w-full rounded border p-3 text-gray-900 dark:text-gray-100"
                  />
                </label>

                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  Fecha de nacimiento
                  <input
                    type="date"
                    value={form.fechaNacimiento}
                    onChange={(e) =>
                      setForm({ ...form, fechaNacimiento: e.target.value })
                    }
                    className="mt-1 block w-full rounded border p-3 text-gray-900 dark:text-gray-100"
                  />
                </label>

                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  Correo electrónico
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="mt-1 block w-full rounded border p-3 text-gray-900 dark:text-gray-100"
                    required={!editing}
                  />
                </label>

                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  Contraseña
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editing ? 'Dejar en blanco para no cambiar' : ''}
                    className="mt-1 block w-full rounded border p-3 text-gray-900 dark:text-gray-100"
                    required={!editing}
                    minLength={6}
                  />
                </label>

                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  Tipo de usuario
                  <select
                    value={form.idTipoUsuario}
                    onChange={(e) =>
                      setForm({ ...form, idTipoUsuario: e.target.value })
                    }
                    className="mt-1 block w-full rounded border p-3 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Selecciona un tipo</option>
                    {(tiposQuery.data ?? []).map((tipo) => (
                      <option key={tipo.id_tipo_usuario} value={tipo.id_tipo_usuario}>
                        {tipo.nombre_tipo_usuario}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  Estado
                  <select
                    value={form.idEstadoUsuario}
                    onChange={(e) =>
                      setForm({ ...form, idEstadoUsuario: e.target.value })
                    }
                    className="mt-1 block w-full rounded border p-3 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Selecciona un estado</option>
                    {(estadosQuery.data ?? []).map((estado) => (
                      <option key={estado.id_estado_usuario} value={estado.id_estado_usuario}>
                        {estado.nombre_estado_usuario}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {editing && (
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {editing.auth_id
                    ? 'Deja la contraseña en blanco para conservar la actual.'
                    : 'Este perfil no tiene cuenta vinculada. Ingresa correo y contraseña para crearla.'}
                </p>
              )}

              {error && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded border px-5 py-3 font-semibold text-gray-700 dark:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {editing
                    ? isSaving
                      ? 'Guardando...'
                      : 'Guardar cambios'
                    : isSaving
                      ? 'Creando...'
                      : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
