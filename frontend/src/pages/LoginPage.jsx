import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, auth } from '../api/client'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/login', form)
      auth.save(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen dot-bg flex items-center justify-center px-4">

      {/* Top ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm enter">

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-400/20 border border-sky-400/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white tracking-tight">nani<span className="text-sky-400">2.0</span></span>
          </div>
          <p className="text-slate-400 text-sm">Smart School Pickup System</p>
        </div>

        {/* Card */}
        <div className="bg-navy-800/80 backdrop-blur rounded-2xl p-8 card-glow">
          <h1 className="font-display text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-7">Sign in to manage pickups</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">Email</label>
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
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">Password</label>
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
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          New here?{' '}
          <Link to="/register" className="text-sky-400 hover:text-sky-300 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
