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
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">

      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="stagger delay-1 mb-14">
          <div className="font-display text-[40px] font-bold tracking-[-0.03em] leading-none uppercase mb-2">
            NANI 2.0
          </div>
          <div className="flex items-center gap-3 mt-2">
            <p className="label-xs">Admin Panel</p>
            <span className="inline-block border border-primary px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase">
              RESTRICTED
            </span>
          </div>
        </div>

        <div className="stagger delay-2">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Admin Sign In</h1>
          <p className="text-sm text-secondary mb-10">Access restricted — authorised personnel only</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="label-sm block mb-2">Email</label>
              <input
                type="email"
                className="field"
                placeholder="admin@school.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label-sm block mb-2">Password</label>
              <input
                type="password"
                className="field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            {error && (
              <div className="border border-error/30 bg-error-container/40 px-4 py-3 text-error text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In as Admin'}
            </button>
          </form>
        </div>

        <div className="stagger delay-3 mt-10 pt-8 border-t border-outline-variant">
          <p className="text-xs text-outline">
            Not an admin?{' '}
            <a href="/" className="hover:text-primary transition-colors">
              Return to login →
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
