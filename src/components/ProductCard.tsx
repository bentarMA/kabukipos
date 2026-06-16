import type { Product } from '../types'
import { formatCurrency } from '../utils/formatters'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <button
      onClick={() => onAdd(product)}
      disabled={!product.isAvailable}
      className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-brand-200 hover:shadow-md hover:shadow-brand-500/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {!product.isAvailable && (
        <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
          Habis
        </span>
      )}
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-3xl transition group-hover:bg-brand-50">
        {product.emoji}
      </div>
      <h4 className="line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</h4>
      {product.description && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gray-400">
          {product.description}
        </p>
      )}
      <p className="mt-auto pt-3 text-sm font-bold text-brand-600">
        {formatCurrency(product.price)}
      </p>
    </button>
  )
}
