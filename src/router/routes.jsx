import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/home/HomePage'
import InterventionsPage from '../screens/InterventionsScreen'
import InterventionDetailPage from '../pages/interventions/InterventionDetailPage'
import AddActionPage from '../pages/interventions/AddActionPage'
import AddPurchasePage from '../pages/interventions/AddPurchasePage'
import InterventionRequestsPage from '../pages/intervention-requests/InterventionRequestsPage'
import AchatsPage from '../pages/achats/AchatsPage'
import StockPage from '../pages/stock/StockPage'
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

        {/* Demandes d'intervention */}
        <Route path="intervention-requests" element={<InterventionRequestsPage />} />
        {/* Compatibilité ancienne route */}
        <Route path="demande-intervention" element={<Navigate to="/intervention-requests" replace />} />

        {/* Stock */}
        <Route path="stock" element={<StockPage />} />

        {/* Achats */}
        <Route path="achats" element={<AchatsPage />} />

        {/* QR Code */}
        <Route path="qrcode" element={<QrCodePage />} />
      </Route>
    </Routes>
  )
}
