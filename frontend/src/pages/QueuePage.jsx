import { useParams, Link } from 'react-router-dom'
import { useQueue } from '../hooks/useQueue'
import { StatusChip } from '../components/StatusChip'
import { auth } from '../api/client'

export default function QueuePage() {
  const { sectionId } = useParams()
  const { queue, connected } = useQueue(sectionId)

  return (
    <div className="min-h-screen dot-bg">

      {/* Header */}
      <header className="border-b border-navy-700/60 bg-navy-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="font-display font-bold text-white text-base">Live Queue</span>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-2 bg-navy-800/60 border border-navy-700/40 rounded-full px-3 py-1.5">
            <div className="relative w-2 h-2">
              {connected && <div className="absolute inset-0 rounded-full bg-emerald-400 live-ring" />}
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            </div>
            <span className="text-xs text-slate-400">{connected ? 'Live' : 'Reconnecting…'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-8 enter enter-1">
          {[
            { label: 'In Queue', value: queue.filter(e => ['pending','confirmed'].includes(e.status)).length },
            { label: 'Picked Up', value: queue.filter(e => e.status === 'picked_up').length },
            { label: 'Total', value: queue.length },
          ].map(s => (
            <div key={s.label} className="bg-navy-800/60 border border-navy-700/40 rounded-xl p-4 text-center">
              <div className="font-display text-2xl font-bold text-sky-400">{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Queue list */}
        {queue.length === 0 ? (
          <div className="text-center py-24 enter enter-2">
            <div className="w-16 h-16 rounded-2xl bg-navy-800/60 border border-navy-700/40 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">Queue is empty</p>
            <p className="text-slate-500 text-sm mt-1">Waiting for pickup bookings…</p>
          </div>
        ) : (
          <div className="space-y-2">
            {queue.map((entry, i) => (
              <div
                key={entry.booking_id}
                className="enter bg-navy-800/60 border border-navy-700/40 rounded-2xl overflow-hidden hover:border-navy-600/60 transition-colors"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <div className="flex items-center gap-4 p-4">

                  {/* Position badge */}
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-display text-lg font-bold ${
                    entry.position === 1
                      ? 'bg-sky-400 text-navy-900 shadow-lg shadow-sky-400/20'
                      : entry.position <= 3
                      ? 'bg-navy-700 text-sky-300 border border-sky-400/20'
                      : 'bg-navy-700/60 text-slate-400'
                  }`}>
                    {entry.position}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold text-white text-base leading-none">{entry.student.name}</p>
                      <StatusChip status={entry.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(entry.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                      {entry.parent?.phone && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {entry.parent.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Priority score */}
                  <div className="shrink-0 text-right hidden sm:block">
                    <div className="text-xs text-slate-500">Priority</div>
                    <div className="text-sm font-display font-bold text-slate-300">
                      {Math.round(entry.priority_score)}
                    </div>
                  </div>
                </div>

                {/* Position 1 highlight bar */}
                {entry.position === 1 && (
                  <div className="h-0.5 bg-gradient-to-r from-sky-400/60 via-sky-400/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
