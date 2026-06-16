import type { DailyRecapRecord, Product, Sale, StoreSettings } from '../types'
import { DEFAULT_SETTINGS, SAMPLE_PRODUCTS } from '../data/sampleProducts'

const KEYS = {
  products: 'kabukiro_products',
  sales: 'kabukiro_sales',
  settings: 'kabukiro_settings',
  recaps: 'kabukiro_recaps',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function migrateSettings(raw: StoreSettings): StoreSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    reportEmail: raw.reportEmail ?? '',
    autoSendRecap: raw.autoSendRecap ?? true,
  }
}

function migrateSale(sale: Sale): Sale {
  if (sale.cashierId) return sale
  return {
    ...sale,
    cashierId: 'legacy',
    cashierName: sale.cashierName || 'Kasir',
  }
}

export function loadProducts(): Product[] {
  return read(KEYS.products, SAMPLE_PRODUCTS)
}

export function saveProducts(products: Product[]): void {
  write(KEYS.products, products)
}

export function loadSales(): Sale[] {
  return read<Sale[]>(KEYS.sales, []).map(migrateSale)
}

export function saveSales(sales: Sale[]): void {
  write(KEYS.sales, sales)
}

export function loadSettings(): StoreSettings {
  const raw = read<StoreSettings>(KEYS.settings, DEFAULT_SETTINGS)
  return migrateSettings(raw)
}

export function saveSettings(settings: StoreSettings): void {
  write(KEYS.settings, settings)
}

export function loadRecaps(): DailyRecapRecord[] {
  return read<DailyRecapRecord[]>(KEYS.recaps, [])
}

export function saveRecaps(recaps: DailyRecapRecord[]): void {
  write(KEYS.recaps, recaps)
}

export function resetToSampleData(): void {
  saveProducts(SAMPLE_PRODUCTS)
  saveSales([])
  saveSettings(DEFAULT_SETTINGS)
  saveRecaps([])
}
