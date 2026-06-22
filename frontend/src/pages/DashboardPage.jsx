import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, auth } from '../api/client'
import { StatusChip } from '../components/StatusChip'
import { useQueue } from '../hooks/useQueue'

function NavBar() {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  function logout() { auth.clear(); navigate('/') }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-outline-variant transition-all duration-300">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setDrawerOpen(true)} className="flex flex-col gap-[5px] group" aria-label="Menu">
              <span className="block w-5 h-px bg-primary transition-all" />
              <span className="block w-3 h-px bg-primary transition-all group-hover:w-5" />
            </button>
            <span className="font-display text-base font-bold tracking-[-0.03em] uppercase">NANI 2.0</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/kids" className="label-sm text-secondary hover:text-primary transition-colors">
              Children
            </Link>
            <button onClick={logout} className="label-sm text-secondary hover:text-primary transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[59] bg-black/10" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full px-6 py-6 justify-center relative">
          <button className="absolute top-6 right-6" onClick={() => setDrawerOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="space-y-10">
            <div className="font-display text-[40px] font-bold tracking-[-0.03em] leading-none uppercase">NANI 2.0</div>
            <nav className="flex flex-col gap-5">
              <button onClick={() => { setDrawerOpen(false) }}
                className="flex items-center gap-4 text-primary hover:translate-x-2 transition-transform duration-300 text-left">
                <span className="font-display text-[28px] font-bold uppercase tracking-tighter">Dashboard</span>
              </button>
              <Link to="/kids" onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-4 text-secondary hover:text-primary hover:translate-x-2 transition-all duration-300">
                <span className="font-display text-[28px] font-bold uppercase tracking-tighter">My Children</span>
              </Link>
              <button onClick={logout}
                className="flex items-center gap-4 text-secondary hover:text-primary hover:translate-x-2 transition-all duration-300 text-left">
                <span className="font-display text-[28px] font-bold uppercase tracking-tighter">Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}

const TIME_SLOTS = (() => {
  const slots = []
  for (let h = 12; h <= 15; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 15 && m > 0) break
      const hour12 = h > 12 ? h - 12 : h
      const label  = `${hour12}:${String(m).padStart(2, '0')} PM`
      const value  = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      slots.push({ label, value })
    }
  }
  return slots
})()

function BookingForm({ onBooked }) {
  const [kids, setKids]       = useState([])
  const [form, setForm]       = useState({ student_id: '', date: '', time: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [open, setOpen]       = useState(false)

  useEffect(() => {
    if (open && kids.length === 0) {
      api.get('/student/my-kids').then(setKids).catch(() => {})
    }
  }, [open])

  const today = new Date().toISOString().split('T')[0]

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const pickup_time = new Date(`${form.date}T${form.time}:00`).toISOString()
      await api.post('/booking/create', { student_id: form.student_id, pickup_time })
      const kid = kids.find(k => k.id === form.student_id)
      if (kid?.section_id) {
        localStorage.setItem('nani_section', kid.section_id)
        onBooked(kid.section_id)
      }
      setForm(f => ({ ...f, student_id: '', time: '' }))
      setOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-primary flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-display font-bold tracking-tight">Book a Pickup</span>
        </div>
        <svg className={`w-4 h-4 text-secondary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <form onSubmit={submit} className="px-6 pb-6 space-y-7 border-t border-outline-variant pt-6">
          <div>
            <label className="label-sm block mb-2">Child</label>
            {kids.length === 0 ? (
              <p className="text-sm text-secondary py-2">
                No children added yet.{' '}
                <Link to="/kids" className="text-primary font-semibold hover:opacity-60 transition-opacity">
                  Add a child first →
                </Link>
              </p>
            ) : (
              <div className="relative">
                <select
                  className="field"
                  value={form.student_id}
                  onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                  required
                >
                  <option value="">Select a child…</option>
                  {kids.map(k => (
                    <option key={k.id} value={k.id}>{k.name} — {k.class_name} {k.section_name}</option>
                  ))}
                </select>
                <svg className="absolute right-0 bottom-3 w-3 h-3 text-secondary pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="label-sm block mb-2">Date</label>
              <input
                type="date"
                className="field"
                min={today}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label-sm block mb-2">Time</label>
              <div className="relative">
                <select
                  className="field"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  required
                >
                  <option value="">Select…</option>
                  {TIME_SLOTS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <svg className="absolute right-0 bottom-3 w-3 h-3 text-secondary pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {error && (
            <p className="border border-error/30 bg-error-container/40 px-4 py-3 text-error text-sm">{error}</p>
          )}
          <button type="submit" className="btn-primary" disabled={loading || kids.length === 0}>
            {loading ? 'Booking…' : 'Confirm Pickup Slot'}
          </button>
        </form>
      )}
    </div>
  )
}

function QueueCard({ sectionId }) {
  const { queue, connected } = useQueue(sectionId)

  if (!sectionId) return null

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold tracking-tight text-sm">Live Queue</span>
          <Link to={`/queue/${sectionId}`} className="label-xs text-secondary hover:text-primary transition-colors">
            Full view →
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-2 h-2">
            {connected && <div className="absolute inset-0 rounded-full bg-primary live-ring" />}
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-primary' : 'bg-outline-variant'}`} />
          </div>
          <span className="label-xs">{connected ? 'Live' : 'Connecting…'}</span>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-secondary">Queue is empty</div>
      ) : (
        <div className="divide-y divide-outline-variant">
          {queue.slice(0, 5).map((entry, i) => (
            <div key={entry.booking_id} className={`flex items-center gap-4 px-6 py-4 ${i === 0 ? 'bg-surface-container-low' : ''}`}>
              <div className={`w-8 h-8 flex items-center justify-center text-sm font-display font-bold shrink-0 border ${
                entry.position === 1
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-white text-on-surface border-outline-variant'
              }`}>
                {entry.position}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{entry.student.name}</p>
                <p className="label-xs mt-0.5">
                  {new Date(entry.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>
              <StatusChip status={entry.status} />
            </div>
          ))}
          {queue.length > 5 && (
            <div className="px-6 py-3 text-center">
              <Link to={`/queue/${sectionId}`} className="label-xs text-secondary hover:text-primary transition-colors">
                +{queue.length - 5} more — view all
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BookingsList({ refresh }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(false)
  const sectionId = localStorage.getItem('nani_section')

  useEffect(() => {
    if (!sectionId) return
    setLoading(true)
    api.get(`/queue/${sectionId}`)
      .then(data => setBookings(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refresh, sectionId])

  async function cancel(bookingId) {
    try {
      await api.post('/booking/cancel', { booking_id: bookingId })
      setBookings(b => b.filter(x => x.booking_id !== bookingId))
    } catch (err) {
      alert(err.message)
    }
  }

  if (!sectionId) return null

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant">
        <span className="font-display font-bold tracking-tight text-sm">Current Queue</span>
      </div>
      {loading ? (
        <div className="px-6 py-10 text-center text-sm text-secondary">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-secondary">No active bookings</div>
      ) : (
        <div className="divide-y divide-outline-variant">
          {bookings.map(entry => (
            <div key={entry.booking_id} className="flex items-start gap-4 px-6 py-4">
              <div className="w-8 h-8 border border-outline-variant flex items-center justify-center text-sm font-display font-bold text-secondary shrink-0">
                {entry.position}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface">{entry.student.name}</p>
                <p className="label-xs mt-0.5">
                  {new Date(entry.pickup_time).toLocaleDateString([], { dateStyle: 'short' })}{' '}
                  {new Date(entry.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
                <div className="mt-2">
                  <StatusChip status={entry.status} />
                </div>
              </div>
              {(entry.status === 'pending' || entry.status === 'confirmed') && (
                <button onClick={() => cancel(entry.booking_id)} className="btn-danger shrink-0">
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [sectionId, setSectionId] = useState(localStorage.getItem('nani_section') || '')
  const [refresh, setRefresh]     = useState(0)

  function onBooked(sid) {
    setSectionId(sid)
    setRefresh(r => r + 1)
  }

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        <div className="stagger delay-1">
          <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] leading-none">Dashboard</h1>
          <p className="text-sm text-secondary mt-2">Manage your child's school pickup</p>
        </div>

        <div className="stagger delay-2">
          <BookingForm onBooked={onBooked} />
        </div>

        {sectionId && (
          <>
            <div className="stagger delay-3">
              <QueueCard sectionId={sectionId} />
            </div>
            <div className="stagger delay-4">
              <BookingsList refresh={refresh} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
