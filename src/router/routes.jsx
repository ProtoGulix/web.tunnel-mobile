import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/home/HomePage'
import InterventionsPage from '../screens/InterventionsScreen'
import InterventionDetailPage from '../pages/interventions/InterventionDetailPage'
import AddActionPage from '../pages/interventions/AddActionPage'
import AddPurchasePage from '../pages/interventions/AddPurchasePage'
import StockPage from '../pages/stock/StockPage'
import EquipementsPage from '../pages/equipements/EquipementsPage'
import QrCodePage from '../pages/qrcode/QrCodePage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <PrivateRoute>
          <AppShell />
        </PrivateRoute>
      }>
        <Route index element={<HomePage />} />

        {/* Interventions */}
        <Route path="interventions" element={<InterventionsPage />} />
        <Route path="interventions/:id" element={<InterventionDetailPage />} />
        <Route path="interventions/:id/add-action" element={<AddActionPage />} />
        <Route path="interventions/:id/add-purchase" element={<AddPurchasePage />} />

        {/* Compatibilité anciennes routes */}
        <Route path="intervention-requests" element={<Navigate to="/interventions" replace />} />
        <Route path="demande-intervention" element={<Navigate to="/interventions" replace />} />
        <Route path="achats" element={<Navigate to="/stock" replace />} />

        {/* Stock (inclut demandes d'achat) */}
        <Route path="stock" element={<StockPage />} />

        {/* Équipements — UUID dans l'URL pour QR code */}
        <Route path="equipements" element={<EquipementsPage />} />
        <Route path="equipements/:uuid" element={<EquipementsPage />} />

        {/* QR Code */}
        <Route path="qrcode" element={<QrCodePage />} />
      </Route>
    </Routes>
  )
}
