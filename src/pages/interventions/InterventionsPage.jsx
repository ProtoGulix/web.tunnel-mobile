import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DIList } from '../../components/interventions/DIList'
import { DIForm } from '../../components/interventions/DIForm'
import { useInterventionRequests } from '../../hooks/interventions/useInterventionRequests'

const FILTERS = [
  { value: 'nouvelle', label: 'Nouvelles' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'acceptee', label: 'Acceptées' },
]

export default function InterventionsPage() {
  const [activeFilter, setActiveFilter] = useState('nouvelle')
  const [showForm, setShowForm] = useState(false)
  const { items, loading, error, create, createStatus } = useInterventionRequests({ statut: activeFilter })

  async function handleCreate(data) {
    await create(data)
    setShowForm(false)
  }

  if (showForm) return (
    <div>
      <PageHeader
        title="Nouvelle DI"
        action={
          <button onClick={() => setShowForm(false)} className="p-1.5 text-tunnel-muted">
            <X size={20} />
          </button>
        }
      />
      <DIForm
        onSubmit={handleCreate}
        onCancel={() => setShowForm(false)}
        status={createStatus.status}
        error={createStatus.error}
      />
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Demandes d'intervention"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-tunnel-accent text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            <Plus size={14} />
            Nouvelle
          </button>
        }
      />
      <div className="flex gap-1 px-4 py-3 bg-white border-b border-tunnel-border">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === f.value
                ? 'bg-tunnel-accent text-white'
                : 'text-tunnel-muted bg-tunnel-bg'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <DIList items={items} loading={loading} error={error} />
    </div>
  )
}
