import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem } from '../types'

const STORAGE_KEY = 'gorras_cart'

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  addItem: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void
  updateQuantity: (idProductoColor: number, cantidad: number) => void
  removeItem: (idProductoColor: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as CartItem[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(item: Omit<CartItem, 'cantidad'>, cantidad = 1): void {
    setItems((current) => {
      const existing = current.find(
        (currentItem) => currentItem.id_producto_color === item.id_producto_color,
      )

      if (existing) {
        return current.map((currentItem) =>
          currentItem.id_producto_color === item.id_producto_color
            ? {
                ...currentItem,
                cantidad: Math.min(currentItem.cantidad + cantidad, currentItem.stock),
              }
            : currentItem,
        )
      }

      return [...current, { ...item, cantidad: Math.min(cantidad, item.stock) }]
    })
  }

  function updateQuantity(idProductoColor: number, cantidad: number): void {
    setItems((current) =>
      current
        .map((item) =>
          item.id_producto_color === idProductoColor
            ? { ...item, cantidad: Math.max(0, Math.min(cantidad, item.stock)) }
            : item,
        )
        .filter((item) => item.cantidad > 0),
    )
  }

  function removeItem(idProductoColor: number): void {
    setItems((current) =>
      current.filter((item) => item.id_producto_color !== idProductoColor),
    )
  }

  function clear(): void {
    setItems([])
  }

  const count = items.reduce((sum, item) => sum + item.cantidad, 0)
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, updateQuantity, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider')
  }
  return ctx
}
