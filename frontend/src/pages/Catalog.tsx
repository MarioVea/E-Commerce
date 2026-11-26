import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { api } from '../services/api'
import type { Product } from '../types'

export default function Catalog() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', query],
    queryFn: async () => {
      const res = await api.get<Product[]>('/products', {
        params: { q: query || undefined },
      })
      return res.data
    },
  })

  const types = useMemo(
    () =>
      Array.from(
        new Set((data ?? []).map((product) => product.tipo).filter(Boolean) as string[]),
      ).sort(),
    [data],
  )

  const visible = useMemo(
    () =>
      (data ?? []).filter(
        (product) => !selectedType || product.tipo === selectedType,
      ),
    [data, selectedType],
  )

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Catálogo</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          setQuery(search)
        }}
        className="mt-4 flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar gorras..."
          className="flex-1 rounded border p-3"
        />
        <select
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          className="rounded border p-3"
        >
          <option value="">Todas las categorías</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button className="rounded bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">
          Buscar
        </button>
      </form>

      {isLoading && <p className="mt-8 text-gray-500 dark:text-gray-400">Cargando productos...</p>}
      {isError && (
        <p className="mt-8 text-red-600 dark:text-red-400">
          No se pudieron cargar los productos. Verifica que el backend esté corriendo y la base
          configurada.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((product) => (
          <Link
            key={product.id_producto}
            to={`/product/${product.id_producto}`}
            className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow transition hover:shadow-md"
          >
            {product.imagen_url ? (
              <img
                src={product.imagen_url}
                alt={product.nombre_producto}
                className="h-48 w-full rounded object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center rounded bg-gray-100 dark:bg-gray-700 text-4xl">
                🧢
              </div>
            )}
            <div className="mt-3 flex items-start justify-between gap-2">
              <h2 className="font-semibold">{product.nombre_producto}</h2>
              <span className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-300">
                {product.tipo ?? 'Sin tipo'}
              </span>
            </div>
            <p className="text-indigo-600 dark:text-indigo-400">${product.precio.toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </p>
          </Link>
        ))}
      </div>

      {!isLoading && visible.length === 0 && (
        <p className="mt-8 text-gray-500 dark:text-gray-400">No se encontraron productos.</p>
      )}
    </section>
  )
}
