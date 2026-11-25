import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const { items, total, clear } = useCart()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/orders', {
        items: items.map((item) => ({
          id_producto_color: item.id_producto_color,
          cantidad: item.cantidad,
        })),
      })
      clear()
      navigate('/orders')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'No se pudo completar la compra')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-4 text-gray-600">No hay productos en el carrito.</p>
        <Link to="/catalog" className="mt-4 inline-block text-indigo-600">
          Volver al catálogo
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="font-semibold">Resumen</h2>
        <ul className="mt-3 divide-y">
          {items.map((item) => (
            <li key={item.id_producto_color} className="flex justify-between py-2 text-sm">
              <span>
                {item.nombre_producto} ({item.color}/{item.talla}) x {item.cantidad}
              </span>
              <span>${(item.precio * item.cantidad).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-xl font-bold">Total: ${total.toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Confirmar compra'}
        </button>
      </form>
    </section>
  )
}
