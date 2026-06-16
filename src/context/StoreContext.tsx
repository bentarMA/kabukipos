import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import type {
  CartItem,
  DailyRecapRecord,
  PaymentMethod,
  Product,
  Sale,
  StoreSettings,
} from '../types'
import { generateId, generateInvoiceNumber, isToday } from '../utils/formatters'
import {
  loadProducts,
  loadRecaps,
  loadSales,
  loadSettings,
  saveProducts,
  saveRecaps,
  saveSales,
  saveSettings,
} from '../utils/storage'

interface StoreContextValue {
  products: Product[]
  sales: Sale[]
  recaps: DailyRecapRecord[]
  settings: StoreSettings
  cart: CartItem[]
  cartSubtotal: number
  todaySales: Sale[]
  todayRevenue: number
  todayTransactions: number
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  completeSale: (params: {
    paymentMethod: PaymentMethod
    amountPaid: number
    discount: number
    customerName?: string
  }) => Sale
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  updateSettings: (settings: StoreSettings) => void
  saveDailyRecap: (recap: DailyRecapRecord) => void
  getRecapForDate: (date: string) => DailyRecapRecord | undefined
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { cashier } = useAuth()
  const [products, setProducts] = useState<Product[]>(() => loadProducts())
  const [sales, setSales] = useState<Sale[]>(() => loadSales())
  const [recaps, setRecaps] = useState<DailyRecapRecord[]>(() => loadRecaps())
  const [settings, setSettings] = useState<StoreSettings>(() => loadSettings())
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => saveProducts(products), [products])
  useEffect(() => saveSales(sales), [sales])
  useEffect(() => saveRecaps(recaps), [recaps])
  useEffect(() => saveSettings(settings), [settings])

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  )

  const todaySales = useMemo(() => sales.filter((s) => isToday(s.createdAt)), [sales])

  const todayRevenue = useMemo(
    () => todaySales.reduce((sum, s) => sum + s.total, 0),
    [todaySales],
  )

  const todayTransactions = todaySales.length

  const addToCart = useCallback((product: Product) => {
    if (!product.isAvailable) return
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId))
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const completeSale = useCallback(
    (params: {
      paymentMethod: PaymentMethod
      amountPaid: number
      discount: number
      customerName?: string
    }) => {
      if (!cashier) throw new Error('Kasir belum login')

      const subtotal = cartSubtotal
      const tax = Math.round(subtotal * settings.taxRate)
      const total = Math.max(0, subtotal + tax - params.discount)
      const change = Math.max(0, params.amountPaid - total)

      const sale: Sale = {
        id: generateId(),
        invoiceNumber: generateInvoiceNumber(sales.length),
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          category: item.product.category,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
          note: item.note,
        })),
        subtotal,
        tax,
        discount: params.discount,
        total,
        paymentMethod: params.paymentMethod,
        amountPaid: params.amountPaid,
        change,
        cashierId: cashier.id,
        cashierName: cashier.name,
        customerName: params.customerName,
        createdAt: new Date().toISOString(),
      }

      setSales((prev) => [sale, ...prev])
      setCart([])
      return sale
    },
    [cart, cartSubtotal, cashier, sales.length, settings.taxRate],
  )

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...product, id: generateId() }])
  }, [])

  const updateProduct = useCallback((product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
  }, [])

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }, [])

  const updateSettings = useCallback((next: StoreSettings) => {
    setSettings(next)
  }, [])

  const saveDailyRecap = useCallback((recap: DailyRecapRecord) => {
    setRecaps((prev) => {
      const filtered = prev.filter((r) => r.date !== recap.date)
      return [recap, ...filtered]
    })
  }, [])

  const getRecapForDate = useCallback(
    (date: string) => recaps.find((r) => r.date === date),
    [recaps],
  )

  const value: StoreContextValue = {
    products,
    sales,
    recaps,
    settings,
    cart,
    cartSubtotal,
    todaySales,
    todayRevenue,
    todayTransactions,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    completeSale,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
    saveDailyRecap,
    getRecapForDate,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
