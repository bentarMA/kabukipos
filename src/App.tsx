import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StoreProvider } from './context/StoreContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { POS } from './pages/POS'
import { SalesHistory } from './pages/SalesHistory'
import { DailyRecapPage } from './pages/DailyRecap'
import { Products } from './pages/Products'
import { Reports } from './pages/Reports'
import { SettingsPage } from './pages/Settings'

function AuthenticatedRoutes() {
  return (
    <StoreProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="kasir" element={<POS />} />
          <Route path="rekap" element={<DailyRecapPage />} />
          <Route path="penjualan" element={<SalesHistory />} />
          <Route path="produk" element={<Products />} />
          <Route path="laporan" element={<Reports />} />
          <Route path="pengaturan" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </StoreProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AuthenticatedRoutes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
