import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, total, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-bold">Carrito</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Tu carrito está vacío.</p>
        <Link
          to="/catalog"
          className="mt-6 inline-block rounded bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Ver catálogo
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Carrito</h1>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.id_producto_color}
            className="flex flex-col gap-4 rounded-lg bg-white dark:bg-gray-800 p-4 shadow sm:flex-row sm:items-center"
          >
            {item.imagen_url ? (
              <img
                src={item.imagen_url}
                alt={item.nombre_producto}
                className="h-20 w-20 rounded object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-100 dark:bg-gray-700 text-3xl">
                🧢
              </div>
            )}

            <div className="flex-1">
              <h2 className="font-semibold">{item.nombre_producto}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.color ?? 'Color'} / {item.talla ?? 'Única'}
              </p>
              <p className="text-indigo-600 dark:text-indigo-400">${item.precio.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={item.stock}
                value={item.cantidad}
                onChange={(event) =>
                  updateQuantity(item.id_producto_color, Number(event.target.value))
                }
                className="w-20 rounded border p-2"
              />
              <button
                onClick={() => removeItem(item.id_producto_color)}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-400"
              >
                Quitar
              </button>
            </div>

            <p className="font-semibold">
              ${(item.precio * item.cantidad).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-end gap-3">
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
        <Link
          to="/checkout"
          className="rounded bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Continuar al checkout
        </Link>
      </div>
    </section>
  )
}
