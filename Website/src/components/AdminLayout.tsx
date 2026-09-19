import type { ReactNode } from 'react'

export function MetricCard({
  label,
  value,
  note,
  tone = 'lime',
}: {
  label: string
  value: string
  note: string
  tone?: string
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  )
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}
