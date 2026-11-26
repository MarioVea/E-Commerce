import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/api'
import type { CatalogItem } from '../../types'
import { CATALOGS, type CatalogConfig } from './catalogConfig'

function emptyForm(catalog: CatalogConfig): Record<string, string | boolean> {
  const values: Record<string, string | boolean> = {}
  for (const field of catalog.fields) {
    values[field.name] = field.type === 'checkbox' ? true : ''
  }
  return values
}

export default function AdminCatalogs() {
  const queryClient = useQueryClient()
  const { catalog: catalogKey } = useParams()
  const active = CATALOGS.find((catalog) => catalog.key === catalogKey) ?? CATALOGS[0]
  const activeKey = active.key
  const [form, setForm] = useState<Record<string, string | boolean>>(() =>
    emptyForm(active),
  )
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setForm(emptyForm(active))
    setEditingId(null)
    setError('')
    setIsModalOpen(false)
  }, [activeKey])

  useEffect(() => {
    if (!isModalOpen) return

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') cancelEdit()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

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
    setIsModalOpen(false)
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
    setIsModalOpen(true)
  }

  function openCreate(): void {
    setEditingId(null)
    setForm(emptyForm(active))
    setError('')
    setIsModalOpen(true)
  }

  function cancelEdit(): void {
    setEditingId(null)
    setForm(emptyForm(active))
    setError('')
    setIsModalOpen(false)
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
    <section>
      <h1 className="text-2xl font-bold">{active.label}</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Solo administradores pueden ver y modificar estos datos.
      </p>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Nota: algunos catálogos son usados por productos, usuarios o ventas. Si intentas
        eliminar un valor en uso, se mostrará un error y no se borrará.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Registros</h2>
        <button
          type="button"
          onClick={openCreate}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Nuevo registro
        </button>
      </div>

      {isLoading && <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando...</p>}

      <div className="mt-3 overflow-x-auto rounded-lg bg-white dark:bg-gray-800 shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
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
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleteItem.isPending}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50"
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
          <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No hay registros en este catálogo.</p>
        )}
      </div>

      {isModalOpen && (
        <div
          role="presentation"
          onClick={cancelEdit}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="catalog-modal-title" className="text-lg font-bold">
                {editingId !== null
                  ? `Editar ${active.label.toLowerCase()}`
                  : `Nuevo registro en ${active.label.toLowerCase()}`}
              </h2>
              <button
                type="button"
                onClick={cancelEdit}
                aria-label="Cerrar"
                className="text-xl leading-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
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
              className="mt-4 space-y-4"
            >
              {active.fields.map((field) =>
                field.type === 'checkbox' ? (
                  <label
                    key={field.name}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(form[field.name])}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [field.name]: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                    />
                    {field.label}
                  </label>
                ) : (
                  <label key={field.name} className="block text-sm text-gray-600 dark:text-gray-300">
                    {field.label}
                    <input
                      type={
                        field.type === 'email'
                          ? 'email'
                          : field.type === 'tel'
                            ? 'tel'
                            : 'text'
                      }
                      value={String(form[field.name] ?? '')}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [field.name]: event.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded border p-2 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </label>
                ),
              )}

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded border px-4 py-2 font-semibold text-gray-700 dark:text-gray-200"
                >
                  Cancelar
                </button>
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
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
