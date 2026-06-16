import { Link } from 'react-router-dom'
import {
  DollarSign,
  Receipt,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Clock,
  CalendarCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { StatCard } from '../components/StatCard'
import { useStore } from '../context/StoreContext'
import { formatCurrency, formatTime } from '../utils/formatters'
import { PAYMENT_LABELS } from '../types'

export function Dashboard() {
  const { cashier } = useAuth()
  const { todayRevenue, todayTransactions, todaySales, sales, products } = useStore()

  const myTodaySales = todaySales.filter((s) => s.cashierId === cashier?.id)
  const myTodayRevenue = myTodaySales.reduce((s, sale) => s + sale.total, 0)

  const topProducts = (() => {
    const counts = new Map<string, { name: string; qty: number; revenue: number }>()
    todaySales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = counts.get(item.productId)
        if (existing) {
          existing.qty += item.quantity
          existing.revenue += item.subtotal
        } else {
          counts.set(item.productId, {
            name: item.productName,
            qty: item.quantity,
            revenue: item.subtotal,
          })
        }
      })
    })
    return Array.from(counts.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  })()

  const availableProducts = products.filter((p) => p.isAvailable).length

  return (
    <div className="animate-fade-in space-y-6 pb-4 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Halo, {cashier?.name} —{' '}
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/rekap"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            <CalendarCheck className="h-4 w-4" />
            Rekap Harian
          </Link>
          <Link
            to="/kasir"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-700"
          >
            Buka Kasir
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <StatCard
          title="Pendapatan Hari Ini"
          value={formatCurrency(todayRevenue)}
          icon={DollarSign}
          accent="purple"
        />
        <StatCard
          title="Penjualan Saya"
          value={formatCurrency(myTodayRevenue)}
          subtitle={`${myTodaySales.length} transaksi`}
          icon={TrendingUp}
          accent="green"
        />
        <StatCard
          title="Transaksi"
          value={String(todayTransactions)}
          subtitle="semua kasir"
          icon={Receipt}
          accent="blue"
        />
        <StatCard
          title="Menu Tersedia"
          value={`${availableProducts}/${products.length}`}
          subtitle="produk aktif"
          icon={ShoppingBag}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Transaksi Terbaru</h3>
            <Link to="/penjualan" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Lihat semua →
            </Link>
          </div>
          {todaySales.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Clock className="mb-3 h-10 w-10 text-gray-200" />
              <p className="text-sm text-gray-400">Belum ada transaksi hari ini</p>
              <Link to="/kasir" className="mt-3 text-sm font-medium text-brand-600">
                Mulai transaksi pertama
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySales.slice(0, 6).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</p>
                    <p className="text-xs text-gray-400">
                      {formatTime(sale.createdAt)} · {sale.cashierName} ·{' '}
                      {PAYMENT_LABELS[sale.paymentMethod]}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-brand-600">
                    {formatCurrency(sale.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-semibold text-gray-900">Menu Terlaris Hari Ini</h3>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Data belum tersedia</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.qty} terjual</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {sales.length > 0 && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
          <p className="text-sm text-brand-800">
            Total <strong>{sales.length}</strong> transaksi tercatat sejak aplikasi digunakan.
            Semua data disimpan di perangkat ini.
          </p>
        </div>
      )}
    </div>
  )
}
