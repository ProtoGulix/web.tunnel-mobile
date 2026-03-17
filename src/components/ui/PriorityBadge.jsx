import { Badge } from './Badge'

const PRIORITY_MAP = {
  urgent: { label: 'Urgent', variant: 'violet' },
  important: { label: 'Important', variant: 'red' },
  normal: { label: 'Normal', variant: 'amber' },
  faible: { label: 'Faible', variant: 'green' },
}

export function PriorityBadge({ priority }) {
  const config = PRIORITY_MAP[priority?.toLowerCase()] ?? PRIORITY_MAP.normal
  return <Badge variant={config.variant}>{config.label}</Badge>
}
