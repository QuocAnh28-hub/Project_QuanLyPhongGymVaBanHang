import { useState } from 'react'
import ImageInput from '../components/ImageInput'
import { Modal } from '../components/AdminLayout'
import { Pagination } from '../components/MemberUi'
import { formatDate, money } from '../services/members'
import { dateKey, ptStatus } from '../services/trainers'
import { useTrainerPage, type Mode } from '../services/useTrainerPage'

export default function TrainerPages({
  mode,
  onOpenRoster,
}: {
  mode: Mode
  onOpenRoster?: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const {
    changeSearch,
    changeStatus,
    changeTrainer,
    changeFrom,
    changeTo,
    resetFilters,
    stats,
    visibleTrainers,
    visibleShifts,
    visibleBookings,
    activeTrainers,
    activeMembers,
    today,
    trainerPrice,
    trainerHasSchedule,
    isShiftLocked,
    canEditShift,
    bookingView,
    data,
    loading,
    error,
    reload,
    search,
    status,
    trainer,
    from,
    to,
    setPage,
    editor,
    busy,
    formError,
    notice,
    bookingTrainer,
    setBookingTrainer,
    trainers,
    trainerName,
    member,
    rangeError,
    total,
    currentPage,
    statuses,
    title,
    open,
    close,
    submit,
    download,
    currentTrainer,
    currentShift,
    available,
  } = useTrainerPage(mode)
  const badge = (value: string) => (
    <span className={`catalog-badge ${value.toLowerCase()}`}>
      {ptStatus(value)}
    </span>
  )
  return (
    <div className="catalog-page trainer-api-page member-api-page">
      <header className="catalog-heading">
        <div>
          <p className="catalog-eyebrow">VẬN HÀNH / HUẤN LUYỆN VIÊN</p>
          <h1>{title}</h1>
          <p>
            {mode === 'roster'
              ? 'Phân công khung giờ làm việc, mở lịch nhận khách và ngày nghỉ.'
              : mode === 'bookings'
                ? 'Theo dõi hội viên, khung giờ tập và trạng thái lịch thuê.'
                : 'Quản lý hồ sơ, chuyên môn, thông tin liên hệ và giá thuê PT.'}
          </p>
        </div>
        <div className="catalog-actions">
          {onOpenRoster && (
            <button onClick={onOpenRoster}>Lịch làm việc →</button>
          )}
          <button disabled={loading} onClick={reload}>
            ↻ Làm mới
          </button>
          <button disabled={loading || !!error || !total} onClick={download}>
            ↓ Xuất CSV
          </button>
          <button
            className="catalog-primary"
            disabled={loading || !!error}
            onClick={() =>
              open({
                kind:
                  mode === 'trainers'
                    ? 'trainer'
                    : mode === 'roster'
                      ? 'shift'
                      : 'book',
              })
            }
          >
            ＋{' '}
            {mode === 'trainers'
              ? 'Thêm HLV'
              : mode === 'roster'
                ? 'Phân ca'
                : 'Đặt lịch PT'}
          </button>
        </div>
      </header>
      {notice && (
        <p role="status" className="catalog-notice">
          {notice}
        </p>
      )}
      {loading && (
        <p role="status" className="catalog-state">
          Đang tải dữ liệu…
        </p>
      )}
      {error && (
        <div role="alert" className="catalog-error">
          <p>{error}</p>
          <button onClick={reload}>Thử lại</button>
        </div>
      )}
      {!loading && !error && data && (
        <>
          <section className="catalog-stats">
            {stats.map(({ status, count }) => (
              <article key={status}>
                <span>{ptStatus(status)}</span>
                <strong>{count}</strong>
              </article>
            ))}
          </section>
          <section className="catalog-filters">
            <input
              aria-label="Tìm kiếm"
              value={search}
              placeholder="Tìm tên, mã hoặc thông tin liên quan…"
              onChange={(e) => changeSearch(e.target.value)}
            />
            {mode !== 'trainers' && (
              <select
                aria-label="Huấn luyện viên"
                value={trainer}
                onChange={(e) => changeTrainer(e.target.value)}
              >
                <option value="">Tất cả HLV</option>
                {trainers.map((t) => (
                  <option key={t.PTID} value={t.PTID}>
                    {t.HoTen}
                  </option>
                ))}
              </select>
            )}
            <select
              aria-label="Trạng thái"
              value={status}
              onChange={(e) => changeStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {ptStatus(s)}
                </option>
              ))}
            </select>
            {mode !== 'trainers' && (
              <>
                <label>
                  Từ ngày
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => changeFrom(e.target.value)}
                  />
                </label>
                <label>
                  Đến ngày
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => changeTo(e.target.value)}
                  />
                </label>
              </>
            )}
            <button onClick={resetFilters}>Xóa bộ lọc</button>
          </section>
          {rangeError && (
            <p role="alert" className="catalog-error">
              Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.
            </p>
          )}
          <section className="catalog-table-card">
            <div className="catalog-table-scroll">
              <table className="catalog-table">
                <thead>
                  <tr>
                    {(mode === 'trainers'
                      ? [
                          'Huấn luyện viên',
                          'Liên hệ',
                          'Chuyên môn',
                          'Giá thuê',
                          'Trạng thái',
                          'Thao tác',
                        ]
                      : mode === 'roster'
                        ? [
                            'Huấn luyện viên',
                            'Ngày làm việc',
                            'Khung giờ',
                            'Trạng thái',
                            'Thao tác',
                          ]
                        : [
                            'Hội viên',
                            'Huấn luyện viên',
                            'Lịch tập',
                            'Giá thuê',
                            'Trạng thái',
                            'Thao tác',
                          ]
                    ).map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mode === 'trainers' &&
                    visibleTrainers.map((t) => (
                      <tr key={t.PTID}>
                        <td>
                          <strong>{t.HoTen}</strong>
                          <small className="trainer-sub">PT #{t.PTID}</small>
                        </td>
                        <td>
                          {t.SoDienThoai || '—'}
                          <small className="trainer-sub">
                            {t.Email || 'Chưa có email'}
                          </small>
                        </td>
                        <td>{t.ChuyenMon || 'Chưa cập nhật'}</td>
                        <td>{money(Number(t.GiaThue))}</td>
                        <td>{badge(t.TrangThai)}</td>
                        <td>
                          <div className="catalog-row-actions">
                            <button
                              onClick={() => open({ kind: 'trainer', row: t })}
                            >
                              Hồ sơ / Sửa
                            </button>
                            <button
                              className="catalog-danger"
                              disabled={trainerHasSchedule(t)}
                              onClick={() =>
                                open({ kind: 'deleteTrainer', row: t })
                              }
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {mode === 'roster' &&
                    visibleShifts.map((s) => (
                      <tr key={s.LichPTID}>
                        <td>
                          <strong>{trainerName(s.PTID)}</strong>
                          <small className="trainer-sub">
                            Ca #{s.LichPTID}
                          </small>
                        </td>
                        <td>{formatDate(s.NgayLam)}</td>
                        <td>
                          {s.GioBatDau.slice(0, 5)} – {s.GioKetThuc.slice(0, 5)}
                        </td>
                        <td>{badge(s.TrangThai)}</td>
                        <td>
                          <div className="catalog-row-actions">
                            <button
                              disabled={!canEditShift(s)}
                              onClick={() => open({ kind: 'shift', row: s })}
                            >
                              Sửa ca
                            </button>
                            <button
                              className="catalog-danger"
                              disabled={isShiftLocked(s)}
                              onClick={() =>
                                open({ kind: 'deleteShift', row: s })
                              }
                            >
                              Xóa
                            </button>
                          </div>
                          {isShiftLocked(s) && (
                            <small className="trainer-sub">
                              Đã có lịch thuê, giữ nguyên ca
                            </small>
                          )}
                        </td>
                      </tr>
                    ))}
                  {mode === 'bookings' &&
                    visibleBookings.map((b) => {
                      const {
                        shift: s,
                        canConfirm,
                        showCancel,
                        canCancel,
                        canComplete,
                      } = bookingView(b)
                      return (
                        <tr key={b.ThuePTID}>
                          <td>
                            <strong>
                              {member(b.HoiVienID)?.HoTen ||
                                `Hội viên #${b.HoiVienID}`}
                            </strong>
                            <small className="trainer-sub">
                              Lịch thuê #{b.ThuePTID} · Đặt{' '}
                              {formatDate(b.NgayDat)}
                            </small>
                            {b.GhiChu && (
                              <p className="catalog-description">{b.GhiChu}</p>
                            )}
                          </td>
                          <td>{trainerName(b.PTID)}</td>
                          <td>
                            {s ? (
                              <>
                                {formatDate(s.NgayLam)}
                                <small className="trainer-sub">
                                  {s.GioBatDau.slice(0, 5)} –{' '}
                                  {s.GioKetThuc.slice(0, 5)}
                                </small>
                              </>
                            ) : (
                              'Không tìm thấy ca'
                            )}
                          </td>
                          <td>{money(Number(b.GiaThue))}</td>
                          <td>{badge(b.TrangThai)}<small>{b.TrangThaiThanhToan || 'Chưa có thanh toán'}</small></td>
                          <td>
                            <div className="catalog-row-actions">
                              {canConfirm && (
                                <button
                                  onClick={() =>
                                    open({
                                      kind: 'action',
                                      action: 'confirm',
                                      row: b,
                                    })
                                  }
                                >
                                  Xác nhận đã thu tiền
                                </button>
                              )}
                              {showCancel && (
                                <button
                                  className="catalog-danger"
                                  disabled={!canCancel}
                                  onClick={() =>
                                    open({
                                      kind: 'action',
                                      action: 'cancel',
                                      row: b,
                                    })
                                  }
                                >
                                  Hủy lịch
                                </button>
                              )}
                              {canComplete && (
                                <button
                                  onClick={() =>
                                    open({
                                      kind: 'action',
                                      action: 'complete',
                                      row: b,
                                    })
                                  }
                                >
                                  Hoàn thành
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
            {!total && (
              <p className="catalog-state">Không có dữ liệu phù hợp.</p>
            )}
            <Pagination
              page={currentPage}
              total={total}
              size={10}
              onChange={setPage}
            />
          </section>
        </>
      )}
      {editor && (
        <Modal
          title={
            editor.kind === 'trainer'
              ? 'Hồ sơ huấn luyện viên'
              : editor.kind === 'shift'
                ? 'Phân ca huấn luyện viên'
                : editor.kind === 'book'
                  ? 'Đặt lịch thuê PT'
                  : 'Xác nhận thao tác'
          }
          onClose={() => { if (!uploading) close() }}
        >
          <form className="catalog-form" onSubmit={event => { if (uploading) event.preventDefault(); else submit(event) }}>
            <fieldset disabled={busy || uploading}>
              {editor.kind === 'trainer' && (
                <>
                  <label className="catalog-full">
                    Họ tên *
                    <input
                      autoFocus
                      name="HoTen"
                      required
                      maxLength={100}
                      defaultValue={currentTrainer?.HoTen}
                    />
                  </label>
                  <label>
                    Điện thoại
                    <input
                      name="SoDienThoai"
                      maxLength={20}
                      defaultValue={currentTrainer?.SoDienThoai || ''}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      name="Email"
                      type="email"
                      maxLength={100}
                      defaultValue={currentTrainer?.Email || ''}
                    />
                  </label>
                  <label>
                    Ngày sinh
                    <input
                      name="NgaySinh"
                      type="date"
                      max={today}
                      defaultValue={dateKey(currentTrainer?.NgaySinh || '')}
                    />
                  </label>
                  <label>
                    Giới tính
                    <select
                      name="GioiTinh"
                      defaultValue={currentTrainer?.GioiTinh || ''}
                    >
                      <option value="">Chưa cập nhật</option>
                      <option value="NAM">Nam</option>
                      <option value="NU">Nữ</option>
                      <option value="KHAC">Khác</option>
                    </select>
                  </label>
                  <label>
                    Chuyên môn
                    <input
                      name="ChuyenMon"
                      maxLength={255}
                      defaultValue={currentTrainer?.ChuyenMon || ''}
                    />
                  </label>
                  <label>
                    Giá thuê (VNĐ) *
                    <input
                      name="GiaThue"
                      type="number"
                      min="0"
                      step="0.01"
                      max="9999999999999.99"
                      required
                      defaultValue={currentTrainer?.GiaThue ?? 0}
                    />
                  </label>
                  <label>
                    Trạng thái
                    <select
                      name="TrangThai"
                      defaultValue={currentTrainer?.TrangThai || 'ACTIVE'}
                    >
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                  </label>
                  <ImageInput name="AnhDaiDien" value={currentTrainer?.AnhDaiDien}
                    endpoint="pt/upload-image" onBusyChange={setUploading} />
                  <label className="catalog-full">
                    Kinh nghiệm
                    <textarea
                      name="KinhNghiem"
                      rows={4}
                      maxLength={10000}
                      defaultValue={currentTrainer?.KinhNghiem || ''}
                    />
                  </label>
                </>
              )}
              {editor.kind === 'shift' && (
                <>
                  <label className="catalog-full">
                    Huấn luyện viên *
                    <select
                      name="PTID"
                      required
                      defaultValue={currentShift?.PTID || ''}
                    >
                      <option value="" disabled>
                        Chọn huấn luyện viên
                      </option>
                      {activeTrainers.map((t) => (
                        <option key={t.PTID} value={t.PTID}>
                          {t.HoTen}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Ngày làm việc *
                    <input
                      name="NgayLam"
                      type="date"
                      min={today}
                      required
                      defaultValue={dateKey(currentShift?.NgayLam || '')}
                    />
                  </label>
                  <label>
                    Trạng thái
                    <select
                      name="TrangThai"
                      defaultValue={currentShift?.TrangThai || 'AVAILABLE'}
                    >
                      <option value="AVAILABLE">Còn trống / Nhận khách</option>
                      <option value="OFF">Nghỉ / Không nhận khách</option>
                    </select>
                  </label>
                  <label>
                    Bắt đầu *
                    <input
                      name="GioBatDau"
                      type="time"
                      required
                      defaultValue={currentShift?.GioBatDau.slice(0, 5)}
                    />
                  </label>
                  <label>
                    Kết thúc *
                    <input
                      name="GioKetThuc"
                      type="time"
                      required
                      defaultValue={currentShift?.GioKetThuc.slice(0, 5)}
                    />
                  </label>
                </>
              )}
              {editor.kind === 'book' && (
                <>
                  <label className="catalog-full">
                    Hội viên *
                    <select name="TaiKhoanID" required defaultValue="">
                      <option value="" disabled>
                        Chọn hội viên
                      </option>
                      {activeMembers.map((m) => (
                        <option key={m.HoiVienID} value={m.TaiKhoanID ?? ''}>
                          {m.HoTen} · HV #{m.HoiVienID}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="catalog-full">
                    Lọc huấn luyện viên
                    <select
                      value={bookingTrainer}
                      onChange={(e) => setBookingTrainer(e.target.value)}
                    >
                      <option value="">Tất cả HLV đang hoạt động</option>
                      {activeTrainers.map((t) => (
                        <option key={t.PTID} value={t.PTID}>
                          {t.HoTen}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="catalog-full">
                    Ca còn trống *
                    <select
                      key={bookingTrainer}
                      name="LichPTID"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Chọn ca
                      </option>
                      {available.map((s) => (
                        <option key={s.LichPTID} value={s.LichPTID}>
                          {trainerName(s.PTID)} · {formatDate(s.NgayLam)} ·{' '}
                          {s.GioBatDau.slice(0, 5)}–{s.GioKetThuc.slice(0, 5)} ·{' '}
                          {money(trainerPrice(s.PTID))}
                        </option>
                      ))}
                    </select>
                  </label>
                  {!available.length && (
                    <p className="catalog-full">
                      Chưa có ca trống phù hợp. Hãy phân ca tại tab “Phân ca”.
                    </p>
                  )}
                  <label className="catalog-full">
                    Ghi chú
                    <textarea name="GhiChu" maxLength={500} rows={3} />
                  </label>
                </>
              )}
              {editor.kind === 'action' && (
                <p className="catalog-full">
                  {editor.action === 'confirm'
                    ? 'Xác nhận đã thu tiền'
                    : editor.action === 'cancel'
                      ? 'Hủy'
                      : 'Đánh dấu hoàn thành'}{' '}
                  lịch thuê #{editor.row.ThuePTID} của{' '}
                  {member(editor.row.HoiVienID)?.HoTen || 'hội viên'}?
                </p>
              )}
              {(editor.kind === 'deleteTrainer' ||
                editor.kind === 'deleteShift') && (
                <p className="catalog-full">
                  Xóa{' '}
                  {editor.kind === 'deleteTrainer'
                    ? editor.row.HoTen
                    : `ca #${editor.row.LichPTID}`}
                  ? Thao tác này không thể hoàn tác.
                </p>
              )}
            </fieldset>
            {formError && (
              <p className="catalog-error" role="alert">
                {formError}
              </p>
            )}
            <footer>
              <button type="button" disabled={busy || uploading} onClick={close}>
                Đóng
              </button>
              <button
                className="catalog-primary"
                disabled={uploading || busy || (editor.kind === 'book' && !available.length)}
              >
                {busy ? 'Đang xử lý…' : 'Xác nhận lưu'}
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  )
}
