import { Badge } from '../ui/Badge'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

const urgencyVariant = { high: 'red', critical: 'violet', normal: 'slate' }
const urgencyLabel = { high: 'Urgent', critical: 'Critique', normal: 'Normal' }

export function DACard({ item }) {
  const urgency = item.urgency ?? 'normal'
  return (
    <div className="bg-white border border-tunnel-border rounded-lg px-4 py-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-tunnel-text truncate">{item.item_label}</p>
          {item.stock_item_ref && (
            <span className="text-[11px] font-mono text-tunnel-muted">{item.stock_item_ref}</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant={urgencyVariant[urgency] ?? 'slate'}>
            {urgencyLabel[urgency] ?? urgency}
          </Badge>
          <span className="text-[11px] text-tunnel-muted">{timeAgo(item.created_at)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-tunnel-muted">
        {item.quantity && <span>{item.quantity} {item.unit ?? ''}</span>}
        {item.code && <span className="font-mono">{item.code}</span>}
      </div>
    </div>
  )
}
