import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'

interface Stats {
  productos: number
  usuarios: number
  ventas: {
    total: number
    ingresos: number
    pendientes: number
    pagadas: number
    enviadas: number
    entregadas: number
    canceladas: number
    devueltas: number
  }
}

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get<Stats>('/admin/stats')
      return res.data
    },
  })

  return (
    <section>
      <h1 className="text-2xl font-bold">Panel de administración</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Productos activos</p>
          <p className="text-2xl font-bold">{data?.productos ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Usuarios</p>
          <p className="text-2xl font-bold">{data?.usuarios ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Ventas</p>
          <p className="text-2xl font-bold">{data?.ventas.total ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Ingresos</p>
          <p className="text-2xl font-bold">
            ${data ? data.ventas.ingresos.toFixed(2) : '—'}
          </p>
        </div>
      </div>

      {data && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Pendientes', data.ventas.pendientes],
            ['Pagadas', data.ventas.pagadas],
            ['Enviadas', data.ventas.enviadas],
            ['Entregadas', data.ventas.entregadas],
            ['Canceladas', data.ventas.canceladas],
            ['Devueltas', data.ventas.devueltas],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded bg-white p-4 text-center shadow">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
