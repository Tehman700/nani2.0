import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, auth } from '../api/client'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/login', form)
      auth.save(data)
      navigate(data.role === 'teacher' ? '/teacher' : '/dashboard')
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
          <p className="label-xs">Smart School Pickup System</p>
        </div>

        {/* Form */}
        <div className="stagger delay-2">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-secondary mb-10">Sign in to manage pickups</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="label-sm block mb-2">Email</label>
              <input
                type="email"
                className="field"
                placeholder="you@school.com"
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

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="stagger delay-3 mt-10 pt-8 border-t border-outline-variant">
          <p className="text-sm text-secondary">
            New here?{' '}
            <Link to="/register" className="text-primary font-semibold hover:opacity-60 transition-opacity">
              Create an account
            </Link>
          </p>
          <p className="text-xs text-outline mt-3">
            Admin?{' '}
            <Link to="/admin-login" className="hover:text-primary transition-colors">
              Admin sign in →
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
