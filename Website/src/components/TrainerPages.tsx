import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Modal } from './AdminLayout'
import { Pagination } from './MemberUi'
import { catalogRequest, searchText } from '../services/catalog'
import { exportCsv, formatDate, money, useMemberData } from '../services/members'
import { dateKey, loadTrainerData, ptStatus, shiftEnd, shiftLocked, shiftPayload, shiftStart, trainerPayload, type Booking, type Shift, type Trainer } from '../services/trainers'

type Mode = 'trainers' | 'bookings' | 'roster'
type Editor = { kind: 'trainer'; row?: Trainer } | { kind: 'shift'; row?: Shift } | { kind: 'book' } | { kind: 'action'; action: 'confirm' | 'cancel' | 'complete'; row: Booking } | { kind: 'deleteTrainer'; row: Trainer } | { kind: 'deleteShift'; row: Shift }

export default function TrainerPages({ mode, onOpenRoster }: { mode: Mode; onOpenRoster?: () => void }) {
  const { data, loading, error, reload } = useMemberData(loadTrainerData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [trainer, setTrainer] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [bookingTrainer, setBookingTrainer] = useState('')
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])
  const trainers = data?.trainers || [], shifts = data?.shifts || [], bookings = data?.bookings || [], members = data?.members || []
  const trainerName = (id: number) => trainers.find(t => Number(t.PTID) === Number(id))?.HoTen || `PT #${id}`
  const member = (id: number) => members.find(m => Number(m.HoiVienID) === Number(id))
  const bookingShift = (b: Booking) => shifts.find(s => Number(s.LichPTID) === Number(b.LichPTID))
  const rangeError = !!from && !!to && from > to
  const inRange = (date: string) => !rangeError && (!from || dateKey(date) >= from) && (!to || dateKey(date) <= to)
  const matches = (value: string) => searchText(value).includes(searchText(search))
  const shownTrainers = trainers.filter(t => (!status || t.TrangThai === status) && matches(`${t.PTID} ${t.HoTen} ${t.SoDienThoai || ''} ${t.ChuyenMon || ''}`)).sort((a, b) => b.PTID - a.PTID)
  const shownShifts = shifts.filter(s => (!status || s.TrangThai === status) && (!trainer || Number(s.PTID) === Number(trainer)) && inRange(s.NgayLam) && matches(`${s.LichPTID} ${trainerName(s.PTID)}`)).sort((a, b) => shiftStart(b) - shiftStart(a))
  const shownBookings = bookings.filter(b => {
    const s = bookingShift(b)
    return (!status || b.TrangThai === status) && (!trainer || Number(b.PTID) === Number(trainer)) && ((!from && !to) || (s && inRange(s.NgayLam))) && matches(`${b.ThuePTID} ${trainerName(b.PTID)} ${member(b.HoiVienID)?.HoTen || ''} ${b.GhiChu || ''}`)
  }).sort((a, b) => b.ThuePTID - a.ThuePTID)
  const total = mode === 'trainers' ? shownTrainers.length : mode === 'roster' ? shownShifts.length : shownBookings.length
  const currentPage = Math.min(page, Math.max(1, Math.ceil(total / 10)))
  const slice = <T,>(rows: T[]) => rows.slice((currentPage - 1) * 10, currentPage * 10)
  const statuses = mode === 'trainers' ? ['ACTIVE', 'INACTIVE'] : mode === 'roster' ? ['AVAILABLE', 'BOOKED', 'OFF'] : ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  const title = mode === 'trainers' ? 'Danh sách huấn luyện viên' : mode === 'bookings' ? 'Lịch thuê PT' : 'Lịch làm việc & phân ca'
  const open = (value: Editor) => { setFormError(''); setBookingTrainer(''); setEditor(value) }
  const close = () => { if (!busyRef.current) setEditor(null) }
  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (!editor || !data || busyRef.current) return
    const form = event ? new FormData(event.currentTarget) : null
    busyRef.current = true; setBusy(true); setFormError(''); setNotice('')
    try {
      if (editor.kind === 'trainer' && form) {
        await catalogRequest(`pt${editor.row ? `/${editor.row.PTID}` : ''}`, { method: editor.row ? 'PUT' : 'POST', body: JSON.stringify(trainerPayload(form)) })
      } else if (editor.kind === 'shift' && form) {
        const fresh = await loadTrainerData(new AbortController().signal)
        const current = editor.row ? fresh.shifts.find(s => Number(s.LichPTID) === Number(editor.row?.LichPTID)) : undefined
        if (editor.row && !current) throw new Error('Ca không còn tồn tại. Vui lòng làm mới danh sách.')
        await catalogRequest(`lichpt${current ? `/${current.LichPTID}` : ''}`, { method: current ? 'PUT' : 'POST', body: JSON.stringify(shiftPayload(form, fresh, current)) })
      } else if (editor.kind === 'book' && form) {
        const TaiKhoanID = Number(form.get('TaiKhoanID')), LichPTID = Number(form.get('LichPTID'))
        if (!TaiKhoanID || !LichPTID) throw new Error('Vui lòng chọn hội viên và ca làm việc.')
        await catalogRequest('thuept/book', { method: 'POST', body: JSON.stringify({ TaiKhoanID, LichPTID, GhiChu: String(form.get('GhiChu') || '').trim() || null }) })
      } else if (editor.kind === 'action') {
        const b = editor.row
        if (editor.action === 'complete') {
          const fresh = await catalogRequest<Booking>(`thuept/${b.ThuePTID}`)
          const s = await catalogRequest<Shift>(`lichpt/${fresh.LichPTID}`)
          if (fresh.TrangThai !== 'CONFIRMED' || shiftEnd(s) > Date.now()) throw new Error('Chỉ hoàn thành lịch đã xác nhận và đã kết thúc.')
          await catalogRequest(`thuept/${b.ThuePTID}`, { method: 'PUT', body: JSON.stringify({ TrangThai: 'COMPLETED' }) })
        } else {
          const TaiKhoanID = member(b.HoiVienID)?.TaiKhoanID
          if (editor.action === 'cancel' && !TaiKhoanID) throw new Error('Hội viên chưa có tài khoản liên kết.')
          await catalogRequest(`thuept/${b.ThuePTID}/${editor.action}`, { method: 'POST', body: JSON.stringify(editor.action === 'cancel' ? { TaiKhoanID } : {}) })
        }
      } else if (editor.kind === 'deleteTrainer' || editor.kind === 'deleteShift') {
        const fresh = await loadTrainerData(new AbortController().signal)
        if (editor.kind === 'deleteTrainer') {
          if (fresh.shifts.some(s => Number(s.PTID) === Number(editor.row.PTID)) || fresh.bookings.some(b => Number(b.PTID) === Number(editor.row.PTID))) throw new Error('Huấn luyện viên đã có lịch. Hãy chuyển sang ngừng hoạt động thay vì xóa.')
          await catalogRequest(`pt/${editor.row.PTID}`, { method: 'DELETE' })
        } else {
          const s = fresh.shifts.find(s => Number(s.LichPTID) === Number(editor.row.LichPTID))
          if (!s || shiftLocked(s, fresh.bookings)) throw new Error('Ca đã có lịch thuê hoặc không còn tồn tại, không thể xóa.')
          await catalogRequest(`lichpt/${s.LichPTID}`, { method: 'DELETE' })
        }
      }
      setEditor(null); setNotice('Đã lưu thay đổi thành công.'); reload()
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Không thể xử lý yêu cầu.') }
    finally { busyRef.current = false; setBusy(false) }
  }
  function download() {
    const rows = mode === 'trainers'
      ? [['Mã PT', 'Họ tên', 'Điện thoại', 'Email', 'Chuyên môn', 'Giá thuê', 'Trạng thái'], ...shownTrainers.map(t => [t.PTID, t.HoTen, t.SoDienThoai || '', t.Email || '', t.ChuyenMon || '', t.GiaThue, ptStatus(t.TrangThai)])]
      : mode === 'roster' ? [['Mã ca', 'Huấn luyện viên', 'Ngày', 'Bắt đầu', 'Kết thúc', 'Trạng thái'], ...shownShifts.map(s => [s.LichPTID, trainerName(s.PTID), dateKey(s.NgayLam), s.GioBatDau, s.GioKetThuc, ptStatus(s.TrangThai)])]
      : [['Mã thuê', 'Hội viên', 'Huấn luyện viên', 'Ngày tập', 'Giá thuê', 'Trạng thái'], ...shownBookings.map(b => [b.ThuePTID, member(b.HoiVienID)?.HoTen || b.HoiVienID, trainerName(b.PTID), dateKey(bookingShift(b)?.NgayLam || ''), b.GiaThue, ptStatus(b.TrangThai)])]
    exportCsv(`${mode}.csv`, rows)
  }
  const currentTrainer = editor?.kind === 'trainer' ? editor.row : undefined
  const currentShift = editor?.kind === 'shift' ? editor.row : undefined
  const available = shifts.filter(s => s.TrangThai === 'AVAILABLE' && shiftStart(s) > now && trainers.some(t => Number(t.PTID) === Number(s.PTID) && t.TrangThai === 'ACTIVE') && (!bookingTrainer || Number(s.PTID) === Number(bookingTrainer))).sort((a, b) => shiftStart(a) - shiftStart(b))
  const badge = (value: string) => <span className={`catalog-badge ${value.toLowerCase()}`}>{ptStatus(value)}</span>
  return <div className="catalog-page trainer-api-page member-api-page">
    <header className="catalog-heading"><div><p className="catalog-eyebrow">VẬN HÀNH / HUẤN LUYỆN VIÊN</p><h1>{title}</h1><p>{mode === 'roster' ? 'Phân công khung giờ làm việc, mở lịch nhận khách và ngày nghỉ.' : mode === 'bookings' ? 'Theo dõi hội viên, khung giờ tập và trạng thái lịch thuê.' : 'Quản lý hồ sơ, chuyên môn, thông tin liên hệ và giá thuê PT.'}</p></div><div className="catalog-actions">
      {onOpenRoster && <button onClick={onOpenRoster}>Lịch làm việc →</button>}<button disabled={loading} onClick={reload}>↻ Làm mới</button><button disabled={loading || !!error || !total} onClick={download}>↓ Xuất CSV</button><button className="catalog-primary" disabled={loading || !!error} onClick={() => open({ kind: mode === 'trainers' ? 'trainer' : mode === 'roster' ? 'shift' : 'book' })}>＋ {mode === 'trainers' ? 'Thêm HLV' : mode === 'roster' ? 'Phân ca' : 'Đặt lịch PT'}</button>
    </div></header>
    {notice && <p role="status" className="catalog-notice">{notice}</p>}{loading && <p role="status" className="catalog-state">Đang tải dữ liệu…</p>}{error && <div role="alert" className="catalog-error"><p>{error}</p><button onClick={reload}>Thử lại</button></div>}
    {!loading && !error && data && <>
      <section className="catalog-stats">{statuses.map(s => <article key={s}><span>{ptStatus(s)}</span><strong>{(mode === 'trainers' ? trainers : mode === 'roster' ? shifts : bookings).filter(r => r.TrangThai === s).length}</strong></article>)}</section>
      <section className="catalog-filters"><input aria-label="Tìm kiếm" value={search} placeholder="Tìm tên, mã hoặc thông tin liên quan…" onChange={e => { setSearch(e.target.value); setPage(1) }} />
        {mode !== 'trainers' && <select aria-label="Huấn luyện viên" value={trainer} onChange={e => { setTrainer(e.target.value); setPage(1) }}><option value="">Tất cả HLV</option>{trainers.map(t => <option key={t.PTID} value={t.PTID}>{t.HoTen}</option>)}</select>}
        <select aria-label="Trạng thái" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}><option value="">Tất cả trạng thái</option>{statuses.map(s => <option key={s} value={s}>{ptStatus(s)}</option>)}</select>
        {mode !== 'trainers' && <><label>Từ ngày<input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1) }} /></label><label>Đến ngày<input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1) }} /></label></>}
        <button onClick={() => { setSearch(''); setStatus(''); setTrainer(''); setFrom(''); setTo(''); setPage(1) }}>Xóa bộ lọc</button>
      </section>{rangeError && <p role="alert" className="catalog-error">Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.</p>}
      <section className="catalog-table-card"><div className="catalog-table-scroll"><table className="catalog-table"><thead><tr>{(mode === 'trainers' ? ['Huấn luyện viên', 'Liên hệ', 'Chuyên môn', 'Giá thuê', 'Trạng thái', 'Thao tác'] : mode === 'roster' ? ['Huấn luyện viên', 'Ngày làm việc', 'Khung giờ', 'Trạng thái', 'Thao tác'] : ['Hội viên', 'Huấn luyện viên', 'Lịch tập', 'Giá thuê', 'Trạng thái', 'Thao tác']).map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>
        {mode === 'trainers' && slice(shownTrainers).map(t => <tr key={t.PTID}><td><strong>{t.HoTen}</strong><small className="trainer-sub">PT #{t.PTID}</small></td><td>{t.SoDienThoai || '—'}<small className="trainer-sub">{t.Email || 'Chưa có email'}</small></td><td>{t.ChuyenMon || 'Chưa cập nhật'}</td><td>{money(Number(t.GiaThue))}</td><td>{badge(t.TrangThai)}</td><td><div className="catalog-row-actions"><button onClick={() => open({ kind: 'trainer', row: t })}>Hồ sơ / Sửa</button><button className="catalog-danger" disabled={shifts.some(s => Number(s.PTID) === Number(t.PTID)) || bookings.some(b => Number(b.PTID) === Number(t.PTID))} onClick={() => open({ kind: 'deleteTrainer', row: t })}>Xóa</button></div></td></tr>)}
        {mode === 'roster' && slice(shownShifts).map(s => <tr key={s.LichPTID}><td><strong>{trainerName(s.PTID)}</strong><small className="trainer-sub">Ca #{s.LichPTID}</small></td><td>{formatDate(s.NgayLam)}</td><td>{s.GioBatDau.slice(0, 5)} – {s.GioKetThuc.slice(0, 5)}</td><td>{badge(s.TrangThai)}</td><td><div className="catalog-row-actions"><button disabled={shiftLocked(s, bookings) || shiftStart(s) <= now} onClick={() => open({ kind: 'shift', row: s })}>Sửa ca</button><button className="catalog-danger" disabled={shiftLocked(s, bookings)} onClick={() => open({ kind: 'deleteShift', row: s })}>Xóa</button></div>{shiftLocked(s, bookings) && <small className="trainer-sub">Đã có lịch thuê, giữ nguyên ca</small>}</td></tr>)}
        {mode === 'bookings' && slice(shownBookings).map(b => {
          const s = bookingShift(b), upcoming = s && shiftStart(s) > now
          return <tr key={b.ThuePTID}><td><strong>{member(b.HoiVienID)?.HoTen || `Hội viên #${b.HoiVienID}`}</strong><small className="trainer-sub">Lịch thuê #{b.ThuePTID} · Đặt {formatDate(b.NgayDat)}</small>{b.GhiChu && <p className="catalog-description">{b.GhiChu}</p>}</td><td>{trainerName(b.PTID)}</td><td>{s ? <>{formatDate(s.NgayLam)}<small className="trainer-sub">{s.GioBatDau.slice(0, 5)} – {s.GioKetThuc.slice(0, 5)}</small></> : 'Không tìm thấy ca'}</td><td>{money(Number(b.GiaThue))}</td><td>{badge(b.TrangThai)}</td><td><div className="catalog-row-actions">
            {b.TrangThai === 'PENDING' && <button onClick={() => open({ kind: 'action', action: 'confirm', row: b })}>Xác nhận</button>}
            {['PENDING', 'CONFIRMED'].includes(b.TrangThai) && upcoming && <button className="catalog-danger" disabled={!member(b.HoiVienID)?.TaiKhoanID} onClick={() => open({ kind: 'action', action: 'cancel', row: b })}>Hủy lịch</button>}
            {b.TrangThai === 'CONFIRMED' && s && shiftEnd(s) <= now && <button onClick={() => open({ kind: 'action', action: 'complete', row: b })}>Hoàn thành</button>}
          </div></td></tr>
        })}
      </tbody></table></div>{!total && <p className="catalog-state">Không có dữ liệu phù hợp.</p>}<Pagination page={currentPage} total={total} size={10} onChange={setPage} /></section>
    </>}
    {editor && <Modal title={editor.kind === 'trainer' ? 'Hồ sơ huấn luyện viên' : editor.kind === 'shift' ? 'Phân ca huấn luyện viên' : editor.kind === 'book' ? 'Đặt lịch thuê PT' : 'Xác nhận thao tác'} onClose={close}>
      <form className="catalog-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          {editor.kind === 'trainer' && <>
            <label className="catalog-full">Họ tên *<input autoFocus name="HoTen" required maxLength={100} defaultValue={currentTrainer?.HoTen} /></label>
            <label>Điện thoại<input name="SoDienThoai" maxLength={20} defaultValue={currentTrainer?.SoDienThoai || ''} /></label><label>Email<input name="Email" type="email" maxLength={100} defaultValue={currentTrainer?.Email || ''} /></label>
            <label>Ngày sinh<input name="NgaySinh" type="date" max={dateKey(new Date().toISOString())} defaultValue={dateKey(currentTrainer?.NgaySinh || '')} /></label><label>Giới tính<select name="GioiTinh" defaultValue={currentTrainer?.GioiTinh || ''}><option value="">Chưa cập nhật</option><option value="NAM">Nam</option><option value="NU">Nữ</option><option value="KHAC">Khác</option></select></label>
            <label>Chuyên môn<input name="ChuyenMon" maxLength={255} defaultValue={currentTrainer?.ChuyenMon || ''} /></label><label>Giá thuê (VNĐ) *<input name="GiaThue" type="number" min="0" step="0.01" max="9999999999999.99" required defaultValue={currentTrainer?.GiaThue ?? 0} /></label>
            <label>Trạng thái<select name="TrangThai" defaultValue={currentTrainer?.TrangThai || 'ACTIVE'}><option value="ACTIVE">Đang hoạt động</option><option value="INACTIVE">Ngừng hoạt động</option></select></label><label>Ảnh đại diện (URL)<input name="AnhDaiDien" type="url" maxLength={255} defaultValue={currentTrainer?.AnhDaiDien || ''} /></label>
            <label className="catalog-full">Kinh nghiệm<textarea name="KinhNghiem" rows={4} maxLength={10000} defaultValue={currentTrainer?.KinhNghiem || ''} /></label>
          </>}
          {editor.kind === 'shift' && <>
            <label className="catalog-full">Huấn luyện viên *<select name="PTID" required defaultValue={currentShift?.PTID || ''}><option value="" disabled>Chọn huấn luyện viên</option>{trainers.filter(t => t.TrangThai === 'ACTIVE').map(t => <option key={t.PTID} value={t.PTID}>{t.HoTen}</option>)}</select></label>
            <label>Ngày làm việc *<input name="NgayLam" type="date" min={dateKey(new Date().toISOString())} required defaultValue={dateKey(currentShift?.NgayLam || '')} /></label><label>Trạng thái<select name="TrangThai" defaultValue={currentShift?.TrangThai || 'AVAILABLE'}><option value="AVAILABLE">Còn trống / Nhận khách</option><option value="OFF">Nghỉ / Không nhận khách</option></select></label>
            <label>Bắt đầu *<input name="GioBatDau" type="time" required defaultValue={currentShift?.GioBatDau.slice(0, 5)} /></label><label>Kết thúc *<input name="GioKetThuc" type="time" required defaultValue={currentShift?.GioKetThuc.slice(0, 5)} /></label>
          </>}
          {editor.kind === 'book' && <>
            <label className="catalog-full">Hội viên *<select name="TaiKhoanID" required defaultValue=""><option value="" disabled>Chọn hội viên</option>{members.filter(m => m.TrangThai === 'ACTIVE' && m.TaiKhoanID).map(m => <option key={m.HoiVienID} value={m.TaiKhoanID ?? ''}>{m.HoTen} · HV #{m.HoiVienID}</option>)}</select></label>
            <label className="catalog-full">Lọc huấn luyện viên<select value={bookingTrainer} onChange={e => setBookingTrainer(e.target.value)}><option value="">Tất cả HLV đang hoạt động</option>{trainers.filter(t => t.TrangThai === 'ACTIVE').map(t => <option key={t.PTID} value={t.PTID}>{t.HoTen}</option>)}</select></label>
            <label className="catalog-full">Ca còn trống *<select key={bookingTrainer} name="LichPTID" required defaultValue=""><option value="" disabled>Chọn ca</option>{available.map(s => <option key={s.LichPTID} value={s.LichPTID}>{trainerName(s.PTID)} · {formatDate(s.NgayLam)} · {s.GioBatDau.slice(0, 5)}–{s.GioKetThuc.slice(0, 5)} · {money(Number(trainers.find(t => Number(t.PTID) === Number(s.PTID))?.GiaThue || 0))}</option>)}</select></label>
            {!available.length && <p className="catalog-full">Chưa có ca trống phù hợp. Hãy phân ca tại tab “Phân ca”.</p>}
            <label className="catalog-full">Ghi chú<textarea name="GhiChu" maxLength={500} rows={3} /></label>
          </>}
          {editor.kind === 'action' && <p className="catalog-full">{editor.action === 'confirm' ? 'Xác nhận' : editor.action === 'cancel' ? 'Hủy' : 'Đánh dấu hoàn thành'} lịch thuê #{editor.row.ThuePTID} của {member(editor.row.HoiVienID)?.HoTen || 'hội viên'}?</p>}
          {(editor.kind === 'deleteTrainer' || editor.kind === 'deleteShift') && <p className="catalog-full">Xóa {editor.kind === 'deleteTrainer' ? editor.row.HoTen : `ca #${editor.row.LichPTID}`}? Thao tác này không thể hoàn tác.</p>}
        </fieldset>
        {formError && <p className="catalog-error" role="alert">{formError}</p>}
        <footer><button type="button" disabled={busy} onClick={close}>Đóng</button><button className="catalog-primary" disabled={busy || (editor.kind === 'book' && !available.length)}>{busy ? 'Đang xử lý…' : 'Xác nhận lưu'}</button></footer>
      </form>
    </Modal>}
  </div>
}
