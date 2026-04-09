import { useParams } from 'react-router-dom'
import { Cpu } from 'lucide-react'

// ── Fiche équipement (accessible via UUID dans l'URL) ─────────────────────────
// Route : /equipements/:uuid
// Le UUID peut provenir d'un scan QR code.
function EquipementDetail({ uuid }) {
  // TODO: charger les données depuis l'API avec l'uuid
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center flex-1">
      <Cpu size={36} strokeWidth={1.25} className="text-[#BDBDBD]" />
      <p className="text-sm font-medium text-[#2E2E2E]">Équipement</p>
      <p className="font-mono text-xs text-[#616161] break-all">{uuid}</p>
      <p className="text-xs text-[#BDBDBD] mt-2">Fiche équipement à venir</p>
    </div>
  )
}

// ── Vue liste équipements ─────────────────────────────────────────────────────
function EquipementsList() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center flex-1">
      <Cpu size={36} strokeWidth={1.25} className="text-[#BDBDBD]" />
      <p className="text-sm text-[#616161]">Module équipements à venir</p>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function EquipementsPage() {
  const { uuid } = useParams()

  return (
    <div className="flex flex-col h-full bg-[#F4F6F8]">
      <header className="bg-white border-b border-[#E0E0E0] px-4 pt-4 pb-3 shrink-0">
        <h1 className="text-base font-semibold text-[#2E2E2E]">Équipements</h1>
      </header>

      {uuid ? <EquipementDetail uuid={uuid} /> : <EquipementsList />}
    </div>
  )
}
