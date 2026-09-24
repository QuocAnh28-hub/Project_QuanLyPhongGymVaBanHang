import { useState, type FormEvent } from 'react'
import { login, type AdminSession } from '../services/auth'

function Icon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true">
      {name}
    </span>
  )
}
export default function Login({
  onLogin,
}: {
  onLogin: (session: AdminSession) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [remember, setRemember] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (pending) return
    setError('')
    setPending(true)
    try {
      onLogin(await login(email.trim(), password, remember))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Đăng nhập thất bại.')
    } finally {
      setPending(false)
    }
  }
  return (
    <main className="admin-login">
      <aside className="admin-promo">
        <header className="admin-brand-row">
          <div className="admin-brand">
            <span className="brand-mark">
              <Icon name="fitness_center" />
            </span>
            <div>
              <strong>
                QA-GYM <small>ENTERPRISE PRO</small>
              </strong>
              <span>CENTRAL CORE SYSTEM v4.2</span>
            </div>
          </div>
          <span className="admin-node">
            <i /> NODE SG-04 · 256-BIT SSL ACTIVE
          </span>
        </header>
        <div className="admin-intro">
          <span className="admin-badge">
            <Icon name="verified_user" /> HQ OPERATIONS CONSOLE
          </span>
          <h1>
            HỆ THỐNG ĐIỀU HÀNH TẬP TRUNG <em>VẬN HÀNH CHUỖI</em> & KIỂM SOÁT AN
            NINH <em>TOÀN DIỆN</em>.
          </h1>
          <p>
            Nền tảng kiểm soát hạ tầng biometric, tự động hóa cổng xoay
            turnstile, đồng bộ hóa chỉ số hội viên cao cấp và quản lý tài chính
            đa chi nhánh theo thời gian thực.
          </p>
        </div>
        <div className="admin-stats" aria-label="Thông tin minh họa hệ thống">
          <article>
            <div>
              CHI NHÁNH HOẠT ĐỘNG <Icon name="hub" />
            </div>
            <strong>
              4 / 4 <small>100% OK</small>
            </strong>
            <p>Vincom Q1, Crescent, Thảo Điền, West Lake</p>
          </article>
          <article>
            <div>
              CỔNG IOT TURNSTILE <Icon name="sensor_door" />
            </div>
            <strong className="lime">
              18 / 18 <small>ONLINE</small>
            </strong>
            <p>Độ trễ phản hồi &lt;14ms</p>
          </article>
          <article>
            <div>
              PHIÊN CÁN BỘ ACTIVE <Icon name="badge" />
            </div>
            <strong>
              84 <small className="lime">STABLE</small>
            </strong>
            <p>Zero-Trust Token Enforced</p>
          </article>
        </div>
        <div className="admin-traffic">
          <span className="traffic-icon">
            <Icon name="query_stats" />
          </span>
          <div>
            <b>LƯỢNG TRUY CẬP HỆ THỐNG BIOMETRIC</b>
            <span>1,420 lượt check-in / giờ cao điểm chiều</span>
          </div>
          <svg viewBox="0 0 140 40" aria-hidden="true">
            <path d="M2 28 24 24 46 30 68 15 90 20 112 10 136 18" />
          </svg>
        </div>
        <footer className="admin-trust">
          <span>
            <Icon name="lock" />
            Zero-Trust Architecture
          </span>
          <span>
            <Icon name="key" />
            FIDO2 / TOTP 2FA Required
          </span>
          <span>
            <Icon name="fact_check" />
            Audit Log Immutability
          </span>
        </footer>
      </aside>
      <section className="admin-access">
        <form onSubmit={submit} aria-busy={pending}>
          <span className="admin-badge">
            <i /> KHU VỰC GIÁM SÁT AN NINH NỘI BỘ
          </span>
          <h2>Đăng nhập Quản trị Viên</h2>
          <p className="admin-description">
            Vui lòng sử dụng tài khoản quản trị được cấp để truy cập trung tâm
            điều hành.
          </p>
          <div className="admin-methods">
            {[
              ['domain', 'SSO Corp'],
              ['person_key', 'FIDO2 Key'],
              ['qr_code_scanner', 'Authenticator'],
            ].map(([icon, label]) => (
              <button
                key={label}
                type="button"
                disabled
                title="Phương thức này chưa được hỗ trợ"
              >
                <Icon name={icon} />
                <span>{label}</span>
                <small>Chưa khả dụng</small>
              </button>
            ))}
          </div>
          <div className="admin-divider">
            <span>HOẶC ĐỊNH DANH CÁN BỘ</span>
          </div>
          <label htmlFor="admin-email">Email Quản trị</label>
          <div className="admin-field">
            <Icon name="badge" />
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="admin@qagym.vn"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={pending}
            />
          </div>
          <div className="admin-password-label">
            <label htmlFor="admin-password">Mật khẩu truy cập hệ thống</label>
            <a href="tel:19008899" title="Liên hệ IT để đặt lại mật khẩu">
              Yêu cầu IT reset
            </a>
          </div>
          <div className="admin-field">
            <Icon name="lock" />
            <input
              id="admin-password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              required
              maxLength={1024}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={pending}
            />
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={visible}
            >
              <Icon name={visible ? 'visibility_off' : 'visibility'} />
            </button>
          </div>
          <label className="admin-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={pending}
            />
            Ghi nhớ đăng nhập trong 12 giờ
          </label>
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          <button className="admin-submit" type="submit" disabled={pending}>
            {pending ? 'ĐANG XÁC THỰC…' : 'XÁC THỰC VÀO TRUNG TÂM CHỈ HUY'}
            <Icon name="arrow_forward" />
          </button>
          <div className="admin-security">
            <Icon name="warning" />
            <p>
              <b>Cảnh báo An ninh:</b> Khu vực chỉ dành cho quản trị viên được
              cấp quyền. Không chia sẻ thông tin đăng nhập và luôn đăng xuất khi
              sử dụng thiết bị dùng chung.
            </p>
          </div>
          <footer className="admin-support">
            <span>
              Hotline IT Security: <a href="tel:19008899">1900 8899</a>
            </span>
            <span>
              <i /> SOC Level-3 Monitoring
            </span>
          </footer>
        </form>
      </section>
    </main>
  )
}
