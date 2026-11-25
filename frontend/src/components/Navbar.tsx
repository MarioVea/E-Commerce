import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 p-4">
        <Link to="/" className="text-xl font-bold">
          🧢 Gorras Store
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link to="/catalog" className="hover:text-indigo-600">
            Catálogo
          </Link>

          {user && (
            <Link to="/cart" className="hover:text-indigo-600">
              Carrito{count > 0 ? ` (${count})` : ''}
            </Link>
          )}
          {user && (
            <Link to="/orders" className="hover:text-indigo-600">
              Pedidos
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="font-semibold text-indigo-600">
              Admin
            </Link>
          )}

          {user ? (
            <>
              <Link to="/profile" className="hover:text-indigo-600">
                {user.fullName || user.email}
              </Link>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="text-red-600 hover:text-red-700"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-600">
                Ingresar
              </Link>
              <Link to="/register" className="hover:text-indigo-600">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
