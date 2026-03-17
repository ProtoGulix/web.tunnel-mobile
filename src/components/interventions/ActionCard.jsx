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
  const purchaseCount = action.purchase_requests?.length ?? 0

  return (
    <div className="bg-white border border-tunnel-border rounded-lg px-4 py-3 space-y-1.5">
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

      {action.description && (
        <p className="text-xs text-tunnel-muted line-clamp-2">{action.description}</p>
      )}

      <div className="flex items-center justify-between text-[11px] text-tunnel-muted">
        <div className="flex items-center gap-2">
          {action.tech && (
            <span className="font-medium">{action.tech.initial ?? `${action.tech.first_name} ${action.tech.last_name}`}</span>
          )}
          {purchaseCount > 0 && (
            <span className="text-blue-600">{purchaseCount} DA</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onAddPurchase && (
            <button
              onClick={() => onAddPurchase(action)}
              className="text-tunnel-accent font-medium text-[11px]"
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
