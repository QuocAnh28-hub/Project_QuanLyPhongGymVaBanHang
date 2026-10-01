import { useEffect, useState } from 'react'
import {
  dashboardDate,
  dashboardTimestamp,
  dashboardTimeZone,
  summarizeDashboard,
  type DashboardData,
} from '../data/dashboard'
import { loadDashboard } from '../services/dashboard'
import { money } from '../services/members'
import { orderLabel } from '../services/orders'
import { ptStatus } from '../services/trainers'

const number = (value: unknown) => Number(value || 0).toLocaleString('vi-VN')
const dateLabel = (value: string) =>
  dashboardDate(value).split('-').reverse().join('/')
const timeLabel = (value: string) =>
  new Date(dashboardTimestamp(value)).toLocaleTimeString('vi-VN', {
    timeZone: dashboardTimeZone,
  })
type Navigate = (page: string, tab?: number) => void

export default function DashboardPage({
  onNavigate,
}: {
  onNavigate: Navigate
}) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    async function refresh() {
      setLoading(true)
      try {
        const fresh = await loadDashboard(controller.signal)
        if (!controller.signal.aborted) {
          setData(fresh)
          setError('')
        }
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error ? cause.message : 'Không thể tải Dashboard.'
          )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          timer = setTimeout(() => {
            void refresh()
          }, 60_000)
        }
      }
    }
    void refresh()
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [version])

  const today = data?.today || dashboardDate(new Date())
  return (
    <div className="dashboard dashboard-api">
      <section className="dashboard-hero">
        <div className="hero-copy">
          <b className="live">TỔNG QUAN VẬN HÀNH</b>
          <h1>TRUNG TÂM ĐIỀU HÀNH</h1>
          <p>
            Theo dõi hội viên, doanh thu, check-in, lịch huấn luyện và đơn hàng.
          </p>
          <p>Tự động cập nhật mỗi 60 giây · Giờ Việt Nam (UTC+7).</p>
        </div>
        <div className="hero-actions">
          <button className="primary" onClick={() => onNavigate('Hội viên')}>
            Quản lý hội viên
          </button>
          <button onClick={() => onNavigate('Check-In')}>
            Giám sát check-in
          </button>
          <button onClick={() => onNavigate('Đơn hàng')}>
            Quản lý đơn hàng
          </button>
          <button onClick={() => onNavigate('Báo cáo thống kê')}>
            Xem báo cáo
          </button>
        </div>
        <div className="hero-status">
          <b>Ngày thống kê: {dateLabel(today)}</b>
          <span role="status">
            {loading
              ? 'Đang cập nhật…'
              : error
                ? 'Cập nhật thất bại'
                : data
                  ? `Đã cập nhật: ${timeLabel(data.updatedAt)}`
                  : 'Chưa có dữ liệu'}
          </span>
          <button disabled={loading} onClick={() => setVersion((v) => v + 1)}>
            ↻ Làm mới
          </button>
        </div>
      </section>
      {error && (
        <div className="dashboard-error" role="alert">
          <p>{error}</p>
          {data && (
            <p>
              Đang hiển thị dữ liệu cũ lúc {timeLabel(data.updatedAt)}, ngày{' '}
              {dateLabel(data.updatedAt)}. Chưa có dữ liệu cập nhật.
            </p>
          )}
          <button disabled={loading} onClick={() => setVersion((v) => v + 1)}>
            Thử lại
          </button>
        </div>
      )}
      {!data && loading && (
        <p className="dashboard-empty" role="status">
          Đang tải dữ liệu Dashboard…
        </p>
      )}
      {data && <DashboardContent data={data} onNavigate={onNavigate} />}
    </div>
  )
}

function DashboardContent({
  data,
  onNavigate,
}: {
  data: DashboardData
  onNavigate: Navigate
}) {
  const summary = summarizeDashboard(data)
  const { report, checkins } = data
  const totalRevenue = Number(report.revenue.total || 0)
  const breakdown = [
    { label: 'Gói tập', amount: Number(report.revenue.package || 0) },
    { label: 'Cửa hàng', amount: Number(report.revenue.shop || 0) },
    {
      label: 'Chưa phân loại',
      amount: Math.max(
        0,
        totalRevenue -
          Number(report.revenue.package || 0) -
          Number(report.revenue.shop || 0)
      ),
    },
  ]
  const cards = [
    {
      title: 'Hội viên hoạt động',
      icon: '♙',
      value: number(report.members.active),
      note: `${number(report.members.newMembers)} hội viên mới trong tháng`,
      details: [
        `Tổng hội viên: ${number(report.members.total)}`,
        `Gói hết hạn trong 7 ngày: ${number(report.members.expiring)}`,
      ],
    },
    {
      title: 'Thực thu tháng này',
      icon: '▤',
      value: money(totalRevenue),
      note: 'Từ đầu tháng đến hôm nay',
      details: [
        `Gói tập: ${money(Number(report.revenue.package || 0))}`,
        `Cửa hàng: ${money(Number(report.revenue.shop || 0))}`,
      ],
    },
    {
      title: 'Check-in hôm nay',
      icon: '✓',
      value: `${number(checkins.metrics.total)} lượt`,
      note: `${number(checkins.metrics.present)} phiên hôm nay chưa check-out`,
      details: [
        `Đã check-out: ${number(checkins.metrics.checkedOut)} lượt`,
        'Thống kê các phiên bắt đầu hôm nay',
      ],
    },
    {
      title: 'Đơn hàng mới hôm nay',
      icon: '▢',
      value: `${number(summary.todayOrders.length)} đơn`,
      note: `${number(summary.pendingOrders.length)} đơn cần xử lý toàn hệ thống`,
      details: [
        `Hoàn tất: ${summary.todayOrders.filter((o) => o.TrangThai === 'COMPLETED').length}`,
        `Đã hủy: ${summary.todayOrders.filter((o) => o.TrangThai === 'CANCELLED').length}`,
      ],
    },
    {
      title: 'Lịch PT hôm nay',
      icon: '⚡',
      value: `${number(summary.sessions.length)} buổi`,
      note: `${number(summary.activeTrainers)} HLV đang hoạt động`,
      details: [
        `Hoàn thành: ${summary.sessions.filter((s) => s.TrangThai === 'COMPLETED').length}`,
        `Sắp diễn ra: ${summary.upcoming.length}`,
        `Đã hủy: ${summary.sessions.filter((s) => s.TrangThai === 'CANCELLED').length}`,
      ],
    },
  ]
  const maxRevenue = Math.max(1, ...summary.revenueDays.map((d) => d.amount))
  const points = summary.revenueDays.map((d, i) => ({
    ...d,
    x:
      summary.revenueDays.length === 1
        ? 300
        : 20 + (i * 560) / (summary.revenueDays.length - 1),
    y: 165 - (d.amount / maxRevenue) * 140,
  }))
  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`)
    .join(' ')
  const peak = Math.max(0, ...summary.hours.map((h) => h.count))
  return (
    <>
      <section className="dashboard-metrics">
        {cards.map((card) => (
          <article className="dash-metric" key={card.title}>
            <div className="metric-top">
              <span>TỔNG QUAN</span>
              <i aria-hidden="true">{card.icon}</i>
            </div>
            <h2>{card.title}</h2>
            <strong>{card.value}</strong>
            <em>{card.note}</em>
            <div className="metric-details">
              {card.details.map((detail) => (
                <div key={detail}>{detail}</div>
              ))}
            </div>
          </article>
        ))}
      </section>
      <section className="dashboard-main-grid">
        <div className="dashboard-left">
          <article className="dash-card revenue-card">
            <span className="dash-eyebrow">THANH TOÁN THÀNH CÔNG</span>
            <h2>
              Thực thu từng ngày · {data.today.slice(5, 7)}/
              {data.today.slice(0, 4)}
            </h2>
            <div className="chart-legend">
              <b>Tổng: {money(totalRevenue)}</b>
              <span>
                Cao nhất/ngày:{' '}
                {money(
                  Math.max(0, ...summary.revenueDays.map((d) => d.amount))
                )}
              </span>
            </div>
            <div className="revenue-chart">
              <div className="chart-dates">
                <span>01/{data.today.slice(5, 7)}</span>
                <span>Đến {dateLabel(data.today)}</span>
              </div>
              <svg
                viewBox="0 0 600 190"
                role="img"
                aria-label={`Thực thu từng ngày, tổng ${money(totalRevenue)}`}
              >
                <path className="actual-line" d={line} />
                {points.map((p) => (
                  <circle key={p.date} cx={p.x} cy={p.y} r="3">
                    <title>
                      {dateLabel(p.date)}: {money(p.amount)}
                    </title>
                  </circle>
                ))}
              </svg>
            </div>
            {totalRevenue === 0 && (
              <p className="dashboard-empty">
                Chưa có thanh toán thành công trong tháng.
              </p>
            )}
            <details className="dashboard-chart-details">
              <summary>Xem số liệu từng ngày</summary>
              <dl className="dashboard-facts">
                {summary.revenueDays.map((d) => (
                  <div key={d.date}>
                    <dt>{dateLabel(d.date)}</dt>
                    <dd>{money(d.amount)}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <footer>
              Chỉ tính khoản thanh toán thành công; giá trị đơn hàng chưa thanh
              toán không phải thực thu.
            </footer>
          </article>
          <article className="dash-card heatmap-card">
            <span className="dash-eyebrow">CHECK-IN HÔM NAY</span>
            <h2>Lượt check-in theo giờ</h2>
            <div className="dashboard-hours-scroll">
              <div className="heatmap dashboard-hours">
                {summary.hours.map(({ hour, count }) => (
                  <div key={hour} aria-label={`${hour} giờ: ${count} lượt`}>
                    <b>{count}</b>
                    <i
                      className={peak > 0 && count === peak ? 'hot' : ''}
                      style={{
                        height: `${peak ? (count / peak) * 85 : 0}px`,
                        borderWidth: count ? 1 : 0,
                      }}
                    />
                    <span>{String(hour).padStart(2, '0')}h</span>
                  </div>
                ))}
              </div>
            </div>
            <footer>
              {peak
                ? `Cao điểm: ${summary.hours
                    .filter((h) => h.count === peak)
                    .map((h) => `${h.hour}h`)
                    .join(', ')} (${peak} lượt/giờ).`
                : 'Chưa có lượt check-in hôm nay.'}
            </footer>
          </article>
        </div>
        <div className="dashboard-right dashboard-stack">
          <article className="dash-card">
            <span className="dash-eyebrow">CƠ CẤU THỰC THU THÁNG</span>
            <h2>Doanh thu theo nguồn</h2>
            {breakdown.map((item) => (
              <div className="dashboard-revenue-source" key={item.label}>
                <div>
                  <span>{item.label}</span>
                  <strong>{money(item.amount)}</strong>
                </div>
                <progress
                  aria-label={item.label}
                  max={Math.max(1, totalRevenue)}
                  value={item.amount}
                />
              </div>
            ))}
            <p className="dashboard-note">
              Doanh thu PT chưa được thống kê riêng trong dữ liệu thanh toán.
            </p>
          </article>
          <article className="dash-card">
            <span className="dash-eyebrow">CẦN THEO DÕI</span>
            <h2>Công việc vận hành</h2>
            <button
              className="dashboard-task"
              onClick={() => onNavigate('Gói tập', 1)}
            >
              <span>Gói tập hết hạn trong 7 ngày</span>
              <b>{number(report.members.expiring)} →</b>
            </button>
            <button
              className="dashboard-task"
              onClick={() => onNavigate('Huấn luyện viên', 1)}
            >
              <span>Lịch PT hôm nay chờ xác nhận</span>
              <b>
                {
                  summary.sessions.filter((s) => s.TrangThai === 'PENDING')
                    .length
                }{' '}
                →
              </b>
            </button>
            <button
              className="dashboard-task"
              onClick={() => onNavigate('Đơn hàng')}
            >
              <span>Đơn hàng chờ xử lý</span>
              <b>
                {
                  summary.pendingOrders.filter((o) => o.TrangThai === 'PENDING')
                    .length
                }{' '}
                →
              </b>
            </button>
            <button
              className="dashboard-task"
              onClick={() => onNavigate('Check-In')}
            >
              <span>Phiên hôm nay chưa check-out</span>
              <b>{number(checkins.metrics.present)} →</b>
            </button>
          </article>
        </div>
      </section>
      <section className="operations-grid">
        <article className="dash-card activity-card">
          <div className="dashboard-section-heading">
            <h2>Check-in gần nhất hôm nay</h2>
            <button onClick={() => onNavigate('Check-In', 1)}>
              Xem lịch sử →
            </button>
          </div>
          {summary.latestCheckins.length ? (
            summary.latestCheckins.map((row) => (
              <div className="activity" key={row.CheckInID}>
                <span>
                  <strong>{row.HoTen || `Hội viên #${row.HoiVienID}`}</strong>
                  <small>
                    {timeLabel(row.ThoiGianCheckIn)} · HV #{row.HoiVienID}
                  </small>
                </span>
                <b>
                  {row.TrangThai === 'CHECKED_OUT'
                    ? 'Đã ra về'
                    : 'Chưa check-out'}
                </b>
              </div>
            ))
          ) : (
            <p className="dashboard-empty">Chưa có lượt check-in hôm nay.</p>
          )}
        </article>
        <div>
          <article className="dash-card">
            <div className="dashboard-section-heading">
              <h2>Lịch PT sắp diễn ra hôm nay</h2>
              <button onClick={() => onNavigate('Huấn luyện viên', 1)}>
                Xem lịch →
              </button>
            </div>
            {summary.upcoming.length ? (
              summary.upcoming.slice(0, 4).map((s) => (
                <div className="dashboard-list-row" key={s.ThuePTID}>
                  <strong>
                    {s.start} · {s.trainer}
                  </strong>
                  <span>{s.member}</span>
                  <small>{ptStatus(s.TrangThai)}</small>
                </div>
              ))
            ) : (
              <p className="dashboard-empty">
                Không có lịch PT sắp diễn ra hôm nay.
              </p>
            )}
          </article>
          <article className="dash-card">
            <div className="dashboard-section-heading">
              <h2>Đơn hàng cần xử lý</h2>
              <button onClick={() => onNavigate('Đơn hàng')}>
                Xem tất cả →
              </button>
            </div>
            <p className="dashboard-note">Ưu tiên đơn được đặt sớm nhất.</p>
            {summary.pendingOrders.length ? (
              summary.pendingOrders.slice(0, 4).map((o) => (
                <div className="dashboard-list-row" key={o.DonHangID}>
                  <strong>
                    Đơn #{o.DonHangID} · {money(Number(o.TongTien))}
                  </strong>
                  <span>
                    {dateLabel(o.NgayDat)} · {orderLabel(o.TrangThai)}
                  </span>
                </div>
              ))
            ) : (
              <p className="dashboard-empty">Không có đơn hàng cần xử lý.</p>
            )}
          </article>
        </div>
      </section>
      <footer className="system-footer">
        Dữ liệu cập nhật lúc {timeLabel(data.updatedAt)} ngày{' '}
        {dateLabel(data.updatedAt)} · Phạm vi toàn hệ thống.
      </footer>
    </>
  )
}
