import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, Loader2, Wrench, Clock, AlignLeft, Gauge } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useInterventionDetail } from '../../hooks/interventions/useInterventionDetail'
import { getActionCategories, getComplexityFactors, createAction } from '../../api/planning'

const QUARTER_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const total = (i + 1) * 0.25
  const h = Math.floor(total)
  const m = Math.round((total - h) * 60)
  return { value: total, label: h === 0 ? `0h${String(m).padStart(2,'0')}` : m === 0 ? `${h}h00` : `${h}h${String(m).padStart(2,'0')}` }
})

const inputClass = 'w-full border border-tunnel-border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tunnel-accent/30 focus:border-tunnel-accent'
const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-tunnel-muted mb-1'

export default function AddActionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { intervention, loading: loadingInter } = useInterventionDetail(id)
  const [categories, setCategories] = useState([])
  const [factors, setFactors] = useState([])
  const [form, setForm] = useState({
    subcategory_id: '',
    description: '',
    time_mode: 'duration',
    time_spent: 0.5,
    action_start: '',
    action_end: '',
    complexity_score: 5,
    complexity_factor_id: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    getActionCategories().then(setCategories).catch(() => setCategories([]))
    getComplexityFactors().then(setFactors).catch(() => setFactors([]))
  }, [])

  function set(field, value) { setForm(p => ({ ...p, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.subcategory_id) { setErr('Sous-catégorie requise'); return }
    if (form.time_mode === 'bounds' && (!form.action_start || !form.action_end)) {
      setErr('Heures de début et fin requises'); return
    }
    if (form.complexity_score > 5 && !form.complexity_factor_id) {
      setErr('Facteur de complexité requis pour score > 5'); return
    }
    setSubmitting(true)
    setErr(null)

    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`

    const payload = {
      intervention_id: id,
      action_subcategory: parseInt(form.subcategory_id),
      tech: user.id,
      description: form.description || undefined,
      complexity_score: form.complexity_score,
      complexity_factor: form.complexity_score > 5 ? form.complexity_factor_id : undefined,
      created_at: `${today}T${hh}:${mm}:${ss}`,
    }
    if (form.time_mode === 'duration') {
      payload.time_spent = form.time_spent
    } else {
      payload.action_start = form.action_start.length === 5 ? `${form.action_start}:00` : form.action_start
      payload.action_end = form.action_end.length === 5 ? `${form.action_end}:00` : form.action_end
    }

    try {
      await createAction(payload)
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
      <p className="text-sm font-medium text-tunnel-text">Action enregistrée !</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 py-3 border-b border-tunnel-border shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 text-tunnel-muted">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-tunnel-text">Nouvelle action</h2>
          {!loadingInter && intervention && (
            <p className="text-xs text-tunnel-muted font-mono truncate">{intervention.code}</p>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {err && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{err}</div>
          )}

          {/* Type */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Wrench size={12} className="text-tunnel-muted" />
              <label className={labelClass + ' mb-0'}>Type d'action *</label>
            </div>
            <select className={inputClass} value={form.subcategory_id} onChange={e => set('subcategory_id', e.target.value)}>
              <option value="">Sélectionner...</option>
              {categories.map(cat => (
                <optgroup key={cat.id} label={cat.name}>
                  {(cat.subcategories ?? []).map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Durée */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={12} className="text-tunnel-muted" />
              <label className={labelClass + ' mb-0'}>Durée *</label>
              <div className="ml-auto flex rounded border border-tunnel-border overflow-hidden">
                {[['duration','Durée'],['bounds','Plage']].map(([m, l]) => (
                  <button key={m} type="button" onClick={() => set('time_mode', m)}
                    className={`px-2.5 py-1 text-[11px] font-medium ${form.time_mode === m ? 'bg-tunnel-accent text-white' : 'bg-white text-tunnel-muted'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {form.time_mode === 'duration' ? (
              <select className={inputClass} value={form.time_spent} onChange={e => set('time_spent', parseFloat(e.target.value))}>
                {QUARTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <div className="flex gap-2 items-center">
                <input type="time" className={inputClass} value={form.action_start} onChange={e => set('action_start', e.target.value)} />
                <span className="text-tunnel-muted text-sm">à</span>
                <input type="time" className={inputClass} value={form.action_end} onChange={e => set('action_end', e.target.value)} />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <AlignLeft size={12} className="text-tunnel-muted" />
              <label className={labelClass + ' mb-0'}>Description</label>
            </div>
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Décris ce qui a été fait : diagnostic, réparation, remplacement..."
            />
          </div>

          {/* Complexité */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Gauge size={12} className="text-tunnel-muted" />
              <label className={labelClass + ' mb-0'}>Complexité *</label>
            </div>
            <select className={inputClass} value={form.complexity_score} onChange={e => set('complexity_score', parseInt(e.target.value))}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} — {n <= 3 ? 'Simple' : n <= 6 ? 'Modérée' : n <= 8 ? 'Complexe' : 'Très complexe'}</option>
              ))}
            </select>
          </div>

          {form.complexity_score > 5 && (
            <div>
              <label className={labelClass}>Facteur de complexité *</label>
              <select className={inputClass} value={form.complexity_factor_id} onChange={e => set('complexity_factor_id', e.target.value)}>
                <option value="">Sélectionner...</option>
                {factors.map(f => <option key={f.code} value={f.code}>{f.label}</option>)}
              </select>
            </div>
          )}
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
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}
