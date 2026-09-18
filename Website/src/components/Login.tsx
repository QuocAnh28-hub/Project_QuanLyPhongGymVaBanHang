import { useState } from "react";
import type { FormEvent } from "react";

type LoginProps = {
  onLogin: () => void;
  onSignup: () => void;
  onForgot: () => void;
};

export default function Login({ onLogin, onSignup, onForgot }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <aside className="login-promo">
          <div className="login-brand">
            <b>QA</b>
            <span>
              QA-GYM <i>PRO</i>
              <small>PERFORMANCE CENTER</small>
            </span>
          </div>
          <div className="club-online">●　3 CLB HOẠT ĐỘNG 24/7</div>
          <div className="promo-copy">
            <span>⚡　HỆ THỐNG HUẤN LUYỆN ĐẲNG CẤP</span>
            <h1>
              KỶ LUẬT LÀ <em>CẦU NỐI</em>
              <br />
              GIỮA MỤC TIÊU & THÀNH
              <br />
              CÔNG.
            </h1>
            <div className="training-meter">
              <b>NHỊP TIM TỐI ƯU HỘI VIÊN</b>
              <i />
              <i />
              <i className="active" />
              <strong>ZONE 4 · 86% MAX</strong>
            </div>
          </div>
          <div className="promo-features">
            <div>
              ▣<b>Lịch Tập PT</b>
              <span>Nhận diện 0.3s</span>
            </div>
            <div>
              ✣<b>Check-in Tự Động</b>
              <span>Nhận diện 0.3s</span>
            </div>
            <div>
              ◉<b>QA-Points</b>
              <span>Đổi quà hội viên</span>
            </div>
          </div>
        </aside>
        <section className="login-panel">
          <form onSubmit={submit}>
            <span className="login-kicker">●　CỔNG HỘI VIÊN ĐIỆN TỬ</span>
            <h2>Chào mừng trở lại!</h2>
            <p>
              Đăng nhập vào tài khoản hội viên QA-Gym để tiếp tục chuỗi tập
              luyện.
            </p>
            <div className="social-login">
              <button type="button">
                G<br />
                <small>Google</small>
              </button>
              <button type="button">
                ●<br />
                <small>Apple ID</small>
              </button>
              <button type="button">
                ◉<br />
                <small>Mã RFID</small>
              </button>
            </div>
            <div className="or">
              <span>HOẶC ĐĂNG NHẬP BẰNG TÀI KHOẢN</span>
            </div>
            <label>
              Số điện thoại hoặc Email
              <div className="login-input">
                ▧<input defaultValue="athlete.khanh@qagym.vn" />
              </div>
            </label>
            <label>
              Mật khẩu
              <button className="forgot-link" type="button" onClick={onForgot}>
                Quên mật khẩu?
              </button>
              <div className="login-input">
                ♙
                <input
                  type={showPassword ? "text" : "password"}
                  defaultValue="discipline2025"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "◉" : "⊙"}
                </button>
              </div>
            </label>
            <label className="remember">
              <input type="checkbox" defaultChecked />{" "}
              <span>Ghi nhớ đăng nhập trong 30 ngày</span>
            </label>
            <button className="login-submit" type="submit">
              ĐĂNG NHẬP NGAY　➜
            </button>
            <button className="signup-link" type="button" onClick={onSignup}>
              Chưa có tài khoản hội viên?　<b>Đăng ký ngay ›</b>
            </button>
            <footer>
              ♙　Mã hóa SSL 256-bit{" "}
              <span>
                ● Hotline Lễ Tân: <b>1900 8899</b>
              </span>
            </footer>
          </form>
        </section>
      </section>
    </main>
  );
}
