export async function getHealth() {
  const baseUrl = window.__APP_CONFIG__?.apiUrl || import.meta.env.VITE_API_URL
  const response = await fetch(`${baseUrl}/health`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
