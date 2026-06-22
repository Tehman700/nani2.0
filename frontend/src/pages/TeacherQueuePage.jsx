import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, auth } from '../api/client'
import { useTeacherQueue } from '../hooks/useTeacherQueue'

const STATUS_LABELS = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
  no_show:   'No Show',
}

const STATUS_STYLES = {
  pending:   'border border-outline text-secondary',
  confirmed: 'bg-primary text-on-primary border border-primary',
  picked_up: 'bg-surface-container-highest text-on-surface border border-outline-variant',
  cancelled: 'border border-outline-variant text-outline',
  no_show:   'border border-outline-variant text-outline opacity-60',
}

function NavBar() {
  const navigate = useNavigate()
  function logout() { auth.clear(); navigate('/') }
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-outline-variant">
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/teacher" className="flex items-center gap-2 label-sm text-secondary hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Students
          </Link>
          <span className="w-px h-4 bg-outline-variant" />
          <span className="font-display font-bold tracking-tight text-sm uppercase">Today's Queue</span>
        </div>
        <button onClick={logout} className="label-sm text-secondary hover:text-primary transition-colors">
          Sign Out
        </button>
      </div>
    </header>
  )
}

function QueueRow({ entry }) {
  const isFirst = entry.position === 1
  return (
    <div className={`flex items-center gap-4 px-6 py-4 transition-colors ${isFirst ? 'bg-surface-container-low' : 'hover:bg-surface-container-low'}`}>
      <div className={`w-9 h-9 flex items-center justify-center text-sm font-display font-bold shrink-0 border ${
        isFirst
          ? 'bg-primary text-on-primary border-primary'
          : 'bg-white text-secondary border-outline-variant'
      }`}>
        {entry.position}
      </div>

      {entry.student.photo_url ? (
        <img src={entry.student.photo_url} alt={entry.student.name}
          className="w-10 h-10 object-cover border border-outline-variant shrink-0" />
      ) : (
        <div className="w-10 h-10 border border-outline-variant bg-surface-container flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface">{entry.student.name}</p>
        <p className="label-xs mt-0.5">Roll #{entry.student.roll_number}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-on-surface">
          {new Date(entry.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </p>
        <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase ${STATUS_STYLES[entry.status] || STATUS_STYLES.pending}`}>
          {STATUS_LABELS[entry.status] || entry.status}
        </span>
      </div>
    </div>
  )
}

export default function TeacherQueuePage() {
  const cnic = auth.cnic()
  const { queue, setQueue, connected } = useTeacherQueue(cnic)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/teacher/today-queue')
      .then(data => setQueue(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        <div className="stagger delay-1 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] leading-none">Today's Queue</h1>
            <p className="text-sm text-secondary mt-2">{today}</p>
          </div>
          <div className="flex items-center gap-2 mt-2 shrink-0">
            <div className="relative w-2 h-2">
              {connected && <div className="absolute inset-0 rounded-full bg-primary live-ring" />}
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-primary' : 'bg-outline-variant'}`} />
            </div>
            <span className="label-xs">{connected ? 'Live' : 'Connecting…'}</span>
          </div>
        </div>

        {queue.length > 0 && (
          <div className="stagger delay-2 grid grid-cols-3 gap-px bg-outline-variant border border-outline-variant">
            {[
              { label: 'In Queue',  value: queue.length },
              { label: 'Pending',   value: queue.filter(e => e.status === 'pending').length },
              { label: 'Confirmed', value: queue.filter(e => e.status === 'confirmed').length },
            ].map(stat => (
              <div key={stat.label} className="bg-white px-5 py-4 text-center">
                <p className="font-display text-3xl font-bold tracking-tighter">{stat.value}</p>
                <p className="label-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="stagger delay-3 card overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-secondary">Loading…</div>
          ) : queue.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-display font-bold uppercase tracking-wide text-sm mb-2">No bookings today</p>
              <p className="text-sm text-secondary">This will update live when parents book pickups.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {queue.map(entry => (
                <QueueRow key={entry.booking_id} entry={entry} />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
