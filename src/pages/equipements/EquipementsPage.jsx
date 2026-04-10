import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle, AlertCircle, Cpu, Calendar, Hash, Tag, MapPin, Factory, FileText, QrCode, Search, X } from 'lucide-react'
import { useEquipements } from '../../hooks/equipements/useEquipements'
import { useEquipementDetail } from '../../hooks/equipements/useEquipementDetail'

// ── Health ────────────────────────────────────────────────────────────────────
const HEALTH_CONFIG = {
  ok:       { color: '#2E7D32', bg: '#2E7D3218', icon: CheckCircle,    label: 'OK' },
  warning:  { color: '#ED6C02', bg: '#ED6C0218', icon: AlertTriangle,  label: 'Attention' },
  critical: { color: '#C62828', bg: '#C6282818', icon: AlertCircle,    label: 'Critique' },
}

function HealthBadge({ health, size = 'sm' }) {
  if (!health) return null
  const cfg = HEALTH_CONFIG[health.level] ?? HEALTH_CONFIG.ok
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium ${size === 'lg' ? 'text-sm px-3 py-1' : 'text-[11px]'}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={size === 'lg' ? 14 : 11} />
      {cfg.label}
    </span>
  )
}

// ── Carte équipement (liste) ──────────────────────────────────────────────────
function EquipementCard({ item, onSelect }) {
  const { health } = item
  const cfg = HEALTH_CONFIG[health?.level] ?? HEALTH_CONFIG.ok

  return (
    <button
      onClick={() => onSelect(item.id)}
      className="w-full text-left bg-white flex overflow-hidden active:opacity-75 transition-opacity"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.07)' }}
    >
      {/* Bordure gauche santé */}
      <div className="w-1 shrink-0" style={{ backgroundColor: cfg.color }} />

      <div className="flex-1 min-w-0 px-3 py-2.5 space-y-1.5">
        {/* Code + classe + statut */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#1F3A5F18', color: '#1F3A5F' }}>
            {item.code}
          </span>
          {item.equipement_class && (
            <span className="text-[11px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#61616118', color: '#616161' }}>
              {item.equipement_class.label}
            </span>
          )}
          {item.statut && (
            <span className="text-[11px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: (item.statut.couleur ?? '#616161') + '22', color: item.statut.couleur ?? '#616161' }}>
              {item.statut.label}
            </span>
          )}
          <HealthBadge health={health} />
        </div>

        {/* Nom */}
        <p className="text-sm font-medium text-[#2E2E2E] leading-snug truncate">{item.name}</p>

        {/* Compteurs interventions */}
        {health && (health.open_interventions_count > 0 || health.new_requests_count > 0) && (
          <div className="flex items-center gap-3 text-[11px] text-[#616161]">
            {health.open_interventions_count > 0 && (
              <span>{health.open_interventions_count} intervention{health.open_interventions_count > 1 ? 's' : ''} ouverte{health.open_interventions_count > 1 ? 's' : ''}</span>
            )}
            {health.urgent_count > 0 && (
              <span style={{ color: '#C62828' }}>{health.urgent_count} urgente{health.urgent_count > 1 ? 's' : ''}</span>
            )}
            {health.new_requests_count > 0 && (
              <span>{health.new_requests_count} demande{health.new_requests_count > 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center pr-3">
        <ChevronRight size={16} className="text-[#616161] shrink-0" />
      </div>
    </button>
  )
}

// ── Détail équipement ─────────────────────────────────────────────────────────
const STATUS_COLOR = {
  ouvert: '#1F3A5F', en_cours: '#ED6C02', en_attente: '#ED6C02',
  attente_pieces: '#C62828', attente_prod: '#ED6C02', ferme: '#2E7D32', cancelled: '#616161',
}
const STATUS_LABEL = {
  ouvert: 'Ouvert', en_cours: 'En cours', en_attente: 'En attente',
  attente_pieces: 'Attente pièces', attente_prod: 'Attente prod', ferme: 'Fermé', cancelled: 'Annulé',
}
const PRIORITY_COLOR = { urgent: '#C62828', important: '#ED6C02', normale: '#1F3A5F', faible: '#616161' }
const PRIORITY_LABEL = { urgent: 'Urgent', important: 'Important', normale: 'Normale', faible: 'Faible' }

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#F0F0F0] last:border-0">
      <Icon size={15} className="text-[#909090] mt-0.5 shrink-0" />
      <span className="text-xs text-[#909090] w-28 shrink-0">{label}</span>
      <span className="text-sm text-[#2E2E2E] flex-1">{value}</span>
    </div>
  )
}

function EquipementDetail({ uuid, onBack }) {
  const navigate = useNavigate()
  const { item, loading, error } = useEquipementDetail(uuid)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-[#616161]" />
    </div>
  )

  if (error) return (
    <div className="m-4 p-3 rounded border border-[#C62828]/20 bg-[#C62828]/10 text-sm text-[#C62828]">{error}</div>
  )

  if (!item) return null

  const { health } = item
  const cfg = HEALTH_CONFIG[health?.level] ?? HEALTH_CONFIG.ok

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Bandeau santé */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: cfg.bg }}>
        <cfg.icon size={18} style={{ color: cfg.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
          {health?.reason && <p className="text-xs mt-0.5" style={{ color: cfg.color + 'CC' }}>{health.reason}</p>}
        </div>
        {health && (health.open_interventions_count > 0 || health.urgent_count > 0) && (
          <div className="flex gap-2 text-[11px] shrink-0">
            {health.open_interventions_count > 0 && (
              <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: cfg.color + '22', color: cfg.color }}>
                {health.open_interventions_count} ouvertes
              </span>
            )}
            {health.urgent_count > 0 && (
              <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#C6282822', color: '#C62828' }}>
                {health.urgent_count} urgentes
              </span>
            )}
          </div>
        )}
      </div>

      {/* Infos principales */}
      <div className="bg-white mt-2 mx-0 px-4">
        <InfoRow icon={Hash}     label="Code"         value={item.code} />
        <InfoRow icon={Cpu}      label="Nom"          value={item.name} />
        <InfoRow icon={Tag}      label="Classe"       value={item.equipement_class?.label} />
        {item.statut && (
          <div className="flex items-start gap-3 py-2.5 border-b border-[#F0F0F0]">
            <Tag size={15} className="text-[#909090] mt-0.5 shrink-0" />
            <span className="text-xs text-[#909090] w-28 shrink-0">Statut</span>
            <span
              className="text-[12px] font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: (item.statut.couleur ?? '#616161') + '22', color: item.statut.couleur ?? '#616161' }}
            >
              {item.statut.label}
            </span>
          </div>
        )}
        {item.parent && (
          <div className="flex items-start gap-3 py-2.5 border-b border-[#F0F0F0]">
            <ChevronRight size={15} className="text-[#909090] mt-0.5 shrink-0" />
            <span className="text-xs text-[#909090] w-28 shrink-0">Machine mère</span>
            <span className="text-sm text-[#2E2E2E] flex-1">
              <span className="font-mono text-[11px] mr-1.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1F3A5F18', color: '#1F3A5F' }}>{item.parent.code}</span>
              {item.parent.name}
            </span>
          </div>
        )}
        <InfoRow icon={Hash}     label="N° machine"   value={item.no_machine} />
        <InfoRow icon={MapPin}   label="Affectation"  value={item.affectation} />
        <InfoRow icon={Factory}  label="Fabricant"    value={item.fabricant} />
        <InfoRow icon={Hash}     label="N° série"     value={item.numero_serie} />
        <InfoRow icon={Calendar} label="Mise en service" value={item.date_mise_service} />
        <InfoRow icon={FileText} label="Notes"        value={item.notes} />
      </div>

      {/* UUID pour QR code */}
      <div className="mx-0 mt-2 bg-white px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <QrCode size={13} className="text-[#909090]" />
          <span className="text-xs text-[#909090]">UUID (QR code)</span>
        </div>
        <p className="font-mono text-[11px] text-[#616161] break-all">{item.id}</p>
      </div>

      {/* Enfants */}
      {item.children_count > 0 && (
        <div className="mt-2 mx-0 bg-white px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-[#2E2E2E]">Sous-équipements</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1F3A5F18', color: '#1F3A5F' }}>
            {item.children_count}
          </span>
        </div>
      )}

      {/* Interventions liées */}
      {item.interventions?.items?.length > 0 && (() => {
        const ARCHIVED = new Set(['ferme', 'cancelled'])
        const PRIORITY_ORDER = { urgent: 0, important: 1, normale: 2, faible: 3 }

        const active = item.interventions.items
          .filter(i => !ARCHIVED.has(i.status_actual))
          .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9))

        const archived = item.interventions.items
          .filter(i => ARCHIVED.has(i.status_actual))

        const InterventionRow = ({ inter, dim }) => {
          const sc = STATUS_COLOR[inter.status_actual] ?? '#616161'
          const pc = PRIORITY_COLOR[inter.priority] ?? '#616161'
          const isUrgent = inter.priority === 'urgent' && !ARCHIVED.has(inter.status_actual)
          return (
            <button
              key={inter.id}
              onClick={() => navigate(`/interventions/${inter.id}`)}
              className="w-full text-left flex items-center gap-0 active:bg-[#F4F6F8]"
              style={{ opacity: dim ? 0.55 : 1 }}
            >
              {/* Barre gauche priorité */}
              <div className="w-1 self-stretch shrink-0" style={{ backgroundColor: isUrgent ? '#C62828' : sc }} />
              <div className="flex-1 min-w-0 px-3 py-2.5 space-y-1 border-b border-[#F0F0F0]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[11px] font-medium" style={{ color: '#1F3A5F' }}>{inter.code}</span>
                  {inter.type_inter && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: '#61616118', color: '#616161' }}>
                      {inter.type_inter.label ?? inter.type_inter.code}
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: sc + '22', color: sc }}>
                    {STATUS_LABEL[inter.status_actual] ?? inter.status_actual}
                  </span>
                  {inter.priority && !ARCHIVED.has(inter.status_actual) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: pc + '22', color: pc }}>
                      {PRIORITY_LABEL[inter.priority] ?? inter.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#2E2E2E] truncate">{inter.title}</p>
              </div>
              <ChevronRight size={14} className="text-[#909090] shrink-0 mr-3" />
            </button>
          )
        }

        return (
          <div className="mt-2">
            {/* Section active */}
            {active.length > 0 && (
              <>
                <p className="px-4 py-2 text-xs font-semibold text-[#616161] uppercase tracking-wide bg-[#F4F6F8]">
                  Interventions ouvertes ({active.length})
                </p>
                <div className="bg-white">
                  {active.map(inter => <InterventionRow key={inter.id} inter={inter} dim={false} />)}
                </div>
              </>
            )}

            {/* Section archivée */}
            {archived.length > 0 && (
              <>
                <p className="px-4 py-2 mt-2 text-xs font-semibold text-[#909090] uppercase tracking-wide bg-[#F4F6F8]">
                  Archivées ({archived.length})
                </p>
                <div className="bg-white">
                  {archived.map(inter => <InterventionRow key={inter.id} inter={inter} dim={true} />)}
                </div>
              </>
            )}
          </div>
        )
      })()}
    </div>
  )
}

// ── Liste avec facettes + recherche ──────────────────────────────────────────
function EquipementsList({ onSelect, searchOpen }) {
  const [selectedClass, setSelectedClass] = useState(null)
  const inputRef = useRef(null)

  const filters = selectedClass ? { select_class: selectedClass } : {}
  const { items, facets, loading, error, search, setSearch, searching } = useEquipements(filters)


  // Focus auto quand la barre s'ouvre
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  return (
    <>
      {/* Barre de recherche (slide-down quand ouverte) */}
      {searchOpen && (
        <div className="px-3 py-2 bg-white border-b border-[#E0E0E0] shrink-0">
          <div className="relative">
            {searching
              ? <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#909090] animate-spin" />
              : <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#909090]" />
            }
            <input
              ref={inputRef}
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Code, nom, affectation…"
              autoFocus
              className="w-full pl-8 pr-8 py-2 rounded border border-[#E0E0E0] bg-[#F4F6F8] text-base focus:outline-none focus:shadow-[0_0_0_3px_rgba(46,46,46,0.10)] focus:border-[#2E2E2E] focus:bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#909090] active:opacity-60"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Facettes classes */}
      {facets.length > 0 && (
        <div className="flex gap-1.5 px-4 py-3 bg-white border-b border-[#E0E0E0] overflow-x-auto shrink-0">
          <button
            onClick={() => setSelectedClass(null)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap border transition-colors ${
              selectedClass === null
                ? 'bg-[#2E2E2E] text-white border-transparent'
                : 'text-[#616161] bg-[#F4F6F8] border-[#E0E0E0]'
            }`}
          >
            Tous
          </button>
          {facets.map(f => (
            <button
              key={f.code ?? '__none__'}
              onClick={() => setSelectedClass(f.code === selectedClass ? null : f.code)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap border transition-colors ${
                selectedClass === f.code
                  ? 'bg-[#2E2E2E] text-white border-transparent'
                  : 'text-[#616161] bg-[#F4F6F8] border-[#E0E0E0]'
              }`}
            >
              {f.label ?? 'Sans classe'}
              {f.count > 0 && (
                <span className={`text-[10px] ${selectedClass === f.code ? 'opacity-70' : 'text-[#909090]'}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={20} className="animate-spin text-[#616161]" />
          </div>
        )}
        {error && (
          <div className="m-4 p-3 rounded border border-[#C62828]/20 bg-[#C62828]/10 text-sm text-[#C62828]">{error}</div>
        )}
        {!loading && !error && items.length === 0 && (
          <p className="text-center text-sm text-[#616161] py-16">
            {search ? `Aucun résultat pour « ${search} »` : 'Aucun équipement'}
          </p>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="divide-y divide-[#E0E0E0] bg-white border-y border-[#E0E0E0] mt-3">
            {items.map(item => (
              <EquipementCard key={item.id} item={item} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function EquipementsPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(uuid ?? null)
  const [searchOpen, setSearchOpen] = useState(false)

  const effectiveId = uuid ?? selectedId

  const handleSelect = (id) => {
    setSelectedId(id)
    navigate(`/equipements/${id}`, { replace: false })
  }

  const handleBack = () => {
    setSelectedId(null)
    setSearchOpen(false)
    navigate('/equipements', { replace: false })
  }

  return (
    <div className="flex flex-col h-full bg-[#F4F6F8]">
      <header className="bg-white border-b border-[#E0E0E0] px-4 pt-4 pb-3 shrink-0 flex items-center gap-2">
        {effectiveId && (
          <button onClick={handleBack} className="p-1 -ml-1 text-[#616161] active:opacity-60">
            <ChevronLeft size={20} />
          </button>
        )}
        <h1 className="flex-1 text-base font-semibold text-[#2E2E2E]">
          {effectiveId ? 'Fiche équipement' : 'Équipements'}
        </h1>
        {!effectiveId && (
          <button
            onClick={() => setSearchOpen(s => !s)}
            className={`p-2 rounded transition-colors active:opacity-60 ${searchOpen ? 'text-[#2E2E2E] bg-[#F0F0F0]' : 'text-[#616161]'}`}
          >
            <Search size={18} />
          </button>
        )}
      </header>

      {effectiveId
        ? <EquipementDetail uuid={effectiveId} onBack={handleBack} />
        : <EquipementsList onSelect={handleSelect} searchOpen={searchOpen} />
      }
    </div>
  )
}
