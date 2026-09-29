import { useCallback } from 'react'
import { DataState } from '../components/MemberUi'
import { formatDate, getApi, loadRelated, memberCode, money, statusLabel, useMemberData, type Member } from '../services/members'

export default function MemberDetail({ member, onBack, onActivityHistory }: { member: Member; onBack: () => void; onActivityHistory: () => void }) {
  const loader = useCallback(async (signal: AbortSignal) => {
    const [profile, related] = await Promise.all([getApi<Member>(`hoivien/${member.HoiVienID}`, signal), loadRelated(member.HoiVienID, signal)])
    return { profile, ...related }
  }, [member.HoiVienID])
  const { data, loading, error, reload } = useMemberData(loader)
  const m = data?.profile
  return <div className="member-detail-page member-api-page">
    <header className="member-detail-heading"><div><p className="breadcrumb">HỘI VIÊN › {memberCode(member.HoiVienID)}</p><h1>CHI TIẾT HỘI VIÊN</h1></div><div className="member-detail-actions"><button onClick={onBack}>← Danh sách</button><button onClick={onActivityHistory}>◷ Lịch sử hoạt động</button><button disabled={loading} onClick={reload}>↻ Làm mới</button></div></header>
    <DataState loading={loading} error={error} retry={reload} />
    {data && m && <>{data.warnings.length > 0 && <p role="alert" className="member-api-warning">Chưa tải được: {data.warnings.join(', ')}. <button onClick={reload}>Thử lại</button></p>}<div className="member-detail-layout"><aside className="member-detail-sidebar"><section className="member-id-card"><div className="member-detail-avatar">{m.HoTen?.slice(0, 1)}</div><h2>{m.HoTen}</h2><p>{memberCode(m.HoiVienID)}</p><span className={`member-status ${m.TrangThai === 'ACTIVE' ? 'active' : 'paused'}`}>{statusLabel(m.TrangThai)}</span><dl>{[['Điện thoại', m.SoDienThoai], ['Email', m.Email], ['Ngày sinh', formatDate(m.NgaySinh)], ['Giới tính', m.GioiTinh === 'NAM' ? 'Nam' : m.GioiTinh === 'NU' ? 'Nữ' : m.GioiTinh === 'KHAC' ? 'Khác' : null], ['Địa chỉ', m.DiaChi], ['Ngày đăng ký', formatDate(m.NgayDangKy)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Chưa cập nhật'}</dd></div>)}</dl></section></aside><div className="member-detail-main">
      <section className="detail-panel"><h2>Thông tin thể chất</h2><div className="inbody-metrics"><strong>{m.ChieuCao ?? '—'}<small>Chiều cao (cm)</small></strong><strong>{m.CanNang ?? '—'}<small>Cân nặng (kg)</small></strong></div><p>Mục tiêu: {m.MucTieuTheHinh || 'Chưa cập nhật'}</p></section>
      <section className="detail-panel"><h2>Gói tập đã đăng ký</h2><div className="members-table-wrap"><table className="members-table"><thead><tr><th>Gói tập</th><th>Bắt đầu</th><th>Kết thúc</th><th>Giá thanh toán</th><th>Trạng thái</th></tr></thead><tbody>{data.registrations.map(r => <tr key={r.DangKyID}><td>{data.packages.find(p => Number(p.GoiTapID) === Number(r.GoiTapID))?.TenGoi || `Gói #${r.GoiTapID}`}<small className="member-record-id">Đăng ký #{r.DangKyID}</small></td><td>{formatDate(r.NgayBatDau)}</td><td>{formatDate(r.NgayKetThuc)}</td><td>{money(r.GiaThanhToan)}</td><td>{statusLabel(r.TrangThai)}</td></tr>)}</tbody></table></div>{!data.registrations.length && <p>{data.warnings.includes('đăng ký gói') ? 'Không thể tải đăng ký gói tập.' : 'Chưa có đăng ký gói tập.'}</p>}</section>
      <section className="detail-panel"><h2>Tổng quan hoạt động</h2><div className="member-overview">{[['Lượt check-in', data.checkins.length, 'check-in'], ['Đặt lịch PT', data.bookings.length, 'đặt lịch PT'], ['Đơn hàng', data.orders.length, 'đơn hàng']].map(([label, count, source]) => <div key={label}><strong>{data.warnings.includes(String(source)) ? '—' : count}</strong><span>{label}</span></div>)}</div><button className="member-activity-link" type="button" onClick={onActivityHistory}>Xem lịch sử hoạt động <span aria-hidden="true">→</span></button></section>
    </div></div></>}
  </div>
}
