import { useState } from 'react'
import { Package, ShoppingCart, Plus } from 'lucide-react'
import { DAList } from '../../components/achats/DAList'
import { PurchaseRequestForm } from '../../components/purchases/PurchaseRequestForm'
import { usePurchaseRequests } from '../../hooks/achats/usePurchaseRequests'
import { BottomBar, BottomBtn } from '../../components/ui/BottomBar'
import { PageHeader } from '../../components/ui/PageHeader'
import { StockItemList } from '../../components/stock/StockItemList'
import { StockItemDetail } from '../../components/stock/StockItemDetail'
import { useStockItems } from '../../hooks/stock/useStockItems'

const TABS = [
  { key: 'stock',  label: 'Stock',             icon: Package },
  { key: 'achats', label: "Demandes d'achat",  icon: ShoppingCart },
]

function TabBar({ active, onChange }) {
  return TABS.map(({ key, label, icon: Icon }) => (
    <button
      key={key}
      onClick={() => onChange(key)}
      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
        active === key ? 'border-[#1F3A5F] text-[#1F3A5F]' : 'border-transparent text-[#616161]'
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  ))
}

// ── Vue Demandes d'achat ──────────────────────────────────────────────────────
function AchatsView() {
  const [showForm, setShowForm] = useState(false)
  const { items, loading, error, reload } = usePurchaseRequests()

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto">
        <DAList items={items} loading={loading} error={error} />
      </div>
      <BottomBar>
        <BottomBtn variant="primary" icon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          Nouvelle demande
        </BottomBtn>
      </BottomBar>
      {showForm && (
        <PurchaseRequestForm onClose={() => setShowForm(false)} onDone={reload} />
      )}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function StockPage() {
  const [tab, setTab] = useState('stock')
  const [selectedId, setSelectedId] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)

  const { items, loading, error, facets, search, setSearch, familyCode, setFamilyCode, subFamilyCode, setSubFamilyCode } = useStockItems()

  const handleTabChange = (key) => { setTab(key); setSelectedId(null); setSearchOpen(false) }
  const handleSelect    = (id)  => { setSelectedId(id); setSearchOpen(false) }
  const handleBack      = ()    => setSelectedId(null)

  const showSearch = tab === 'stock' && !selectedId
  const title = selectedId
    ? (items.find(i => i.id === selectedId)?.name ?? '…')
    : 'Stock'

  return (
    <div className="flex flex-col h-full bg-[#F4F6F8]">
      <PageHeader
        title={title}
        onBack={selectedId ? handleBack : undefined}
        onSearch={showSearch ? () => setSearchOpen(s => !s) : undefined}
        searchActive={searchOpen}
        tabs={!selectedId && <TabBar active={tab} onChange={handleTabChange} />}
      />

      {tab === 'stock' ? (
        selectedId ? (
          <StockItemDetail id={selectedId} />
        ) : (
          <StockItemList
            items={items}
            loading={loading}
            error={error}
            search={search}
            onSearchChange={setSearch}
            searchOpen={searchOpen}
            facets={facets}
            familyCode={familyCode}
            onFamilyChange={setFamilyCode}
            subFamilyCode={subFamilyCode}
            onSubFamilyChange={setSubFamilyCode}
            onSelect={handleSelect}
          />
        )
      ) : (
        <AchatsView />
      )}
    </div>
  )
}
