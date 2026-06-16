import { useMemo } from 'react'
import { BarChart3, PieChart } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { CATEGORY_LABELS, PAYMENT_LABELS, type ProductCategory, type PaymentMethod } from '../types'
import { formatCurrency, isToday } from '../utils/formatters'

export function Reports() {
  const { sales } = useStore()

  const todaySales = sales.filter((s) => isToday(s.createdAt))
  const weekSales = sales.filter((s) => {
    const d = new Date(s.createdAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d >= weekAgo
  })

  const todayRevenue = todaySales.reduce((s, sale) => s + sale.total, 0)
  const weekRevenue = weekSales.reduce((s, sale) => s + sale.total, 0)

  const categoryBreakdown = useMemo(() => {
    const map = new Map<ProductCategory, number>()
    weekSales.forEach((sale) => {
      sale.items.forEach((item) => {
        map.set(item.category, (map.get(item.category) ?? 0) + item.subtotal)
      })
    })
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, revenue]) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        revenue,
        pct: weekRevenue > 0 ? (revenue / weekRevenue) * 100 : 0,
      }))
  }, [weekSales, weekRevenue])

  const paymentBreakdown = useMemo(() => {
    const map = new Map<PaymentMethod, number>()
    weekSales.forEach((sale) => {
      map.set(sale.paymentMethod, (map.get(sale.paymentMethod) ?? 0) + sale.total)
    })
    return Array.from(map.entries()).map(([method, total]) => ({
      method,
      label: PAYMENT_LABELS[method],
      total,
      pct: weekRevenue > 0 ? (total / weekRevenue) * 100 : 0,
    }))
  }, [weekSales, weekRevenue])

  const dailyChart = useMemo(() => {
    const days: { label: string; revenue: number; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const daySales = sales.filter((s) => s.createdAt.startsWith(dateStr))
      days.push({
        label: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        revenue: daySales.reduce((sum, s) => sum + s.total, 0),
        count: daySales.length,
      })
    }
    return days
  }, [sales])

  const maxDaily = Math.max(...dailyChart.map((d) => d.revenue), 1)

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
        <p className="mt-1 text-sm text-gray-500">Analisis penjualan 7 hari terakhir</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Hari Ini</p>
          <p className="mt-1 text-2xl font-bold text-brand-600">{formatCurrency(todayRevenue)}</p>
          <p className="text-xs text-gray-400">{todaySales.length} transaksi</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">7 Hari Terakhir</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(weekRevenue)}</p>
          <p className="text-xs text-gray-400">{weekSales.length} transaksi</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Rata-rata Harian</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatCurrency(Math.round(weekRevenue / 7))}
          </p>
          <p className="text-xs text-gray-400">per hari</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-brand-600" />
          <h3 className="font-semibold text-gray-900">Grafik Pendapatan Harian</h3>
        </div>
        <div className="flex items-end gap-3" style={{ height: 200 }}>
          {dailyChart.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-medium text-gray-500">
                {day.revenue > 0 ? `${(day.revenue / 1000).toFixed(0)}k` : '-'}
              </span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                style={{
                  height: `${Math.max(4, (day.revenue / maxDaily) * 160)}px`,
                }}
              />
              <span className="text-[10px] text-gray-400">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900">Penjualan per Kategori</h3>
          </div>
          {categoryBreakdown.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Belum ada data</p>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <span className="text-gray-500">
                      {formatCurrency(item.revenue)} ({item.pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900">Metode Pembayaran</h3>
          </div>
          {paymentBreakdown.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Belum ada data</p>
          ) : (
            <div className="space-y-4">
              {paymentBreakdown.map((item) => (
                <div key={item.method}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <span className="text-gray-500">
                      {formatCurrency(item.total)} ({item.pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand-400 transition-all"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
