import { MetricCard } from './AdminLayout'
export function PageTop({
  trail,
  title,
  actions,
  metrics,
}: {
  trail: string
  title: string
  actions: React.ReactNode
  metrics: [string, string, string][]
}) {
  return (
    <>
      <header className="page-heading">
        <div>
          <p>KINH DOANH & THƯƠNG MẠI　›　{trail}</p>
          <h1>{title}</h1>
        </div>
        <div className="heading-actions">{actions}</div>
      </header>
      <section className="metrics-grid">
        {metrics.map(([label, value, note]) => (
          <MetricCard key={label} label={label} value={value} note={note} />
        ))}
      </section>
    </>
  )
}
export function Toast({ message }: { message: string }) {
  return message ? (
    <div className="toast" role="status">
      ✓ {message}
    </div>
  ) : null
}
