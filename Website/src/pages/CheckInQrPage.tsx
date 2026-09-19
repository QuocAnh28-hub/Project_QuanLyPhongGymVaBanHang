import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { MetricCard, Modal } from '../components/AdminLayout'
import {
  initialQrTokens,
  iotNodes,
  type QrToken,
} from '../data/checkin-qr.mock'

export default function CheckInQrPage() {
  const [seconds, setSeconds] = useState(30),
    [tokens, setTokens] = useState(initialQrTokens),
    [tab, setTab] = useState('all'),
    [syncing, setSyncing] = useState(false),
    [otp, setOtp] = useState(false),
    [toast, setToast] = useState(''),
    [preview, setPreview] = useState(initialQrTokens[1]),
    [refresh, setRefresh] = useState(30),
    [anti, setAnti] = useState(15),
    [geo, setGeo] = useState(true)
  const guestRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const timer = setInterval(
      () => setSeconds((x) => (x <= 1 ? 30 : x - 1)),
      1000
    )
    return () => clearInterval(timer)
  }, [])
  const notify = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(''), 1800)
  }
  const shown = useMemo(
    () =>
      tokens.filter(
        (x) =>
          tab === 'all' ||
          (tab === 'annual' && x.status === 'active') ||
          (tab === 'guest' && x.status === 'guest') ||
          (tab === 'locked' && x.status === 'locked')
      ),
    [tokens, tab]
  )
  const sync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      notify('Đồng bộ 18/18 Turnstile thành công')
    }, 1400)
  }
  const action = (id: number, type: string) => {
    if (type === 'revoke')
      setTokens((x) =>
        x.map((t) => (t.id === id ? { ...t, status: 'locked' } : t))
      )
    if (type === 'unlock')
      setTokens((x) =>
        x.map((t) => (t.id === id ? { ...t, status: 'active' } : t))
      )
    if (type === 'refresh') setSeconds(30)
    notify(`Đã ${type} token mock`)
  }
  const issue = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget),
      name = String(data.get('name')),
      phone = String(data.get('phone'))
    if (!name.trim() || phone.replace(/\D/g, '').length < 9)
      return notify('Vui lòng nhập tên và số điện thoại hợp lệ')
    const token: QrToken = {
      id: Date.now(),
      token: `#GPASS-${Date.now().toString().slice(-6)}`,
      owner: `${name} · ${phone}`,
      type: 'Guest Pass 24h',
      branch: String(data.get('branch')),
      expiry: 'Còn 24h',
      status: 'guest',
    }
    setTokens([token, ...tokens])
    setPreview(token)
    notify('Đã phát hành Guest QR local')
    e.currentTarget.reset()
  }
  return (
    <div className="admin-page checkin-page qr-page">
      <div className="security-strip">
        <b>♢ CORE GATEWAY ENCRYPTION:</b>
        <span>SHA-256 Dynamic TOTP Engine (UI mô phỏng)</span>
        <strong>LATENCY: 42ms</strong>
        <small>KHÓA BẢO MẬT: 0x88F...BC19</small>
      </div>
      <header className="page-heading">
        <div>
          <p>
            VẬN HÀNH CHÍNH　›　CỔNG CHECK-IN　›　<b>QUẢN LÝ MÃ QR</b>
          </p>
          <h1>QUẢN LÝ MÃ QR ĐỘNG & BẢO MẬT SOÁT VÉ</h1>
          <span className="online-badge">↻ TOTP REFRESH: {seconds}s</span>
        </div>
        <div className="heading-actions">
          <button
            className="primary"
            onClick={() =>
              guestRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            ⌁ CẤP MÃ QR KHẨN CẤP (TEMPORARY PASS)
          </button>
          <button onClick={sync}>
            ♧ {syncing ? 'ĐANG ĐỒNG BỘ...' : 'ĐỒNG BỘ TURNSTILE'}
          </button>
          <button onClick={() => setOtp(true)}>☷ CẤU HÌNH OTP</button>
        </div>
      </header>
      <section className="metrics-grid">
        <MetricCard
          label="QR ĐỘNG ĐANG CHẠY"
          value="25.840"
          note="Tự động đổi token mỗi 30s"
        />
        <MetricCard
          label="QUÉT CỔNG THÀNH CÔNG"
          value="896"
          note="Tỷ lệ mở cửa 99.7%"
          tone="mint"
        />
        <MetricCard
          label="MÃ TẠM & GUEST PASS"
          value="48"
          note="31 mã khách VIP · 17 Trial"
          tone="cyan"
        />
        <MetricCard
          label="CẢNH BÁO BẤT THƯỜNG"
          value="02"
          note="Cần xử lý thủ công"
          tone="error"
        />
      </section>
      <section className="algorithm-panel">
        <header>
          <div>
            <h2>
              ♢ BẢNG ĐIỀU KHIỂN THUẬT TOÁN MÃ QR & CHỐNG GIAN LẬN CỔNG VÀO
            </h2>
            <p>
              Bộ quy tắc bảo mật chuẩn quét SHA-256 TOTP kết hợp định vị và giới
              hạn tần suất mã cửa.
            </p>
          </div>
          <b>● ENCRYPTION LOCK ACTIVE</b>
        </header>
        <div className="algorithm-grid">
          <article>
            <span>
              THỜI GIAN LÀM MỚI TOKEN <b>{refresh}s</b>
            </span>
            <h3>TOTP Refresh</h3>
            <strong>{seconds} GIÂY / TOTP Cycle</strong>
            <input
              type="range"
              min="10"
              max="60"
              value={refresh}
              onChange={(e) => setRefresh(+e.target.value)}
            />
            <i>
              <b style={{ width: `${(seconds / 30) * 100}%` }} />
            </i>
          </article>
          <article>
            <span>ANTI-PASSBACK ENGINE</span>
            <h3>Giãn cách: {anti} Phút</h3>
            <p>
              Ngăn chặn việc một QR vừa quét vào cửa sau đó dùng ngược ra ngoài.
            </p>
            <input
              type="range"
              min="5"
              max="30"
              value={anti}
              onChange={(e) => setAnti(+e.target.value)}
            />
          </article>
          <article>
            <span>ĐỊNH VỊ GPS GEO-FENCING</span>
            <h3>Bán kính quét CLB</h3>
            <button
              className={geo ? 'setting-on' : ''}
              onClick={() => setGeo(!geo)}
            >
              {geo ? '< 100 Mét · BẬT' : 'ĐÃ TẮT'}
            </button>
            <p>Chỉ cho phép dùng mã QR trong bán kính cảm biến GPS thiết bị.</p>
          </article>
          <article>
            <span>MÃ TĨNH OFFLINE DỰ PHÒNG</span>
            <h3>Offline Backup Token</h3>
            <strong>Single-use · 1 Token / Day</strong>
            <p>Tự động cấp token dùng một lần khi mất kết nối.</p>
          </article>
        </div>
      </section>
      <div className="qr-layout">
        <section className="qr-directory">
          <header>
            <h2>☷ DANH SÁCH MÃ QR ĐANG HIỆU LỰC</h2>
            <div className="chips">
              {[
                ['all', 'Tất cả'],
                ['annual', 'Thường niên'],
                ['guest', 'Guest VIP'],
                ['locked', 'Khóa/Cảnh báo'],
              ].map(([k, v]) => (
                <button
                  className={tab === k ? 'selected' : ''}
                  onClick={() => setTab(k)}
                  key={k}
                >
                  {v}
                </button>
              ))}
            </div>
          </header>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    'MÃ TOKEN & ẢNH',
                    'HỘI VIÊN / NGƯỜI SỞ HỮU',
                    'LOẠI THẺ',
                    'CƠ SỞ ÁP DỤNG',
                    'THỜI HẠN',
                    'TRẠNG THÁI',
                    'THAO TÁC',
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((x) => (
                  <tr className={x.status} key={x.id}>
                    <td>
                      <div className="mini-qr">▦</div>
                      <b>{x.token}</b>
                    </td>
                    <td>{x.owner}</td>
                    <td>
                      <span className="tag">{x.type}</span>
                    </td>
                    <td>{x.branch}</td>
                    <td>{x.expiry}</td>
                    <td>
                      <span
                        className={`status ${x.status === 'locked' ? 'bad' : 'ok'}`}
                      >
                        {x.status === 'locked'
                          ? 'Khóa chống gian lận'
                          : 'Đang hoạt động'}
                      </span>
                    </td>
                    <td>
                      <button
                        title="Refresh"
                        onClick={() => action(x.id, 'refresh')}
                      >
                        ↻
                      </button>
                      <button
                        title="Share"
                        onClick={() => notify('Đã mở chia sẻ mock')}
                      >
                        ⌁
                      </button>
                      <button title="Print" onClick={() => window.print()}>
                        ▣
                      </button>
                      <button
                        title={x.status === 'locked' ? 'Unlock' : 'Revoke'}
                        onClick={() =>
                          action(
                            x.id,
                            x.status === 'locked' ? 'unlock' : 'revoke'
                          )
                        }
                      >
                        {x.status === 'locked' ? '✓' : '⊗'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>Hiển thị {shown.length} mã QR</span>
            <div>
              <button className="current">1</button>
              <button>2</button>
              <button>3</button>
              <span>…</span>
              <button>646</button>
            </div>
          </div>
        </section>
        <section className="guest-panel" ref={guestRef}>
          <header>
            <h2>⌗ CẤP NHANH MÃ QR GUEST</h2>
            <b>Ready</b>
          </header>
          <p>
            Dành cho hội viên bảo lãnh bạn bè đi cùng hoặc hội viên quên điện
            thoại.
          </p>
          <form onSubmit={issue}>
            <label>
              HỘI VIÊN BẢO LÃNH
              <input name="sponsor" defaultValue="QA-10924 - Lê Hoàng Nam" />
            </label>
            <div>
              <label>
                HỌ TÊN KHÁCH
                <input name="name" placeholder="Nguyễn Văn A" />
              </label>
              <label>
                SỐ ĐIỆN THOẠI
                <input name="phone" placeholder="09xx.xxx.xxx" />
              </label>
            </div>
            <div>
              <label>
                CƠ SỞ
                <select name="branch">
                  <option>Landmark 81 CLB</option>
                  <option>Thảo Điền Garden</option>
                </select>
              </label>
              <label>
                THỜI HẠN
                <select name="expiry">
                  <option>1 Ngày (24 Giờ)</option>
                  <option>4 Giờ</option>
                </select>
              </label>
            </div>
            <button className="primary">⊕ PHÁT HÀNH MÃ QR NGAY</button>
          </form>
          <div className="qr-preview">
            <span>
              ▦<i>QA</i>
            </span>
            <b>{preview.token}</b>
            <small>Hiệu lực: {preview.expiry}</small>
            <div>
              <button onClick={() => window.print()}>▣ In thẻ giấy</button>
              <button onClick={() => notify('SMS/Zalo chỉ là mô phỏng')}>
                ▣ Gửi SMS/Zalo
              </button>
            </div>
          </div>
        </section>
      </div>
      <section className="iot-panel">
        <header>
          <div>
            <h2>♧ MẠNG LƯỚI ĐẦU ĐỌC QUÉT MÃ TURNSTILE IOT</h2>
            <p>
              Trạng thái truyền dữ liệu thời gian thực từ 4 cụm cơ sở về QA Gate
              Controller
            </p>
          </div>
          <b>● 18/18 Nodes Online</b>
        </header>
        <div>
          {iotNodes.map((n) => (
            <article key={n.name}>
              <h3>
                {n.name} <span>{n.lanes} ĐẦU ĐỌC</span>
              </h3>
              {Array.from({ length: n.lanes }, (_, i) => (
                <p key={i}>
                  Lane 0{i + 1} · Cửa {i % 2 ? 'Ra' : 'Vào'}
                  <b>ONLINE · {n.latency}</b>
                </p>
              ))}
              <footer>
                Firmware: {n.firmware} ·{' '}
                <strong>Heartbeat {n.heartbeat}</strong>
              </footer>
            </article>
          ))}
        </div>
      </section>
      {otp && (
        <Modal title="CẤU HÌNH OTP" onClose={() => setOtp(false)}>
          <div className="form-grid">
            <label>
              Chu kỳ làm mới
              <input
                type="number"
                value={refresh}
                onChange={(e) => setRefresh(+e.target.value)}
              />
            </label>
            <label>
              Anti-passback (phút)
              <input
                type="number"
                value={anti}
                onChange={(e) => setAnti(+e.target.value)}
              />
            </label>
          </div>
          <p>
            Đây chỉ là cấu hình giao diện, không triển khai TOTP mã hóa thật.
          </p>
          <footer className="modal-actions">
            <button onClick={() => setOtp(false)}>Hủy</button>
            <button
              className="primary"
              onClick={() => {
                setOtp(false)
                notify('Đã lưu cấu hình OTP mock')
              }}
            >
              Lưu
            </button>
          </footer>
        </Modal>
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  )
}
