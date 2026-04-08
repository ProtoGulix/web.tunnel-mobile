import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, CalendarDays, Search, Loader2, ChevronRight, ChevronLeft, ChevronRight as ChevronR, Clock, Plus } from 'lucide-react'
import { useInterventionSearch } from '../../hooks/interventions/useInterventionSearch'
import { usePlanningWeek } from '../../hooks/planning/usePlanningWeek'
import { ActionCard } from '../planning/ActionCard'
import { ActionForm } from '../../components/actions/ActionForm'
import { PurchaseRequestForm } from '../../components/purchases/PurchaseRequestForm'

// ─── Constantes planning ─────────────────────────────────────────────────────
const DAY_NAMES = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']
const MONTH_SHORT = ['jan.', 'fév.', 'mar.', 'avr.', 'mai', 'jun.', 'jul.', 'aoû.', 'sep.', 'oct.', 'nov.', 'déc.']
const COL_WIDTH = 172

function formatWeekLabel(weekStart) {
  const end = new Date(weekStart)
  end.setDate(weekStart.getDate() + 6)
  const s = weekStart.getDate()
  const e = end.getDate()
  const em = MONTH_SHORT[end.getMonth()]
  const ey = end.getFullYear()
  if (weekStart.getMonth() === end.getMonth()) return `${s} – ${e} ${em} ${ey}`
  return `${s} ${MONTH_SHORT[weekStart.getMonth()]} – ${e} ${em} ${ey}`
}

function formatDayHeader(date) {
  const dow = date.getDay()
  return `${DAY_NAMES[dow === 0 ? 6 : dow - 1]} ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`
}

function formatTime(hours) {
  if (!hours) return null
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h00`
  return `${h}h${String(m).padStart(2, '0')}`
}

function isToday(date) {
  const now = new Date()
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
}

// ─── Statuts liste ────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  ouvert: '#1F3A5F', en_cours: '#ED6C02', en_attente: '#ED6C02',
  resolu: '#2E7D32', cloture: '#616161', bloque: '#C62828',
  ferme: '#2E7D32',
}
const STATUS_LABELS = {
  ouvert: 'Ouvert', en_cours: 'En cours', en_attente: 'En attente',
  resolu: 'Résolu', cloture: 'Clôturé', bloque: 'Bloqué', ferme: 'Fermé',
}

// ─── Vue Liste ────────────────────────────────────────────────────────────────
function ListView() {
  const navigate = useNavigate()
  const { setQuery, results, loading, error } = useInterventionSearch()
  const inputRef = useRef(null)

  return (
    <>
      <div className="px-4 py-3 bg-white border-b border-[#E0E0E0]">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            placeholder="Code intervention, équipement…"
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded border border-[#E0E0E0] bg-[#F4F6F8] text-base focus:outline-none focus:shadow-[0_0_0_3px_rgba(31,58,95,0.10)] focus:border-[#1F3A5F] focus:bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={20} className="animate-spin text-[#616161]" />
          </div>
        )}
        {error && (
          <div className="m-4 p-3 rounded border border-[#C62828]/20 bg-[#C62828]/10 text-sm text-[#C62828]">{error}</div>
        )}
        {!loading && !error && (
          results.length === 0
            ? <p className="text-center text-sm text-[#616161] py-12">Aucune intervention trouvée</p>
            : <div className="bg-white border-y border-[#E0E0E0] mt-3">
                {results.slice(0, 50).map(item => {
                  const statusCode = item.status_actual ?? item.statut ?? ''
                  const color = STATUS_COLORS[statusCode]
                  const label = STATUS_LABELS[statusCode]
                  const eq = item.equipements ?? item.machine
                  const title = item.title ?? item.description ?? item.type_inter ?? '—'
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/interventions/${item.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#E0E0E0] active:bg-[#F4F6F8] text-left last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#616161] shrink-0">{item.code}</span>
                          {color && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0"
                              style={{ backgroundColor: color + '22', color }}
                            >
                              {label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-[#2E2E2E] mt-0.5 truncate">{title}</p>
                        {eq && (
                          <p className="text-xs text-[#616161] truncate">
                            <span className="font-mono">{eq.code}</span>
                            {eq.name && <span> · {eq.name}</span>}
                          </p>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-[#616161] shrink-0" />
                    </button>
                  )
                })}
              </div>
        )}
      </div>
    </>
  )
}

// ─── Vue Planning ─────────────────────────────────────────────────────────────
function PlanningView() {
  const { weekStart, days, loading, error, prevWeek, nextWeek, goToToday, reload } = usePlanningWeek()
  const [addingDay, setAddingDay] = useState(null)
  const [purchaseActionId, setPurchaseActionId] = useState(null)

  return (
    <>
      <div className="px-4 py-2 bg-white border-b border-[#E0E0E0] flex items-center gap-2">
        <button
          onClick={prevWeek}
          className="w-7 h-7 flex items-center justify-center rounded border border-[#E0E0E0] text-[#616161] active:bg-[#F4F6F8]"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="flex-1 text-center text-xs font-semibold text-[#2E2E2E]">
          {formatWeekLabel(weekStart)}
        </span>
        <button
          onClick={nextWeek}
          className="w-7 h-7 flex items-center justify-center rounded border border-[#E0E0E0] text-[#616161] active:bg-[#F4F6F8]"
        >
          <ChevronR size={14} />
        </button>
        <button
          onClick={goToToday}
          className="px-2.5 py-1 rounded border border-[#1F3A5F]/30 text-[11px] font-medium text-[#1F3A5F] bg-[#1F3A5F]/05 active:bg-[#1F3A5F]/10"
        >
          Auj.
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 rounded border border-[#C62828]/20 bg-[#C62828]/10 text-sm text-[#C62828]">{error}</div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={22} className="animate-spin text-[#616161]" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full" style={{ minWidth: days.length * COL_WIDTH }}>
            {days.map((day) => {
              const today = isToday(day.date)
              const totalHours = day.actions.reduce((s, a) => s + (a.time_spent ?? 0), 0)
              const totalFmt = formatTime(totalHours)
              return (
                <div
                  key={day.dateStr}
                  className={`flex flex-col border-r border-[#E0E0E0] h-full ${today ? 'bg-blue-50/30' : ''}`}
                  style={{ width: COL_WIDTH, minWidth: COL_WIDTH }}
                >
                  <div className={`px-2.5 py-2 border-b border-[#E0E0E0] shrink-0 ${today ? 'bg-blue-50' : 'bg-white'}`}>
                    <p className={`text-[11px] font-bold uppercase tracking-wide ${today ? 'text-[#1F3A5F]' : 'text-[#2E2E2E]'}`}>
                      {formatDayHeader(day.date)}
                    </p>
                    {totalFmt && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-[#616161]" />
                        <span className="text-[10px] text-[#616161]">{totalFmt}</span>
                      </div>
                    )}
                  </div>
                  <div className="px-2 pt-2 shrink-0">
                    <button
                      onClick={() => setAddingDay(day.dateStr)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-medium text-[#1F3A5F] active:bg-[#1F3A5F]/10"
                    >
                      <Plus size={11} />
                      Ajouter
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1.5">
                    {day.actions.length === 0
                      ? <p className="text-center text-[10px] text-[#BDBDBD] pt-4">Aucune action</p>
                      : day.actions.map((action, ai) => (
                          <ActionCard key={action.id ?? ai} action={action} onAddPurchase={setPurchaseActionId} />
                        ))
                    }
                  </div>
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

// ─── Page principale ──────────────────────────────────────────────────────────
export default function InterventionsPage() {
  const [view, setView] = useState('liste')

  return (
    <div className="flex flex-col h-full bg-[#F4F6F8]">
      <header className="bg-white border-b border-[#E0E0E0] px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-[#2E2E2E]">Interventions</h1>
          {/* Toggle Liste / Planning */}
          <div className="flex rounded border border-[#E0E0E0] overflow-hidden">
            <button
              onClick={() => setView('liste')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                view === 'liste'
                  ? 'bg-[#1F3A5F] text-white'
                  : 'bg-white text-[#616161] active:bg-[#F4F6F8]'
              }`}
            >
              <List size={13} />
              Liste
            </button>
            <button
              onClick={() => setView('planning')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-[#E0E0E0] ${
                view === 'planning'
                  ? 'bg-[#1F3A5F] text-white'
                  : 'bg-white text-[#616161] active:bg-[#F4F6F8]'
              }`}
            >
              <CalendarDays size={13} />
              Planning
            </button>
          </div>
        </div>
      </header>

      {view === 'liste' ? <ListView /> : <PlanningView />}
    </div>
  )
}
