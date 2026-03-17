import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/LoginPage'
import InterventionsPage from '../pages/interventions/InterventionsPage'
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
        <Route index element={<Navigate to="/interventions" replace />} />
        <Route path="interventions" element={<InterventionsPage />} />
        <Route path="achats" element={<AchatsPage />} />
      </Route>
    </Routes>
  )
}
