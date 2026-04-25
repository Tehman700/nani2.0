import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, auth } from '../api/client'
import { useTeacherQueue } from '../hooks/useTeacherQueue'

const STATUS_STYLES = {
  pending:   'bg-amber-400/10 text-amber-300 border-amber-400/20',
  confirmed: 'bg-sky-400/10 text-sky-300 border-sky-400/20',
  picked_up: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  cancelled: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  no_show:   'bg-slate-400/10 text-slate-400 border-slate-400/20',
}

const STATUS_LABELS = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
  no_show:   'No Show',
}

function NavBar() {
  const navigate = useNavigate()
  function logout() { auth.clear(); navigate('/') }
  return (
    <header className="border-b border-navy-700/60 bg-navy-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/teacher')} className="text-slate-400 hover:text-slate-200 text-sm transition-colors mr-2">
            ← Students
          </button>
          <div className="w-6 h-6 rounded-md bg-sky-400/20 border border-sky-400/30 flex items-center justify-center">
            <svg className="w-3 h-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-base tracking-tight">nani<span className="text-sky-400">2.0</span></span>
        </div>
        <button onClick={logout} className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
          Sign out
        </button>
      </div>
    </header>
  )
}

function QueueRow({ entry }) {
  const isFirst = entry.position === 1
  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${isFirst ? 'bg-sky-400/5' : ''}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-display font-bold shrink-0 ${
        isFirst ? 'bg-sky-400 text-navy-900' : 'bg-navy-700 text-slate-300'
      }`}>
        {entry.position}
      </div>

      {entry.student.photo_url ? (
        <img src={entry.student.photo_url} alt={entry.student.name}
          className="w-10 h-10 rounded-full object-cover border border-navy-600 shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{entry.student.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">Roll #{entry.student.roll_number}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs text-slate-300 font-medium">
          {new Date(entry.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[entry.status] || STATUS_STYLES.pending}`}>
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
    <div className="min-h-screen dot-bg">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        <div className="enter enter-1 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Today's Queue</h1>
            <p className="text-slate-400 text-sm mt-1">{today}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="relative w-2 h-2">
              {connected && <div className="absolute inset-0 rounded-full bg-emerald-400 live-ring" />}
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </div>
            <span className="text-xs text-slate-400">{connected ? 'Live' : 'Connecting…'}</span>
          </div>
        </div>

        {queue.length > 0 && (
          <div className="enter enter-2 grid grid-cols-3 gap-3">
            {[
              { label: 'In Queue', value: queue.length, color: 'text-sky-400' },
              { label: 'Pending',  value: queue.filter(e => e.status === 'pending').length,   color: 'text-amber-400' },
              { label: 'Confirmed', value: queue.filter(e => e.status === 'confirmed').length, color: 'text-emerald-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-navy-800/60 rounded-xl border border-navy-700/60 p-4 text-center">
                <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="enter enter-3 bg-navy-800/60 rounded-2xl border border-navy-700/60 card-glow overflow-hidden">
          {loading ? (
            <div className="px-5 py-12 text-center text-slate-500 text-sm">Loading…</div>
          ) : queue.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-slate-400 text-sm">No bookings for today yet.</p>
              <p className="text-slate-500 text-xs mt-1">This will update live when parents book pickups.</p>
            </div>
          ) : (
            <div className="divide-y divide-navy-700/30">
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
