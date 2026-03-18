function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

export function DICard({ item }) {
  const eq = item.equipement

  return (
    <div className="bg-white border border-tunnel-border rounded-lg px-4 py-3 space-y-2">
      {/* Ligne 1 : description + statut + date */}
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 min-w-0 text-sm font-medium text-tunnel-text line-clamp-2">{item.description}</p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {item.statut_color && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: item.statut_color + '22', color: item.statut_color }}
            >
              {item.statut_label}
            </span>
          )}
          <span className="text-[11px] text-tunnel-muted">{timeAgo(item.created_at)}</span>
        </div>
      </div>

      {/* Ligne 2 : équipement */}
      {eq && (
        <div className="flex items-center gap-1.5 text-xs text-tunnel-muted">
          <span className="font-mono bg-tunnel-bg px-1.5 py-0.5 rounded">{eq.code}</span>
          <span className="truncate">{eq.name}</span>
          {eq.equipement_class && (
            <span className="text-[11px] text-tunnel-muted/60">· {eq.equipement_class.label}</span>
          )}
        </div>
      )}

      {/* Ligne 3 : code DI + demandeur + service */}
      <div className="flex items-center justify-between text-[11px] text-tunnel-muted">
        <div className="flex items-center gap-2">
          {item.code && <span className="font-mono">{item.code}</span>}
          {item.demandeur_nom && <span>{item.demandeur_nom}</span>}
          {item.demandeur_service && <span>· {item.demandeur_service}</span>}
        </div>
        {item.intervention_id && (
          <span className="text-green-600 font-medium">Intervention liée</span>
        )}
      </div>
    </div>
  )
}
