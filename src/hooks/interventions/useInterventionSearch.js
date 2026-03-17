import { useState, useEffect, useRef } from 'react'
import { searchInterventions } from '../../api/interventions'

export function useInterventionSearch() {
  const [query, setQuery] = useState('')
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const t = useRef(null)

  useEffect(() => {
    searchInterventions({ status: 'ouvert,en_cours,en_attente' })
      .then(setAll)
      .catch(err => setError(err?.data?.detail ?? err.message))
      .finally(() => setLoading(false))
  }, [])

  const results = query.trim().length < 2
    ? all
    : all.filter(i => {
        const q = query.toLowerCase()
        return (i.code ?? '').toLowerCase().includes(q)
          || (i.title ?? i.description ?? '').toLowerCase().includes(q)
          || (i.machine_name ?? i.equipements?.name ?? '').toLowerCase().includes(q)
      })

  function handleQueryChange(value) {
    clearTimeout(t.current)
    t.current = setTimeout(() => setQuery(value), 200)
  }

  return { query, setQuery: handleQueryChange, results, loading, error }
}
