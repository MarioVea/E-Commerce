import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import type { Order } from '../../types'

export default function AdminReturns() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: async () => {
      const res = await api.get<Order[]>('/admin/returns')
      return res.data
    },
  })

  if (isLoading) return <p className="p-8 text-gray-500">Cargando devoluciones...</p>

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Devoluciones y cancelaciones</h1>

      {(!data || data.length === 0) && (
        <p className="mt-4 text-gray-600">No hay cancelaciones ni devoluciones registradas.</p>
      )}

      <div className="mt-6 space-y-4">
        {data?.map((order) => (
          <article key={order.id_venta} className="rounded-lg bg-white p-5 shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Pedido #{order.id_venta}</h2>
                <p className="text-sm text-gray-500">
                  {order.usuario
                    ? `${order.usuario.nombre} ${order.usuario.primer_apellido}`
                    : `Usuario #${order.id_usuario}`}{' '}
                  · {new Date(order.fecha_creacion).toLocaleString()}
                </p>
              </div>
              <span className="rounded bg-gray-200 px-3 py-1 text-sm">
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
