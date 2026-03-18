import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Check, Loader2, Clock, CalendarDays, Tag, AlignLeft, BarChart3, ChevronDown } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useInterventionDetail } from '../../hooks/interventions/useInterventionDetail'
import { useActionForm } from '../../hooks/interventions/useActionForm'
import { getActionCategories, getComplexityFactors, createAction } from '../../api/planning'

// ─── Styles partagés ────────────────────────────────────────────────────────
const inputCls = 'w-full border border-tunnel-border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tunnel-accent/30 focus:border-tunnel-accent'
const labelCls = 'flex items-center gap-1.5 mb-1.5'

// ─── Sélecteur de catégorie (bottom-sheet) ───────────────────────────────────
function CategoryPicker({ categories, selected, onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl max-h-[72vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-3 border-b border-tunnel-border shrink-0 flex items-center justify-between">
          <p className="text-sm font-semibold text-tunnel-text">Type d'action</p>
          <button onClick={onClose} className="text-xs text-tunnel-muted font-medium px-2 py-1">Fermer</button>
        </div>
        <div className="overflow-y-auto">
          {categories.map(cat => (
            <div key={cat.id}>
              {/* En-tête catégorie — non sélectionnable */}
              <div
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-50"
                style={{
                  borderLeft: `4px solid ${cat.color || '#6b7280'}`,
                  borderBottom: '1px solid var(--tunnel-border, #e2e8f0)',
                }}
              >
                {cat.name}
              </div>
              {/* Sous-catégories */}
              {(cat.subcategories ?? []).map(sub => {
                const isActive = String(sub.id) === String(selected)
                return (
                  <button
                    key={sub.id}
                    onClick={() => { onSelect(String(sub.id)); onClose() }}
                    className={`w-full flex items-center gap-3 pl-6 pr-4 py-3 border-b border-tunnel-border text-left ${isActive ? 'bg-blue-50' : 'bg-white active:bg-tunnel-bg'}`}
                  >
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold text-white shrink-0"
                      style={{ backgroundColor: cat.color || '#6b7280' }}
                    >
                      {sub.code}
                    </span>
                    <span className="flex-1 text-sm text-tunnel-text">{sub.name}</span>
                    {isActive && <Check size={14} className="text-tunnel-accent shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function AddActionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { intervention, loading: loadingInter } = useInterventionDetail(id)
  const { formState, handlers, validation } = useActionForm()

  const [categories, setCategories] = useState([])
  const [factors, setFactors] = useState([])
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    getActionCategories().then(setCategories).catch(() => setCategories([]))
    getComplexityFactors().then(setFactors).catch(() => setFactors([]))
  }, [])

  // Sous-catégorie sélectionnée pour l'affichage du trigger
  const selectedSubcat = useMemo(() => {
    for (const cat of categories) {
      const sub = cat.subcategories?.find(s => String(s.id) === String(formState.category))
      if (sub) return { sub, cat }
    }
    return null
  }, [categories, formState.category])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!handlers.handleValidate()) return
    setSubmitting(true)
    setSubmitError(null)

    const now = new Date()
    const ts = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`

    try {
      await createAction({
        intervention_id: id,
        action_subcategory: Number(formState.category) || undefined,
        tech: user.id,
        description: formState.description,
        time_spent: formState.time ? Number(formState.time) : undefined,
        complexity_score: Number(formState.complexity),
        complexity_factor: Number(formState.complexity) > 5 ? formState.complexityFactors[0] : undefined,
        created_at: formState.date ? `${formState.date}T${ts}` : undefined,
      })
      setDone(true)
      setTimeout(() => navigate(`/interventions/${id}`, { replace: true }), 700)
    } catch (err) {
      setSubmitError(err?.data?.detail ?? err.message)
      setSubmitting(false)
    }
  }

  // ── État succès ──
  if (done) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 bg-white">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
        <Check size={24} className="text-green-600" />
      </div>
      <p className="text-sm font-medium text-tunnel-text">Action enregistrée !</p>
    </div>
  )

  const hasErrors = validation.errors.length > 0

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-2 py-3 border-b border-tunnel-border shrink-0 bg-blue-50">
        <button onClick={() => navigate(-1)} className="p-2 text-tunnel-muted">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Plus size={16} color="var(--color-blue-600, #2563eb)" />
            <h2 className="text-sm font-bold text-tunnel-text">Nouvelle action</h2>
          </div>
          {!loadingInter && intervention && (
            <p className="text-xs text-tunnel-muted font-mono truncate mt-0.5">{intervention.code}</p>
          )}
        </div>
      </div>

      {/* ── Formulaire ── */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-5">

            {/* Erreurs de validation */}
            {(hasErrors || submitError) && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-300">
                <p className="text-xs font-bold text-red-700 mb-1.5">Erreurs de validation</p>
                <div className="space-y-0.5">
                  {validation.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-700">• {err}</p>
                  ))}
                  {submitError && <p className="text-xs text-red-700">• {submitError}</p>}
                </div>
              </div>
            )}

            {/* ── Ligne 1 : Temps | Date | Type ── */}
            <div className="flex gap-3 flex-wrap">

              {/* Temps */}
              <div style={{ flex: '1', minWidth: '90px' }}>
                <div className={labelCls}>
                  <Clock size={14} className="text-tunnel-muted" />
                  <span className="text-xs font-bold text-tunnel-text">Temps</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="0.5"
                    value={formState.time}
                    onChange={e => handlers.handleTimeChange(e.target.value)}
                    className={inputCls + ' pr-7'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tunnel-muted select-none">h</span>
                </div>
              </div>

              {/* Date */}
              <div style={{ flex: '1', minWidth: '110px' }}>
                <div className={labelCls}>
                  <CalendarDays size={14} className="text-tunnel-muted" />
                  <span className="text-xs font-bold text-tunnel-text">Date</span>
                </div>
                <input
                  type="date"
                  value={formState.date}
                  onChange={e => handlers.handleDateChange(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Type / catégorie */}
              <div style={{ flex: '2', minWidth: '140px' }}>
                <div className={labelCls}>
                  <Tag size={14} className="text-tunnel-muted" />
                  <span className="text-xs font-bold text-tunnel-text">Type</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryPicker(true)}
                  className={`w-full flex items-center justify-between gap-2 border border-tunnel-border rounded-lg px-3 py-2.5 bg-white text-left focus:outline-none focus:ring-2 focus:ring-tunnel-accent/30 focus:border-tunnel-accent ${!selectedSubcat ? 'text-tunnel-muted' : 'text-tunnel-text'}`}
                >
                  {selectedSubcat ? (
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold text-white shrink-0"
                        style={{ backgroundColor: selectedSubcat.cat.color || '#6b7280' }}
                      >
                        {selectedSubcat.sub.code}
                      </span>
                      <span className="text-sm truncate">{selectedSubcat.sub.name}</span>
                    </span>
                  ) : (
                    <span className="text-sm text-tunnel-muted">Sélectionner...</span>
                  )}
                  <ChevronDown size={14} className="text-tunnel-muted shrink-0" />
                </button>
              </div>
            </div>

            {/* ── Description ── */}
            <div>
              <div className={labelCls}>
                <AlignLeft size={16} className="text-tunnel-muted" />
                <span className="text-xs font-bold text-tunnel-text">Description de l'action</span>
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                  Obligatoire
                </span>
              </div>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={formState.description}
                onChange={e => handlers.handleDescriptionChange(e.target.value)}
                placeholder="Décris en détail ce qui a été fait : diagnostic, réparation, remplacement..."
              />
              <p className="text-[11px] text-tunnel-muted mt-1">
                Sois précis : cela aide pour l'analyse et les prochaines interventions
              </p>
            </div>

            {/* ── Facteurs de complexité (si score > 5) ── */}
            {validation.shouldShowComplexityFactors && (
              <div>
                <div className={labelCls}>
                  <BarChart3 size={16} className="text-orange-500" />
                  <span className="text-xs font-bold text-tunnel-text">Facteurs de complexité</span>
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700">
                    Obligatoire pour complexité &gt; 5
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {factors.map(factor => {
                    const code = factor.code ?? factor.id
                    const isSelected = formState.complexityFactors.includes(code)
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handlers.handleComplexityFactorToggle(code)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-gray-100 text-gray-700 border-gray-200 active:bg-gray-200'
                        }`}
                      >
                        {factor.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-tunnel-muted mt-2">
                  Sélectionne les facteurs qui ont rendu cette action complexe
                </p>
              </div>
            )}

            {/* ── Complexité ── */}
            <div>
              <div className={labelCls}>
                <BarChart3 size={16} className="text-tunnel-muted" />
                <span className="text-xs font-bold text-tunnel-text">Complexité</span>
              </div>
              <select
                className={inputCls}
                value={formState.complexity}
                onChange={e => handlers.handleComplexityChange(e.target.value)}
              >
                <option value="1">1 — Très simple</option>
                <option value="2">2 — Simple</option>
                <option value="3">3 — Facile</option>
                <option value="4">4 — Moyen-</option>
                <option value="5">5 — Moyen</option>
                <option value="6">6 — Moyen+</option>
                <option value="7">7 — Difficile</option>
                <option value="8">8 — Complexe</option>
                <option value="9">9 — Très complexe</option>
                <option value="10">10 — Expert</option>
              </select>
              <p className="text-[11px] text-tunnel-muted mt-1">
                Évalue la difficulté de l'intervention
              </p>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 flex gap-3 px-4 py-3 border-t border-tunnel-border bg-white safe-bottom">
          <button
            type="button"
            onClick={() => { handlers.handleReset(); navigate(-1) }}
            className="flex-1 py-2.5 rounded-lg border border-tunnel-border text-sm font-medium text-tunnel-muted bg-white active:bg-tunnel-bg"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting || hasErrors}
            className="flex-1 py-2.5 rounded-lg bg-tunnel-accent text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Enregistrer
          </button>
        </div>
      </form>

      {/* ── Category picker ── */}
      {showCategoryPicker && (
        <CategoryPicker
          categories={categories}
          selected={formState.category}
          onSelect={handlers.handleCategoryChange}
          onClose={() => setShowCategoryPicker(false)}
        />
      )}
    </div>
  )
}
