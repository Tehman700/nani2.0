import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, auth } from '../api/client'

const ROLES = [
  { value: 'parent',  label: 'Parent',  desc: 'Book pickups for your child' },
  { value: 'teacher', label: 'Teacher', desc: 'Manage pickup queue for your class' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'parent' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/register', form)
      auth.save(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen dot-bg flex items-center justify-center px-4 py-12">

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm enter">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-400/20 border border-sky-400/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white tracking-tight">nani<span className="text-sky-400">2.0</span></span>
          </div>
        </div>

        <div className="bg-navy-800/80 backdrop-blur rounded-2xl p-8 card-glow">
          <h1 className="font-display text-xl font-bold text-white mb-1">Create account</h1>
          <p className="text-slate-400 text-sm mb-6">Join the smart pickup system</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                className={`p-3 rounded-xl border text-left transition-all duration-150 ${
                  form.role === r.value
                    ? 'border-sky-400/50 bg-sky-400/10 text-sky-300'
                    : 'border-navy-600 text-slate-400 hover:border-navy-500'
                }`}
              >
                <div className="font-display font-bold text-sm">{r.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">Full Name</label>
              <input
                className="field"
                placeholder="Ali Hassan"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
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
                placeholder="Min 8 characters"
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
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/" className="text-sky-400 hover:text-sky-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
