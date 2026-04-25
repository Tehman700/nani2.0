const BASE = 'http://localhost:8000'

async function req(path, opts = {}) {
  const token = localStorage.getItem('nani_token')
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  })
  if (res.status === 204) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export const api = {
  get:    (path)       => req(path),
  post:   (path, body) => req(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => req(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body) => req(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)       => req(path, { method: 'DELETE' }),
}

export const auth = {
  save(data) {
    localStorage.setItem('nani_token',   data.access_token)
    localStorage.setItem('nani_role',    data.role)
    localStorage.setItem('nani_user_id', data.user_id)
    if (data.cnic) localStorage.setItem('nani_cnic', data.cnic)
  },
  clear() {
    ['nani_token', 'nani_role', 'nani_user_id', 'nani_cnic'].forEach(k => localStorage.removeItem(k))
  },
  token:    () => localStorage.getItem('nani_token'),
  role:     () => localStorage.getItem('nani_role'),
  userId:   () => localStorage.getItem('nani_user_id'),
  cnic:     () => localStorage.getItem('nani_cnic'),
  loggedIn: () => !!localStorage.getItem('nani_token'),
}
