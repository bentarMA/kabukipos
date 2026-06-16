import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  BarChart3,
  Settings,
  Store,
  CalendarCheck,
  Menu,
  X,
  LogOut,
  MoreHorizontal,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import { formatCurrency } from '../utils/formatters'

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true as const },
  { to: '/kasir', label: 'Kasir', icon: ShoppingCart },
  { to: '/rekap', label: 'Rekap', icon: CalendarCheck },
  { to: '/penjualan', label: 'Penjualan', icon: Receipt },
]

const moreNav = [
  { to: '/produk', label: 'Produk', icon: Package },
  { to: '/laporan', label: 'Laporan', icon: BarChart3 },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings },
]

type NavEntry = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

const allNav: NavEntry[] = [...mainNav, ...moreNav]

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  onClick,
  cartCount,
}: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  onClick?: () => void
  cartCount?: number
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {label}
      {cartCount !== undefined && cartCount > 0 && (
        <span className="ml-auto rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
          {cartCount}
        </span>
      )}
    </NavLink>
  )
}

export function Layout() {
  const { cashier, logout } = useAuth()
  const { settings, todayRevenue, todayTransactions, cart } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const isKasir = location.pathname === '/kasir'
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <div className="flex min-h-screen min-h-dvh flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200/80 bg-white lg:flex">
        <div className="border-b border-gray-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-lg shadow-brand-500/25">
              屋
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-gray-900">Kabukiro</h1>
              <p className="truncate text-[11px] font-medium text-brand-600">Japanese Yatai</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {allNav.map(({ to, label, icon, end }) => (
            <NavItem
              key={to}
              to={to}
              label={label}
              icon={icon}
              end={end}
              cartCount={to === '/kasir' ? cartCount : undefined}
            />
          ))}
        </nav>

        <div className="space-y-3 border-t border-gray-100 p-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
            <div className="flex items-center gap-2 text-brand-200">
              <Store className="h-4 w-4" />
              <span className="text-xs font-medium">Hari Ini</span>
            </div>
            <p className="mt-2 text-lg font-bold">{formatCurrency(todayRevenue)}</p>
            <p className="text-xs text-brand-200">{todayTransactions} transaksi</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          <aside className="absolute inset-y-0 left-0 flex w-[min(280px,85vw)] flex-col bg-white shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                  屋
                </div>
                <div>
                  <p className="text-sm font-bold">Kabukiro POS</p>
                  <p className="text-[10px] text-brand-600">{cashier?.name}</p>
                </div>
              </div>
              <button onClick={closeDrawer} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {allNav.map(({ to, label, icon, end }) => (
                <NavItem
                  key={to}
                  to={to}
                  label={label}
                  icon={icon}
                  end={end}
                  onClick={closeDrawer}
                  cartCount={to === '/kasir' ? cartCount : undefined}
                />
              ))}
            </nav>
            <div className="border-t border-gray-100 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile more menu sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 pb-safe animate-slide-up">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Menu Lainnya
            </p>
            <div className="grid grid-cols-3 gap-2">
              {moreNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-gray-50 p-4 text-center text-xs font-medium text-gray-700"
                >
                  <Icon className="h-5 w-5 text-brand-600" />
                  {label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setMoreOpen(false)
                  handleLogout()
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-red-50 p-4 text-center text-xs font-medium text-red-600"
              >
                <LogOut className="h-5 w-5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-dvh flex-1 flex-col lg:pl-64">
        {/* Mobile / desktop header */}
        {!isKasir && (
          <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="hidden text-xs font-medium uppercase tracking-wider text-brand-600 sm:block">
                    Point of Sale
                  </p>
                  <h2 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                    {settings.storeName}
                  </h2>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-gray-900">{cashier?.name}</p>
                  <p className="text-xs text-gray-500">Kasir Aktif</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {cashier?.avatar ?? '?'}
                </div>
              </div>
            </div>
          </header>
        )}

        <main
          className={`flex-1 ${
            isKasir ? 'pb-0' : 'p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8'
          }`}
        >
          <Outlet />
        </main>

        {/* Mobile bottom navigation */}
        {!isKasir && (
          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-md pb-safe lg:hidden">
            <div className="flex items-stretch justify-around">
              {mainNav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
                      isActive ? 'text-brand-600' : 'text-gray-400'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-5 w-5 ${isActive ? 'text-brand-600' : ''}`} />
                      {label}
                      {to === '/kasir' && cartCount > 0 && (
                        <span className="absolute right-[calc(50%-22px)] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                          {cartCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
              <button
                onClick={() => setMoreOpen(true)}
                className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-gray-400"
              >
                <MoreHorizontal className="h-5 w-5" />
                Lainnya
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
