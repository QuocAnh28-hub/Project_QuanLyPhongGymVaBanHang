import { useEffect, useState, type ReactNode } from 'react'
import { money } from '../data/admin-utils'
import { getReport, type Report } from '../services/admin-finance'
import './Reports.css'

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const previousMonth = (now = new Date()) => [
  ymd(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
  ymd(new Date(now.getFullYear(), now.getMonth(), 0)),
]
const n = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0
const count = (value: number) => value.toLocaleString('vi-VN')
const shortMoney = (value: number) => new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value) + ' đ'
const dateLabel = (value: string) => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T00:00:00') : new Date(value)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
const statusLabels: Record<string, string> = {
  SUCCESS: 'Đã thanh toán', PENDING: 'Chờ xử lý', FAILED: 'Thất bại', CANCELLED: 'Đã hủy',
  ACTIVE: 'Đang hoạt động', INACTIVE: 'Ngừng hoạt động', EXPIRED: 'Đã hết hạn',
  CONFIRMED: 'Đã xác nhận', COMPLETED: 'Hoàn thành', CHECKED_IN: 'Đang ở phòng', CHECKED_OUT: 'Đã checkout',
}
const methodLabel = (value: string) => ({ TIEN_MAT: 'Tiền mặt', CHUYEN_KHOAN: 'Chuyển khoản', THE: 'Thẻ' })[value] || value
const iconPaths: Record<string, string> = {
  revenue: 'M3 7h18v14H3z M3 7l3-4h12l3 4 M3 12h18 M9 16h6',
  package: 'M4 5h16v14H4z M8 5V3 M16 5V3 M4 9h16 M8 13h3 M8 16h7',
  shop: 'M3 3h2l3 12h10l3-8H6 M9 20h.01 M18 20h.01',
  members: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M22 21v-2a4 4 0 0 0-3-3.87 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M17 3a4 4 0 0 1 0 8',
  checkin: 'M9 3H4v18h5 M10 12h11 M17 8l4 4-4 4',
  pt: 'M3 8v8 M6 6v12 M6 12h12 M18 6v12 M21 8v8',
  chart: 'M4 20V4 M4 20h17 M8 16v-4 M13 16V7 M18 16v-7',
}
function Icon({ name }: { name: string }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name] || iconPaths.chart} /></svg>
}
function Empty() {
  return <div className="rp-empty"><Icon name="chart" /><span>Chưa có dữ liệu trong kỳ</span></div>
}
function SummaryCard({ label, value, note, icon, featured = false }: { label: string; value: string; note: string; icon: string; featured?: boolean }) {
  return <article className={`rp-kpi ${featured ? 'rp-kpi-featured' : ''}`}>
    <div className="rp-kpi-label"><span>{label}</span><i><Icon name={icon} /></i></div>
    <strong>{value}</strong><p>{note}</p>
  </article>
}
function SectionCard({ title, description, children, aside }: { title: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return <article className="rp-panel"><header><div><h3>{title}</h3>{description && <p>{description}</p>}</div>{aside}</header>{children}</article>
}
function ReportTable({ title, heads, rows }: { title: string; heads: string[]; rows: (string | number)[][] }) {
  return <SectionCard title={title}><div className="rp-table-scroll"><table>
    <thead><tr>{heads.map((head, index) => <th key={head} className={index > 0 ? 'rp-numeric' : ''}>{head}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{row.map((value, column) => <td key={column} className={column > 0 ? 'rp-numeric' : ''}>
      {typeof value === 'string' && statusLabels[value] ? <span className={`rp-badge rp-${value.toLowerCase()}`}><i />{statusLabels[value]}</span> : typeof value === 'number' ? count(value) : value}
    </td>)}</tr>)}</tbody>
  </table>{!rows.length && <Empty />}</div></SectionCard>
}
type ChartItem = { label: string; value: number }
function SimpleBarChart({ title, items, format, horizontal = false, description, tone = 'lime' }: {
  title: string; items: ChartItem[]; format: (value: number) => string; horizontal?: boolean; description?: string; tone?: string
}) {
  const max = Math.max(1, ...items.map(item => item.value))
  const sum = items.reduce((total, item) => total + item.value, 0)
  return <SectionCard title={title} description={description} aside={<span className={`rp-chart-dot rp-tone-${tone}`} />}>{!items.length ? <Empty /> : horizontal ?
    <ul className={`rp-horizontal rp-tone-${tone}`}>
      {items.map((item, index) => <li key={`${item.label}-${index}`}>
        <div><span title={item.label}>{item.label}</span><strong>{format(item.value)}</strong></div>
        <div className="rp-track"><i style={{ width: `${Math.max(0, item.value / max * 100)}%` }} /></div>
        {title.includes('phương thức') && <small>{sum ? Math.round(item.value / sum * 100) : 0}% doanh thu theo phương thức</small>}
      </li>)}
    </ul> : <div className={`rp-column-scroll rp-tone-${tone}`}>
      <div className="rp-column-chart" role="list" aria-label={title}>
        {items.map((item, index) => <div className="rp-column" role="listitem" key={`${item.label}-${index}`} aria-label={`${item.label}: ${format(item.value)}`}>
          <div className="rp-column-track"><i style={{ height: `${Math.max(0, item.value / max * 100)}%` }}><span>{format(item.value)}</span></i></div>
          <span>{item.label}</span>
        </div>)}
      </div>
      <p className="rp-chart-caption">{items.length} ngày có dữ liệu · Cột càng cao, giá trị càng lớn</p>
    </div>}
  </SectionCard>
}
function ReportSection({ id, title, description, number, children }: { id: string; title: string; description: string; number: string; children: ReactNode }) {
  return <section id={id} className="rp-section"><header className="rp-section-heading"><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></header>{children}</section>
}
export default function Reports() {
  const initial = previousMonth()
  const [from, setFrom] = useState(initial[0]), [to, setTo] = useState(initial[1])
  const [activePreset, setActivePreset] = useState<'today' | 'previousMonth' | 'month' | null>('previousMonth')
  const [data, setData] = useState<Report>(), [error, setError] = useState(''), [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    if (!from || !to || from > to) {
      setError('Vui lòng chọn khoảng ngày hợp lệ. Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    getReport(from, to).then(value => { if (active) setData(value) })
      .catch(failure => { if (active) setError(failure.message || 'Không thể tải báo cáo. Vui lòng thử lại.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [from, to])
  const preset = (kind: 'today' | 'previousMonth' | 'month') => {
    const now = new Date()
    const [a, b] = kind === 'today' ? [ymd(now), ymd(now)] : kind === 'previousMonth' ? previousMonth(now) : [ymd(new Date(now.getFullYear(), now.getMonth(), 1)), ymd(now)]
    setActivePreset(kind); setFrom(a); setTo(b)
  }
  return <div className="reports-dashboard">
    <header className="rp-heading"><div><div className="rp-eyebrow"><Icon name="chart" /> TỔNG QUAN KINH DOANH</div><h1>Báo cáo & thống kê</h1><p>Theo dõi doanh thu, hội viên, check-in, shop và PT theo khoảng thời gian</p></div><span className="rp-period">{new Date((from || ymd(new Date())) + 'T00:00:00').toLocaleDateString('vi-VN')} — {new Date((to || ymd(new Date())) + 'T00:00:00').toLocaleDateString('vi-VN')}</span></header>
    <section className="rp-filters" aria-label="Khoảng thời gian báo cáo">
      <div className="rp-presets">{([['today', 'Hôm nay'], ['previousMonth', 'Tháng trước'], ['month', 'Tháng này']] as const).map(([kind, label]) => <button type="button" key={kind} className={activePreset === kind ? 'active' : ''} aria-pressed={activePreset === kind} onClick={() => preset(kind)}>{label}</button>)}</div>
      <div className="rp-date-inputs"><label>Từ ngày<input type="date" value={from} onChange={event => { setActivePreset(null); setFrom(event.target.value) }} /></label><span aria-hidden="true">→</span><label>Đến ngày<input type="date" value={to} onChange={event => { setActivePreset(null); setTo(event.target.value) }} /></label></div>
      <span className="rp-filter-note">Tự cập nhật khi chọn ngày</span>
    </section>
    {error && <div className="rp-message rp-error" role="alert">{error}</div>}
    {loading && <div className="rp-message" role="status"><span className="rp-loading-dot" />Đang tải báo cáo…</div>}
    {data && !loading && !error && <>
      <div className="rp-overview-label"><h2>Phòng gym trong tầm mắt</h2><span>{dateLabel(data.range.from)} — {dateLabel(data.range.to)} · Doanh thu đã thanh toán</span></div>
      <section className="rp-kpis" aria-label="Chỉ số tổng quan">
        <SummaryCard featured label="Tổng doanh thu" value={money(n(data.revenue.total))} note="Tổng tiền đã thanh toán trong kỳ" icon="revenue" />
        <SummaryCard label="Doanh thu gói tập" value={money(n(data.revenue.package))} note="Từ đăng ký và gia hạn gói" icon="package" />
        <SummaryCard label="Doanh thu shop" value={money(n(data.revenue.shop))} note="Từ mua sắm tại cửa hàng" icon="shop" />
        <SummaryCard label="Hội viên đang hoạt động" value={count(n(data.members.active))} note="Hội viên có trạng thái hoạt động" icon="members" />
        <SummaryCard label="Tổng lượt check-in" value={count(n(data.checkins.total))} note="Lượt vào phòng trong kỳ" icon="checkin" />
        <SummaryCard label="Số đơn shop" value={count(n(data.shop.total))} note="Đơn hàng được tạo trong kỳ" icon="shop" />
        <SummaryCard label="Lượt thuê PT" value={count(n(data.pt.total))} note="Lịch thuê huấn luyện viên trong kỳ" icon="pt" />
      </section>
      <nav className="rp-section-nav" aria-label="Các mục báo cáo">{[['revenue', 'Doanh thu'], ['members', 'Hội viên'], ['checkins', 'Check-in'], ['shop', 'Shop'], ['trainers', 'PT']].map(([id, label]) => <a key={id} href={`#rp-${id}`}>{label}<span>↗</span></a>)}</nav>
      <ReportSection id="rp-revenue" number="01" title="Doanh thu" description="Nhìn rõ nguồn thu và xu hướng qua từng ngày.">
        <div className="rp-grid rp-grid-wide"><SimpleBarChart title="Doanh thu theo ngày" description="Tiền đã thanh toán · đơn vị đồng" items={data.revenueByDay.map(item => ({ label: dateLabel(item.date), value: n(item.amount) }))} format={shortMoney} />
          <SimpleBarChart horizontal title="Doanh thu theo phương thức thanh toán" description="Nguồn tiền theo cách hội viên thanh toán" items={data.revenueByMethod.map(item => ({ label: methodLabel(item.method), value: n(item.amount) }))} format={money} tone="mint" /></div>
      </ReportSection>
      <ReportSection id="rp-members" number="02" title="Tình hình hội viên" description="Quy mô hội viên, đăng ký mới và những gói cần chú ý.">
        <div className="rp-grid"><ReportTable title="Tổng quan hội viên" heads={['Chỉ số', 'Số lượng']} rows={[
          ['Tổng hội viên', n(data.members.total)], ['ACTIVE', n(data.members.active)], ['Hội viên mới trong kỳ', n(data.members.newMembers)], ['Đăng ký gói mới trong kỳ', n(data.members.newRegistrations)],
        ]} /><SectionCard title="Theo dõi hạn gói tập" description="Chủ động nhắc hội viên gia hạn">
          <div className="rp-member-highlights"><div><span className="rp-highlight-icon">◷</span><strong>{count(n(data.members.expiring))}</strong><h4>Gói sắp hết hạn</h4><p>Hội viên cần được nhắc gia hạn</p></div><div><span className="rp-highlight-icon">!</span><strong>{count(n(data.members.expired))}</strong><h4>Gói đã hết hạn</h4><p>Chủ động liên hệ và tư vấn gói mới</p></div></div>
        </SectionCard></div>
      </ReportSection>
      <ReportSection id="rp-checkins" number="03" title="Tình hình check-in" description="Theo dõi lượt vào phòng và khung giờ đông khách.">
        <div className="rp-grid rp-grid-wide"><SimpleBarChart title="Check-in theo ngày" items={data.checkinsByDay.map(item => ({ label: dateLabel(item.date), value: n(item.count) }))} format={value => `${count(value)} lượt`} tone="mint" />
          <ReportTable title="Lượt vào và ra phòng" heads={['Trạng thái', 'Số lượt']} rows={[
            ['Tổng lượt check-in', n(data.checkins.total)], ['CHECKED_IN', n(data.checkins.checkedIn)], ['CHECKED_OUT', n(data.checkins.checkedOut)],
          ]} /></div>
        <SimpleBarChart horizontal title="Khung giờ đông khách" description="Số lượt check-in theo giờ" items={data.peakHours.map(item => ({ label: `${String(item.hour).padStart(2, '0')}:00`, value: n(item.count) }))} format={value => `${count(value)} lượt`} tone="mint" />
      </ReportSection>
      <ReportSection id="rp-shop" number="04" title="Hoạt động shop" description="Tình hình đơn hàng và các sản phẩm được mua nhiều nhất.">
        <div className="rp-grid"><SimpleBarChart horizontal title="Top sản phẩm bán chạy" description="Xếp hạng theo số lượng bán" items={[...data.topProducts].sort((a, b) => n(b.quantity) - n(a.quantity)).map(item => ({ label: item.TenSanPham, value: n(item.quantity) }))} format={value => `${count(value)} sản phẩm`} tone="blue" />
          <ReportTable title="Tình hình đơn hàng" heads={['Chỉ số', 'Giá trị']} rows={[
            ['Tổng đơn shop', n(data.shop.total)], ['COMPLETED', n(data.shop.completed)], ['CANCELLED', n(data.shop.cancelled)], ['Doanh thu đã thanh toán', money(n(data.shop.revenue))],
          ]} /></div>
      </ReportSection>
      <ReportSection id="rp-trainers" number="05" title="Hoạt động PT" description="Theo dõi lịch thuê và những huấn luyện viên được chọn nhiều.">
        <div className="rp-grid"><SimpleBarChart horizontal title="Top PT được thuê nhiều" description="Xếp hạng theo lượt thuê trong kỳ" items={[...data.topTrainers].sort((a, b) => n(b.rentals) - n(a.rentals)).map(item => ({ label: item.HoTen, value: n(item.rentals) }))} format={value => `${count(value)} lượt`} />
          <ReportTable title="Tình hình lịch thuê PT" heads={['Trạng thái', 'Số lượt']} rows={[
            ['Tổng lượt thuê', n(data.pt.total)], ['PENDING', n(data.pt.pending)], ['CONFIRMED', n(data.pt.confirmed)], ['COMPLETED', n(data.pt.completed)], ['CANCELLED', n(data.pt.cancelled)],
          ]} /></div>
        <p className="rp-footnote">Doanh thu PT chưa có dữ liệu trong báo cáo hiện tại.</p>
      </ReportSection>
    </>}
  </div>
}
