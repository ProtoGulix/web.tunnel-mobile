import { useState } from 'react'
import { Package, ShoppingCart, Plus } from 'lucide-react'
import { DAList } from '../../components/achats/DAList'
import { PurchaseRequestForm } from '../../components/purchases/PurchaseRequestForm'
import { usePurchaseRequests } from '../../hooks/achats/usePurchaseRequests'

// ── Vue Stock ────────────────────────────────────────────────────────────────
function StockView() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center flex-1">
      <Package size={36} strokeWidth={1.25} className="text-[#BDBDBD]" />
      <p className="text-sm text-[#616161]">Module stock à venir</p>
    </div>
  )
}

// ── Vue Demandes d'achat ──────────────────────────────────────────────────────
function AchatsView() {
  const [showForm, setShowForm] = useState(false)
  const { items, loading, error, reload } = usePurchaseRequests()

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 py-3 bg-white border-b border-[#E0E0E0] flex items-center justify-between">
        <span className="text-xs font-medium text-[#616161]">Demandes d'achat</span>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-[#1F3A5F] text-white px-3 py-1.5 rounded text-xs font-medium active:opacity-80"
        >
          <Plus size={14} />
          Nouvelle
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <DAList items={items} loading={loading} error={error} />
      </div>
      {showForm && (
        <PurchaseRequestForm
          onClose={() => setShowForm(false)}
          onDone={reload}
        />
      )}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function StockPage() {
  const [tab, setTab] = useState('stock')

  return (
    <div className="flex flex-col h-full bg-[#F4F6F8]">
      <header className="bg-white border-b border-[#E0E0E0] px-4 pt-4 pb-0 shrink-0">
        <h1 className="text-base font-semibold text-[#2E2E2E] mb-3">Stock</h1>
        <div className="flex">
          <button
            onClick={() => setTab('stock')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === 'stock'
                ? 'border-[#1F3A5F] text-[#1F3A5F]'
                : 'border-transparent text-[#616161]'
            }`}
          >
            <Package size={13} />
            Stock
          </button>
          <button
            onClick={() => setTab('achats')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === 'achats'
                ? 'border-[#1F3A5F] text-[#1F3A5F]'
                : 'border-transparent text-[#616161]'
            }`}
          >
            <ShoppingCart size={13} />
            Demandes d'achat
          </button>
        </div>
      </header>

      {tab === 'stock' ? <StockView /> : <AchatsView />}
    </div>
  )
}
