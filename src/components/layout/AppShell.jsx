import { Outlet } from 'react-router-dom'
import { BottomNav } from '../ui/BottomNav'

export default function AppShell() {
  return (
    <div className="flex flex-col h-full bg-tunnel-bg">
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 'var(--bottom-nav-height)' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
