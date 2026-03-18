import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getEquipements } from '../../api/interventions'
import { AsyncSearchSelect, SelectionChip } from '../ui/AsyncSearchSelect'

const inputClass = 'w-full border border-tunnel-border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tunnel-accent/30 focus:border-tunnel-accent'
const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-tunnel-muted mb-1.5'

export function DIForm({ onSubmit, onCancel, status, error }) {
  const [form, setForm] = useState({ demandeur_nom: '', machine_id: '', description: '' })
  const [selectedEquip, setSelectedEquip] = useState(null)

  function handleEquipSelect(equip) {
    setSelectedEquip(equip)
    setForm(p => ({ ...p, machine_id: equip.id }))
  }

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ machine_id: form.machine_id || undefined, demandeur_nom: form.demandeur_nom, description: form.description })
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
      )}

      {/* Équipement */}
      <div>
        <label className={labelClass}>Équipement</label>
        {selectedEquip ? (
          <SelectionChip
            badge={selectedEquip.code}
            label={selectedEquip.name ?? selectedEquip.code}
            onClear={() => { setSelectedEquip(null); setForm(p => ({ ...p, machine_id: '' })) }}
          />
        ) : (
          <AsyncSearchSelect
            fetchFn={getEquipements}
            onSelect={handleEquipSelect}
            renderItem={eq => (
              <>
                {eq.code && (
                  <span className="font-mono text-xs bg-tunnel-bg px-1.5 py-0.5 rounded text-tunnel-muted shrink-0">
                    {eq.code}
                  </span>
                )}
                <span className="text-sm font-medium text-tunnel-text truncate">{eq.name}</span>
              </>
            )}
            placeholder="Rechercher un équipement..."
            minChars={1}
          />
        )}
      </div>

      {/* Demandeur */}
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

      {/* Description */}
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
