import { useEffect, useRef, useState, type FormEvent } from 'react'
import { confirmCheckIn, previewCheckIn, type CheckInPreview } from '../services/checkins'
import { resolveBackendImageUrl } from '../services/images'
import { formatDate, memberCode } from '../services/members'
import './CheckInScanPage.css'

const labels: Record<string, string> = {
  ACTIVE: 'Đang hoạt động', INACTIVE: 'Ngừng hoạt động', LOCKED: 'Đã khóa',
  SUCCESS: 'Đã thanh toán', PENDING: 'Chờ thanh toán', FAILED: 'Thanh toán thất bại',
  UNPAID: 'Chưa thanh toán', CANCELLED: 'Đã hủy', EXPIRED: 'Đã hết hạn',
  CHECKED_IN: 'Đang có mặt', NOT_CHECKED_IN: 'Chưa có phiên check-in',
}
const status = (value: string) => labels[value] || value

export default function CheckInScanPage({ onShowToday }: { onShowToday: () => void }) {
  const [code, setCode] = useState('')
  const [preview, setPreview] = useState<CheckInPreview | null>(null)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [now, setNow] = useState(Date.now())
  const [failedImage, setFailedImage] = useState<string>()
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const expired = !!preview && new Date(preview.expiresAt).getTime() <= now
  const avatar = resolveBackendImageUrl(preview?.AnhDaiDien)

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busyRef.current || !code.trim()) return
    busyRef.current = true
    setBusy(true)
    setPreview(null)
    setError('')
    setNotice('')
    try {
      setPreview(await previewCheckIn(code.trim()))
      setNow(Date.now())
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Không thể kiểm tra mã.')
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }
  async function confirm() {
    if (busyRef.current || !preview?.eligible || expired || error) return
    busyRef.current = true
    setBusy(true)
    setError('')
    try {
      const result = await confirmCheckIn(preview.token)
      setNotice(`${result.message}: ${preview.HoTen} · ${memberCode(preview.HoiVienID)}.`)
      setPreview(null)
      setCode('')
    } catch (failure) {
      // Require a fresh preview after a failed or uncertain confirmation.
      setError(failure instanceof Error ? failure.message : 'Không thể xác nhận check-in.')
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }
  return (
    <div className="admin-page checkin-page checkin-scan-page">
      <header className="page-heading">
        <div>
          <p>VẬN HÀNH CHÍNH › CHECK-IN › QUÉT / NHẬP MÃ</p>
          <h1>QUÉT / NHẬP MÃ CHECK-IN</h1>
          <p>Kiểm tra thông tin hội viên trước khi xác nhận vào phòng.</p>
        </div>
      </header>
      <section className="checkin-scan-entry">
        <button type="button" disabled>Quét QR bằng camera — sắp hỗ trợ</button>
        <form onSubmit={lookup}>
          <label htmlFor="checkin-code">Mã ngắn hoặc nội dung QR</label>
          <input id="checkin-code" autoFocus autoComplete="off" maxLength={255}
            placeholder="QR-…-… hoặc dán token QR" value={code} disabled={busy}
            onChange={event => {
              setCode(event.target.value)
              setPreview(null)
              setError('')
              setNotice('')
            }} />
          <button type="submit" className="primary" disabled={busy || !code.trim()}>
            {busy ? 'Đang xử lý…' : 'Xem thông tin hội viên'}
          </button>
        </form>
        <p>Nhập mã đang hiển thị dưới QR trên Mobile. Xem thông tin chưa tạo lượt check-in.</p>
      </section>
      {error && <p className="checkin-scan-error" role="alert">{error}</p>}
      {notice && <div className="checkin-scan-notice" role="status">
        <p>{notice}</p>
        <button type="button" onClick={onShowToday}>Xem Giám sát hôm nay →</button>
      </div>}
      {preview && <section className="checkin-scan-card" aria-label="Thông tin hội viên">
        <div className="checkin-scan-identity">
          <div className="checkin-scan-avatar">
            {avatar && avatar !== failedImage
              ? <img key={avatar} src={avatar} alt={preview.HoTen} onError={() => setFailedImage(avatar)} />
              : <span>{preview.HoTen?.slice(0, 1)}</span>}
          </div>
          <div><h2>{preview.HoTen}</h2><p>{memberCode(preview.HoiVienID)} · HoiVienID: {preview.HoiVienID}</p></div>
        </div>
        <dl>
          {[
            ['Số điện thoại', preview.SoDienThoai || 'Chưa cập nhật'],
            ['Gói tập', preview.TenGoi],
            ['Ngày bắt đầu', formatDate(preview.NgayBatDau)],
            ['Ngày kết thúc', formatDate(preview.NgayKetThuc)],
            ['Số ngày còn lại', `${preview.SoNgayConLai} ngày`],
            ['Tài khoản', status(preview.TrangThaiTaiKhoan)],
            ['Hội viên', status(preview.TrangThaiHoiVien)],
            ['Trạng thái gói', status(preview.TrangThaiDangKy)],
            ['Thanh toán', status(preview.TrangThaiThanhToan)],
            ['Check-in hiện tại', status(preview.TrangThaiCheckIn)],
          ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        {preview.reasons.length > 0 && <ul className="checkin-scan-error" role="alert">
          {preview.reasons.map(reason => <li key={reason.code}>{reason.message}</li>)}
        </ul>}
        {expired && <p className="checkin-scan-error" role="alert">Mã đã hết hạn. Hãy nhập mã mới từ Mobile.</p>}
        <p>Mã còn hiệu lực: {Math.max(0, Math.ceil((new Date(preview.expiresAt).getTime() - now) / 1000))} giây.</p>
        <button type="button" className="primary" disabled={busy || !preview.eligible || expired || !!error} onClick={() => void confirm()}>
          {busy ? 'ĐANG XÁC NHẬN…' : 'XÁC NHẬN CHECK-IN'}
        </button>
      </section>}
    </div>
  )
}
