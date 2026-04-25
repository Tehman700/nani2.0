const STYLES = {
  pending:   'bg-amber-400/15 text-amber-300 border-amber-400/25',
  confirmed: 'bg-sky-400/15 text-sky-300 border-sky-400/25',
  picked_up: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/25',
  cancelled: 'bg-slate-400/15 text-slate-400 border-slate-400/25',
  no_show:   'bg-rose-400/15 text-rose-300 border-rose-400/25',
}

const LABELS = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
  no_show:   'No Show',
}

export function StatusChip({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide ${STYLES[status] ?? STYLES.pending}`}>
      {LABELS[status] ?? status}
    </span>
  )
}
