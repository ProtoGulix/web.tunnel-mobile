import { useState, useEffect, useCallback } from 'react'
import { getStockItems } from '../../api/stock'
import { useDebounce } from '../shared/useDebounce'

export function useStockItems({ search = '', familyCode = '', subFamilyCode = '' } = {}) {
  const [items, setItems] = useState([])
  const [facets, setFacets] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const debouncedSearch = useDebounce(search, 350)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getStockItems({ search: debouncedSearch, family_code: familyCode, sub_family_code: subFamilyCode })
      .then(res => {
        setItems(res.items ?? [])
        setFacets(res.facets ?? null)
      })
      .catch(err => setError(err?.data?.detail ?? err.message))
      .finally(() => setLoading(false))
  }, [debouncedSearch, familyCode, subFamilyCode])

  useEffect(() => { load() }, [load])

  return { items, facets, loading, error, reload: load }
}
