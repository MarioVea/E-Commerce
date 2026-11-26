import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 p-4">
        <Link to="/" className="text-xl font-bold">
          🧢 Gorras Store
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link to="/catalog" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Catálogo
          </Link>

          {user && (
            <Link to="/cart" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Carrito{count > 0 ? ` (${count})` : ''}
            </Link>
          )}
          {user && (
            <Link to="/orders" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Pedidos
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="font-semibold text-indigo-600 dark:text-indigo-400">
              Admin
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="rounded border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                {user.fullName || user.email}
              </Link>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-400"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Ingresar
              </Link>
              <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
