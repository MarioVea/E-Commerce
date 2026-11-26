import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import type { Color, Product, Talla, TipoProducto } from '../../types'

export default function AdminProducts() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    nombre_producto: '',
    descripcion_producto: '',
    id_tipo: '',
    id_color: '',
    id_talla: '',
    precio_compra: '',
    precio_venta: '',
    stock: '',
  })
  const [imagen, setImagen] = useState<File | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [error, setError] = useState('')

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/admin/products')
      return res.data
    },
  })

  const tiposQuery = useQuery({
    queryKey: ['catalogs', 'tipos-producto'],
    queryFn: async () => {
      const res = await api.get<TipoProducto[]>('/admin/catalogs/tipos-producto')
      return res.data
    },
  })

  const coloresQuery = useQuery({
    queryKey: ['catalogs', 'colores'],
    queryFn: async () => {
      const res = await api.get<Color[]>('/admin/catalogs/colores')
      return res.data
    },
  })

  const tallasQuery = useQuery({
    queryKey: ['catalogs', 'tallas'],
    queryFn: async () => {
      const res = await api.get<Talla[]>('/admin/catalogs/tallas')
      return res.data
    },
  })

  useEffect(() => {
    setForm((current) => {
      const next = { ...current }
      if (!next.id_tipo && tiposQuery.data?.[0]) {
        next.id_tipo = String(tiposQuery.data[0].id_tipo)
      }
      if (!next.id_color && coloresQuery.data?.[0]) {
        next.id_color = String(coloresQuery.data[0].id_color)
      }
      if (!next.id_talla && tallasQuery.data?.[0]) {
        next.id_talla = String(tallasQuery.data[0].id_talla)
      }
      return next
    })
  }, [tiposQuery.data, coloresQuery.data, tallasQuery.data])

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const createProduct = useMutation({
    mutationFn: async () => {
      const data = new FormData()
      data.append('nombre_producto', form.nombre_producto)
      data.append('descripcion_producto', form.descripcion_producto)
      data.append('id_tipo', form.id_tipo)
      data.append('id_color', form.id_color)
      data.append('id_talla', form.id_talla)
      data.append('precio_compra', form.precio_compra)
      data.append('precio_venta', form.precio_venta)
      data.append('stock', form.stock)
      if (imagen) data.append('imagen', imagen)
      await api.post('/admin/products', data)
    },
    onSuccess: () => {
      setError('')
      resetForm()
      invalidate()
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo crear el producto')
    },
  })

  const updateProduct = useMutation({
    mutationFn: async () => {
      if (!editing) return
      await api.put(`/admin/products/${editing.id_producto}`, {
        nombre_producto: form.nombre_producto,
        descripcion_producto: form.descripcion_producto,
        id_tipo: Number(form.id_tipo),
      })
    },
    onSuccess: () => {
      setError('')
      resetForm()
      invalidate()
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo actualizar el producto')
    },
  })

  const toggleActive = useMutation({
    mutationFn: async (product: Product) => {
      await api.put(`/admin/products/${product.id_producto}`, {
        activo: !product.activo,
      })
    },
    onSuccess: invalidate,
  })

  const uploadImage = useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const data = new FormData()
      data.append('imagen', file)
      await api.post(`/admin/products/${id}/image`, data)
    },
    onSuccess: invalidate,
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo subir la imagen')
    },
  })

  function resetForm() {
    setEditing(null)
    setImagen(null)
    setForm({
      nombre_producto: '',
      descripcion_producto: '',
      id_tipo: tiposQuery.data?.[0] ? String(tiposQuery.data[0].id_tipo) : '',
      id_color: coloresQuery.data?.[0] ? String(coloresQuery.data[0].id_color) : '',
      id_talla: tallasQuery.data?.[0] ? String(tallasQuery.data[0].id_talla) : '',
      precio_compra: '',
      precio_venta: '',
      stock: '',
    })
  }

  function startEdit(product: Product) {
    setEditing(product)
    setImagen(null)
    setForm({
      nombre_producto: product.nombre_producto,
      descripcion_producto: product.descripcion_producto ?? '',
      id_tipo: String(product.id_tipo),
      id_color: '',
      id_talla: '',
      precio_compra: '',
      precio_venta: '',
      stock: '',
    })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (editing) {
      updateProduct.mutate()
    } else {
      createProduct.mutate()
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Administrar productos</h1>

      <form onSubmit={handleSubmit} className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="font-semibold">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            value={form.nombre_producto}
            onChange={(e) => setForm({ ...form, nombre_producto: e.target.value })}
            placeholder="Nombre del producto"
            className="rounded border p-3"
            required
          />
          <select
            value={form.id_tipo}
            onChange={(e) => setForm({ ...form, id_tipo: e.target.value })}
            className="rounded border p-3"
            required
          >
            <option value="">Tipo de producto</option>
            {(tiposQuery.data ?? []).map((tipo) => (
              <option key={tipo.id_tipo} value={tipo.id_tipo}>
                {tipo.nombre_tipo}
              </option>
            ))}
          </select>
          <textarea
            value={form.descripcion_producto}
            onChange={(e) => setForm({ ...form, descripcion_producto: e.target.value })}
            placeholder="Descripción"
            className="rounded border p-3 sm:col-span-2"
            rows={2}
          />

          {!editing && (
            <>
              <select
                value={form.id_color}
                onChange={(e) => setForm({ ...form, id_color: e.target.value })}
                className="rounded border p-3"
                required
              >
                <option value="">Color</option>
                {(coloresQuery.data ?? []).map((color) => (
                  <option key={color.id_color} value={color.id_color}>
                    {color.nombre_color}
                  </option>
                ))}
              </select>
              <select
                value={form.id_talla}
                onChange={(e) => setForm({ ...form, id_talla: e.target.value })}
                className="rounded border p-3"
                required
              >
                <option value="">Talla</option>
                {(tallasQuery.data ?? []).map((talla) => (
                  <option key={talla.id_talla} value={talla.id_talla}>
                    {talla.clave_talla} — {talla.nombre_talla}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.precio_compra}
                onChange={(e) => setForm({ ...form, precio_compra: e.target.value })}
                placeholder="Precio compra"
                className="rounded border p-3"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.precio_venta}
                onChange={(e) => setForm({ ...form, precio_venta: e.target.value })}
                placeholder="Precio venta"
                className="rounded border p-3"
                required
              />
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="Stock inicial"
                className="rounded border p-3"
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setImagen(e.target.files?.[0] ?? null)}
                className="rounded border p-2"
              />
            </>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={createProduct.isPending || updateProduct.isPending}
            className="rounded bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {editing ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border px-5 py-3 font-semibold text-gray-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {(productsQuery.data ?? []).map((product) => (
          <article
            key={product.id_producto}
            className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center"
          >
            {product.imagen_url ? (
              <img
                src={product.imagen_url}
                alt={product.nombre_producto}
                className="h-20 w-20 rounded object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-100 text-3xl">
                🧢
              </div>
            )}

            <div className="flex-1">
              <h2 className="font-semibold">{product.nombre_producto}</h2>
              <p className="text-sm text-gray-500">
                {product.tipo ?? 'Sin tipo'} · ${product.precio.toFixed(2)} · Stock:{' '}
                {product.stock}
              </p>
              <span
                className={`mt-1 inline-block rounded px-2 py-1 text-xs ${
                  product.activo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {product.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => startEdit(product)}
                className="rounded border px-3 py-2 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => toggleActive.mutate(product)}
                className="rounded border px-3 py-2 text-sm"
              >
                {product.activo ? 'Desactivar' : 'Activar'}
              </button>
              <label className="cursor-pointer rounded border px-3 py-2 text-sm">
                Subir imagen
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadImage.mutate({ id: product.id_producto, file })
                  }}
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
