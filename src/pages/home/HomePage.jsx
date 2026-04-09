import { useNavigate } from 'react-router-dom'
import { Wrench, Package, Cpu, QrCode } from 'lucide-react'

const SHORTCUTS = [
  { label: 'Interventions', route: '/interventions', icon: Wrench,   color: '#1F3A5F' },
  { label: 'Stock',         route: '/stock',         icon: Package,  color: '#1F3A5F' },
  { label: 'Équipements',   route: '/equipements',   icon: Cpu,      color: '#1F3A5F' },
  { label: 'QR Code',       route: '/qrcode',        icon: QrCode,   color: '#1F3A5F' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-[#F4F6F8]">
      <header className="bg-white border-b border-[#E0E0E0] px-4 pt-4 pb-3">
        <h1 className="text-base font-semibold text-[#2E2E2E]">TUNNEL GMAO</h1>
        <p className="text-xs text-[#616161] mt-0.5">Gestion de Maintenance Assistée par Ordinateur</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-medium text-[#616161] uppercase tracking-wide mb-3">Accès rapide</p>
        <div className="grid grid-cols-2 gap-3">
          {SHORTCUTS.map(({ label, route, icon: Icon, color }) => (
            <button
              key={route}
              onClick={() => navigate(route)}
              className="flex flex-col items-center justify-center gap-2 p-5 bg-white rounded border border-[#E0E0E0] active:bg-[#F4F6F8] transition-colors"
            >
              <Icon size={24} color={color} strokeWidth={1.75} />
              <span className="text-xs font-medium text-[#2E2E2E]">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
