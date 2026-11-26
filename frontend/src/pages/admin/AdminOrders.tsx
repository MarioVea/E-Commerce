import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/api'
import type { Order } from '../../types'

const ESTADOS = ['Pendiente', 'Pagada', 'Enviada', 'Entregada', 'Cancelada', 'Devuelta']

export default function AdminOrders() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get<Order[]>('/admin/orders')
      return res.data
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: string }) => {
      await api.patch(`/admin/orders/${id}/status`, { estado })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  if (isLoading) return <p className="text-gray-500 dark:text-gray-400">Cargando pedidos...</p>

  return (
    <section>
      <h1 className="text-2xl font-bold">Pedidos</h1>

      {(!data || data.length === 0) && (
        <p className="mt-4 text-gray-600 dark:text-gray-300">No hay pedidos registrados.</p>
      )}

      <div className="mt-6 space-y-4">
        {data?.map((order) => (
          <article key={order.id_venta} className="rounded-lg bg-white dark:bg-gray-800 p-5 shadow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Pedido #{order.id_venta}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {order.usuario
                    ? `${order.usuario.nombre} ${order.usuario.primer_apellido}`
                    : `Usuario #${order.id_usuario}`}{' '}
                  · {new Date(order.fecha_creacion).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">${order.total_venta.toFixed(2)}</span>
                <select
                  value={order.estado_venta?.nombre_estado ?? ''}
                  onChange={(event) =>
                    updateStatus.mutate({
                      id: order.id_venta,
                      estado: event.target.value,
                    })
                  }
                  className="rounded border p-2 text-sm"
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ul className="mt-3 divide-y text-sm">
              {(order.venta_detalle ?? []).map((detail) => (
                <li key={detail.id_venta_detalle} className="flex justify-between py-2">
                  <span>
                    {detail.producto?.nombre_producto ?? `Producto #${detail.id_producto}`} x{' '}
                    {detail.cantidad}
                  </span>
                  <span>${detail.subtotal.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
