import { NavLink } from 'react-router-dom'
import {
  Home, Wrench, ClipboardList, Package, ShoppingCart,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',                      icon: Home,          label: 'Accueil' },
  { to: '/interventions',          icon: Wrench,        label: 'Interventions' },
  { to: '/intervention-requests',  icon: ClipboardList, label: 'Demandes' },
  { to: '/stock',                  icon: Package,       label: 'Stock' },
  { to: '/achats',                 icon: ShoppingCart,  label: 'Achats' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] safe-bottom z-50"
      style={{ height: 'var(--bottom-nav-height)' }}
    >
      <div className="flex h-full">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-[150ms]
              ${isActive ? 'text-[#1F3A5F]' : 'text-[#616161]'}
            `.trim()}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-[11px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
