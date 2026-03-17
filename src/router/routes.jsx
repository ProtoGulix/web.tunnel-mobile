import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/home/HomePage'
import PlanningPage from '../pages/planning/PlanningPage'
import InterventionsPage from '../pages/interventions/InterventionsPage'
import InterventionDetailPage from '../pages/interventions/InterventionDetailPage'
import AddActionPage from '../pages/interventions/AddActionPage'
import AddPurchasePage from '../pages/interventions/AddPurchasePage'
import AchatsPage from '../pages/achats/AchatsPage'

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
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="planning" element={<PlanningPage />} />
        <Route path="interventions" element={<InterventionsPage />} />
        <Route path="interventions/:id" element={<InterventionDetailPage />} />
        <Route path="interventions/:id/add-action" element={<AddActionPage />} />
        <Route path="interventions/:id/add-purchase" element={<AddPurchasePage />} />
        <Route path="achats" element={<AchatsPage />} />
      </Route>
    </Routes>
  )
}
