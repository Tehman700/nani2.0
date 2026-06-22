const STYLES = {
  pending:   'border border-outline text-secondary',
  confirmed: 'bg-primary text-on-primary border border-primary',
  picked_up: 'bg-surface-container-highest text-on-surface border border-outline-variant',
  cancelled: 'border border-outline-variant text-outline',
  no_show:   'text-outline border border-outline-variant opacity-60',
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
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase ${STYLES[status] ?? STYLES.pending}`}>
      {LABELS[status] ?? status}
    </span>
  )
}
