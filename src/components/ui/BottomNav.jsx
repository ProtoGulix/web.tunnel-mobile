import { NavLink } from 'react-router-dom'
import { Search, Calendar, Wrench, ShoppingCart } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/home', icon: Search, label: 'Recherche' },
  { to: '/planning', icon: Calendar, label: 'Planning' },
  { to: '/interventions', icon: Wrench, label: 'DI' },
  { to: '/achats', icon: ShoppingCart, label: 'Achats' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-tunnel-border safe-bottom z-50" style={{ height: 'var(--bottom-nav-height)' }}>
      <div className="flex h-full">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors
              ${isActive ? 'text-tunnel-accent' : 'text-tunnel-muted'}
            `}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-[11px]">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
