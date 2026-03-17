import { client } from '../lib/api/client'

export function getActions(params = {}) {
  const query = new URLSearchParams(params).toString()
  return client.get(`/intervention-actions${query ? `?${query}` : ''}`)
}

export function createAction(data) {
  return client.post('/intervention-actions', data)
}

export function searchInterventions() {
  return client.get('/interventions?limit=20').then(res => res.items ?? res)
}

export function getActionCategories() {
  return client.get('/action-categories')
}

export function getComplexityFactors() {
  return client.get('/complexity-factors')
}

export function createIntervention(data) {
  return client.post('/interventions', data)
}

export function createDI(data) {
  return client.post('/intervention-requests', data)
}

export function searchDI() {
  return client.get('/intervention-requests?exclude_statuses=rejetee,cloturee&limit=30').then(res => res.items ?? res)
}
