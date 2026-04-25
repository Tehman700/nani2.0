import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, auth } from '../api/client'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/admin-login', form)
      auth.save(data)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen dot-bg flex items-center justify-center px-4">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-violet-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm enter">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-400/20 border border-violet-400/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white tracking-tight">nani<span className="text-violet-400">2.0</span></span>
          </div>
          <p className="text-slate-400 text-sm">Admin Panel</p>
        </div>

        <div className="bg-navy-800/80 backdrop-blur rounded-2xl p-8 card-glow">
          <h1 className="font-display text-xl font-bold text-white mb-1">Admin Sign In</h1>
          <p className="text-slate-400 text-sm mb-7">Restricted access — admins only</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">Email</label>
              <input type="email" className="field" placeholder="admin@school.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">Password</label>
              <input type="password" className="field" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 text-rose-300 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-violet-500/20 border border-violet-400/30 text-violet-300 font-display font-bold text-sm hover:bg-violet-500/30 transition-all disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign In as Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          To create an admin: POST /auth/register with role: "super_admin"
        </p>
      </div>
    </div>
  )
}
