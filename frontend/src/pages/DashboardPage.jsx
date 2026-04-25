import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, auth } from '../api/client'
import { StatusChip } from '../components/StatusChip'
import { useQueue } from '../hooks/useQueue'

function NavBar() {
  const navigate = useNavigate()
  function logout() { auth.clear(); navigate('/') }
  const isParent = auth.role() === 'parent'
  return (
    <header className="border-b border-navy-700/60 bg-navy-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-sky-400/20 border border-sky-400/30 flex items-center justify-center">
            <svg className="w-3 h-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-base tracking-tight">nani<span className="text-sky-400">2.0</span></span>
        </div>
        <div className="flex items-center gap-3">
          {isParent && (
            <Link to="/kids" className="text-sky-400 hover:text-sky-300 text-sm font-display font-bold transition-colors">
              My Children
            </Link>
          )}
          <button onClick={logout} className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </header>
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
    <div className="bg-navy-800/60 rounded-2xl border border-navy-700/60 overflow-hidden card-glow">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-navy-700/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-400/15 border border-sky-400/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-display font-bold text-white">Book a Pickup</span>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <form onSubmit={submit} className="px-5 pb-5 space-y-4 border-t border-navy-700/40 pt-5">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">Child</label>
            {kids.length === 0 ? (
              <p className="text-slate-500 text-sm py-2">
                No children added yet.{' '}
                <Link to="/kids" className="text-sky-400 hover:text-sky-300">Add a child first →</Link>
              </p>
            ) : (
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
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">Date</label>
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
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">Time</label>
              <select
                className="field"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                required
              >
                <option value="">Select time…</option>
                {TIME_SLOTS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-rose-300 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
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
  const userId = auth.userId()

  const myEntry = queue.find(e => e.parent?.id && auth.role() === 'parent')

  if (!sectionId) return null

  return (
    <div className="bg-navy-800/60 rounded-2xl border border-navy-700/60 card-glow overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-navy-700/40">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-white text-sm">Live Queue</span>
          <Link to={`/queue/${sectionId}`} className="text-xs text-sky-400 hover:text-sky-300 transition-colors ml-1">
            Full view →
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative w-2 h-2">
            {connected && <div className="absolute inset-0 rounded-full bg-emerald-400 live-ring" />}
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          </div>
          <span className="text-xs text-slate-400">{connected ? 'Live' : 'Connecting…'}</span>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="px-5 py-8 text-center text-slate-500 text-sm">Queue is empty</div>
      ) : (
        <div className="divide-y divide-navy-700/30">
          {queue.slice(0, 5).map((entry, i) => (
            <div key={entry.booking_id} className={`flex items-center gap-4 px-5 py-3.5 ${i === 0 ? 'bg-sky-400/5' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold shrink-0 ${
                entry.position === 1 ? 'bg-sky-400 text-navy-900' : 'bg-navy-700 text-slate-300'
              }`}>
                {entry.position}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{entry.student.name}</p>
                <p className="text-xs text-slate-500">{new Date(entry.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <StatusChip status={entry.status} />
            </div>
          ))}
          {queue.length > 5 && (
            <div className="px-5 py-3 text-center">
              <Link to={`/queue/${sectionId}`} className="text-xs text-sky-400 hover:text-sky-300">
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
    <div className="bg-navy-800/60 rounded-2xl border border-navy-700/60 card-glow overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-700/40">
        <span className="font-display font-bold text-white text-sm">Current Queue</span>
      </div>
      {loading ? (
        <div className="px-5 py-8 text-center text-slate-500 text-sm">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="px-5 py-8 text-center text-slate-500 text-sm">No active bookings</div>
      ) : (
        <div className="divide-y divide-navy-700/30">
          {bookings.map(entry => (
            <div key={entry.booking_id} className="flex items-start gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-sm font-display font-bold text-slate-300 shrink-0">
                {entry.position}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">{entry.student.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(entry.pickup_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
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
    <div className="min-h-screen dot-bg">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        <div className="enter enter-1">
          <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your child's school pickup</p>
        </div>

        <div className="enter enter-2">
          <BookingForm onBooked={onBooked} />
        </div>

        {sectionId && (
          <>
            <div className="enter enter-3">
              <QueueCard sectionId={sectionId} />
            </div>
            <div className="enter enter-4">
              <BookingsList refresh={refresh} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
