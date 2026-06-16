import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal } from '../components/Modal'
import { useStore } from '../context/StoreContext'
import type { Product, ProductCategory } from '../types'
import { CATEGORY_LABELS } from '../types'
import { formatCurrency } from '../utils/formatters'

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  category: 'ramen',
  price: 0,
  emoji: '🍜',
  description: '',
  isAvailable: true,
}

export function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct)
  const [filter, setFilter] = useState<ProductCategory | 'all'>('all')

  const filtered = filter === 'all' ? products : products.filter((p) => p.category === filter)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyProduct)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      emoji: product.emoji,
      description: product.description ?? '',
      isAvailable: product.isAvailable,
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name || form.price <= 0) return
    if (editing) {
      updateProduct({ ...form, id: editing.id })
    } else {
      addProduct(form)
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Hapus produk ini?')) deleteProduct(id)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
          <p className="mt-1 text-sm text-gray-500">{products.length} menu terdaftar</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Tambah Menu
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(['all', 'ramen', 'sushi', 'yakitori', 'snack', 'minuman', 'paket'] as const).map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filter === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand-300'
              }`}
            >
              {cat === 'all' ? 'Semua' : CATEGORY_LABELS[cat]}
            </button>
          ),
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-3xl">
              {product.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-xs text-brand-600">{CATEGORY_LABELS[product.category]}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    product.isAvailable
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {product.isAvailable ? 'Tersedia' : 'Habis'}
                </span>
              </div>
              {product.description && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-400">{product.description}</p>
              )}
              <p className="mt-2 text-sm font-bold text-gray-900">
                {formatCurrency(product.price)}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => openEdit(product)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Menu' : 'Tambah Menu Baru'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Nama Menu</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Kategori</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as ProductCategory })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Harga (Rp)</label>
              <input
                type="number"
                value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Emoji</label>
              <input
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-center text-2xl outline-none focus:border-brand-400"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Tersedia
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Simpan
          </button>
        </div>
      </Modal>
    </div>
  )
}
