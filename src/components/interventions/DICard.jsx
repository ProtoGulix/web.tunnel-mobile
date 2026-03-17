import { PriorityBadge } from '../ui/PriorityBadge'
import { StatusBadge } from '../ui/StatusBadge'
import { Badge } from '../ui/Badge'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

export function DICard({ item }) {
  return (
    <div className="bg-white border border-tunnel-border rounded-lg px-4 py-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-tunnel-text truncate">{item.title ?? item.titre}</p>
          {item.equipment_code && (
            <Badge variant="blue" mono className="mt-1">{item.equipment_code}</Badge>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <PriorityBadge priority={item.priority ?? item.priorite} />
          <span className="text-[11px] text-tunnel-muted">{timeAgo(item.created_at)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={item.status ?? item.statut} />
        {item.code && <span className="text-[11px] font-mono text-tunnel-muted">{item.code}</span>}
      </div>
    </div>
  )
}
