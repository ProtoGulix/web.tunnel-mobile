const BASE_URL = import.meta.env.VITE_API_URL

export async function getHealth() {
  const response = await fetch(`${BASE_URL}/health`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
