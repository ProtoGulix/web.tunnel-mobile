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

export function getIntervention(id) {
  return client.get(`/interventions/${id}`)
}

export function searchInterventions(params = {}) {
  const query = new URLSearchParams({ limit: 50, ...params }).toString()
  return client.get(`/interventions?${query}`).then(res => res.items ?? res)
}

export function getInterventionActions(interventionId) {
  return client.get(`/intervention-actions?intervention_id=${interventionId}`).then(res => res.items ?? res)
}

export function changeInterventionStatus(data) {
  return client.post('/intervention-status-log', data)
}
