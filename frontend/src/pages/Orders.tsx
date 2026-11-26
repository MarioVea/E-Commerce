import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../services/api'
import type { Order } from '../types'

const statusColors: Record<string, string> = {
  Pendiente: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
  Pagada: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
  Enviada: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300',
  Entregada: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
  Cancelada: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
  Devuelta: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
}

export default function Orders() {
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get<Order[]>('/orders')
      return res.data
    },
  })

  const action = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: 'cancel' | 'return' }) => {
      await api.post(`/orders/${id}/${type}`)
    },
    onSuccess: () => {
      setError('')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo completar la acción')
    },
  })

  if (isLoading) return <p className="p-8 text-gray-500 dark:text-gray-400">Cargando pedidos...</p>
  if (isError) return <p className="p-8 text-red-600 dark:text-red-400">No se pudieron cargar los pedidos.</p>

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {(!data || data.length === 0) && (
        <p className="mt-4 text-gray-600 dark:text-gray-300">Aún no tienes pedidos.</p>
      )}

      <div className="mt-6 space-y-4">
        {data?.map((order) => {
          const status = order.estado_venta?.nombre_estado ?? 'Desconocido'
          const canCancel = status === 'Pendiente' || status === 'Pagada'
          const canReturn = status === 'Entregada'

          return (
            <article key={order.id_venta} className="rounded-lg bg-white dark:bg-gray-800 p-5 shadow">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold">Pedido #{order.id_venta}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.fecha_creacion).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded px-3 py-1 text-sm ${
                    statusColors[status] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {status}
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

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">Total: ${order.total_venta.toFixed(2)}</p>
                <div className="flex gap-2">
                  {canCancel && (
                    <button
                      onClick={() => action.mutate({ id: order.id_venta, type: 'cancel' })}
                      disabled={action.isPending}
                      className="rounded border border-red-600 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      Cancelar pedido
                    </button>
                  )}
                  {canReturn && (
                    <button
                      onClick={() => action.mutate({ id: order.id_venta, type: 'return' })}
                      disabled={action.isPending}
                      className="rounded border border-gray-600 dark:border-gray-500 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Devolver pedido
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
