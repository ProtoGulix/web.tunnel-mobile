import { Badge } from './Badge'

const STATUS_MAP = {
  nouveau: { label: 'Nouveau', variant: 'blue' },
  new: { label: 'Nouveau', variant: 'blue' },
  en_cours: { label: 'En cours', variant: 'amber' },
  in_progress: { label: 'En cours', variant: 'amber' },
  termine: { label: 'Terminé', variant: 'green' },
  done: { label: 'Terminé', variant: 'green' },
  annule: { label: 'Annulé', variant: 'slate' },
  cancelled: { label: 'Annulé', variant: 'slate' },
}

export function StatusBadge({ status }) {
  const config = STATUS_MAP[status?.toLowerCase()] ?? { label: status, variant: 'slate' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
