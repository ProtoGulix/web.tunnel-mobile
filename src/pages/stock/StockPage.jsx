import { Package } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'

export default function StockPage() {
  return (
    <div>
      <PageHeader title="Stock" />
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
        <Package size={36} strokeWidth={1.25} className="text-[#BDBDBD]" />
        <p className="text-sm text-[#616161]">Module stock à venir</p>
      </div>
    </div>
  )
}
