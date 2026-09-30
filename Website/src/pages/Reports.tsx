import { useEffect, useState } from 'react'
import { money } from '../data/admin-utils'
import { getReport, type Report } from '../services/admin-finance'

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const range = (days: number) => {
  const to = new Date(),
    from = new Date()
  from.setDate(to.getDate() - days + 1)
  return [ymd(from), ymd(to)]
}
const n = (v: unknown) => Number(v || 0)
const badge = new Set([
  'SUCCESS',
  'PENDING',
  'FAILED',
  'CANCELLED',
  'ACTIVE',
  'INACTIVE',
  'EXPIRED',
  'CONFIRMED',
  'COMPLETED',
  'CHECKED_IN',
  'CHECKED_OUT',
])
function Table({
  title,
  eyebrow = 'TỔNG QUAN',
  heads,
  rows,
}: {
  title: string
  eyebrow?: string
  heads: string[]
  rows: (string | number)[][]
}) {
  return (
    <article className="report-card report-panel">
      <header className="panel-heading">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      </header>
      <div className="commerce-table-wrap">
        <table className="commerce-table report-table">
          <thead>
            <tr>
              {heads.map((x, i) => (
                <th className={i === heads.length - 1 ? 'numeric' : ''} key={x}>
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((x, j) => (
                  <td className={j === row.length - 1 ? 'numeric' : ''} key={j}>
                    {typeof x === 'string' && badge.has(x) ? (
                      <span
                        className={`status-badge status-${x.toLowerCase()}`}
                      >
                        {x}
                      </span>
                    ) : (
                      x
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="empty">Chưa có dữ liệu trong kỳ.</p>}
      </div>
    </article>
  )
}
function Bars({
  title,
  items,
  format,
}: {
  title: string
  items: { label: string; value: number }[]
  format: (value: number) => string
}) {
  const max = Math.max(1, ...items.map((x) => x.value))
  return (
    <article className="report-card report-panel chart-panel">
      <header className="panel-heading">
        <div>
          <span>XU HƯỚNG</span>
          <h2>{title}</h2>
        </div>
      </header>
      {items.length ? (
        <div className="data-bars">
          {items.map((x) => (
            <div className="data-bar" key={x.label}>
              <div className="bar-track">
                <i style={{ height: `${Math.max(6, (x.value / max) * 100)}%` }}>
                  <b>{format(x.value)}</b>
                </i>
              </div>
              <span>{x.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty">Chưa có dữ liệu trong kỳ.</p>
      )}
    </article>
  )
}
export default function Reports() {
  const initial = range(7),
    [from, setFrom] = useState(initial[0]),
    [to, setTo] = useState(initial[1]),
    [data, setData] = useState<Report>(),
    [error, setError] = useState('')
  useEffect(() => {
    if (from > to) {
      setError('Khoảng ngày không hợp lệ')
      return
    }
    getReport(from, to)
      .then((x) => {
        setData(x)
        setError('')
      })
      .catch((e) => setError(e.message))
  }, [from, to])
  const preset = (kind: 'today' | 'week' | 'month') => {
    const now = new Date()
    if (kind === 'today') {
      const x = ymd(now)
      setFrom(x)
      setTo(x)
    } else if (kind === 'week') {
      const [a, b] = range(7)
      setFrom(a)
      setTo(b)
    } else {
      setFrom(ymd(new Date(now.getFullYear(), now.getMonth(), 1)))
      setTo(ymd(now))
    }
  }
  return (
    <div className="reports-page commerce-page finance-admin-page reports-admin-page">
      <header className="report-heading">
        <div>
          <span>
            <i /> DỮ LIỆU CƠ SỞ DỮ LIỆU
          </span>
          <h1>BÁO CÁO & THỐNG KÊ</h1>
          <p>Doanh thu chỉ lấy giao dịch ThanhToan có trạng thái SUCCESS.</p>
        </div>
        <div className="report-actions">
          <nav>
            <button onClick={() => preset('today')}>Hôm nay</button>
            <button onClick={() => preset('week')}>7 ngày</button>
            <button onClick={() => preset('month')}>Tháng này</button>
          </nav>
          <div className="report-date-range">
            <label>
              Từ
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label>
              Đến
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>
        </div>
      </header>
      {error && <p className="empty">{error}</p>}
      {data && (
        <>
          <section className="report-summary">
            {[
              ['TỔNG DOANH THU', money(n(data.revenue.total)), 'SUCCESS'],
              ['GÓI TẬP', money(n(data.revenue.package)), 'Thanh toán gói'],
              ['SHOP', money(n(data.revenue.shop)), 'Thanh toán đơn hàng'],
              ['PT', 'Chưa có dữ liệu', 'Chưa có thanh toán PT'],
            ].map(([a, b, c]) => (
              <article key={a}>
                <header>
                  <span>{a}</span>
                </header>
                <strong>{b}</strong>
                <footer>
                  <span>{c}</span>
                </footer>
              </article>
            ))}
          </section>
          <section className="report-main">
            <Bars
              title="Doanh thu theo ngày"
              items={data.revenueByDay.map((x) => ({
                label: new Date(x.date).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                }),
                value: n(x.amount),
              }))}
              format={money}
            />
            <Table
              title="Theo phương thức"
              eyebrow="DOANH THU"
              heads={['Phương thức', 'Doanh thu']}
              rows={data.revenueByMethod.map((x) => [
                x.method,
                money(n(x.amount)),
              ])}
            />
          </section>
          <section className="report-main">
            <Table
              title="HỘI VIÊN"
              heads={['Chỉ số', 'Số lượng']}
              rows={[
                ['Tổng', n(data.members.total)],
                ['ACTIVE', n(data.members.active)],
                ['Mới trong kỳ', n(data.members.newMembers)],
                ['Đăng ký gói mới', n(data.members.newRegistrations)],
                ['Sắp hết hạn', n(data.members.expiring)],
                ['Hết hạn', n(data.members.expired)],
              ]}
            />
            <Table
              title="CHECK-IN"
              heads={['Chỉ số', 'Số lượt']}
              rows={[
                ['Tổng lượt', n(data.checkins.total)],
                ['CHECKED_IN', n(data.checkins.checkedIn)],
                ['CHECKED_OUT', n(data.checkins.checkedOut)],
                ...[...data.peakHours].map((x) => [
                  `Khung ${x.hour}:00`,
                  n(x.count),
                ]),
              ]}
            />
          </section>
          <section className="report-main">
            <Table
              title="SHOP"
              heads={['Chỉ số', 'Giá trị']}
              rows={[
                ['Số đơn', n(data.shop.total)],
                ['COMPLETED', n(data.shop.completed)],
                ['CANCELLED', n(data.shop.cancelled)],
                ['Doanh thu SUCCESS', money(n(data.shop.revenue))],
                ...data.topProducts.map((x) => [x.TenSanPham, n(x.quantity)]),
              ]}
            />
            <Table
              title="PT"
              heads={['Chỉ số', 'Số lượt']}
              rows={[
                ['Số lượt thuê', n(data.pt.total)],
                ['PENDING', n(data.pt.pending)],
                ['CONFIRMED', n(data.pt.confirmed)],
                ['COMPLETED', n(data.pt.completed)],
                ['CANCELLED', n(data.pt.cancelled)],
                ...data.topTrainers.map((x) => [x.HoTen, n(x.rentals)]),
              ]}
            />
          </section>
          <Bars
            title="Check-in theo ngày"
            items={data.checkinsByDay.map((x) => ({
              label: new Date(x.date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
              }),
              value: n(x.count),
            }))}
            format={(value) => `${value} lượt`}
          />
        </>
      )}
    </div>
  )
}
