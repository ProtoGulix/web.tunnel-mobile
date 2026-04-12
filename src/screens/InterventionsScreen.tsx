import { useState, useRef, useEffect } from 'react'
import { CalendarDays, List, Search, ChevronLeft, ChevronRight, Loader2, Clock, Plus, ChevronDown, ChevronUp, ClipboardList, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useInterventionsList, ageInDays } from '../hooks/interventions/useInterventionsList'
import { usePlanningWeek } from '../hooks/planning/usePlanningWeek'
import { useInterventionRequests } from '../hooks/interventions/useInterventionRequests'
import { ActionCard } from '../pages/planning/ActionCard'
import { ActionForm } from '../components/actions/ActionForm'
import { PurchaseRequestForm } from '../components/purchases/PurchaseRequestForm'
import { DIList } from '../components/interventions/DIList'
import { DIForm } from '../components/interventions/DIForm'
import { PageHeader } from '../components/ui/PageHeader'
import { BottomBar, BottomBtn } from '../components/ui/BottomBar'
import { INTERVENTION_STATUSES, PRIORITIES, INTERVENTION_TYPES } from '../config/badges'

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_SHORT = ['jan.','fév.','mar.','avr.','mai','jun.','jul.','aoû.','sep.','oct.','nov.','déc.']
const DAY_LABELS  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatWeekLabel(monday: Date): string {
  const sunday = addDays(monday, 6)
  const s = monday.getDate(), e = sunday.getDate()
  const em = MONTH_SHORT[sunday.getMonth()], ey = sunday.getFullYear()
  if (monday.getMonth() === sunday.getMonth()) return `${s} – ${e} ${em} ${ey}`
  return `${s} ${MONTH_SHORT[monday.getMonth()]} – ${e} ${em} ${ey}`
}

function formatTime(hours: number): string {
  if (!hours) return '0min'
  const h = Math.floor(hours), m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h00`
  return `${h}h${String(m).padStart(2, '0')}`
}

function isToday(date: Date): boolean {
  const now = new Date()
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
}

// ── Helpers couleurs — depuis la source de vérité config/badges.js ───────────
const statusColor  = (s: string) => INTERVENTION_STATUSES[s]?.color  ?? '#616161'
const statusLabel  = (s: string) => INTERVENTION_STATUSES[s]?.label  ?? s
const priorityColor = (p: string) => PRIORITIES[p]?.color ?? '#616161'
const priorityLabel = (p: string) => PRIORITIES[p]?.label ?? p
const typeColor     = (t: string) => INTERVENTION_TYPES[t]?.color    ?? '#616161'

// ── Badge âge conditionnel ────────────────────────────────────────────────────
function AgeBadge({ reported_date, priority }: { reported_date: string; priority: string }) {
  const age = ageInDays(reported_date)
  const isRed   = (priority === 'urgent' && age > 7) || age > 30
  const isAmber = !isRed && age >= 7
  if (isRed)   return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#C6282822', color: '#C62828' }}>{age}j</span>
  if (isAmber) return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#ED6C0222', color: '#ED6C02' }}>{age}j</span>
  return <span className="text-[11px] text-[#616161]">{age}j</span>
}

// ── Carte intervention ────────────────────────────────────────────────────────
function InterventionCard({ item }: { item: any }) {
  const navigate = useNavigate()
  const borderColor  = item.printed_fiche ? '#BDBDBD' : (priorityColor(item.priority) ?? '#BDBDBD')
  const tc           = typeColor(item.type_inter)
  const sc           = statusColor(item.status_actual)

  return (
    <button
      onClick={() => navigate(`/interventions/${item.id}`)}
      className="w-full text-left bg-white flex overflow-hidden active:opacity-75 transition-opacity"
      style={{
        opacity: item.printed_fiche ? 0.65 : 1,
        boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
      }}
    >
      {/* Bordure gauche priorité (grisée si imprimée) */}
      <div className="w-1 shrink-0" style={{ backgroundColor: borderColor }} />

      <div className="flex-1 min-w-0 px-3 py-2.5 space-y-1.5">
        {/* Ligne 1 — code intervention + code machine */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[11px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#1F3A5F18', color: '#1F3A5F' }}>
            {item.code}
          </span>
          {item.equipements?.code && (
            <>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: '#61616118', color: '#616161' }}>
                {item.equipements.code}
              </span>
              <span className="text-[11px] text-[#616161] truncate">{item.equipements.name ?? ''}</span>
            </>
          )}
        </div>

        {/* Ligne 2 — titre + badge imprimée + badge type */}
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm font-medium text-[#2E2E2E] leading-snug">{item.title}</p>
          <div className="flex items-center gap-1 shrink-0">
            {item.printed_fiche && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ backgroundColor: '#61616118', color: '#616161' }}>
                ✓ Imprimée
              </span>
            )}
            {item.type_inter && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                style={{ backgroundColor: tc + '22', color: tc }}>
                {item.type_inter}
              </span>
            )}
          </div>
        </div>

        {/* Ligne 3 — priorité + statut + initiales + âge */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.priority && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: priorityColor(item.priority) + '22', color: priorityColor(item.priority) }}>
              {priorityLabel(item.priority)}
            </span>
          )}
          {item.status_actual && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: sc + '18', color: sc }}>
              {statusLabel(item.status_actual)}
            </span>
          )}
          {item.tech_initials && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#1F3A5F14', color: '#1F3A5F' }}>
              {item.tech_initials}
            </span>
          )}
          <div className="flex-1" />
          {item.reported_date && (
            <AgeBadge reported_date={item.reported_date} priority={item.priority} />
          )}
        </div>
      </div>
    </button>
  )
}

// ── Bloc segmenté repliable ───────────────────────────────────────────────────
function InterventionBlock({ segment }: { segment: any }) {
  const [collapsed, setCollapsed] = useState(segment.collapsedByDefault ?? false)

  return (
    <div>
      <button
        onClick={() => setCollapsed((c: boolean) => !c)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-[#F4F6F8] border-y border-[#E0E0E0] active:bg-[#E8EAED] transition-colors"
      >
        <span className="text-xs font-semibold text-[#2E2E2E] flex-1 text-left">{segment.label}</span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded"
          style={{ backgroundColor: segment.badgeColor + '22', color: segment.badgeColor }}>
          {segment.items.length}
        </span>
        {collapsed
          ? <ChevronDown size={14} className="text-[#616161]" />
          : <ChevronUp   size={14} className="text-[#616161]" />
        }
      </button>

      {!collapsed && (
        <div className="divide-y divide-[#E0E0E0]">
          {segment.items.map((item: any) => (
            <InterventionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Vue Liste — segmentée, API réelle ─────────────────────────────────────────
function ListView({ searchOpen, onTyping }: { searchOpen: boolean, onTyping: (v: boolean) => void }) {
  const { segments, query, setQuery, loading, error } = useInterventionsList()
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  const handleChange = (val: string) => {
    setQuery(val)
    onTyping(true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => onTyping(false), 400)
  }

  return (
    <>
      {/* Barre de recherche */}
      {searchOpen && (
        <div className="px-3 py-2 bg-white border-b border-[#E0E0E0] shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#909090]" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => handleChange(e.target.value)}
              placeholder="Code machine, intervention, mot-clé…"
              className="w-full pl-8 pr-8 py-2 rounded border border-[#E0E0E0] bg-[#F4F6F8] text-base focus:outline-none focus:shadow-[0_0_0_3px_rgba(31,58,95,0.10)] focus:border-[#1F3A5F] focus:bg-white"
            />
            {query && (
              <button onClick={() => { setQuery(''); onTyping(false) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#909090] active:opacity-60">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={20} className="animate-spin text-[#616161]" />
          </div>
        )}
        {error && (
          <div className="m-4 p-3 rounded border border-[#C62828]/20 bg-[#C62828]/10 text-sm text-[#C62828]">{error}</div>
        )}
        {!loading && !error && segments.length === 0 && (
          <p className="text-center text-sm text-[#616161] py-16">Aucune intervention trouvée</p>
        )}
        {!loading && !error && segments.map((seg: any) => (
          <InterventionBlock key={seg.key} segment={seg} />
        ))}
      </div>
    </>
  )
}

// ── Vue Planning (API réelle via usePlanningWeek + filtre tech) ───────────────
function PlanningView() {
  const { weekStart, days, loading, error, prevWeek, nextWeek, goToToday, reload } = usePlanningWeek()
  const [addingDay, setAddingDay] = useState<string | null>(null)
  const [purchaseActionId, setPurchaseActionId] = useState<string | null>(null)

  // Totaux journaliers par colonne
  const COL_NORMAL  = 164
  const COL_WEEKEND = 88

  return (
    <>
      {/* Navigation semaine */}
      <div className="bg-white border-b border-[#E0E0E0] px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#E0E0E0] text-[#616161] active:bg-[#F4F6F8]">
            <ChevronLeft size={14} />
          </button>
          <span className="flex-1 text-center text-xs font-semibold text-[#2E2E2E]">
            {formatWeekLabel(weekStart)}
          </span>
          <button onClick={nextWeek}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#E0E0E0] text-[#616161] active:bg-[#F4F6F8]">
            <ChevronRight size={14} />
          </button>
          <button onClick={goToToday}
            className="px-2.5 py-1 rounded border border-[#1F3A5F]/30 text-[11px] font-medium text-[#1F3A5F] active:bg-[#1F3A5F]/10">
            Auj.
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-3 mt-2 p-3 rounded border border-[#C62828]/20 bg-[#C62828]/10 text-sm text-[#C62828] shrink-0">{error}</div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={22} className="animate-spin text-[#616161]" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full" style={{ minWidth: days.reduce((s: number, _: any, i: number) => s + (i >= 5 ? COL_WEEKEND : COL_NORMAL), 0) }}>
            {days.map((day: any, i: number) => {
              const isWeekend = i >= 5
              const today = isToday(day.date)
              const totalHours = day.actions.reduce((s: number, a: any) => s + (a.time_spent ?? 0), 0)
              const colWidth = isWeekend ? COL_WEEKEND : COL_NORMAL

              // Couleur total journalier — le backend décide des seuils, on affiche seulement
              const totalColor = totalHours >= 7.5 ? '#2E7D32' : totalHours >= 5 ? '#ED6C02' : totalHours > 0 ? '#C62828' : '#616161'

              return (
                <div key={day.dateStr}
                  className={`flex flex-col border-r border-[#E0E0E0] h-full shrink-0 ${today ? 'bg-[#1F3A5F]/04' : ''}`}
                  style={{ width: colWidth }}>

                  {/* En-tête colonne */}
                  <div className={`px-2 py-1.5 border-b border-[#E0E0E0] shrink-0 ${today ? 'bg-[#1F3A5F]/08' : 'bg-white'}`}>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-[11px] font-bold uppercase tracking-wide ${today ? 'text-[#1F3A5F]' : 'text-[#616161]'}`}>
                        {DAY_LABELS[i]}
                      </span>
                      <span className={`text-sm font-semibold ${today ? 'text-[#1F3A5F]' : 'text-[#2E2E2E]'}`}>
                        {day.date.getDate()}
                      </span>
                    </div>
                    {/* Bouton + uniquement Lun–Ven */}
                    {!isWeekend && (
                      <button
                        onClick={() => setAddingDay(day.dateStr)}
                        className="mt-1 w-full flex items-center justify-center gap-0.5 py-1 rounded text-[10px] font-medium text-[#1F3A5F] active:bg-[#1F3A5F]/10 border border-[#1F3A5F]/20">
                        <Plus size={10} />
                        Ajouter
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
                    {day.actions.length === 0 ? (
                      <p className="text-center text-[9px] text-[#BDBDBD] pt-3">
                        {isWeekend ? '—' : 'Aucune action'}
                      </p>
                    ) : (
                      day.actions.map((action: any, ai: number) => (
                        <ActionCard
                          key={action.id ?? ai}
                          action={action}
                          onAddPurchase={setPurchaseActionId}
                        />
                      ))
                    )}
                  </div>

                  {/* Total journalier */}
                  {totalHours > 0 && (
                    <div className="flex items-center justify-center gap-1 py-1.5 border-t border-[#E0E0E0] shrink-0">
                      <Clock size={10} style={{ color: totalColor }} />
                      <span className="text-[10px] font-semibold" style={{ color: totalColor }}>
                        {formatTime(totalHours)}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {addingDay && (
        <ActionForm
          actionDate={addingDay}
          onClose={() => setAddingDay(null)}
          onDone={() => { reload(); setAddingDay(null) }}
        />
      )}
      {purchaseActionId != null && (
        <PurchaseRequestForm
          actionId={purchaseActionId}
          onClose={() => setPurchaseActionId(null)}
          onDone={() => { setPurchaseActionId(null); reload() }}
        />
      )}
    </>
  )
}

// ── Vue Demandes ──────────────────────────────────────────────────────────────
function DemandesView() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('nouvelle')
  const [showForm, setShowForm] = useState(false)
  const { items, facets, loading, error, create, createStatus } = useInterventionRequests({ statut: activeFilter })

  async function handleCreate(data: any) {
    await create(data)
    setShowForm(false)
  }

  if (showForm) return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Nouvelle DI"
        action={
          <button onClick={() => setShowForm(false)} className="p-1.5 text-[#616161]">
            <X size={20} />
          </button>
        }
      />
      <DIForm
        onSubmit={handleCreate}
        onCancel={() => setShowForm(false)}
        status={createStatus.status}
        error={createStatus.error}
      />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {facets.length > 0 && (
        <div className="flex gap-1 px-4 py-3 bg-white border-b border-[#E0E0E0] overflow-x-auto shrink-0">
          {facets.map((f: any) => (
            <button
              key={f.code}
              onClick={() => setActiveFilter(f.code)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors border ${
                activeFilter === f.code
                  ? 'text-white border-transparent'
                  : 'text-[#616161] bg-[#F4F6F8] border-[#E0E0E0]'
              }`}
              style={activeFilter === f.code ? { backgroundColor: f.color, borderColor: f.color } : {}}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`text-[10px] ${activeFilter === f.code ? 'opacity-80' : 'text-[#616161]'}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <DIList items={items} loading={loading} error={error} onSelect={(id: string) => navigate(`/intervention-requests/${id}`)} />
      </div>
      <BottomBar>
        <BottomBtn variant="primary" icon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          Nouvelle demande
        </BottomBtn>
      </BottomBar>
    </div>
  )
}

// ── Écran principal ───────────────────────────────────────────────────────────
export default function InterventionsScreen() {
  const [searchParams, setSearchParams] = useSearchParams()
  const VALID_TABS = ['planning', 'liste', 'demandes']
  const tab = VALID_TABS.includes(searchParams.get('tab') ?? '') ? searchParams.get('tab')! : 'planning'
  const setTab = (key: string) => { setSearchParams({ tab: key }, { replace: true }); setSearchOpen(false) }

  const [searchOpen, setSearchOpen] = useState(false)
  const [typing, setTyping] = useState(false)

  const showSearch = tab === 'liste'

  return (
    <div className="flex flex-col h-full bg-[#F4F6F8]">
      <header className="bg-white border-b border-[#E0E0E0] px-4 pt-4 pb-0 shrink-0">
        <div className="flex items-center mb-3">
          <h1 className="flex-1 text-base font-semibold text-[#2E2E2E]">Interventions</h1>
          {showSearch && (
            <button
              onClick={() => setSearchOpen(s => !s)}
              className={`p-1.5 rounded transition-colors active:opacity-60 ${searchOpen ? 'text-[#1F3A5F] bg-[#1F3A5F]/10' : 'text-[#616161]'}`}
            >
              {typing
                ? <Loader2 size={18} className="animate-spin" />
                : <Search size={18} />
              }
            </button>
          )}
        </div>
        <div className="flex">
          <button
            onClick={() => setTab('planning')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === 'planning' ? 'border-[#1F3A5F] text-[#1F3A5F]' : 'border-transparent text-[#616161]'
            }`}
          >
            <CalendarDays size={13} />
            Planning
          </button>
          <button
            onClick={() => { setTab('liste'); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === 'liste' ? 'border-[#1F3A5F] text-[#1F3A5F]' : 'border-transparent text-[#616161]'
            }`}
          >
            <List size={13} />
            Interventions
          </button>
          <button
            onClick={() => setTab('demandes')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === 'demandes' ? 'border-[#1F3A5F] text-[#1F3A5F]' : 'border-transparent text-[#616161]'
            }`}
          >
            <ClipboardList size={13} />
            Demandes
          </button>
        </div>
      </header>

      {tab === 'planning' ? <PlanningView /> : tab === 'liste'
        ? <ListView searchOpen={searchOpen} onTyping={setTyping} />
        : <DemandesView />
      }
    </div>
  )
}
