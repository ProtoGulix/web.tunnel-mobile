import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Loader2, Check, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useInterventionDetail } from '../../hooks/interventions/useInterventionDetail'
import { changeInterventionStatus } from '../../api/interventions'
import { ActionCard } from '../../components/interventions/ActionCard'

const STATUS_COLORS = {
  ouvert: '#22c55e',
  en_cours: '#3b82f6',
  en_attente: '#f59e0b',
  resolu: '#6b7280',
  cloture: '#1f2937',
  bloque: '#ef4444',
}
const STATUS_LABELS = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  en_attente: 'En attente',
  resolu: 'Résolu',
  cloture: 'Clôturé',
  bloque: 'Bloqué',
}
const STATUS_TRANSITIONS = {
  ouvert:     [{ code: 'en_cours',    label: 'Prendre en charge' }],
  en_cours:   [{ code: 'en_attente', label: 'Mettre en attente' }, { code: 'resolu', label: 'Marquer résolu' }],
  en_attente: [{ code: 'en_cours',    label: 'Reprendre' }],
  resolu:     [{ code: 'cloture',    label: 'Clôturer' }],
  bloque:     [{ code: 'en_cours',    label: 'Reprendre' }],
}

function StatusSheet({ statusCode, onClose, onChange }) {
  const transitions = STATUS_TRANSITIONS[statusCode] ?? []
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  async function handleChange(toCode) {
    setLoading(true)
    setErr(null)
    try {
      await onChange(toCode)
      onClose()
    } catch (e) {
      setErr(e?.data?.detail ?? e.message)
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl safe-bottom"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-tunnel-border rounded-full mx-auto mt-3 mb-4" />
        <div className="px-4 pb-2">
          <p className="text-xs font-medium uppercase tracking-wide text-tunnel-muted mb-3">
            Changer le statut
          </p>
          {err && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{err}</div>
          )}
          {transitions.length === 0 ? (
            <p className="text-sm text-tunnel-muted py-4 text-center">Aucune transition disponible</p>
          ) : (
            <div className="space-y-2 mb-4">
              {transitions.map(t => (
                <button
                  key={t.code}
                  disabled={loading}
                  onClick={() => handleChange(t.code)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-tunnel-border bg-white active:bg-tunnel-bg text-sm font-medium text-tunnel-text disabled:opacity-50"
                >
                  <span>{t.label}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded font-medium"
                    style={{ backgroundColor: (STATUS_COLORS[t.code] ?? '#6b7280') + '22', color: STATUS_COLORS[t.code] ?? '#6b7280' }}
                  >
                    {STATUS_LABELS[t.code] ?? t.code}
                  </span>
                </button>
              ))}
            </div>
          )}
          <button onClick={onClose} className="w-full py-3 text-sm text-tunnel-muted font-medium mb-2">
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InterventionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { intervention, loading, error, reload } = useInterventionDetail(id)
  const [showStatusSheet, setShowStatusSheet] = useState(false)

  const statusCode = intervention?.status_actual ?? intervention?.statut ?? ''
  const statusColor = STATUS_COLORS[statusCode]
  const statusLabel = STATUS_LABELS[statusCode] ?? statusCode
  const eq = intervention?.equipements ?? intervention?.machine
  const actions = intervention?.actions ?? []
  const stats = intervention?.stats

  async function handleStatusChange(toCode) {
    await changeInterventionStatus({
      intervention_id: id,
      status_from: statusCode,
      status_to: toCode,
      technician_id: user?.id,
      date: new Date().toISOString(),
    })
    await reload()
  }

  return (
    <div className="flex flex-col h-full bg-tunnel-bg">
      {/* Header */}
      <header className="bg-white border-b border-tunnel-border shrink-0">
        <div className="flex items-center gap-2 px-2 pt-3 pb-2">
          <button onClick={() => navigate(-1)} className="p-2 text-tunnel-muted">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-tunnel-text truncate">
                {loading ? '…' : (intervention?.code ?? id)}
              </span>
              {statusColor && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0"
                  style={{ backgroundColor: statusColor + '22', color: statusColor }}
                >
                  {statusLabel}
                </span>
              )}
            </div>
            {eq && (
              <p className="text-xs text-tunnel-muted truncate mt-0.5">
                <span className="font-mono">{eq.code}</span>
                {eq.name && <span> · {eq.name}</span>}
              </p>
            )}
          </div>
          {statusCode && STATUS_TRANSITIONS[statusCode]?.length > 0 && (
            <button
              onClick={() => setShowStatusSheet(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-tunnel-bg border border-tunnel-border text-tunnel-text mr-2"
            >
              Statut
            </button>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="flex divide-x divide-tunnel-border border-t border-tunnel-border text-center">
            {[
              { label: 'Actions', value: stats.action_count ?? 0 },
              { label: 'Heures', value: stats.total_time ? `${stats.total_time}h` : '—' },
              { label: 'DA', value: stats.purchase_count ?? 0 },
            ].map(s => (
              <div key={s.label} className="flex-1 py-2">
                <p className="text-base font-semibold text-tunnel-text">{s.value}</p>
                <p className="text-[10px] text-tunnel-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={20} className="animate-spin text-tunnel-muted" />
          </div>
        )}

        {error && (
          <div className="m-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
        )}

        {!loading && intervention && (
          <>
            {/* Description */}
            {(intervention.description ?? intervention.title) && (
              <div className="mx-4 mt-4 p-3 rounded-lg bg-white border border-tunnel-border">
                <p className="text-xs font-medium uppercase tracking-wide text-tunnel-muted mb-1">Description</p>
                <p className="text-sm text-tunnel-text">{intervention.description ?? intervention.title}</p>
              </div>
            )}

            {/* Actions */}
            <div className="px-4 mt-4 mb-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium uppercase tracking-wide text-tunnel-muted">
                  Actions {actions.length > 0 && `(${actions.length})`}
                </p>
              </div>

              {actions.length === 0 ? (
                <p className="text-sm text-tunnel-muted text-center py-8">Aucune action enregistrée</p>
              ) : (
                <div className="space-y-2">
                  {actions.map(action => (
                    <ActionCard
                      key={action.id}
                      action={action}
                      onAddPurchase={() => navigate(`/interventions/${id}/add-purchase`, { state: { actionId: action.id } })}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* FAB bottom bar */}
      {!loading && intervention && (
        <div className="shrink-0 flex gap-3 px-4 py-3 border-t border-tunnel-border bg-white safe-bottom">
          <button
            onClick={() => navigate(`/interventions/${id}/add-purchase`)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-tunnel-border bg-white text-sm font-medium text-tunnel-muted active:bg-tunnel-bg"
          >
            <ShoppingCart size={15} />
            DA
          </button>
          <button
            onClick={() => navigate(`/interventions/${id}/add-action`)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-tunnel-accent text-white text-sm font-semibold active:opacity-90"
          >
            <Plus size={16} />
            Ajouter une action
          </button>
        </div>
      )}

      {showStatusSheet && (
        <StatusSheet
          statusCode={statusCode}
          onClose={() => setShowStatusSheet(false)}
          onChange={handleStatusChange}
        />
      )}
    </div>
  )
}
