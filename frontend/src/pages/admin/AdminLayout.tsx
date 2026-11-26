import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { CATALOGS } from './catalogConfig'

const MAIN_LINKS = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/products', label: 'Productos' },
  { to: '/admin/orders', label: 'Pedidos' },
  { to: '/admin/returns', label: 'Devoluciones' },
  { to: '/admin/cancellations', label: 'Cancelaciones' },
  { to: '/admin/users', label: 'Usuarios' },
]

function linkClass({ isActive }: { isActive: boolean }): string {
  return `block rounded px-3 py-2 text-sm ${
    isActive
      ? 'bg-indigo-600 font-semibold text-white'
      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
  }`
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex w-full flex-col gap-4 px-6 py-6 lg:flex-row lg:gap-6 lg:px-8">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded border bg-white dark:bg-gray-800 px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 shadow lg:hidden"
      >
        {open ? 'Ocultar menú' : 'Mostrar menú'}
      </button>

      <aside className={`${open ? 'block' : 'hidden'} w-full shrink-0 lg:block lg:w-64`}>
        <nav className="space-y-6 rounded-lg bg-white dark:bg-gray-800 p-4 shadow">
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Administración
            </p>
            <div className="mt-2 space-y-1">
              {MAIN_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Catálogos
            </p>
            <div className="mt-2 space-y-1">
              {CATALOGS.map((catalog) => (
                <NavLink
                  key={catalog.key}
                  to={`/admin/catalogs/${catalog.key}`}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                >
                  {catalog.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
