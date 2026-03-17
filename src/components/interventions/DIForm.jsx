import { useState, useEffect, useRef } from 'react'
import { getEquipements } from '../../api/interventions'
import { Loader2 } from 'lucide-react'

export function DIForm({ onSubmit, onCancel, status, error }) {
  const [form, setForm] = useState({
    demandeur_nom: '',
    machine_id: '',
    equipment_label: '',
    description: '',
  })
  const [equipSearch, setEquipSearch] = useState('')
  const [equipSuggestions, setEquipSuggestions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimeout = useRef(null)

  useEffect(() => {
    if (equipSearch.length < 2) { setEquipSuggestions([]); return }
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearchLoading(true)
      getEquipements(equipSearch)
        .then(setEquipSuggestions)
        .catch(() => setEquipSuggestions([]))
        .finally(() => setSearchLoading(false))
    }, 300)
  }, [equipSearch])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleEquipSelect(equip) {
    setForm(prev => ({ ...prev, machine_id: equip.id, equipment_label: equip.name ?? equip.code }))
    setEquipSearch(equip.name ?? equip.code)
    setEquipSuggestions([])
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      machine_id: form.machine_id || undefined,
      demandeur_nom: form.demandeur_nom,
      description: form.description,
    })
  }

  const inputClass = 'w-full border border-tunnel-border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tunnel-accent/30 focus:border-tunnel-accent'
  const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-tunnel-muted mb-1'

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
      )}

      <div className="relative">
        <label className={labelClass}>Équipement</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Rechercher un équipement..."
          value={equipSearch}
          onChange={e => setEquipSearch(e.target.value)}
        />
        {searchLoading && <Loader2 size={14} className="absolute right-3 top-8 animate-spin text-tunnel-muted" />}
        {equipSuggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-tunnel-border rounded-lg shadow-lg overflow-hidden">
            {equipSuggestions.slice(0, 6).map(eq => (
              <li key={eq.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-tunnel-bg active:bg-tunnel-bg"
                  onClick={() => handleEquipSelect(eq)}
                >
                  <span className="font-medium">{eq.name}</span>
                  {eq.code && <span className="ml-2 font-mono text-xs text-tunnel-muted">{eq.code}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className={labelClass}>Votre nom *</label>
        <input
          type="text"
          required
          className={inputClass}
          value={form.demandeur_nom}
          onChange={e => set('demandeur_nom', e.target.value)}
          placeholder="Nom du demandeur"
        />
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          required
          className={`${inputClass} resize-none`}
          rows={4}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Décrivez le problème ou l'intervention souhaitée..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg border border-tunnel-border text-sm font-medium text-tunnel-muted bg-white"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex-1 py-2.5 rounded-lg bg-tunnel-accent text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === 'loading' && <Loader2 size={14} className="animate-spin" />}
          Créer la DI
        </button>
      </div>
    </form>
  )
}
