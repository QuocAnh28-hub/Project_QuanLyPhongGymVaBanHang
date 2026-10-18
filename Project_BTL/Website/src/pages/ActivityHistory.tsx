import { useCallback, useState } from 'react'
import { DataState, Pagination } from '../components/MemberUi'
import {
  exportCsv,
  formatDate,
  loadRelated,
  memberCode,
  money,
  statusLabel,
  useMemberData,
  type Member,
} from '../services/members'

type Activity = {
  id: string
  type: string
  date: string
  title: string
  detail: string
  status: string
}
export default function ActivityHistory({
  member,
  onBack,
}: {
  member: Member
  onBack: () => void
}) {
  const loader = useCallback(
    (signal: AbortSignal) => loadRelated(member.HoiVienID, signal),
    [member.HoiVienID]
  )
  const { data, loading, error, reload } = useMemberData(loader)
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const activities: Activity[] = data
    ? [
        ...data.checkins.flatMap((c) => [
          {
            id: `in-${c.CheckInID}`,
            type: 'checkin',
            date: c.ThoiGianCheckIn,
            title: `Check-in #${c.CheckInID}`,
            detail: 'Ghi nhận vào phòng tập',
            status: '',
          },
          ...(c.ThoiGianCheckOut
            ? [
                {
                  id: `out-${c.CheckInID}`,
                  type: 'checkin',
                  date: c.ThoiGianCheckOut,
                  title: `Check-out #${c.CheckInID}`,
                  detail: 'Ghi nhận rời phòng tập',
                  status: '',
                },
              ]
            : []),
        ]),
        ...data.registrations.map((r) => ({
          id: `registration-${r.DangKyID}`,
          type: 'package',
          date: r.NgayDangKy,
          title: `Đăng ký gói #${r.DangKyID}`,
          detail: `${data.packages.find((p) => Number(p.GoiTapID) === Number(r.GoiTapID))?.TenGoi || `Gói #${r.GoiTapID}`} · ${formatDate(r.NgayBatDau)} – ${formatDate(r.NgayKetThuc)} · ${money(r.GiaThanhToan)}`,
          status: r.TrangThai,
        })),
        ...data.orders.map((o) => ({
          id: `order-${o.DonHangID}`,
          type: 'order',
          date: o.NgayDat,
          title: `Đặt đơn hàng #${o.DonHangID}`,
          detail: `Giá trị đơn hàng: ${money(o.TongTien)}`,
          status: o.TrangThai,
        })),
        ...data.bookings.map((b) => ({
          id: `pt-${b.ThuePTID}`,
          type: 'pt',
          date: b.NgayDat,
          title: `Đặt lịch PT #${b.ThuePTID}`,
          detail: `Huấn luyện viên #${b.PTID}`,
          status: b.TrangThai,
        })),
      ]
    : []
  const invalidRange = !!from && !!to && from > to
  const filtered = activities
    .filter((a) => {
      const time = new Date(a.date).getTime()
      return (
        !invalidRange &&
        (!type || a.type === type) &&
        `${a.title} ${a.detail}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()) &&
        (!from || time >= new Date(`${from}T00:00:00`).getTime()) &&
        (!to || time <= new Date(`${to}T23:59:59.999`).getTime())
      )
    })
    .sort(
      (a, b) =>
        (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0)
    )
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 10))
  )
  return (
    <div className="activity-history-page member-api-page">
      <header className="activity-history-heading">
        <div>
          <p className="breadcrumb">
            HỘI VIÊN › {memberCode(member.HoiVienID)} › LỊCH SỬ
          </p>
          <h1>LỊCH SỬ HOẠT ĐỘNG</h1>
          <p>
            {member.HoTen} · {memberCode(member.HoiVienID)}
          </p>
        </div>
        <div className="activity-history-actions">
          <button onClick={onBack}>← Hồ sơ hội viên</button>
          <button disabled={loading} onClick={reload}>
            ↻ Làm mới
          </button>
          <button
            disabled={loading || !filtered.length}
            onClick={() =>
              exportCsv(`lich-su-${memberCode(member.HoiVienID)}.csv`, [
                ['Thời gian', 'Hoạt động', 'Chi tiết', 'Trạng thái hiện tại'],
                ...filtered.map((a) => [
                  formatDate(a.date, true),
                  a.title,
                  a.detail,
                  a.status ? statusLabel(a.status) : '',
                ]),
              ])
            }
          >
            ↓ Xuất CSV
          </button>
        </div>
      </header>
      <DataState loading={loading} error={error} retry={reload} />
      {!loading && data && (
        <>
          {data.warnings.length > 0 && (
            <p className="member-api-warning" role="alert">
              Lịch sử chưa đầy đủ. Chưa tải được: {data.warnings.join(', ')}.{' '}
              <button onClick={reload}>Thử lại</button>
            </p>
          )}
          <section className="activity-summary">
            {[
              ['CHECK-IN', data.checkins.length, 'check-in'],
              ['ĐĂNG KÝ GÓI', data.registrations.length, 'đăng ký gói'],
              ['ĐẶT LỊCH PT', data.bookings.length, 'đặt lịch PT'],
              ['ĐƠN HÀNG', data.orders.length, 'đơn hàng'],
            ].map(([label, count, source]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>
                  {data.warnings.includes(String(source)) ? '—' : count}
                </strong>
                <p>Tổng số bản ghi của hội viên</p>
              </article>
            ))}
          </section>
          <section className="member-filters">
            <div className="filter-row">
              <label className="member-search">
                <input
                  aria-label="Tìm hoạt động"
                  placeholder="Tìm hoạt động, mã đơn, tên gói…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </label>
              <select
                aria-label="Loại hoạt động"
                value={type}
                onChange={(e) => {
                  setType(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">Tất cả hoạt động</option>
                <option value="checkin">Check-in / Check-out</option>
                <option value="package">Đăng ký gói</option>
                <option value="pt">Đặt lịch PT</option>
                <option value="order">Đơn hàng</option>
              </select>
              <label>
                Từ ngày{' '}
                <input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value)
                    setPage(1)
                  }}
                />
              </label>
              <label>
                Đến ngày{' '}
                <input
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value)
                    setPage(1)
                  }}
                />
              </label>
              <button
                onClick={() => {
                  setType('')
                  setSearch('')
                  setFrom('')
                  setTo('')
                  setPage(1)
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
            {invalidRange && (
              <p role="alert">Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.</p>
            )}
          </section>
          <section className="activity-stream">
            <div className="activity-stream-heading">
              <b>DÒNG THỜI GIAN</b>
              <span>{filtered.length} sự kiện · Mới nhất trước</span>
            </div>
            {filtered
              .slice((currentPage - 1) * 10, currentPage * 10)
              .map((a) => (
                <article className="activity-event" key={a.id}>
                  <div className="activity-event-icon">◷</div>
                  <div className="activity-event-content">
                    <header>
                      <h3>{a.title}</h3>
                      <time dateTime={a.date}>{formatDate(a.date, true)}</time>
                    </header>
                    <p>{a.detail}</p>
                    {a.status && (
                      <footer>
                        Trạng thái hiện tại: {statusLabel(a.status)}
                      </footer>
                    )}
                  </div>
                </article>
              ))}
            {!filtered.length && (
              <p className="member-data-state">
                {data.warnings.length
                  ? 'Không có sự kiện phù hợp trong dữ liệu đã tải.'
                  : 'Chưa có hoạt động phù hợp với bộ lọc.'}
              </p>
            )}
            <Pagination
              page={currentPage}
              total={filtered.length}
              size={10}
              onChange={setPage}
            />
          </section>
        </>
      )}
    </div>
  )
}
