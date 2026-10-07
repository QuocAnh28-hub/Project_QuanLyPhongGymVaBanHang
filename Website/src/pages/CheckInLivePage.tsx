import { useEffect, useMemo, useRef, useState } from 'react'
import { MetricCard, Modal } from '../components/AdminLayout'
import { checkout, getTodayCheckIns, type CheckInRow } from '../services/checkins'
import { resolveBackendImageUrl } from '../services/images'

export default function CheckInLivePage() {
  const [selected, setSelected] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const requestVersion = useRef(0)
  const [checkoutError, setCheckoutError] = useState('')
  const [notice, setNotice] = useState('')
  const [failedAvatar, setFailedAvatar] = useState<string>()
  const [loadedAt, setLoadedAt] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  const [rows, setRows] = useState<CheckInRow[]>([]),
    [metrics, setMetrics] = useState({ total: 0, present: 0, checkedOut: 0 }),
    [filter, setFilter] = useState('all'),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('')
  const load = async () => {
    const version = ++requestVersion.current
    try {
      const data = await getTodayCheckIns()
      if (version !== requestVersion.current) return
      setRows(data.rows)
      setMetrics(data.metrics)
      setLoadedAt(Date.now())
      setError('')
    } catch (e) {
      if (version !== requestVersion.current) return
      setError(e instanceof Error ? e.message : 'Không thể tải check-in')
    } finally {
      if (version === requestVersion.current) setLoading(false)
    }
  }
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- fetch initializes server state
    void load()
    const timer = window.setInterval(() => { if (!busyRef.current) void load() }, 15000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (selected === null) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [selected])
  const current = rows.find(row => row.CheckInID === selected)
  const avatar = resolveBackendImageUrl(current?.AnhDaiDien)
  const seconds = Math.max(0, Number(current?.ThoiGianDaTap || 0) + (current?.TrangThai === 'CHECKED_IN' ? Math.floor((now - loadedAt) / 1000) : 0))
  const duration = `${Math.floor(seconds / 3600)} giờ ${Math.floor(seconds % 3600 / 60)} phút ${seconds % 60} giây`
  async function confirmCheckout() {
    if (!current || busyRef.current || current.TrangThai !== 'CHECKED_IN' || current.ThoiGianCheckOut) return
    busyRef.current = true
    ++requestVersion.current
    setBusy(true)
    setCheckoutError('')
    try {
      const result = await checkout(current.CheckInID)
      setRows(previous => previous.map(row => row.CheckInID === current.CheckInID ? { ...row, ...result.data } : row))
      setMetrics(previous => ({ ...previous, present: Math.max(0, previous.present - 1), checkedOut: previous.checkedOut + 1 }))
      setSelected(null)
      setNotice(`${result.message}: ${current.HoTen}.`)
      await load()
    } catch (failure) {
      setCheckoutError(failure instanceof Error ? failure.message : 'Không thể check-out')
      await load()
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }
  const shown = useMemo(
    () => rows.filter((row) => filter === 'all' || row.TrangThai === filter),
    [rows, filter]
  )
  const exportCsv = () => {
    const csv = [
      'HoiVienID,Tên,SĐT,Check-in,Check-out,Trạng thái',
      ...shown.map((x) =>
        [
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
    a.download = 'checkin-hom-nay.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return (
    <div className="admin-page checkin-page">
      <header className="page-heading">
        <div>
          <p>
            VẬN HÀNH CHÍNH　›　CỔNG CHECK-IN　›　<b>CHECK-IN HÔM NAY</b>
          </p>
          <h1>GIÁM SÁT CHECK-IN HÔM NAY</h1>
          <span className="online-badge">
            ● DỮ LIỆU MYSQL · TỰ LÀM MỚI 15 GIÂY
          </span>
        </div>
        <div className="heading-actions">
          <button disabled={busy} onClick={() => void load()}>↻ LÀM MỚI</button>
          <button onClick={exportCsv}>⇩ XUẤT DANH SÁCH</button>
        </div>
      </header>
      {notice && <p className="catalog-notice" role="status">{notice}</p>}
      <section className="metrics-grid">
        <MetricCard
          label="TỔNG LƯỢT CHECK-IN"
          value={String(metrics.total)}
          note="Trong ngày hôm nay"
        />
        <MetricCard
          label="ĐANG CÓ MẶT"
          value={String(metrics.present)}
          note="Chưa checkout"
          tone="mint"
        />
        <MetricCard
          label="ĐÃ CHECK-OUT"
          value={String(metrics.checkedOut)}
          note="Đã rời CLB"
        />
        <MetricCard
          label="DỮ LIỆU HARDWARE"
          value="—"
          note="Chưa có trong database"
        />
      </section>
      <section className="live-section">
        <div className="section-title">
          <h2>● CHECK-IN HÔM NAY</h2>
          <div className="chips">
            {[
              ['all', 'Tất cả'],
              ['CHECKED_IN', 'Đang có mặt'],
              ['CHECKED_OUT', 'Đã checkout'],
            ].map(([key, label]) => (
              <button
                className={filter === key ? 'selected' : ''}
                onClick={() => setFilter(key)}
                key={key}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {loading && <div className="empty-state">Đang tải...</div>}
        {error && <div className="empty-state">{error}</div>}
        <div className="live-feed">
          {shown.map((x) => (
            <article key={x.CheckInID}>
              <i>{x.HoTen[0]}</i>
              <div>
                <h3>
                  {x.HoTen}{' '}
                  <small>
                    HV-{x.HoiVienID} · {x.SoDienThoai || 'Không có SĐT'}
                  </small>
                </h3>
                <p>
                  Vào: {x.ThoiGianCheckIn}　•　Ra:{' '}
                  {x.ThoiGianCheckOut || 'Chưa checkout'}
                </p>
              </div>
              <strong>{x.TrangThai}</strong>
              {x.TrangThai === 'CHECKED_IN' && !x.ThoiGianCheckOut && (
                <button type="button" disabled={busy} onClick={() => {
                  setSelected(x.CheckInID)
                  setNow(Date.now())
                  setCheckoutError('')
                  setNotice('')
                }}>CHECK-OUT</button>
              )}
            </article>
          ))}
        </div>
        {!loading && !error && !shown.length && (
          <div className="empty-state">Chưa có lượt check-in phù hợp.</div>
        )}
      </section>
      {current && <Modal title="Xác nhận check-out" onClose={() => { if (!busyRef.current) setSelected(null) }}>
        <div className="catalog-form">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {avatar && failedAvatar !== avatar
              ? <img src={avatar} alt={current.HoTen} onError={() => setFailedAvatar(avatar)} style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: '50%' }} />
              : <span className="catalog-image-placeholder">{current.HoTen.charAt(0)}</span>}
            <div><h3>{current.HoTen}</h3><p>HV-{current.HoiVienID} · HoiVienID: {current.HoiVienID}</p></div>
          </div>
          <p>SĐT: {current.SoDienThoai || 'Chưa cập nhật'}</p>
          <p>Giờ check-in: {current.ThoiGianCheckIn}</p>
          <p>Thời gian đã ở phòng: {duration}</p>
          {current.TrangThai === 'CHECKED_OUT' && <p>Hội viên đã check-out lúc {current.ThoiGianCheckOut}.</p>}
          {checkoutError && <p className="catalog-error" role="alert">{checkoutError}</p>}
          <footer>
            <button type="button" disabled={busy} onClick={() => setSelected(null)}>HỦY</button>
            <button type="button" className="catalog-primary" disabled={busy || current.TrangThai !== 'CHECKED_IN' || !!current.ThoiGianCheckOut} onClick={() => void confirmCheckout()}>
              {busy ? 'ĐANG XỬ LÝ…' : 'XÁC NHẬN CHECK-OUT'}
            </button>
          </footer>
        </div>
      </Modal>}
    </div>
  )
}
