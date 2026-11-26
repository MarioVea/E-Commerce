import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'

interface AdminUser {
  id_usuario: number
  nombre: string
  primer_apellido: string
  segundo_apellido: string | null
  fecha_creacion: string
  auth_id: string | null
  tipo_usuario_rel?: { nombre_tipo_usuario: string }
  estado_usuario?: { nombre_estado_usuario: string }
}

export default function AdminUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get<AdminUser[]>('/admin/users')
      return res.data
    },
  })

  if (isLoading) return <p className="text-gray-500">Cargando usuarios...</p>

  return (
    <section>
      <h1 className="text-2xl font-bold">Usuarios</h1>

      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Cuenta vinculada</th>
              <th className="p-3">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(data ?? []).map((user) => (
              <tr key={user.id_usuario}>
                <td className="p-3">{user.id_usuario}</td>
                <td className="p-3">
                  {user.nombre} {user.primer_apellido} {user.segundo_apellido ?? ''}
                </td>
                <td className="p-3">{user.tipo_usuario_rel?.nombre_tipo_usuario ?? '—'}</td>
                <td className="p-3">{user.estado_usuario?.nombre_estado_usuario ?? '—'}</td>
                <td className="p-3">{user.auth_id ? 'Sí' : 'No'}</td>
                <td className="p-3">{user.fecha_creacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
