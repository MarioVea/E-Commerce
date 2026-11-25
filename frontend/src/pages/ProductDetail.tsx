import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [message, setMessage] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get<Product>(`/products/${id}`)
      return res.data
    },
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (data && data.variantes.length > 0 && selectedVariantId === null) {
      const firstAvailable = data.variantes.find(
        (variant) => variant.disponible && variant.stock > 0,
      )
      setSelectedVariantId(firstAvailable?.id_producto_color ?? data.variantes[0].id_producto_color)
    }
  }, [data, selectedVariantId])

  if (isLoading) return <p className="p-8 text-gray-500">Cargando...</p>
  if (isError || !data) return <p className="p-8 text-red-600">Producto no encontrado.</p>

  const variant = data.variantes.find(
    (item) => item.id_producto_color === selectedVariantId,
  )

  function handleAdd() {
    if (!data || !variant) return
    if (variant.stock <= 0) {
      setMessage('Esta variante está agotada.')
      return
    }

    addItem(
      {
        id_producto_color: variant.id_producto_color,
        id_producto: data.id_producto,
        nombre_producto: data.nombre_producto,
        color: variant.color,
        talla: variant.talla,
        precio: variant.precio_venta,
        imagen_url: data.imagen_url,
        stock: variant.stock,
      },
      cantidad,
    )
    setMessage('Producto agregado al carrito.')
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
      {data.imagen_url ? (
        <img
          src={data.imagen_url}
          alt={data.nombre_producto}
          className="w-full rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100 text-7xl">
          🧢
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">{data.nombre_producto}</h1>
        <p className="mt-1 text-sm text-gray-500">{data.tipo ?? 'Sin categoría'}</p>
        <p className="mt-2 text-2xl text-indigo-600">
          ${(variant?.precio_venta ?? data.precio).toFixed(2)}
        </p>
        <p className="mt-4 text-gray-600">{data.descripcion_producto}</p>

        {data.variantes.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700">Variante</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.variantes.map((item) => (
                <button
                  key={item.id_producto_color}
                  onClick={() => setSelectedVariantId(item.id_producto_color)}
                  className={`rounded border px-3 py-2 text-sm ${
                    item.id_producto_color === selectedVariantId
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300'
                  } ${item.stock <= 0 ? 'opacity-50' : ''}`}
                >
                  {item.color ?? 'Color'} / {item.talla ?? 'Única'}
                  {item.stock <= 0 ? ' (agotado)' : ''}
                </button>
              ))}
            </div>
            {variant && (
              <p className="mt-2 text-sm text-gray-500">
                Stock disponible: {variant.stock}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-red-600">Producto sin variantes registradas.</p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <label className="text-sm text-gray-700">Cantidad</label>
          <input
            type="number"
            min={1}
            max={variant?.stock ?? 1}
            value={cantidad}
            onChange={(event) => setCantidad(Math.max(1, Number(event.target.value)))}
            className="w-20 rounded border p-2"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!variant || variant.stock <= 0}
          className="mt-6 rounded bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Agregar al carrito
        </button>

        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}

        <Link to="/cart" className="mt-4 block text-sm text-indigo-600">
          Ir al carrito
        </Link>
      </div>
    </section>
  )
}
