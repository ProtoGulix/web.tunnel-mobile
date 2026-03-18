import { ShoppingCart, Plus } from 'lucide-react'

function formatTime(hours) {
  if (!hours) return null
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h00`
  return `${h}h${String(m).padStart(2, '0')}`
}

export function ActionCard({ action, onAddPurchase }) {
  const cat = action.subcategory?.category
  const sub = action.subcategory
  const inter = action.intervention
  const catColor = cat?.color ?? '#64748b'
  const time = formatTime(action.time_spent)
  const purchases = action.purchase_requests ?? []
  const daCount = purchases.length

  // Badge color: unique color if all same, amber if mixed
  const colors = [...new Set(purchases.map(p => p.derived_status?.color).filter(Boolean))]
  const badgeColor = daCount === 0 ? null : colors.length === 1 ? colors[0] : '#F59E0B'

  return (
    <div
      className="bg-white rounded-lg border border-tunnel-border overflow-hidden"
      style={{ borderLeft: `3px solid ${catColor}` }}
    >
      <div className="px-2.5 py-2 space-y-1.5">
        {/* Code intervention */}
        <p className="font-mono text-[11px] font-semibold text-tunnel-text truncate leading-none">
          {inter?.code ?? action.intervention_id}
        </p>

        {/* Titre intervention */}
        {inter?.title && (
          <p className="text-[11px] text-tunnel-muted truncate leading-none">{inter.title}</p>
        )}

        {/* Badge sous-catégorie */}
        {sub && (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide"
            style={{ backgroundColor: catColor + '22', color: catColor }}
          >
            {sub.code}
          </span>
        )}

        {/* Description */}
        {action.description && (
          <p className="text-[11px] text-tunnel-muted line-clamp-2 leading-relaxed">
            {action.description}
          </p>
        )}

        {/* Footer : complexité + temps + DA */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] text-tunnel-muted">
            {action.action_start && action.action_end
              ? `${action.action_start.slice(0, 5)} – ${action.action_end.slice(0, 5)}`
              : '—'}
          </span>
          <div className="flex items-center gap-1.5">
            {time && (
              <span className="text-[11px] font-semibold" style={{ color: catColor }}>
                {time}
              </span>
            )}
            <button
              onClick={e => { e.stopPropagation(); onAddPurchase?.(action.id) }}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md active:opacity-70"
              style={daCount > 0
                ? { backgroundColor: badgeColor + '22', color: badgeColor }
                : { color: '#94a3b8' }
              }
            >
              <ShoppingCart size={10} />
              {daCount > 0
                ? <span className="text-[10px] font-semibold">{daCount}</span>
                : <Plus size={8} strokeWidth={2.5} />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
