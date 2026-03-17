import { client } from '../lib/api/client'

export function login(email, password) {
  return client.post('/auth/login', { email, password, mode: 'session' })
}

export function logout() {
  return client.post('/auth/logout', {})
}

export function getMe() {
  return client.get('/users/me')
}
