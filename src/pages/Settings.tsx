import { useState } from 'react'
import { Save, RotateCcw, Mail } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import type { StoreSettings } from '../types'
import { resetToSampleData } from '../utils/storage'

export function SettingsPage() {
  const { settings, updateSettings } = useStore()
  const [form, setForm] = useState<StoreSettings>(settings)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (
      confirm(
        'Reset semua data ke default? Semua transaksi dan perubahan produk akan dihapus.',
      )
    ) {
      resetToSampleData()
      window.location.reload()
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6 pb-4 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Pengaturan</h1>
        <p className="mt-1 text-sm text-gray-500">Konfigurasi toko, email rekap & pajak</p>
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="font-semibold text-gray-900">Informasi Toko</h3>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Nama Toko</label>
          <input
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Tagline</label>
          <input
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Alamat</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Telepon</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-brand-600" />
          <h3 className="font-semibold text-gray-900">Email Rekap Harian</h3>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Email Tujuan Laporan
          </label>
          <input
            type="email"
            value={form.reportEmail}
            onChange={(e) => setForm({ ...form, reportEmail: e.target.value })}
            placeholder="owner@kabukiro.com"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Rekap harian otomatis dikirim ke email ini saat Anda menekan &quot;Selesaikan Rekap&quot;
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.autoSendRecap}
            onChange={(e) => setForm({ ...form, autoSendRecap: e.target.checked })}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          Kirim email otomatis saat rekap ditutup
        </label>
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="font-semibold text-gray-900">Pajak</h3>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Pajak (desimal — contoh: 0.11 untuk 11%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={form.taxRate}
            onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleSave}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Save className="h-4 w-4" />
          {saved ? 'Tersimpan!' : 'Simpan Pengaturan'}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Data
        </button>
      </div>

      <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-brand-800">
        <p>
          <strong>Kabukiro POS v2.0</strong> — Siap deploy di Vercel. Data tersimpan lokal
          (localStorage) dan akan terintegrasi dengan database Supabase. Setup{' '}
          <code className="rounded bg-brand-100 px-1 text-xs">RESEND_API_KEY</code> di Vercel
          untuk fitur email rekap.
        </p>
      </div>
    </div>
  )
}
