import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, auth } from '../api/client'

function formatCnic(value) {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

const ROLES = [
  { value: 'parent',  label: 'Parent',  desc: 'Book pickups for your child' },
  { value: 'teacher', label: 'Teacher', desc: 'Manage pickup queue' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'parent', cnic: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.cnic) delete payload.cnic
      const data = await api.post('/auth/register', payload)
      auth.save(data)
      navigate(data.role === 'teacher' ? '/teacher' : '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-16">

      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="stagger delay-1 mb-12">
          <div className="font-display text-[40px] font-bold tracking-[-0.03em] leading-none uppercase mb-2">
            NANI 2.0
          </div>
          <p className="label-xs">Smart School Pickup System</p>
        </div>

        <div className="stagger delay-2">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Create account</h1>
          <p className="text-sm text-secondary mb-8">Join the smart pickup system</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                className={`p-4 border text-left transition-all duration-200 ${
                  form.role === r.value
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-white border-outline-variant text-on-surface hover:border-primary'
                }`}
              >
                <div className="font-display font-bold text-sm tracking-tight">{r.label}</div>
                <div className="text-xs mt-0.5 opacity-70 font-body">{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="label-sm block mb-2">Full Name</label>
              <input
                className="field"
                placeholder="Ali Hassan"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
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
                placeholder="Min 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            {form.role === 'teacher' && (
              <div className="stagger delay-1">
                <label className="label-sm block mb-2">CNIC</label>
                <input
                  className="field"
                  placeholder="42201-1234567-1"
                  value={form.cnic}
                  onChange={e => setForm(f => ({ ...f, cnic: formatCnic(e.target.value) }))}
                  required
                />
                <p className="text-xs text-outline mt-2">Parents will link students to you using this CNIC</p>
              </div>
            )}

            {error && (
              <div className="border border-error/30 bg-error-container/40 px-4 py-3 text-error text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="stagger delay-3 mt-10 pt-8 border-t border-outline-variant">
          <p className="text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/" className="text-primary font-semibold hover:opacity-60 transition-opacity">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
