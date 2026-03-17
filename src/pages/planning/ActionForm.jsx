import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, Loader2, Check, Wrench, Clock, AlignLeft, Gauge } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import {
  searchInterventions,
  searchDI,
  getActionCategories,
  getComplexityFactors,
  createAction,
  createIntervention,
  createDI,
} from '../../api/planning'
import { getEquipements } from '../../api/interventions'

const QUARTER_OPTIONS = []
for (let q = 1; q <= 48; q++) {
  const total = q * 0.25
  const h = Math.floor(total)
  const m = Math.round((total - h) * 60)
  QUARTER_OPTIONS.push({
    value: total,
    label: h === 0 ? `0h${String(m).padStart(2, '0')}` : m === 0 ? `${h}h00` : `${h}h${String(m).padStart(2, '0')}`,
  })
}

const inputClass = 'w-full border border-tunnel-border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tunnel-accent/30 focus:border-tunnel-accent'
const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-tunnel-muted mb-1'

function EquipSearch({ value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const t = useRef(null)

  function handleChange(e) {
    const v = e.target.value
    onChange(v)
    clearTimeout(t.current)
    if (v.length < 2) { setSuggestions([]); return }
    t.current = setTimeout(() => {
      setLoading(true)
      getEquipements(v)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false))
    }, 300)
  }

  return (
    <div className="relative">
      <label className={labelClass}>Équipement</label>
      <input type="text" className={inputClass} placeholder="Rechercher..." value={value} onChange={handleChange} />
      {loading && <Loader2 size={14} className="absolute right-3 top-8 animate-spin text-tunnel-muted" />}
      {suggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-tunnel-border rounded-lg shadow-lg overflow-hidden">
          {suggestions.slice(0, 6).map(eq => (
            <li key={eq.id}>
              <button type="button" className="w-full text-left px-3 py-2.5 text-sm active:bg-tunnel-bg"
                onClick={() => { onSelect(eq); setSuggestions([]) }}>
                <span className="font-medium">{eq.name}</span>
                {eq.code && <span className="ml-2 font-mono text-xs text-tunnel-muted">{eq.code}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Step1({ onChoice }) {
  const choices = [
    { key: '2a', label: 'Intervention existante', sub: 'Rattacher à une intervention déjà créée' },
    { key: '2b', label: 'DI existante → nouvelle intervention', sub: 'Créer une intervention depuis une DI' },
    { key: '2c', label: 'Nouvelle DI → nouvelle intervention', sub: 'Créer la DI puis l\'intervention' },
  ]
  return (
    <div className="p-4 space-y-3">
      <p className="text-sm font-medium text-tunnel-text mb-4">Quel est le contexte de cette action ?</p>
      {choices.map(c => (
        <button key={c.key} onClick={() => onChoice(c.key)}
          className="w-full text-left p-4 rounded-xl border border-tunnel-border bg-white active:bg-tunnel-bg">
          <p className="text-sm font-semibold text-tunnel-text">{c.label}</p>
          <p className="text-xs text-tunnel-muted mt-0.5">{c.sub}</p>
        </button>
      ))}
    </div>
  )
}

function Step2aInterventions({ onSelect }) {
  const [all, setAll] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    searchInterventions()
      .then(setAll)
      .catch(() => setAll([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = query.trim()
    ? all.filter(i =>
        (i.code ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (i.title ?? i.description ?? '').toLowerCase().includes(query.toLowerCase()))
    : all

  return (
    <div className="p-4 space-y-3">
      <input type="text" className={inputClass} placeholder="Filtrer par code ou titre..." value={query}
        onChange={e => setQuery(e.target.value)} />
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-tunnel-muted" /></div>
      ) : (
        <ul className="space-y-2">
          {filtered.slice(0, 20).map(inter => (
            <li key={inter.id}>
              <button type="button" onClick={() => onSelect(inter)}
                className="w-full text-left p-3 rounded-lg border border-tunnel-border bg-white active:bg-tunnel-bg">
                <span className="font-mono text-xs text-tunnel-muted">{inter.code}</span>
                <p className="text-sm font-medium text-tunnel-text mt-0.5 line-clamp-1">{inter.title ?? inter.description}</p>
                {inter.machine_name && <p className="text-xs text-tunnel-muted mt-0.5">{inter.machine_name}</p>}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <p className="text-center text-sm text-tunnel-muted py-6">Aucun résultat</p>}
        </ul>
      )}
    </div>
  )
}

function Step2bDI({ onSelect }) {
  const [all, setAll] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedDI, setSelectedDI] = useState(null)
  const [form, setForm] = useState({ type_inter: '', priority: 'normale' })
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    searchDI().then(setAll).catch(() => setAll([])).finally(() => setLoading(false))
  }, [])

  const filtered = query.trim()
    ? all.filter(d =>
        (d.code ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (d.description ?? '').toLowerCase().includes(query.toLowerCase()))
    : all

  async function handleCreateInter() {
    if (!form.type_inter) { setErr('Type requis'); return }
    setSubmitting(true)
    setErr(null)
    try {
      const inter = await createIntervention({
        request_id: selectedDI.id,
        machine_id: selectedDI.equipement?.id ?? selectedDI.machine_id,
        type_inter: form.type_inter,
        tech_initials: user.initial,
        priority: form.priority,
      })
      onSelect(inter)
    } catch (e) {
      setErr(e?.data?.detail ?? e.message)
      setSubmitting(false)
    }
  }

  if (selectedDI) return (
    <div className="p-4 space-y-4">
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700">
        DI sélectionnée : <strong>{selectedDI.code}</strong>
      </div>
      {err && <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{err}</div>}
      <div>
        <label className={labelClass}>Type d'intervention *</label>
        <input type="text" required className={inputClass} value={form.type_inter}
          onChange={e => setForm(p => ({ ...p, type_inter: e.target.value }))} placeholder="Ex: curative, préventive..." />
      </div>
      <div>
        <label className={labelClass}>Priorité</label>
        <select className={inputClass} value={form.priority}
          onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
          {[['faible','Faible'],['normale','Normale'],['important','Important'],['urgent','Urgent']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <button type="button" disabled={submitting}
        onClick={handleCreateInter}
        className="w-full py-3 rounded-xl bg-tunnel-accent text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
        {submitting && <Loader2 size={14} className="animate-spin" />}
        Créer l'intervention
      </button>
    </div>
  )

  return (
    <div className="p-4 space-y-3">
      <input type="text" className={inputClass} placeholder="Filtrer par code ou description..." value={query}
        onChange={e => setQuery(e.target.value)} />
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-tunnel-muted" /></div>
      ) : (
        <ul className="space-y-2">
          {filtered.slice(0, 20).map(di => (
            <li key={di.id}>
              <button type="button" onClick={() => setSelectedDI(di)}
                className="w-full text-left p-3 rounded-lg border border-tunnel-border bg-white active:bg-tunnel-bg">
                <span className="font-mono text-xs text-tunnel-muted">{di.code}</span>
                <p className="text-sm font-medium text-tunnel-text mt-0.5 line-clamp-2">{di.description}</p>
                {di.machine_name && <p className="text-xs text-tunnel-muted mt-0.5">{di.machine_name}</p>}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <p className="text-center text-sm text-tunnel-muted py-6">Aucun résultat</p>}
        </ul>
      )}
    </div>
  )
}

function Step2cNewDI({ onSelect }) {
  const { user } = useAuth()
  const [equipSearch, setEquipSearch] = useState('')
  const [form, setForm] = useState({
    machine_id: '',
    demandeur_nom: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
    description: '',
    type_inter: '',
    priority: 'normale',
  })
  const [stage, setStage] = useState('di') // 'di' | 'inter'
  const [createdDI, setCreatedDI] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)

  function set(field, value) { setForm(p => ({ ...p, [field]: value })) }

  async function handleCreateDI() {
    if (!form.description) { setErr('Description requise'); return }
    setSubmitting(true)
    setErr(null)
    try {
      const di = await createDI({
        machine_id: form.machine_id || undefined,
        demandeur_nom: form.demandeur_nom,
        description: form.description,
      })
      setCreatedDI(di)
      setStage('inter')
    } catch (e) {
      setErr(e?.data?.detail ?? e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreateInter() {
    if (!form.type_inter) { setErr('Type requis'); return }
    setSubmitting(true)
    setErr(null)
    try {
      const inter = await createIntervention({
        request_id: createdDI.id,
        machine_id: (createdDI.equipement?.id ?? form.machine_id) || undefined,
        type_inter: form.type_inter,
        tech_initials: user.initial,
        priority: form.priority,
      })
      onSelect(inter)
    } catch (e) {
      setErr(e?.data?.detail ?? e.message)
      setSubmitting(false)
    }
  }

  if (stage === 'inter') return (
    <div className="p-4 space-y-4">
      <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
        DI créée : <strong>{createdDI?.code}</strong>
      </div>
      {err && <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{err}</div>}
      <div>
        <label className={labelClass}>Type d'intervention *</label>
        <input type="text" required className={inputClass} value={form.type_inter}
          onChange={e => set('type_inter', e.target.value)} placeholder="Ex: curative, préventive..." />
      </div>
      <div>
        <label className={labelClass}>Priorité</label>
        <select className={inputClass} value={form.priority} onChange={e => set('priority', e.target.value)}>
          {[['faible','Faible'],['normale','Normale'],['important','Important'],['urgent','Urgent']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <button type="button" disabled={submitting} onClick={handleCreateInter}
        className="w-full py-3 rounded-xl bg-tunnel-accent text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
        {submitting && <Loader2 size={14} className="animate-spin" />}
        Créer l'intervention
      </button>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      {err && <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{err}</div>}
      <EquipSearch value={equipSearch} onChange={setEquipSearch}
        onSelect={eq => { set('machine_id', eq.id); setEquipSearch(eq.name ?? eq.code) }} />
      <div>
        <label className={labelClass}>Demandeur *</label>
        <input type="text" required className={inputClass} value={form.demandeur_nom}
          onChange={e => set('demandeur_nom', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Description *</label>
        <textarea required className={`${inputClass} resize-none`} rows={3} value={form.description}
          onChange={e => set('description', e.target.value)} placeholder="Décrivez le problème..." />
      </div>
      <button type="button" disabled={submitting} onClick={handleCreateDI}
        className="w-full py-3 rounded-xl bg-tunnel-accent text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
        {submitting && <Loader2 size={14} className="animate-spin" />}
        Créer la DI
      </button>
    </div>
  )
}

const CAT_COLORS = ['blue', 'violet', 'green', 'amber', 'red', 'indigo', 'slate']

function Step3Action({ intervention, actionDate, onDone, onCancel }) {
  const { user } = useAuth()
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
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getActionCategories().then(setCategories).catch(() => setCategories([]))
    getComplexityFactors().then(setFactors).catch(() => setFactors([]))
  }, [])

  function set(field, value) { setForm(p => ({ ...p, [field]: value })) }

  async function handleSubmit() {
    if (!form.subcategory_id) { setErr('Sous-catégorie requise'); return }
    if (form.time_mode === 'bounds' && (!form.action_start || !form.action_end)) {
      setErr('Heures de début et fin requises'); return
    }
    if (form.complexity_score > 5 && !form.complexity_factor_id) {
      setErr('Facteur de complexité requis pour un score > 5'); return
    }
    setSubmitting(true)
    setErr(null)

    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    const createdAt = `${actionDate}T${hh}:${mm}:${ss}`

    const payload = {
      intervention_id: intervention.id,
      action_subcategory: parseInt(form.subcategory_id),
      tech: user.id,
      description: form.description || undefined,
      complexity_score: form.complexity_score,
      complexity_factor: form.complexity_score > 5 ? form.complexity_factor_id : undefined,
      created_at: createdAt,
    }

    if (form.time_mode === 'duration') {
      payload.time_spent = form.time_spent
    } else {
      payload.action_start = form.action_start.length === 5 ? `${form.action_start}:00` : form.action_start
      payload.action_end = form.action_end.length === 5 ? `${form.action_end}:00` : form.action_end
    }

    try {
      await createAction(payload)
      setSuccess(true)
      setTimeout(() => onDone(), 800)
    } catch (e) {
      setErr(e?.data?.detail ?? e.message)
      setSubmitting(false)
    }
  }

  if (success) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
        <Check size={24} className="text-green-600" />
      </div>
      <p className="text-sm font-medium text-tunnel-text">Action créée !</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-0">
          {err && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{err}</div>}

          {/* Intervention */}
          <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-tunnel-border">
            <Wrench size={13} className="text-tunnel-muted shrink-0" />
            <span className="font-mono text-xs font-semibold text-tunnel-text">{intervention.code}</span>
            {intervention.title && <span className="text-xs text-tunnel-muted truncate">— {intervention.title}</span>}
          </div>

          {/* Type / sous-catégorie */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
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

          {/* Plage horaire / durée */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
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
              <select className={inputClass} value={form.time_spent}
                onChange={e => set('time_spent', parseFloat(e.target.value))}>
                {QUARTER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <div className="flex gap-2 items-center">
                <input type="time" className={inputClass} value={form.action_start}
                  onChange={e => set('action_start', e.target.value)} />
                <span className="text-tunnel-muted text-sm">à</span>
                <input type="time" className={inputClass} value={form.action_end}
                  onChange={e => set('action_end', e.target.value)} />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlignLeft size={12} className="text-tunnel-muted" />
              <label className={labelClass + ' mb-0'}>Description de l'action</label>
              <span className="ml-1 text-[10px] text-tunnel-accent font-medium">Obligatoire</span>
            </div>
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Décris en détail ce qui a été fait : diagnostic, réparation, remplacement..."
            />
            <p className="text-[10px] text-tunnel-muted mt-1">Sois précis : cela aide pour l'analyse et les prochaines interventions</p>
          </div>

          {/* Complexité */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Gauge size={12} className="text-tunnel-muted" />
              <label className={labelClass + ' mb-0'}>Complexité *</label>
            </div>
            <select className={inputClass} value={form.complexity_score}
              onChange={e => set('complexity_score', parseInt(e.target.value))}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} — {n <= 3 ? 'Simple' : n <= 6 ? 'Modérée' : n <= 8 ? 'Complexe' : 'Très complexe'}</option>
              ))}
            </select>
            <p className="text-[10px] text-tunnel-muted mt-1">Évalue la difficulté de l'intervention</p>
          </div>

          {form.complexity_score > 5 && (
            <div className="mb-4">
              <label className={labelClass}>Facteur de complexité *</label>
              <select className={inputClass} value={form.complexity_factor_id}
                onChange={e => set('complexity_factor_id', e.target.value)}>
                <option value="">Sélectionner...</option>
                {factors.map(f => <option key={f.code} value={f.code}>{f.label}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Footer fixe Annuler / Enregistrer */}
      <div className="shrink-0 flex gap-3 px-4 py-3 border-t border-tunnel-border bg-white">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg border border-tunnel-border text-sm font-medium text-tunnel-muted bg-white active:bg-tunnel-bg">
          Annuler
        </button>
        <button type="button" disabled={submitting} onClick={handleSubmit}
          className="flex-1 py-2.5 rounded-lg bg-tunnel-accent text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Enregistrer
        </button>
      </div>
    </div>
  )
}

const STEP_TITLES = {
  '1': 'Nouveau contexte',
  '2a': 'Intervention existante',
  '2b': 'DI existante',
  '2c': 'Nouvelle DI',
  '3': 'Saisir l\'action',
}

export function ActionForm({ actionDate, onClose, onDone }) {
  const [step, setStep] = useState('1')
  const [intervention, setIntervention] = useState(null)

  function handleChoice(key) { setStep(key) }

  function handleInterventionSelected(inter) {
    setIntervention(inter)
    setStep('3')
  }

  function handleBack() {
    if (step === '3') { setStep('1'); setIntervention(null) }
    else if (['2a', '2b', '2c'].includes(step)) setStep('1')
    else onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-tunnel-border bg-white shrink-0">
        <button onClick={handleBack} className="p-1.5 -ml-1.5 text-tunnel-muted">
          <ChevronLeft size={20} />
        </button>
        <h2 className="flex-1 text-sm font-semibold text-tunnel-text">{STEP_TITLES[step] ?? 'Nouvelle action'}</h2>
        <button onClick={onClose} className="p-1.5 text-tunnel-muted">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {step === '1' && <Step1 onChoice={handleChoice} />}
        {step === '2a' && <Step2aInterventions onSelect={handleInterventionSelected} />}
        {step === '2b' && <Step2bDI onSelect={handleInterventionSelected} />}
        {step === '2c' && <Step2cNewDI onSelect={handleInterventionSelected} />}
        {step === '3' && intervention && (
          <Step3Action intervention={intervention} actionDate={actionDate} onDone={() => { onDone(); onClose() }} onCancel={onClose} />
        )}
      </div>
    </div>
  )
}
