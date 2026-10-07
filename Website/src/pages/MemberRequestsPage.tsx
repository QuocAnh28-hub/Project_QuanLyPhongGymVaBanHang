import { useState } from 'react'
import { catalogRequest } from '../services/catalog'
import { useMemberData, formatDate } from '../services/members'

type Row = {
  XacMinhID?: number; BaoLuuID?: number; DangKyID?: number; HoTen: string
  TenTruong?: string; MaHSSV?: string; NgayHetHan?: string
  NgayBatDau?: string; NgayKetThuc?: string; TrangThai: string; NgayGui: string
}
const loadStudents = (signal: AbortSignal) => catalogRequest<Row[]>('member-requests/student', { signal })
const loadFreezes = (signal: AbortSignal) => catalogRequest<Row[]>('member-requests/freeze', { signal })
export default function MemberRequestsPage({ kind }: { kind: 'student' | 'freeze' }) {
  const { data, loading, error, reload } = useMemberData(kind === 'student' ? loadStudents : loadFreezes)
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState('')
  async function review(row: Row, approve: boolean) {
    if (busy) return
    setBusy(true); setNotice('')
    try {
      await catalogRequest(`member-requests/${kind}/${row.XacMinhID ?? row.BaoLuuID}/review`, {
        method: 'POST', body: JSON.stringify({ TrangThai: approve ? kind === 'student' ? 'VERIFIED' : 'APPROVED' : 'REJECTED' }),
      })
      setNotice('Đã lưu quyết định.'); reload()
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Không thể duyệt yêu cầu.') }
    finally { setBusy(false) }
  }
  return <div className="catalog-page member-api-page">
    <header className="catalog-heading"><h1>{kind === 'student' ? 'Xác minh HSSV' : 'Bảo lưu gói tập'}</h1><button disabled={loading || busy} onClick={reload}>Làm mới</button></header>
    {(error || notice) && <p role="status" className="catalog-notice">{error || notice}</p>}
    {loading ? <p>Đang tải…</p> : <section className="catalog-table-card"><div className="catalog-table-scroll"><table className="catalog-table">
      <thead><tr><th>Hội viên</th><th>Thông tin</th><th>Ngày gửi</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody>{data?.map(row => <tr key={row.XacMinhID ?? row.BaoLuuID}>
        <td>{row.HoTen}</td><td>{kind === 'student' ? <>{row.TenTruong} · {row.MaHSSV}<small>Hết hạn: {formatDate(row.NgayHetHan || '')}</small></> : <>Gói #{row.DangKyID}<small>{formatDate(row.NgayBatDau || '')} – {formatDate(row.NgayKetThuc || '')}</small></>}</td>
        <td>{formatDate(row.NgayGui, true)}</td><td>{row.TrangThai}</td><td>{row.TrangThai === 'PENDING' && <div className="catalog-row-actions"><button disabled={busy} onClick={() => void review(row, true)}>Duyệt</button><button disabled={busy} className="catalog-danger" onClick={() => void review(row, false)}>Từ chối</button></div>}</td>
      </tr>)}</tbody>
    </table></div>{!data?.length && <p className="catalog-state">Chưa có yêu cầu.</p>}</section>}
  </div>
}
