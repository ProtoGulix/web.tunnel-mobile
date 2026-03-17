import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { createPurchaseRequest } from '../../api/achats'

const inputClass = 'w-full border border-tunnel-border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tunnel-accent/30 focus:border-tunnel-accent'
const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-tunnel-muted mb-1'

export default function AddPurchasePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const actionId = location.state?.actionId

  const [form, setForm] = useState({
    item_label: '',
    quantity: '1',
    unit: '',
    urgency: 'normal',
    reason: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(false)

  function set(field, value) { setForm(p => ({ ...p, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErr(null)
    try {
      await createPurchaseRequest({
        item_label: form.item_label,
        quantity: Number(form.quantity) || 1,
        unit: form.unit || undefined,
        urgency: form.urgency,
        reason: form.reason || undefined,
        intervention_id: id,
        requester_name: user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || undefined : undefined,
      })
      setDone(true)
      setTimeout(() => navigate(`/interventions/${id}`, { replace: true }), 800)
    } catch (e) {
      setErr(e?.data?.detail ?? e.message)
      setSubmitting(false)
    }
  }

  if (done) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 bg-white">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
        <Check size={24} className="text-green-600" />
      </div>
      <p className="text-sm font-medium text-tunnel-text">Demande créée !</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 py-3 border-b border-tunnel-border shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 text-tunnel-muted">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-sm font-semibold text-tunnel-text">Demande d'achat</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {err && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{err}</div>
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
              {[{ value: 'normal', label: 'Normal' }, { value: 'high', label: 'Urgent' }, { value: 'critical', label: 'Critique' }].map(u => (
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
        </div>

        {/* Footer */}
        <div className="shrink-0 flex gap-3 px-4 py-3 border-t border-tunnel-border bg-white safe-bottom">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 py-2.5 rounded-lg border border-tunnel-border text-sm font-medium text-tunnel-muted bg-white active:bg-tunnel-bg">
            Annuler
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-2.5 rounded-lg bg-tunnel-accent text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Créer la DA
          </button>
        </div>
      </form>
    </div>
  )
}
