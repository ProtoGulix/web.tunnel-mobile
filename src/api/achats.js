import { client } from '../lib/api/client'

export function getPurchaseRequests(params = {}) {
  const query = new URLSearchParams(params).toString()
  return client.get(`/purchase-requests${query ? `?${query}` : ''}`)
}

export function createPurchaseRequest(data) {
  return client.post('/purchase-requests', data)
}
