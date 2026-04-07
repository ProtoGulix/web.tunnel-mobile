import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, ChevronRight } from 'lucide-react'
import { useInterventionSearch } from '../../hooks/interventions/useInterventionSearch'

const STATUS_COLORS = {
  ouvert: '#22c55e',
  en_cours: '#3b82f6',
  en_attente: '#f59e0b',
  resolu: '#6b7280',
  cloture: '#1f2937',
  bloque: '#ef4444',
}

const STATUS_LABELS = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  en_attente: 'En attente',
  resolu: 'Résolu',
  cloture: 'Clôturé',
  bloque: 'Bloqué',
}

function InterventionRow({ item, onClick }) {
  const statusCode = item.status_actual ?? item.statut ?? ''
  const color = statusCode ? STATUS_COLORS[statusCode] : null
  const label = statusCode ? STATUS_LABELS[statusCode] : null
  const eq = item.equipements ?? item.machine
  const title = item.title ?? item.description ?? item.type_inter ?? '—'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-white border-b border-tunnel-border active:bg-tunnel-bg text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-tunnel-muted shrink-0">{item.code}</span>
          {color && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0"
              style={{ backgroundColor: color + '22', color }}
            >
              {label}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-tunnel-text mt-0.5 truncate">{title}</p>
        {eq && (
          <p className="text-xs text-tunnel-muted truncate">
            <span className="font-mono">{eq.code}</span>
            {eq.name && <span> · {eq.name}</span>}
          </p>
        )}
      </div>
      <ChevronRight size={16} className="text-tunnel-muted shrink-0" />
    </button>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { setQuery, results, loading, error } = useInterventionSearch()
  const inputRef = useRef(null)

  return (
    <div className="flex flex-col h-full bg-tunnel-bg">
      <header className="bg-white border-b border-tunnel-border px-4 pt-4 pb-3">
        <h1 className="text-base font-semibold text-tunnel-text mb-3">Interventions</h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-tunnel-muted" />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            placeholder="Code intervention, équipement..."
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-tunnel-border bg-tunnel-bg text-sm focus:outline-none focus:ring-2 focus:ring-tunnel-accent/30 focus:border-tunnel-accent focus:bg-white"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={20} className="animate-spin text-tunnel-muted" />
          </div>
        )}

        {error && (
          <div className="m-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && (
          <>
            {results.length === 0 ? (
              <p className="text-center text-sm text-tunnel-muted py-12">Aucune intervention trouvée</p>
            ) : (
              <div className="bg-white border-y border-tunnel-border mt-3">
                {results.slice(0, 30).map(item => (
                  <InterventionRow
                    key={item.id}
                    item={item}
                    onClick={() => navigate(`/interventions/${item.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
