import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DIList } from '../../components/interventions/DIList'
import { DIForm } from '../../components/interventions/DIForm'
import { useInterventionRequests } from '../../hooks/interventions/useInterventionRequests'

export default function InterventionRequestsPage() {
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
          <button onClick={() => setShowForm(false)} className="p-1.5 text-[#616161]">
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
            className="flex items-center gap-1.5 bg-[#1F3A5F] text-white px-3 py-1.5 rounded text-xs font-medium active:opacity-80"
          >
            <Plus size={14} />
            Nouvelle
          </button>
        }
      />
      {facets.length > 0 && (
        <div className="flex gap-1 px-4 py-3 bg-white border-b border-[#E0E0E0] overflow-x-auto">
          {facets.map(f => (
            <button
              key={f.code}
              onClick={() => setActiveFilter(f.code)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors border ${
                activeFilter === f.code
                  ? 'text-white border-transparent'
                  : 'text-[#616161] bg-[#F4F6F8] border-[#E0E0E0]'
              }`}
              style={activeFilter === f.code ? { backgroundColor: f.color, borderColor: f.color } : {}}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`text-[10px] ${activeFilter === f.code ? 'opacity-80' : 'text-[#616161]'}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      <DIList items={items} loading={loading} error={error} />
    </div>
  )
}
