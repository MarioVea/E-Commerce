import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import type { Order } from '../../types'

interface AdminReturnsProps {
  estado: 'Devuelta' | 'Cancelada'
}

export default function AdminReturns({ estado }: AdminReturnsProps) {
  const isReturn = estado === 'Devuelta'
  const titulo = isReturn ? 'Devoluciones' : 'Cancelaciones'

  const { data, isLoading } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: async () => {
      const res = await api.get<Order[]>('/admin/returns')
      return res.data
    },
  })

  if (isLoading) return <p className="text-gray-500 dark:text-gray-400">Cargando {titulo.toLowerCase()}...</p>

  const orders = (data ?? []).filter(
    (order) => order.estado_venta?.nombre_estado === estado,
  )

  return (
    <section>
      <h1 className="text-2xl font-bold">{titulo}</h1>

      {orders.length === 0 && (
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          {isReturn
            ? 'No hay devoluciones registradas.'
            : 'No hay cancelaciones registradas.'}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article key={order.id_venta} className="rounded-lg bg-white dark:bg-gray-800 p-5 shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Pedido #{order.id_venta}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {order.usuario
                    ? `${order.usuario.nombre} ${order.usuario.primer_apellido}`
                    : `Usuario #${order.id_usuario}`}{' '}
                  · {new Date(order.fecha_creacion).toLocaleString()}
                </p>
              </div>
              <span className="rounded bg-gray-200 dark:bg-gray-700 px-3 py-1 text-sm">
                {order.estado_venta?.nombre_estado}
              </span>
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

            <p className="mt-3 text-right font-bold">
              Total: ${order.total_venta.toFixed(2)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
