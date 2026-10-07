import { useCallback, useState, type FormEvent } from 'react'
import ImageInput from '../components/ImageInput'
import { catalogRequest } from '../services/catalog'
import { isImagePath, resolveBackendImageUrl } from '../services/images'
import { DataState } from '../components/MemberUi'
import {
  formatDate,
  getApi,
  loadRelated,
  memberCode,
  money,
  statusLabel,
  useMemberData,
  type Member,
} from '../services/members'

export default function MemberDetail({
  member,
  onBack,
  onActivityHistory,
}: {
  member: Member
  onBack: () => void
  onActivityHistory: () => void
}) {
  const loader = useCallback(
    async (signal: AbortSignal) => {
      const [profile, related] = await Promise.all([
        getApi<Member & { AnhDaiDien?: string | null }>(`hoivien/${member.HoiVienID}`, signal),
        loadRelated(member.HoiVienID, signal),
      ])
      return { profile, ...related }
    },
    [member.HoiVienID]
  )
  const { data, loading, error, reload } = useMemberData(loader)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveNotice, setSaveNotice] = useState('')
  const [failedImage, setFailedImage] = useState<string>()
  const m = data?.profile
  const avatar = resolveBackendImageUrl(m?.AnhDaiDien)
  async function saveImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (uploading || saving || !m) return
    const image = String(new FormData(event.currentTarget).get('AnhDaiDien') || '').trim()
    if (image && (!isImagePath(image) || image.length > 255)) {
      setSaveError('URL / đường dẫn ảnh không hợp lệ.')
      return
    }
    setSaving(true)
    setSaveError('')
    setSaveNotice('')
    try {
      await catalogRequest(`hoivien/${m.HoiVienID}`, {
        method: 'PUT', body: JSON.stringify({ AnhDaiDien: image || null }),
      })
      setFailedImage(undefined)
      setSaveNotice('Đã cập nhật ảnh đại diện.')
      reload()
    } catch (failure) {
      setSaveError(failure instanceof Error ? failure.message : 'Không thể lưu ảnh.')
    } finally { setSaving(false) }
  }
  return (
    <div className="member-detail-page member-api-page">
      <header className="member-detail-heading">
        <div>
          <p className="breadcrumb">QUẢN LÝ HỘI VIÊN <span aria-hidden="true">/</span> {memberCode(member.HoiVienID)}</p>
          <h1>Chi tiết hội viên</h1>
          <p className="member-detail-subtitle">Hồ sơ cá nhân, gói tập và hoạt động tại câu lạc bộ.</p>
        </div>
        <div className="member-detail-actions">
          <button disabled={uploading || saving} onClick={onBack}>Quay lại danh sách</button>
          <button disabled={loading || uploading || saving} onClick={reload}>Làm mới</button>
          <button className="member-detail-primary" disabled={uploading || saving} onClick={onActivityHistory}>Lịch sử hoạt động</button>
        </div>
      </header>
      <DataState loading={loading} error={error} retry={reload} />
      {saveNotice && <p role="status" className="member-detail-success">{saveNotice}</p>}
      {data && m && (
        <>
          {data.warnings.length > 0 && (
            <div role="alert" className="member-api-warning">
              <span>Chưa tải được: {data.warnings.join(', ')}.</span>
              <button onClick={reload}>Thử lại</button>
            </div>
          )}
          <div className="member-detail-layout">
            <aside className="member-detail-sidebar">
              <section className="member-id-card" aria-labelledby="member-profile-name">
                <div className="member-profile-identity">
                  <div className="member-detail-avatar">
                    {avatar && failedImage !== avatar
                      ? <img src={avatar} alt={m.HoTen} onError={() => setFailedImage(avatar)} />
                      : m.HoTen?.slice(0, 1)}
                  </div>
                  <h2 id="member-profile-name">{m.HoTen}</h2>
                  <p className="member-detail-code">{memberCode(m.HoiVienID)}</p>
                  <span className="member-detail-badge" data-status={m.TrangThai}>{statusLabel(m.TrangThai)}</span>
                </div>
                <div className="member-contact-section">
                  <h3>Thông tin cá nhân</h3>
                  <dl>
                    {[
                      ['Điện thoại', m.SoDienThoai],
                      ['Email', m.Email],
                      ['Ngày sinh', formatDate(m.NgaySinh)],
                      ['Giới tính', m.GioiTinh === 'NAM' ? 'Nam' : m.GioiTinh === 'NU' ? 'Nữ' : m.GioiTinh === 'KHAC' ? 'Khác' : null],
                      ['Địa chỉ', m.DiaChi],
                      ['Ngày đăng ký', formatDate(m.NgayDangKy)],
                    ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Chưa cập nhật'}</dd></div>)}
                  </dl>
                </div>
                <details className="member-avatar-editor">
                  <summary>Cập nhật ảnh đại diện</summary>
                  <form className="member-avatar-form" onSubmit={saveImage}>
                    <p className="member-avatar-help">Chọn ảnh JPG, PNG, WEBP tối đa 5 MB hoặc nhập đường dẫn ảnh.</p>
                    <fieldset disabled={saving || uploading}>
                      <ImageInput key={`${m.HoiVienID}:${m.AnhDaiDien || ''}`} name="AnhDaiDien" value={m.AnhDaiDien}
                        endpoint={`hoivien/${m.HoiVienID}/upload-image`} onBusyChange={setUploading} />
                    </fieldset>
                    {saveError && <p role="alert" className="catalog-error">{saveError}</p>}
                    <button className="member-avatar-save" disabled={saving || uploading}>{saving ? 'Đang lưu…' : 'Lưu ảnh đại diện'}</button>
                  </form>
                </details>
              </section>
            </aside>
            <div className="member-detail-main">
              <section className="detail-panel member-activity-panel" aria-labelledby="member-activity-title">
                <header className="member-panel-heading">
                  <div><p className="member-section-label">HOẠT ĐỘNG</p><h2 id="member-activity-title">Tổng quan hội viên</h2></div>
                </header>
                <div className="member-overview">
                  {[
                    ['Lượt check-in', data.checkins.length, 'check-in', 'Ra vào phòng tập'],
                    ['Lịch thuê PT', data.bookings.length, 'đặt lịch PT', 'Huấn luyện cá nhân'],
                    ['Đơn hàng', data.orders.length, 'đơn hàng', 'Mua sắm tại câu lạc bộ'],
                  ].map(([label, count, source, note]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{data.warnings.includes(String(source)) ? '—' : count}</strong>
                      <small>{note}</small>
                    </div>
                  ))}
                </div>
              </section>
              <div className="member-wellness-grid">
                <section className="detail-panel member-physical-panel" aria-labelledby="member-physical-title">
                  <header className="member-panel-heading"><div><p className="member-section-label">THỂ CHẤT</p><h2 id="member-physical-title">Chỉ số hiện tại</h2></div></header>
                  <div className="inbody-metrics">
                    <div><span>Chiều cao</span><strong>{m.ChieuCao ?? '—'}<small>cm</small></strong></div>
                    <div><span>Cân nặng</span><strong>{m.CanNang ?? '—'}<small>kg</small></strong></div>
                  </div>
                </section>
                <section className="detail-panel member-goal-panel" aria-labelledby="member-goal-title">
                  <header className="member-panel-heading"><div><p className="member-section-label">ĐỊNH HƯỚNG</p><h2 id="member-goal-title">Mục tiêu tập luyện</h2></div></header>
                  <p className="member-goal-value">{m.MucTieuTheHinh || 'Chưa cập nhật mục tiêu'}</p>
                  <p className="member-panel-description">Mục tiêu hội viên đã đăng ký trong hồ sơ.</p>
                </section>
              </div>
              <section className="detail-panel member-packages-panel" aria-labelledby="member-packages-title">
                <header className="member-panel-heading">
                  <div><p className="member-section-label">GÓI TẬP</p><h2 id="member-packages-title">Lịch sử đăng ký</h2></div>
                  {!data.warnings.includes('đăng ký gói') && <span className="member-detail-count">{data.registrations.length} gói</span>}
                </header>
                {data.registrations.length > 0 ? (
                  <div className="members-table-wrap" role="region" aria-label="Gói tập đã đăng ký" tabIndex={0}>
                    <table className="members-table">
                      <thead><tr><th scope="col">Gói tập</th><th scope="col">Bắt đầu</th><th scope="col">Kết thúc</th><th scope="col">Giá thanh toán</th><th scope="col">Trạng thái</th></tr></thead>
                      <tbody>{data.registrations.map(r => (
                        <tr key={r.DangKyID}>
                          <td><strong>{data.packages.find(p => Number(p.GoiTapID) === Number(r.GoiTapID))?.TenGoi || `Gói #${r.GoiTapID}`}</strong><small className="member-record-id">Đăng ký #{r.DangKyID}</small></td>
                          <td>{formatDate(r.NgayBatDau)}</td><td>{formatDate(r.NgayKetThuc)}</td><td className="member-package-price">{money(r.GiaThanhToan)}</td>
                          <td><span className="member-detail-badge" data-status={r.TrangThai}>{statusLabel(r.TrangThai)}</span></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : <div className="member-detail-empty"><strong>{data.warnings.includes('đăng ký gói') ? 'Chưa tải được gói tập' : 'Chưa có đăng ký gói tập'}</strong><p>{data.warnings.includes('đăng ký gói') ? 'Bấm Thử lại để tải thông tin đăng ký.' : 'Các gói hội viên đăng ký sẽ được hiển thị tại đây.'}</p></div>}
              </section>
              <div className="member-history-callout">
                <div><h3>Theo dõi hoạt động chi tiết</h3><p>Tra cứu các lần check-in, lịch PT và đơn hàng của hội viên.</p></div>
                <button className="member-activity-link" type="button" onClick={onActivityHistory}>Xem lịch sử hoạt động</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
