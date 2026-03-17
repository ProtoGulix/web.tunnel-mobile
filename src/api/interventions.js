import { client } from '../lib/api/client'

export function getInterventionRequests(params = {}) {
  const query = new URLSearchParams(params).toString()
  return client.get(`/intervention-requests${query ? `?${query}` : ''}`)
}

export function createInterventionRequest(data) {
  return client.post('/intervention-requests', data)
}

export function getEquipements(search = '') {
  return client.get(`/equipements${search ? `?search=${encodeURIComponent(search)}` : ''}`)
    .then(res => res.items ?? res)
}
