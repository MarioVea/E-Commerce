import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../services/api'
import type { CatalogItem } from '../../types'

interface CatalogField {
  name: string
  label: string
  type?: 'text' | 'checkbox'
}

interface CatalogConfig {
  key: string
  label: string
  pk: string
  fields: CatalogField[]
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
    fields: [
      { name: 'nombre_proveedor', label: 'Nombre' },
      { name: 'activo', label: 'Activo', type: 'checkbox' },
    ],
  },
  {
    key: 'tipos-usuario',
    label: 'Tipos de usuario',
    pk: 'id_tipo_usuario',
    fields: [{ name: 'nombre_tipo_usuario', label: 'Nombre' }],
  },
  {
    key: 'estados-usuario',
    label: 'Estados de usuario',
    pk: 'id_estado_usuario',
    fields: [{ name: 'nombre_estado_usuario', label: 'Nombre' }],
  },
  {
    key: 'estados-venta',
    label: 'Estados de venta',
    pk: 'id_estado',
    fields: [{ name: 'nombre_estado', label: 'Nombre' }],
  },
]

function emptyForm(catalog: CatalogConfig): Record<string, string | boolean> {
  const values: Record<string, string | boolean> = {}
  for (const field of catalog.fields) {
    values[field.name] = field.type === 'checkbox' ? true : ''
  }
  return values
}

export default function AdminCatalogs() {
  const queryClient = useQueryClient()
  const [activeKey, setActiveKey] = useState(CATALOGS[0].key)
  const [form, setForm] = useState<Record<string, string | boolean>>(() =>
    emptyForm(CATALOGS[0]),
  )
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const active = CATALOGS.find((catalog) => catalog.key === activeKey) ?? CATALOGS[0]

  const { data, isLoading } = useQuery({
    queryKey: ['catalogs', activeKey],
    queryFn: async () => {
      const res = await api.get<CatalogItem[]>(`/admin/catalogs/${activeKey}`)
      return res.data
    },
  })

  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {}
    for (const field of active.fields) {
      payload[field.name] =
        field.type === 'checkbox' ? Boolean(form[field.name]) : String(form[field.name] ?? '')
    }
    return payload
  }

  function finishSuccess(): void {
    setError('')
    setEditingId(null)
    setForm(emptyForm(active))
    queryClient.invalidateQueries({ queryKey: ['catalogs'] })
  }

  const createItem = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/catalogs/${activeKey}`, buildPayload())
    },
    onSuccess: finishSuccess,
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo crear el registro')
    },
  })

  const updateItem = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, unknown> }) => {
      await api.put(`/admin/catalogs/${activeKey}/${id}`, payload)
    },
    onSuccess: finishSuccess,
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo actualizar el registro')
    },
  })

  const deleteItem = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/catalogs/${activeKey}/${id}`)
    },
    onSuccess: () => {
      setError('')
      queryClient.invalidateQueries({ queryKey: ['catalogs'] })
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'No se pudo eliminar el registro')
    },
  })

  function startEdit(item: CatalogItem): void {
    setEditingId(Number(item[active.pk]))
    const values: Record<string, string | boolean> = {}
    for (const field of active.fields) {
      values[field.name] =
        field.type === 'checkbox'
          ? Boolean(item[field.name])
          : String(item[field.name] ?? '')
    }
    setForm(values)
    setError('')
  }

  function cancelEdit(): void {
    setEditingId(null)
    setForm(emptyForm(active))
    setError('')
  }

  function handleDelete(item: CatalogItem): void {
    const name = String(item[active.fields[0].name] ?? `#${item[active.pk]}`)
    if (!window.confirm(`¿Eliminar "${name}" de ${active.label}?`)) return
    deleteItem.mutate(Number(item[active.pk]))
  }

  const isSaving = createItem.isPending || updateItem.isPending
  const columns = data && data.length > 0 ? Object.keys(data[0]) : active.fields.map((f) => f.name)

  function columnLabel(column: string): string {
    return active.fields.find((field) => field.name === column)?.label ?? column
  }

  function formatValue(column: string, value: unknown): string {
    const field = active.fields.find((item) => item.name === column)
    if (field?.type === 'checkbox') return value ? 'Sí' : 'No'
    return String(value ?? '—')
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Catálogos</h1>
      <p className="mt-1 text-sm text-gray-500">
        Solo administradores pueden ver y modificar estos datos.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATALOGS.map((catalog) => (
          <button
            key={catalog.key}
            onClick={() => {
              setActiveKey(catalog.key)
              setForm(emptyForm(catalog))
              setEditingId(null)
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
          if (editingId !== null) {
            updateItem.mutate({ id: editingId, payload: buildPayload() })
          } else {
            createItem.mutate()
          }
        }}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow"
      >
        {active.fields.map((field) =>
          field.type === 'checkbox' ? (
            <label key={field.name} className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={Boolean(form[field.name])}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [field.name]: event.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              {field.label}
            </label>
          ) : (
            <label key={field.name} className="text-sm text-gray-600">
              {field.label}
              <input
                value={String(form[field.name] ?? '')}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [field.name]: event.target.value }))
                }
                className="mt-1 block rounded border p-2 text-gray-900"
                required
              />
            </label>
          ),
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {editingId !== null
            ? isSaving
              ? 'Guardando...'
              : 'Guardar cambios'
            : isSaving
              ? 'Agregando...'
              : 'Agregar'}
        </button>

        {editingId !== null && (
          <button
            type="button"
            onClick={cancelEdit}
            className="rounded border px-4 py-2 font-semibold text-gray-700"
          >
            Cancelar
          </button>
        )}
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <p className="mt-3 text-xs text-gray-500">
        Nota: algunos catálogos son usados por productos, usuarios o ventas. Si intentas
        eliminar un valor en uso, se mostrará un error y no se borrará.
      </p>

      {isLoading && <p className="mt-4 text-gray-500">Cargando...</p>}

      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {columns.map((column) => (
                <th key={column} className="p-3">
                  {columnLabel(column)}
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
                    {formatValue(column, item[column])}
                  </td>
                ))}
                <td className="p-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleteItem.isPending}
                      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && (data ?? []).length === 0 && (
          <p className="p-4 text-sm text-gray-500">No hay registros en este catálogo.</p>
        )}
      </div>
    </section>
  )
}
