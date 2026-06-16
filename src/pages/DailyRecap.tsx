import { useState, useEffect } from 'react'
import {
  Mail,
  CalendarCheck,
  Users,
  ShoppingBag,
  TrendingUp,
  Send,
  CheckCircle2,
  AlertCircle,
  History,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import { StatCard } from '../components/StatCard'
import { sendRecapEmail } from '../utils/email'
import { buildDailyRecap, formatRecapDate } from '../utils/recap'
import { formatCurrency } from '../utils/formatters'
import { generateId } from '../utils/formatters'
import type { DailyRecapRecord } from '../types'

export function DailyRecapPage() {
  const { cashier } = useAuth()
  const { sales, settings, saveDailyRecap, getRecapForDate, recaps } = useStore()
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const recap = buildDailyRecap(sales, selectedDate, settings.storeName)
  const existingRecap = getRecapForDate(selectedDate)

  useEffect(() => {
    setStatus(null)
  }, [selectedDate])

  const handleCloseAndSend = async () => {
    if (!cashier) return
    if (recap.totalTransactions === 0) {
      setStatus({ type: 'error', message: 'Belum ada transaksi pada tanggal ini.' })
      return
    }

    setSending(true)
    setStatus(null)

    let emailSent = false
    let emailSentAt: string | undefined
    let emailError: string | undefined

    if (settings.reportEmail) {
      const result = await sendRecapEmail(recap, settings.reportEmail)
      emailSent = result.ok
      if (result.ok) {
        emailSentAt = new Date().toISOString()
      } else {
        emailError = result.message
      }
    }

    const record: DailyRecapRecord = {
      ...recap,
      id: existingRecap?.id ?? generateId(),
      closedAt: new Date().toISOString(),
      closedBy: cashier.name,
      emailSent,
      emailSentAt,
      emailError,
    }

    saveDailyRecap(record)

    if (settings.reportEmail) {
      if (emailSent) {
        setStatus({
          type: 'success',
          message: `Rekap berhasil disimpan dan dikirim ke ${settings.reportEmail}`,
        })
      } else {
        setStatus({
          type: 'error',
          message: emailError ?? 'Rekap disimpan, tetapi email gagal dikirim.',
        })
      }
    } else {
      setStatus({
        type: 'success',
        message: 'Rekap harian berhasil disimpan. Atur email di Pengaturan untuk kirim otomatis.',
      })
    }

    setSending(false)
  }

  return (
    <div className="animate-fade-in space-y-6 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Rekap Harian</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ringkasan penjualan per hari & laporan per kasir
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-4 sm:p-5">
        <p className="text-sm font-medium text-brand-700">{formatRecapDate(selectedDate)}</p>
        {existingRecap && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Rekap ditutup {new Date(existingRecap.closedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {existingRecap.emailSent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 font-medium text-brand-700">
                <Mail className="h-3 w-3" />
                Email terkirim
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Pendapatan"
          value={formatCurrency(recap.totalRevenue)}
          icon={TrendingUp}
          accent="purple"
        />
        <StatCard
          title="Transaksi"
          value={String(recap.totalTransactions)}
          subtitle="pesanan selesai"
          icon={CalendarCheck}
          accent="blue"
        />
        <StatCard
          title="Item Terjual"
          value={String(recap.totalItemsSold)}
          icon={ShoppingBag}
          accent="green"
        />
        <StatCard
          title="Kasir Aktif"
          value={String(recap.cashiers.length)}
          subtitle="yang melayani"
          icon={Users}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Performa per Kasir</h3>
          {recap.cashiers.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Belum ada transaksi</p>
          ) : (
            <div className="space-y-3">
              {recap.cashiers.map((c) => (
                <div
                  key={c.cashierId}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.cashierName}</p>
                    <p className="text-xs text-gray-400">
                      {c.transactions} transaksi · {c.itemsSold} item
                    </p>
                  </div>
                  <span className="text-sm font-bold text-brand-600">
                    {formatCurrency(c.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Menu Terlaris</h3>
          {recap.topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {recap.topProducts.map((p, i) => (
                <div key={p.productName} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{p.productName}</p>
                    <p className="text-xs text-gray-400">{p.quantity} terjual</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-gray-700">
                    {formatCurrency(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {recap.payments.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Metode Pembayaran</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recap.payments.map((p) => (
              <div key={p.method} className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">{p.label}</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(p.total)}</p>
                <p className="text-xs text-gray-400">{p.count} transaksi</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-2 font-semibold text-gray-900">Selesaikan Rekap</h3>
        <p className="mb-4 text-sm text-gray-500">
          Tutup rekap harian dan kirim laporan otomatis ke email yang dikonfigurasi.
          {settings.reportEmail ? (
            <span className="block mt-1 font-medium text-brand-600">
              Email tujuan: {settings.reportEmail}
            </span>
          ) : (
            <span className="block mt-1 text-amber-600">
              Email belum diatur — rekap tetap tersimpan lokal.
            </span>
          )}
        </p>

        {status && (
          <div
            className={`mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {status.message}
          </div>
        )}

        <button
          onClick={handleCloseAndSend}
          disabled={sending || recap.totalTransactions === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-700 hover:to-brand-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-8"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Mengirim...' : 'Selesaikan Rekap & Kirim Email'}
        </button>
      </div>

      {recaps.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900">Riwayat Rekap</h3>
          </div>
          <div className="space-y-2">
            {recaps.slice(0, 10).map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedDate(r.date)}
                className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-left transition hover:bg-brand-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatRecapDate(r.date)}</p>
                  <p className="text-xs text-gray-400">
                    oleh {r.closedBy} · {r.totalTransactions} trx
                    {r.emailSent && ' · ✉ terkirim'}
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-600">
                  {formatCurrency(r.totalRevenue)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
