import { useEffect, useState } from 'react'
import { MetricCard } from '../components/AdminLayout'
import {
  getQrRecords,
  issueQr,
  revokeQr,
  searchMembers,
  type IssuedQr,
  type MemberOption,
  type QrRecord,
} from '../services/checkins'

export default function CheckInQrPage() {
  const [rows, setRows] = useState<QrRecord[]>([]),
    [members, setMembers] = useState<MemberOption[]>([]),
    [selected, setSelected] = useState<MemberOption | null>(null),
    [issued, setIssued] = useState<IssuedQr | null>(null),
    [query, setQuery] = useState(''),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [toast, setToast] = useState('')
  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }
  const load = async () => {
    try {
      setRows(await getQrRecords())
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải QR')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- fetch initializes server state
    void load()
  }, [])
  useEffect(() => {
    if (!query.trim()) return
    const timer = window.setTimeout(
      () =>
        void searchMembers(query.trim())
          .then(setMembers)
          .catch((e) => notify(e.message)),
      250
    )
    return () => window.clearTimeout(timer)
  }, [query])
  const issue = async () => {
    if (!selected) return notify('Hãy chọn hội viên')
    try {
      setBusy(true)
      const value = await issueQr(selected.TaiKhoanID)
      setIssued(value)
      await load()
      notify('Đã cấp QR tại quầy')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Không thể cấp QR')
    } finally {
      setBusy(false)
    }
  }
  const revoke = async (id: number) => {
    try {
      await revokeQr(id)
      if (issued?.MaQRID === id) setIssued(null)
      await load()
      notify('Đã thu hồi QR')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Không thể thu hồi QR')
    }
  }
  const copy = async () => {
    if (issued) {
      await navigator.clipboard.writeText(issued.token)
      notify('Đã sao chép token')
    }
  }
  return (
    <div className="admin-page checkin-page qr-page">
      <div className="security-strip">
        <b>♢ SIGNED QR:</b>
        <span>Backend HMAC SHA-256</span>
        <strong>Single-use</strong>
        <small>Không expose secret</small>
      </div>
      <header className="page-heading">
        <div>
          <p>
            VẬN HÀNH CHÍNH　›　CỔNG CHECK-IN　›　<b>QUẢN LÝ MÃ QR</b>
          </p>
          <h1>QUẢN LÝ QR CHECK-IN</h1>
          <span className="online-badge">● MYSQL · SIGNED TOKEN</span>
        </div>
        <div className="heading-actions">
          <button onClick={() => void load()}>↻ LÀM MỚI</button>
        </div>
      </header>
      <section className="metrics-grid">
        <MetricCard
          label="TỔNG QR"
          value={String(rows.length)}
          note="Dữ liệu MySQL"
        />
        <MetricCard
          label="ACTIVE"
          value={String(rows.filter((x) => x.TrangThai === 'ACTIVE').length)}
          note="Có thể scan"
          tone="mint"
        />
        <MetricCard
          label="EXPIRED"
          value={String(rows.filter((x) => x.TrangThai === 'EXPIRED').length)}
          note="Không thể scan"
        />
        <MetricCard
          label="INACTIVE"
          value={String(rows.filter((x) => x.TrangThai === 'INACTIVE').length)}
          note="Đã dùng hoặc thu hồi"
          tone="error"
        />
      </section>
      <div className="qr-layout">
        <section className="qr-directory">
          <header>
            <h2>☷ DANH SÁCH QR THẬT</h2>
          </header>
          {loading && <div className="empty-state">Đang tải...</div>}
          {error && <div className="empty-state">{error}</div>}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID / TOKEN MASK</th>
                  <th>HỘI VIÊN</th>
                  <th>NGÀY TẠO</th>
                  <th>HẾT HẠN</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.MaQRID}>
                    <td>
                      <b>#{x.MaQRID}</b>
                      <small>{x.MaCode}</small>
                    </td>
                    <td>
                      {x.HoTen || '—'}
                      {x.HoiVienID && <small>HV-{x.HoiVienID}</small>}
                    </td>
                    <td>{x.NgayTao}</td>
                    <td>{x.NgayHetHan || '—'}</td>
                    <td>
                      <span
                        className={`status ${x.TrangThai === 'ACTIVE' ? 'ok' : 'bad'}`}
                      >
                        {x.TrangThai}
                      </span>
                    </td>
                    <td>
                      {x.TrangThai === 'ACTIVE' ? (
                        <button
                          className="danger"
                          onClick={() => void revoke(x.MaQRID)}
                        >
                          Thu hồi
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && !error && !rows.length && (
            <div className="empty-state">Chưa có QR.</div>
          )}
        </section>
        <section className="guest-panel">
          <header>
            <h2>Cấp QR tại quầy</h2>
          </header>
          <p>
            Tìm theo tên, số điện thoại hoặc mã hội viên, sau đó chọn người cần cấp QR.
          </p>
          <label className="qr-member-search">
            Tìm hội viên
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelected(null)
                if (!e.target.value.trim()) setMembers([])
              }}
              placeholder="Nhập tên, số điện thoại hoặc mã hội viên"
            />
          </label>
          <div className="qr-member-results" role="group" aria-label="Kết quả tìm hội viên">
            {members.map((member) => (
              <button
                className={
                  `qr-member-option ${selected?.HoiVienID === member.HoiVienID ? 'primary' : ''}`
                }
                type="button"
                aria-pressed={selected?.HoiVienID === member.HoiVienID}
                onClick={() => setSelected(member)}
                key={member.HoiVienID}
              >
                <span className="qr-member-initial" aria-hidden="true">{member.HoTen.charAt(0)}</span>
                <span className="qr-member-identity"><strong>{member.HoTen}</strong><small>HV-{member.HoiVienID} · {member.SoDienThoai || 'Chưa có số điện thoại'}</small></span>
                {selected?.HoiVienID === member.HoiVienID && <span className="qr-member-picked">Đã chọn</span>}
              </button>
            ))}
          </div>
          <button
            className="primary"
            disabled={!selected || busy}
            onClick={issue}
          >
            {busy ? 'Đang kiểm tra…' : 'Cấp QR cho hội viên'}
          </button>
          {issued && (
            <div className="qr-preview">
              <span>
                ▦<i>QA</i>
              </span>
              <b>
                QR #{issued.MaQRID} · HV-{issued.HoiVienID}
              </b>
              <small>
                Hết hạn: {new Date(issued.expiresAt).toLocaleString('vi-VN')}
              </small>
              <textarea readOnly value={issued.token} />
              <div>
                <button onClick={copy}>Sao chép token</button>
                <button
                  className="danger"
                  onClick={() => void revoke(issued.MaQRID)}
                >
                  Thu hồi
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  )
}
