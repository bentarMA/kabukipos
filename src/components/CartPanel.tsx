import { Minus, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { formatCurrency } from '../utils/formatters'

interface CartPanelProps {
  onCheckout: () => void
}

export function CartPanel({ onCheckout }: CartPanelProps) {
  const { cart, cartSubtotal, updateCartQuantity, removeFromCart, clearCart } = useStore()
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Keranjang</h3>
            <p className="text-xs text-gray-500">{itemCount} item</p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-medium text-red-500 hover:text-red-600"
            >
              Kosongkan
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 text-4xl opacity-30">🛒</div>
            <p className="text-sm font-medium text-gray-400">Keranjang kosong</p>
            <p className="mt-1 text-xs text-gray-300">Pilih menu untuk memulai</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.product.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-brand-600">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product.id, item.quantity - 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product.id, item.quantity + 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-5">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">{formatCurrency(cartSubtotal)}</span>
          </div>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-700 hover:to-brand-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          Bayar — {formatCurrency(cartSubtotal)}
        </button>
      </div>
    </div>
  )
}
