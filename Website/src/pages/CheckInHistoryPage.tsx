import { useEffect, useState } from 'react'
import { MetricCard } from '../components/AdminLayout'
import { getCheckInHistory, type CheckInRow } from '../services/checkins'

const ymd = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
function dates(range: string, from: string, to: string) {
  const now = new Date(),
    today = ymd(now)
  if (range === 'today') return [(from = today), (to = today)]
  if (range === '7d') {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    return [ymd(start), today]
  }
  if (range === 'month') return [`${today.slice(0, 7)}-01`, today]
  return [from, to]
}

export default function CheckInHistoryPage() {
  const [rows, setRows] = useState<CheckInRow[]>([]),
    [total, setTotal] = useState(0),
    [range, setRange] = useState('month'),
    [search, setSearch] = useState(''),
    [status, setStatus] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [page, setPage] = useState(1),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('')
  const pageSize = 8,
    pages = Math.max(1, Math.ceil(total / pageSize))
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true)
        const [start, end] = dates(range, from, to),
          params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
          })
        if (search.trim()) params.set('q', search.trim())
        if (status) params.set('status', status)
        if (start) params.set('from', start)
        if (end) params.set('to', end)
        const data = await getCheckInHistory(params)
        setRows(data.rows)
        setTotal(data.total)
        setError('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không thể tải lịch sử')
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [range, search, status, from, to, page])
  const selectRange = (value: string) => {
    setRange(value)
    setPage(1)
  }
  const exportCsv = () => {
    const csv = [
      'CheckInID,HoiVienID,Tên,SĐT,Check-in,Check-out,Trạng thái',
      ...rows.map((x) =>
        [
          x.CheckInID,
          x.HoiVienID,
          x.HoTen,
          x.SoDienThoai || '',
          x.ThoiGianCheckIn,
          x.ThoiGianCheckOut || '',
          x.TrangThai,
        ].join(',')
      ),
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'lich-su-checkin.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return (
    <div className="admin-page checkin-page">
      <header className="page-heading">
        <div>
          <p>
            VẬN HÀNH CHÍNH　›　CỔNG CHECK-IN　›　<b>LỊCH SỬ CHECK-IN</b>
          </p>
          <h1>NHẬT KÝ & LỊCH SỬ CHECK-IN HỘI VIÊN</h1>
          <span className="online-badge">● {total} BẢN GHI PHÙ HỢP</span>
        </div>
        <div className="heading-actions">
          <button className="primary" onClick={exportCsv}>
            ⇩ XUẤT TRANG HIỆN TẠI
          </button>
        </div>
      </header>
      <section className="metrics-grid">
        <MetricCard
          label="TỔNG BẢN GHI"
          value={String(total)}
          note="Theo bộ lọc hiện tại"
        />
        <MetricCard
          label="ĐANG CÓ MẶT"
          value={String(
            rows.filter((x) => x.TrangThai === 'CHECKED_IN').length
          )}
          note="Trong trang hiện tại"
          tone="mint"
        />
        <MetricCard
          label="ĐÃ CHECK-OUT"
          value={String(
            rows.filter((x) => x.TrangThai === 'CHECKED_OUT').length
          )}
          note="Trong trang hiện tại"
        />
        <MetricCard
          label="HARDWARE / FACEID"
          value="—"
          note="Chưa có dữ liệu trong DB"
        />
      </section>
      <section className="history-filters">
        <div className="chips">
          <span>KHOẢNG THỜI GIAN:</span>
          {[
            ['today', 'Hôm nay'],
            ['7d', '7 ngày qua'],
            ['month', 'Tháng hiện tại'],
            ['custom', 'Khoảng ngày'],
          ].map(([key, label]) => (
            <button
              className={range === key ? 'selected' : ''}
              onClick={() => selectRange(key)}
              key={key}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <label>
            ⌕
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tên, HoiVienID hoặc SĐT"
            />
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="CHECKED_IN">CHECKED_IN</option>
            <option value="CHECKED_OUT">CHECKED_OUT</option>
          </select>
          {range === 'custom' && (
            <>
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value)
                  setPage(1)
                }}
              />
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value)
                  setPage(1)
                }}
              />
            </>
          )}
        </div>
      </section>
      <section className="audit-card">
        <header>
          <h2>⌕ DỮ LIỆU CHECK-IN TỪ MYSQL</h2>
        </header>
        {loading && <div className="empty-state">Đang tải...</div>}
        {error && <div className="empty-state">{error}</div>}
        <div className="table-scroll">
          <table className="audit-table">
            <thead>
              <tr>
                <th>CHECKIN ID</th>
                <th>THỜI GIAN VÀO</th>
                <th>HỘI VIÊN</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>CHECKOUT</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.CheckInID}>
                  <td>
                    <b>#{x.CheckInID}</b>
                  </td>
                  <td>{x.ThoiGianCheckIn}</td>
                  <td>
                    <b>{x.HoTen}</b>
                    <small>HV-{x.HoiVienID}</small>
                  </td>
                  <td>{x.SoDienThoai || '—'}</td>
                  <td>{x.ThoiGianCheckOut || 'Chưa checkout'}</td>
                  <td>
                    <span
                      className={`status ${x.TrangThai === 'CHECKED_IN' ? 'ok' : 'neutral'}`}
                    >
                      {x.TrangThai}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && !rows.length && (
          <div className="empty-state">Không có dữ liệu phù hợp.</div>
        )}
      </section>
      <div className="pagination">
        <span>
          Trang {page}/{pages} · tổng <b>{total}</b> bản ghi
        </span>
        <div>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            ‹
          </button>
          <button className="current">{page}</button>
          <button disabled={page === pages} onClick={() => setPage(page + 1)}>
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
