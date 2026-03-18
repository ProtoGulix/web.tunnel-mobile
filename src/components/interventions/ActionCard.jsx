function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

function formatTime(hours) {
  if (!hours) return null
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}

export function ActionCard({ action, onAddPurchase }) {
  const cat = action.subcategory?.category
  const sub = action.subcategory
  const purchases = action.purchase_requests ?? []

  return (
    <div className="bg-white border border-tunnel-border rounded-lg px-4 py-3 space-y-2">
      {/* Ligne 1 — catégorie + métriques */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {cat?.color && (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
          )}
          <span className="text-sm font-medium text-tunnel-text truncate">{sub?.name ?? '—'}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {action.time_spent && (
            <span className="text-xs text-tunnel-muted">{formatTime(action.time_spent)}</span>
          )}
          {action.complexity_score && (
            <span className="text-[11px] font-mono bg-tunnel-bg px-1.5 py-0.5 rounded text-tunnel-muted">
              C{action.complexity_score}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {action.description && (
        <p className="text-xs text-tunnel-muted line-clamp-2">{action.description}</p>
      )}

      {/* DA rattachées */}
      {purchases.length > 0 && (
        <div className="space-y-1 pt-0.5">
          {purchases.map(pr => (
            <div key={pr.id} className="flex items-center gap-2 rounded-md border border-tunnel-border bg-tunnel-bg px-2.5 py-1.5">
              <span className="flex-1 text-[11px] font-medium text-tunnel-text truncate">
                {pr.quantity} {pr.unit ? `${pr.unit} · ` : ''}{pr.item_label}
              </span>
              {pr.derived_status && (
                <span
                  className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: (pr.derived_status.color ?? '#6b7280') + '22',
                    color: pr.derived_status.color ?? '#6b7280',
                  }}
                >
                  {pr.derived_status.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ligne bas — tech + action + date */}
      <div className="flex items-center justify-between text-[11px] text-tunnel-muted">
        <div className="flex items-center gap-2">
          {action.tech && (
            <span className="font-medium">{action.tech.initial ?? `${action.tech.first_name} ${action.tech.last_name}`}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onAddPurchase && (
            <button
              onClick={() => onAddPurchase(action)}
              className="text-tunnel-accent font-medium"
            >
              + DA
            </button>
          )}
          <span>{timeAgo(action.created_at)}</span>
        </div>
      </div>
    </div>
  )
}
