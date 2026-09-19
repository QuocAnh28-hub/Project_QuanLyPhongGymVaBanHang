import { useState } from 'react'
import type { FormEvent } from 'react'

type SignupProps = { onLogin: () => void; onRegister: () => void }

const benefits = [
  [
    '⚡',
    '01 buổi tập 1-1 miễn phí',
    'Huấn luyện viên cá nhân định chuẩn giáo án chuyên nghiệp',
  ],
  [
    '▣',
    'Phân tích InBody 770 chuyên sâu',
    'Quét chỉ số mỡ nội tạng, cơ xương và nước tế bào chuẩn xác',
  ],
  [
    '◉',
    'Tặng 200 QA-Points vào ví hội viên',
    'Dùng đổi nước tăng lực, whey protein bar và phụ kiện tại Pro-Shop',
  ],
  [
    '♧',
    '3 ngày trải nghiệm không giới hạn',
    'Tự do trải nghiệm bể sục Jacuzzi, xông hơi đá muối Himalaya & bể bơi',
  ],
]

export default function Signup({ onLogin, onRegister }: SignupProps) {
  const [goal, setGoal] = useState('Giảm mỡ nhanh')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onRegister()
  }
  return (
    <main className="signup-page">
      <header className="signup-top">
        <div className="signup-brand">
          <b>ϟ</b>
          <span>
            QA-GYM　<i>PERFORMANCE CLUB</i>
            <small>Kỷ Nguyên Thể Lực Đẳng Cấp Cao</small>
          </span>
        </div>
        <strong>Ưu đãi chào đón hội viên mới đang diễn ra</strong>
      </header>
      <section className="signup-shell">
        <aside className="signup-benefits">
          <span className="member-kicker">◉　ĐẶC QUYỀN THẺ MEMBERSHIP</span>
          <h1>
            GIA NHẬP HỆ THỐNG
            <br />
            <em>QA-GYM</em> NGAY HÔM NAY
          </h1>
          <p>
            Mở khóa tiềm năng cơ thể với không gian tập luyện chuẩn Olympic,
            công nghệ đo lường sinh học chuyên sâu và lộ trình cá nhân hóa.
          </p>
          <div>
            {benefits.map(([icon, title, text]) => (
              <article key={title}>
                <i>{icon}</i>
                <span>
                  <b>{title}</b>
                  <small>{text}</small>
                </span>
              </article>
            ))}
          </div>
          <footer>
            ◉◉◉　 <b>14.800+ Hội viên năng động</b>
            <span>98.6% đánh giá dịch vụ đạt 5 sao　 ★★★★★</span>
          </footer>
        </aside>
        <section className="signup-form">
          <form onSubmit={submit}>
            <div className="signup-title">
              <span>BƯỚC 1 / ĐĂNG KÝ TÀI KHOẢN</span>
              <h2>Hồ Sơ Thành Hội Viên</h2>
              <b>
                Thời gian hoàn tất: <em>~ 2 phút</em>
              </b>
            </div>
            <div className="signup-fields">
              <label>
                Họ và tên đầy đủ ●
                <div>
                  ♙ <input placeholder="VD: Nguyễn Tuấn Anh" />
                </div>
              </label>
              <label>
                Nhập CCCD/CMND　 Số điện thoại ●
                <div>
                  ▯ <input placeholder="09xx xxx xxx" />
                  <button type="button">GỬI OTP</button>
                </div>
              </label>
              <label>
                Địa chỉ Email ●
                <div>
                  ✉ <input placeholder="tuananh.nguyen@example.com" />
                </div>
              </label>
              <label>
                Chi nhánh mong muốn ●
                <div>
                  ⌖{' '}
                  <select defaultValue="">
                    <option value="" disabled>
                      Vincom Đồng Khởi (Quận 1, TP.HCM)
                    </option>
                    <option>QA Gym Landmark 81</option>
                  </select>
                </div>
              </label>
            </div>
            <div className="goals">
              <div>
                <b>Mục tiêu tập luyện chính</b>
                <span>Chọn 1 mục tiêu ưu tiên</span>
              </div>
              <section>
                {[
                  '♨|Giảm mỡ nhanh',
                  '⚡|Tăng cơ nạc',
                  '♟|Cải thiện thể lực',
                  '❖|Phục hồi chấn thương',
                ].map((option) => {
                  const [icon, title] = option.split('|')
                  return (
                    <button
                      type="button"
                      onClick={() => setGoal(title)}
                      className={goal === title ? 'selected' : ''}
                      key={title}
                    >
                      <i>{icon}</i>
                      {title}
                    </button>
                  )
                })}
              </section>
            </div>
            <div className="signup-fields password-fields">
              <label>
                Mật khẩu ●
                <div>
                  ▣ <input type="password" placeholder="Tối thiểu 8 ký tự" />⊙
                </div>
              </label>
              <label>
                Xác nhận mật khẩu ●
                <div>
                  ⟳ <input type="password" placeholder="Nhập lại mật khẩu" />⊙
                </div>
              </label>
            </div>
            <p className="password-note">
              ━━━━━━　 Chưa nhập　 Khuyến khích chữ hoa, số và ký tự đặc biệt
              (@, #, !)
            </p>
            <label className="terms">
              <input type="checkbox" /> Tôi đồng ý với Điều khoản dịch vụ và
              Chính sách bảo mật của Hệ thống QA-Gym Performance Club. Tôi xác
              nhận thông tin cung cấp là chính xác.
            </label>
            <button className="register-submit">
              TẠO TÀI KHOẢN HỘI VIÊN　➜
            </button>
            <p className="have-account">
              Đã có tài khoản hội viên?　
              <button type="button" onClick={onLogin}>
                Đăng nhập ngay　›
              </button>
            </p>
            <footer className="signup-security">
              ◉　Mã hóa dữ liệu chuẩn AES-256{' '}
              <span>◷　Kích hoạt tài khoản tức thì</span>
              <b>♧　Hỗ trợ 24/7 Hotline 1900–QAGYM</b>
            </footer>
          </form>
        </section>
      </section>
    </main>
  )
}
