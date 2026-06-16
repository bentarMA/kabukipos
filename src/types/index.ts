export type ProductCategory =
  | 'ramen'
  | 'teppanyaki'
  | 'hikiniku'
  | 'rice'
  | 'minuman'
  | 'snack'
  | 'addon'
  | 'mie'
  | 'nasgor'
  | 'ropang'

export type PaymentMethod = 'cash' | 'debit' | 'qris' | 'transfer'

export interface Cashier {
  id: string
  name: string
  password: string
  avatar: string
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  price: number
  emoji: string
  description?: string
  isAvailable: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  note?: string
}

export interface SaleItem {
  productId: string
  productName: string
  category: ProductCategory
  price: number
  quantity: number
  subtotal: number
  note?: string
}

export interface Sale {
  id: string
  invoiceNumber: string
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  amountPaid: number
  change: number
  cashierId: string
  cashierName: string
  customerName?: string
  createdAt: string
}

export interface StoreSettings {
  storeName: string
  tagline: string
  address: string
  phone: string
  taxRate: number
  reportEmail: string
  autoSendRecap: boolean
}

export interface CashierRecapStats {
  cashierId: string
  cashierName: string
  transactions: number
  revenue: number
  itemsSold: number
}

export interface ProductRecapStats {
  productName: string
  quantity: number
  revenue: number
}

export interface PaymentRecapStats {
  method: PaymentMethod
  label: string
  total: number
  count: number
}

export interface DailyRecapSummary {
  date: string
  storeName: string
  totalRevenue: number
  totalTransactions: number
  totalItemsSold: number
  totalDiscount: number
  totalTax: number
  cashiers: CashierRecapStats[]
  topProducts: ProductRecapStats[]
  payments: PaymentRecapStats[]
}

export interface DailyRecapRecord extends DailyRecapSummary {
  id: string
  closedAt: string
  closedBy: string
  emailSent: boolean
  emailSentAt?: string
  emailError?: string
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ramen: 'Ramen',
  teppanyaki: 'Teppanyaki',
  hikiniku: 'Hikiniku',
  rice: 'Rice',
  minuman: 'Minuman',
  snack: 'Snack',
  addon: 'Add On',
  mie: 'Mie',
  nasgor: 'Nasi Goreng',
  ropang: 'Ropang',
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  debit: 'Kartu Debit',
  qris: 'QRIS',
  transfer: 'Transfer',
}
