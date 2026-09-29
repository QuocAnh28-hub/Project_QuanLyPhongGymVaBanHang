import { useState } from 'react'
import { exportCsv, formatDate, loadMembers, memberCode, statusLabel, useMemberData, type Member } from '../services/members'
import { DataState, Pagination } from '../components/MemberUi'

export default function MemberList({ onSelectMember }: { onSelectMember: (member: Member) => void }) {
  const { data, loading, error, reload } = useMemberData(loadMembers)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const members = data || []
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase()
  const filtered = members.filter(m => (!status || m.TrangThai === status) && normalize(`${m.HoTen} ${m.SoDienThoai || ''} ${m.Email || ''} ${memberCode(m.HoiVienID)}`).includes(normalize(search.trim())))
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)))
  return <div className="members-page member-api-page member-list-page">
    <section className="members-heading"><div><p className="breadcrumb">VẬN HÀNH CHÍNH › HỘI VIÊN</p><h1>DANH SÁCH HỘI VIÊN</h1><p>Tra cứu hồ sơ và theo dõi hoạt động hội viên.</p></div><div className="member-heading-actions"><button onClick={reload} disabled={loading}>↻ Làm mới</button><button disabled={loading || !!error || !filtered.length} onClick={() => exportCsv('hoi-vien.csv', [['Mã hội viên', 'Họ tên', 'Điện thoại', 'Email', 'Trạng thái'], ...filtered.map(m => [memberCode(m.HoiVienID), m.HoTen, m.SoDienThoai || '', m.Email || '', statusLabel(m.TrangThai)])])}>↓ Xuất CSV</button></div></section>
    <DataState loading={loading} error={error} retry={reload} />
    {!loading && !error && <>
      <section className="member-statistics">{[['TỔNG HỘI VIÊN', members.length, 'lime'], ['ĐANG HOẠT ĐỘNG', members.filter(m => m.TrangThai === 'ACTIVE').length, 'aqua'], ['TRẠNG THÁI KHÁC', members.filter(m => m.TrangThai !== 'ACTIVE').length, 'gold'], ['KẾT QUẢ TÌM KIẾM', filtered.length, 'red']].map(([label, value, tone]) => <article className={`member-stat ${tone}`} key={label}><p>{label}</p><strong>{value}</strong></article>)}</section>
      <section className="member-filters"><div className="filter-row"><label className="member-search">⌕ <input aria-label="Tìm hội viên" placeholder="Tên, số điện thoại, email, mã hội viên…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} /></label><select aria-label="Trạng thái hội viên" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}><option value="">Tất cả trạng thái</option>{[...new Set(members.map(m => m.TrangThai))].map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}</select><button onClick={() => { setSearch(''); setStatus(''); setPage(1) }}>Xóa bộ lọc</button></div></section>
      <section className="members-table-card"><div className="members-table-wrap"><table className="members-table"><thead><tr><th>HỘI VIÊN</th><th>ĐIỆN THOẠI</th><th>EMAIL</th><th>NGÀY ĐĂNG KÝ</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>{filtered.slice((currentPage - 1) * 10, currentPage * 10).map(m => <tr key={m.HoiVienID}><td><button className="member-profile member-profile-button" onClick={() => onSelectMember(m)}><i>{m.HoTen?.slice(0, 1) || 'HV'}</i><div><strong>{m.HoTen}</strong><small>{memberCode(m.HoiVienID)}</small></div></button></td><td>{m.SoDienThoai || '—'}</td><td>{m.Email || '—'}</td><td>{formatDate(m.NgayDangKy)}</td><td><span className={`member-status ${m.TrangThai === 'ACTIVE' ? 'active' : 'paused'}`}>{statusLabel(m.TrangThai)}</span></td><td><button className="member-view-button" onClick={() => onSelectMember(m)}>Chi tiết <span aria-hidden="true">→</span></button></td></tr>)}</tbody></table></div>{!filtered.length && <p className="member-data-state">Không tìm thấy hội viên phù hợp.</p>}<Pagination page={currentPage} total={filtered.length} size={10} onChange={setPage} /></section>
    </>}
  </div>
}
