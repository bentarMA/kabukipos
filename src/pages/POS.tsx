import { useMemo, useState } from 'react'
import {
  Search,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  ShoppingCart,
  X,
  ArrowLeft,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CartPanel } from '../components/CartPanel'
import { Modal } from '../components/Modal'
import { ProductCard } from '../components/ProductCard'
import { useStore } from '../context/StoreContext'
import type { PaymentMethod, ProductCategory, Sale } from '../types'
import { CATEGORY_LABELS, PAYMENT_LABELS } from '../types'
import { formatCurrency, formatDateTime } from '../utils/formatters'

const categories: (ProductCategory | 'all')[] = [
  'all',
  'ramen',
  'teppanyaki',
  'hikiniku',
  'rice',
  'minuman',
  'snack',
  'addon',
  'mie',
  'nasgor',
  'ropang',
]

const paymentOptions: { method: PaymentMethod; icon: typeof Banknote; label: string }[] = [
  { method: 'cash', icon: Banknote, label: 'Tunai' },
  { method: 'qris', icon: QrCode, label: 'QRIS' },
  { method: 'debit', icon: CreditCard, label: 'Debit' },
  { method: 'transfer', icon: Building2, label: 'Transfer' },
]

function ReceiptView({ sale, storeName }: { sale: Sale; storeName: string }) {
  return (
    <div className="mx-auto max-w-xs font-mono text-xs">
      <div className="border-b border-dashed border-gray-300 pb-3 text-center">
        <p className="text-sm font-bold">{storeName}</p>
        <p className="text-[10px] text-gray-500">Japanese Yatai</p>
      </div>
      <div className="space-y-1 border-b border-dashed border-gray-300 py-3">
        <p>No: {sale.invoiceNumber}</p>
        <p>{formatDateTime(sale.createdAt)}</p>
        <p>Kasir: {sale.cashierName}</p>
        {sale.customerName && <p>Pelanggan: {sale.customerName}</p>}
      </div>
      <div className="space-y-2 py-3">
        {sale.items.map((item, i) => (
          <div key={i} className="flex justify-between gap-2">
            <span className="min-w-0">
              {item.quantity}x {item.productName}
            </span>
            <span className="shrink-0">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1 border-t border-dashed border-gray-300 pt-3">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Diskon</span>
            <span>-{formatCurrency(sale.discount)}</span>
          </div>
        )}
        {sale.tax > 0 && (
          <div className="flex justify-between">
            <span>Pajak</span>
            <span>{formatCurrency(sale.tax)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>{PAYMENT_LABELS[sale.paymentMethod]}</span>
          <span>{formatCurrency(sale.amountPaid)}</span>
        </div>
        {sale.change > 0 && (
          <div className="flex justify-between font-bold">
            <span>Kembalian</span>
            <span>{formatCurrency(sale.change)}</span>
          </div>
        )}
      </div>
      <p className="pt-4 text-center text-[10px] text-gray-400">
        ありがとうございました · Terima kasih!
      </p>
    </div>
  )
}

export function POS() {
  const { cashier } = useAuth()
  const { products, cart, cartSubtotal, settings, completeSale, addToCart } = useStore()
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [discount, setDiscount] = useState('')
  const [customerName, setCustomerName] = useState('')

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const tax = Math.round(cartSubtotal * settings.taxRate)
  const discountNum = Number(discount) || 0
  const total = Math.max(0, cartSubtotal + tax - discountNum)
  const paidNum = Number(amountPaid) || 0
  const change = Math.max(0, paidNum - total)

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = category === 'all' || p.category === category
      const matchSearch =
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      return matchCategory && matchSearch && p.isAvailable
    })
  }, [products, category, search])

  const handleCheckout = () => {
    setAmountPaid(String(total))
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  const handleComplete = () => {
    if (paidNum < total) return
    const sale = completeSale({
      paymentMethod,
      amountPaid: paidNum,
      discount: discountNum,
      customerName: customerName || undefined,
    })
    setCompletedSale(sale)
    setCheckoutOpen(false)
    setReceiptOpen(true)
    setAmountPaid('')
    setDiscount('')
    setCustomerName('')
    setPaymentMethod('cash')
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:flex-row">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white sm:flex">
                屋
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-gray-900">Kasir</h1>
                <p className="truncate text-xs text-gray-500">
                  {cashier?.name} · {settings.storeName}
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition sm:px-4 ${
                  category === cat
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'Semua' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f8f7fc] p-3 pb-24 sm:p-6 lg:pb-6">
          {filteredProducts.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-400">Tidak ada menu ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop cart sidebar */}
      <div className="hidden w-[380px] shrink-0 border-l border-gray-200 shadow-xl lg:block">
        <CartPanel onCheckout={handleCheckout} />
      </div>

      {/* Mobile floating cart button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-brand-500/40 transition active:scale-95 lg:hidden"
      >
        <ShoppingCart className="h-5 w-5" />
        {formatCurrency(cartSubtotal)}
        {cartCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs">
            {cartCount}
          </span>
        )}
      </button>

      {/* Mobile cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex h-[85dvh] flex-col rounded-t-2xl bg-white animate-slide-up">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="font-semibold text-gray-900">Keranjang</h3>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <CartPanel onCheckout={handleCheckout} />
            </div>
          </div>
        </div>
      )}

      <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Pembayaran" size="md">
        <div className="space-y-5">
          <div className="rounded-xl bg-brand-50 p-4 text-center">
            <p className="text-sm text-brand-600">Total Pembayaran</p>
            <p className="text-2xl font-bold text-brand-700 sm:text-3xl">{formatCurrency(total)}</p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map(({ method, icon: Icon, label }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    paymentMethod === method
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Diskon (Rp)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Nama Pelanggan
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Opsional"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Jumlah Dibayar (Rp)
            </label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-lg font-semibold outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            {paidNum >= total && paidNum > 0 && (
              <p className="mt-2 text-sm font-medium text-emerald-600">
                Kembalian: {formatCurrency(change)}
              </p>
            )}
            {paidNum > 0 && paidNum < total && (
              <p className="mt-2 text-sm font-medium text-red-500">
                Kurang: {formatCurrency(total - paidNum)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[50000, 100000, 200000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmountPaid(String(amt))}
                className="rounded-lg border border-gray-200 py-2 text-[11px] font-semibold text-gray-600 hover:border-brand-300 hover:bg-brand-50 sm:text-xs"
              >
                {formatCurrency(amt)}
              </button>
            ))}
          </div>

          <button
            onClick={handleComplete}
            disabled={paidNum < total}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Selesaikan Transaksi
          </button>
        </div>
      </Modal>

      <Modal open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Struk Pembayaran" size="sm">
        {completedSale && (
          <div>
            <ReceiptView sale={completedSale} storeName={settings.storeName} />
            <button
              onClick={() => setReceiptOpen(false)}
              className="mt-6 w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Transaksi Baru
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
