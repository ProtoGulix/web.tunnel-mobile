import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DAList } from '../../components/achats/DAList'
import { DAForm } from '../../components/achats/DAForm'
import { usePurchaseRequests } from '../../hooks/achats/usePurchaseRequests'

export default function AchatsPage() {
  const [showForm, setShowForm] = useState(false)
  const { items, loading, error, create, createStatus } = usePurchaseRequests()

  async function handleCreate(data) {
    await create(data)
    setShowForm(false)
  }

  if (showForm) return (
    <div>
      <PageHeader
        title="Nouvelle DA"
        action={
          <button onClick={() => setShowForm(false)} className="p-1.5 text-tunnel-muted">
            <X size={20} />
          </button>
        }
      />
      <DAForm
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
        title="Demandes d'achat"
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
      <DAList items={items} loading={loading} error={error} />
    </div>
  )
}
