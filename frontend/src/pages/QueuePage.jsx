import { useParams, Link } from 'react-router-dom'
import { useQueue } from '../hooks/useQueue'
import { StatusChip } from '../components/StatusChip'

export default function QueuePage() {
  const { sectionId } = useParams()
  const { queue, connected } = useQueue(sectionId)

  const inQueue   = queue.filter(e => ['pending', 'confirmed'].includes(e.status)).length
  const pickedUp  = queue.filter(e => e.status === 'picked_up').length

  return (
    <div className="min-h-screen bg-surface">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-outline-variant">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 label-sm text-secondary hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <span className="w-px h-4 bg-outline-variant" />
            <span className="font-display font-bold tracking-tight text-sm uppercase">Live Queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-2 h-2">
              {connected && <div className="absolute inset-0 rounded-full bg-primary live-ring" />}
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-primary' : 'bg-outline-variant'}`} />
            </div>
            <span className="label-xs">{connected ? 'Live' : 'Reconnecting…'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Stats row */}
        <div className="stagger delay-1 grid grid-cols-3 gap-px bg-outline-variant mb-10 border border-outline-variant">
          {[
            { label: 'In Queue',  value: inQueue },
            { label: 'Picked Up', value: pickedUp },
            { label: 'Total',     value: queue.length },
          ].map(s => (
            <div key={s.label} className="bg-white px-6 py-5">
              <div className="font-display text-3xl font-bold tracking-tighter">{s.value}</div>
              <div className="label-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Queue list */}
        {queue.length === 0 ? (
          <div className="stagger delay-2 text-center py-24 border border-outline-variant bg-white">
            <div className="w-12 h-12 border border-outline-variant flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-display font-bold text-sm uppercase tracking-wide">Queue is empty</p>
            <p className="text-sm text-secondary mt-1">Waiting for pickup bookings…</p>
          </div>
        ) : (
          <div className="stagger delay-2 border border-outline-variant bg-white divide-y divide-outline-variant">
            {queue.map((entry, i) => (
              <div
                key={entry.booking_id}
                className="stagger flex items-center gap-4 p-5 hover:bg-surface-container-low transition-colors"
                style={{ animationDelay: `${0.3 + i * 0.05}s` }}
              >
                {/* Position badge */}
                <div className={`shrink-0 w-10 h-10 flex items-center justify-center font-display text-lg font-bold border ${
                  entry.position === 1
                    ? 'bg-primary text-on-primary border-primary'
                    : entry.position <= 3
                    ? 'bg-white text-on-surface border-primary'
                    : 'bg-white text-secondary border-outline-variant'
                }`}>
                  {entry.position}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-display font-bold text-on-surface leading-none">{entry.student.name}</p>
                    <StatusChip status={entry.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="label-xs">
                      {new Date(entry.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                    {entry.parent?.phone && (
                      <span className="label-xs">{entry.parent.phone}</span>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className="shrink-0 text-right hidden sm:block">
                  <div className="label-xs">Priority</div>
                  <div className="font-display font-bold text-sm mt-0.5">{Math.round(entry.priority_score)}</div>
                </div>

                {/* Position 1 left accent */}
                {entry.position === 1 && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
