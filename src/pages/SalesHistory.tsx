import { useMemo, useState } from 'react'
import { Search, Eye, Download } from 'lucide-react'
import { Modal } from '../components/Modal'
import { useStore } from '../context/StoreContext'
import type { Sale } from '../types'
import { PAYMENT_LABELS } from '../types'
import { formatCurrency, formatDateTime } from '../utils/formatters'

function SaleDetail({ sale }: { sale: Sale }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">No. Invoice</p>
          <p className="font-medium">{sale.invoiceNumber}</p>
        </div>
        <div>
          <p className="text-gray-500">Waktu</p>
          <p className="font-medium">{formatDateTime(sale.createdAt)}</p>
        </div>
        <div>
          <p className="text-gray-500">Kasir</p>
          <p className="font-medium">{sale.cashierName}</p>
        </div>
        <div>
          <p className="text-gray-500">Pembayaran</p>
          <p className="font-medium">{PAYMENT_LABELS[sale.paymentMethod]}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Item</th>
              <th className="px-4 py-2.5 text-center font-medium text-gray-500">Qty</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sale.items.map((item, i) => (
              <tr key={i}>
                <td className="px-4 py-2.5">{item.productName}</td>
                <td className="px-4 py-2.5 text-center">{item.quantity}</td>
                <td className="px-4 py-2.5 text-right font-medium">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Diskon</span>
            <span>-{formatCurrency(sale.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
          <span>Total</span>
          <span className="text-brand-600">{formatCurrency(sale.total)}</span>
        </div>
        {sale.change > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Kembalian</span>
            <span>{formatCurrency(sale.change)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function SalesHistory() {
  const { sales } = useStore()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchSearch =
        search === '' ||
        sale.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        sale.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()))

      const matchDate =
        dateFilter === '' ||
        sale.createdAt.startsWith(dateFilter)

      return matchSearch && matchDate
    })
  }, [sales, search, dateFilter])

  const totalFiltered = filteredSales.reduce((s, sale) => s + sale.total, 0)

  const exportCsv = () => {
    const headers = ['Invoice', 'Tanggal', 'Kasir', 'Pembayaran', 'Item', 'Total']
    const rows = filteredSales.map((s) => [
      s.invoiceNumber,
      formatDateTime(s.createdAt),
      s.cashierName,
      PAYMENT_LABELS[s.paymentMethod],
      s.items.map((i) => `${i.quantity}x ${i.productName}`).join('; '),
      s.total,
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `penjualan-kabukiro-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in space-y-6 pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Riwayat Penjualan</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredSales.length} transaksi · Total {formatCurrency(totalFiltered)}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filteredSales.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-brand-300 hover:text-brand-600 disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari invoice, pelanggan, atau menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {filteredSales.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center">
            <p className="text-sm text-gray-400">Belum ada data penjualan</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {sale.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-400">{formatDateTime(sale.createdAt)}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-brand-600">
                  {formatCurrency(sale.total)}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                  {PAYMENT_LABELS[sale.paymentMethod]}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  {sale.cashierName}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-gray-500">
                {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
              </p>
              <button
                onClick={() => setSelectedSale(sale)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600"
              >
                <Eye className="h-3.5 w-3.5" />
                Lihat detail
              </button>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
        {filteredSales.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">Belum ada data penjualan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Invoice
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Waktu
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Item
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Kasir
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Pembayaran
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="transition hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</p>
                    {sale.customerName && (
                      <p className="text-xs text-gray-400">{sale.customerName}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDateTime(sale.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-[200px] truncate text-sm text-gray-600">
                      {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sale.cashierName}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                      {PAYMENT_LABELS[sale.paymentMethod]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        title="Detail Transaksi"
        size="lg"
      >
        {selectedSale && <SaleDetail sale={selectedSale} />}
      </Modal>
    </div>
  )
}
