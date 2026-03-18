import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DIList } from '../../components/interventions/DIList'
import { DIForm } from '../../components/interventions/DIForm'
import { useInterventionRequests } from '../../hooks/interventions/useInterventionRequests'

export default function InterventionsPage() {
  const [activeFilter, setActiveFilter] = useState('nouvelle')
  const [showForm, setShowForm] = useState(false)
  const { items, facets, loading, error, create, createStatus } = useInterventionRequests({ statut: activeFilter })

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
      <div className="flex gap-1 px-4 py-3 bg-white border-b border-tunnel-border overflow-x-auto">
        {facets.map(f => (
          <button
            key={f.code}
            onClick={() => setActiveFilter(f.code)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === f.code
                ? 'text-white'
                : 'text-tunnel-muted bg-tunnel-bg'
            }`}
            style={activeFilter === f.code ? { backgroundColor: f.color } : {}}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`text-[10px] ${activeFilter === f.code ? 'opacity-80' : 'text-tunnel-muted'}`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <DIList items={items} loading={loading} error={error} />
    </div>
  )
}
