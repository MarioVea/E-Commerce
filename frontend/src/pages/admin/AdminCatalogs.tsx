import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../services/api'
import type { CatalogItem } from '../../types'

interface CatalogConfig {
  key: string
  label: string
  pk: string
  fields: { name: string; label: string }[]
}

const CATALOGS: CatalogConfig[] = [
  {
    key: 'tipos-producto',
    label: 'Tipos de producto',
    pk: 'id_tipo',
    fields: [{ name: 'nombre_tipo', label: 'Nombre' }],
  },
  {
    key: 'colores',
    label: 'Colores',
    pk: 'id_color',
    fields: [{ name: 'nombre_color', label: 'Nombre' }],
  },
  {
    key: 'tallas',
    label: 'Tallas',
    pk: 'id_talla',
    fields: [
      { name: 'clave_talla', label: 'Clave (XS, S, M...)' },
      { name: 'nombre_talla', label: 'Nombre' },
    ],
  },
  {
    key: 'proveedores',
    label: 'Proveedores',
    pk: 'id_proveedor',
    fields: [{ name: 'nombre_proveedor', label: 'Nombre' }],
  },
]

export default function AdminCatalogs() {
  const queryClient = useQueryClient()
  const [activeKey, setActiveKey] = useState(CATALOGS[0].key)
  const [form, setForm] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  const active = CATALOGS.find((catalog) => catalog.key === activeKey) ?? CATALOGS[0]

  const { data, isLoading } = useQuery({
    queryKey: ['catalogs', activeKey],
    queryFn: async () => {
      const res = await api.get<CatalogItem[]>(`/admin/catalogs/${activeKey}`)
      return res.data
    },
  })

  const createItem = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {}
      for (const field of active.fields) {
        payload[field.name] = form[field.name] ?? ''
      }
      await api.post(`/admin/catalogs/${activeKey}`, payload)
    },
    onSuccess: () => {
      setError('')
      setForm({})
      queryClient.invalidateQueries({ queryKey: ['catalogs', activeKey] })
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'tipos-producto'] })
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'colores'] })
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'tallas'] })
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo crear el registro')
    },
  })

  const deleteItem = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/catalogs/${activeKey}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', activeKey] })
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo eliminar el registro')
    },
  })

  const columns = data && data.length > 0 ? Object.keys(data[0]) : [active.pk]

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Catálogos</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATALOGS.map((catalog) => (
          <button
            key={catalog.key}
            onClick={() => {
              setActiveKey(catalog.key)
              setForm({})
              setError('')
            }}
            className={`rounded px-4 py-2 text-sm ${
              catalog.key === activeKey
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 shadow'
            }`}
          >
            {catalog.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          createItem.mutate()
        }}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow"
      >
        {active.fields.map((field) => (
          <label key={field.name} className="text-sm text-gray-600">
            {field.label}
            <input
              value={form[field.name] ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, [field.name]: event.target.value }))
              }
              className="mt-1 block rounded border p-2 text-gray-900"
              required
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={createItem.isPending}
          className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Agregar
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {isLoading && <p className="mt-4 text-gray-500">Cargando...</p>}

      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {columns.map((column) => (
                <th key={column} className="p-3">
                  {column}
                </th>
              ))}
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(data ?? []).map((item) => (
              <tr key={String(item[active.pk])}>
                {columns.map((column) => (
                  <td key={column} className="p-3">
                    {String(item[column] ?? '—')}
                  </td>
                ))}
                <td className="p-3">
                  <button
                    onClick={() => deleteItem.mutate(Number(item[active.pk]))}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
