import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function DAForm({ onSubmit, onCancel, status, error }) {
  const [form, setForm] = useState({
    item_label: '',
    quantity: '1',
    unit: '',
    urgency: 'normal',
    reason: '',
  })

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      item_label: form.item_label,
      quantity: Number(form.quantity) || 1,
      unit: form.unit || undefined,
      urgency: form.urgency,
      reason: form.reason || undefined,
    })
  }

  const inputClass = 'w-full border border-tunnel-border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tunnel-accent/30 focus:border-tunnel-accent'
  const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-tunnel-muted mb-1'

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className={labelClass}>Désignation *</label>
        <input
          type="text"
          required
          className={inputClass}
          value={form.item_label}
          onChange={e => set('item_label', e.target.value)}
          placeholder="Nom de la pièce ou fourniture"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass}>Quantité</label>
          <input
            type="number"
            min="1"
            className={inputClass}
            value={form.quantity}
            onChange={e => set('quantity', e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>Unité</label>
          <input
            type="text"
            className={inputClass}
            value={form.unit}
            onChange={e => set('unit', e.target.value)}
            placeholder="pcs, m, kg..."
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Urgence</label>
        <div className="flex gap-2">
          {[{ value: 'normal', label: 'Normal' }, { value: 'high', label: 'Urgent' }].map(u => (
            <button
              key={u.value}
              type="button"
              onClick={() => set('urgency', u.value)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                form.urgency === u.value
                  ? 'bg-tunnel-accent text-white border-tunnel-accent'
                  : 'bg-white text-tunnel-muted border-tunnel-border'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Raison / besoin</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={form.reason}
          onChange={e => set('reason', e.target.value)}
          placeholder="Contexte, justification..."
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
          Créer la DA
        </button>
      </div>
    </form>
  )
}
