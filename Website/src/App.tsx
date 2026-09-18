import { useState } from "react";
import Header from "./components/Header";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import Navigation from "./components/Navigation";
import type { PageId } from "./components/Navigation";
import PackagesPage from "./pages/PackagesPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import CheckInLivePage from "./pages/CheckInLivePage";
import CheckInHistoryPage from "./pages/CheckInHistoryPage";
import CheckInQrPage from "./pages/CheckInQrPage";
import TrainerManagementPage from "./pages/TrainerManagementPage";
import PtSessionsPage from "./pages/PtSessionsPage";
import TrainerRosterPage from "./pages/TrainerRosterPage";
import "./App.css";
import "./AdminBase.css";
import "./AdminExtra.css";
import "./CheckIn.css";
import "./Typography.css";
import "./Sidebar.css";
import "./PtModule.css";

const metrics = [
  [
    "TỔNG QUAN HỘI VIÊN",
    "▣",
    "Hội viên Active",
    "25.840",
    "↗ +148 mới tuần này (+12.4%)",
    "Diamond VIP: 3.420|Classic/Silver: 22.420|Hết hạn trong 7 ngày: 4 hội viên",
  ],
  [
    "DOANH THU HỆ THỐNG",
    "▤",
    "Doanh thu MTD",
    "1.845.600.000 đ",
    "◉ +18.2% vượt KPIs tháng",
    "Tiến độ: 62%|Hội viên: (1.144M)|Huấn luyện: (461M)|QA Pro Shop: (240M)",
  ],
  [
    "LƯỢT CHECK-IN HÔM NAY",
    "◉",
    "Turnstile Live",
    "1.428 lượt",
    "● Hiện có mặt: 312 khách",
    "Công suất chuỗi: 68% peak|Turnstile 19/18 Online|IoT: 100%",
  ],
  [
    "QA PRO SHOP",
    "▢",
    "Đơn hàng Nutrition",
    "38 đơn mới",
    "● Doanh số ngày: 18.950.000 đ",
    "• Giao 12 đơn|• Hoàn tất: 24 đơn|• Chờ xác nhận: 2 đơn",
  ],
  [
    "ĐỘI NGŨ HUẤN LUYỆN VIÊN",
    "⚡",
    "Lịch tập PT 1-1",
    "42 Trainers",
    "◉ Tỷ lệ kín lịch: 94.6%",
    "Tổng ca hôm nay: 156 buổi|Đã hoàn tất: 84 buổi|Sắp diễn ra: 72 buổi",
  ],
];

const clubs = [
  [
    "Vincom Đồng Khởi Q.1",
    "ĐÔNG ĐÚC",
    82,
    142,
    "8 ca PT hoạt động",
    "Cổng 1–4 Active",
  ],
  [
    "Crescent Elite Q.7",
    "BÌNH THƯỜNG",
    64,
    86,
    "5 ca PT hoạt động",
    "Cổng 1–4 Active",
  ],
  [
    "Thảo Điền Performance Hub",
    "LÝ TƯỞNG",
    55,
    54,
    "4 ca PT hoạt động",
    "Cổng 1–5 Active",
  ],
  [
    "West Lake HM Exclusive",
    "LÝ TƯỞNG",
    48,
    30,
    "2 ca PT hoạt động",
    "Cổng 1–5 Active",
  ],
];

const hours = [34, 52, 64, 45, 33, 47, 67, 37, 18, 62, 72, 79, 68, 45, 28, 22];

function App() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [screen, setScreen] = useState<
    "login" | "signup" | "forgot" | "dashboard"
  >("login");

  if (screen === "login")
    return (
      <Login
        onLogin={() => setScreen("dashboard")}
        onSignup={() => setScreen("signup")}
        onForgot={() => setScreen("forgot")}
      />
    );
  if (screen === "signup")
    return (
      <Signup
        onLogin={() => setScreen("login")}
        onRegister={() => setScreen("dashboard")}
      />
    );
  if (screen === "forgot")
    return <ForgotPassword onBack={() => setScreen("login")} />;

  return (
    <main className="app-shell">
      <Navigation
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={() => setScreen("login")}
      />
      <section className="workspace">
        <Header />
        {!['packages-list', 'package-registrations', 'checkin-live', 'checkin-history', 'checkin-qr', 'trainers-list', 'pt-sessions', 'trainer-roster'].includes(activePage) ? (
        <div className="dashboard">
          <section className="dashboard-hero">
            <div className="hero-copy">
              <div>
                <b className="live">LIVE STREAM V4.2</b>
                <span className="telemetry">
                  ● Telemetry Ingest: 4 CLB Connected
                </span>
              </div>
              <h1>
                TRUNG TÂM ĐIỀU HÀNH & GIÁM
                <br />
                SÁT TOÀN DIỆN
              </h1>
              <p>
                Dữ liệu vận hành thời thực từ 4 chi nhánh CLB, 18 cổng Turnstile
                <br />
                kiểm soát sinh trắc học và hệ sinh thái QA Pro Shop trực tuyến.
              </p>
            </div>
            <div className="hero-actions">
              <button className="primary">♧　+ Thêm Hội viên mới</button>
              <button>▦　Quét Check-in</button>
              <button>♜　Tạo đơn Pro Shop</button>
              <button>⇩　Xuất Báo cáo Ngày</button>
            </div>
            <div className="hero-status">
              <b>▣　Hôm nay, 24/10/2025</b>
              <span>
                ◷　20:10:21　<small>REALTIME SYNC</small>
              </span>
              <label>
                PHẠM VI CƠ SỞ{" "}
                <select>
                  <option>Toàn hệ thống (4 Cơ sở)</option>
                </select>
              </label>
            </div>
          </section>

          <section className="dashboard-metrics">
            {metrics.map(([eyebrow, icon, title, value, trend, details]) => (
              <article className="dash-metric" key={title}>
                <div className="metric-top">
                  <span>{eyebrow}</span>
                  <i>{icon}</i>
                </div>
                <h2>{title}</h2>
                <strong>{value}</strong>
                <em>{trend}</em>
                <div className="metric-details">
                  {details.split("|").map((detail) => (
                    <div key={detail}>{detail}</div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section className="dashboard-main-grid">
            <div className="dashboard-left">
              <article className="dash-card revenue-card">
                <span className="dash-eyebrow">PERFORMANCE TRACKING</span>
                <h2>Xu hướng Doanh thu & Chỉ tiêu Tháng 10/2025</h2>
                <div className="chart-legend">
                  <b>●　Thực thu</b>
                  <span>●　Target KPI</span>
                </div>
                <div className="revenue-chart">
                  <div className="chart-dates">
                    <span>01/10</span>
                    <span>07/10</span>
                    <span>14/10</span>
                    <span>21/10</span>
                    <b>24/10 (Hôm nay: 1.84B)</b>
                    <span>31/10 (Mục tiêu: 2.2B)</span>
                  </div>
                  <svg
                    viewBox="0 0 600 190"
                    preserveAspectRatio="none"
                    aria-label="Biểu đồ doanh thu"
                  >
                    <defs>
                      <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#aafa00" stopOpacity=".32" />
                        <stop offset="1" stopColor="#aafa00" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path className="target-line" d="M0 145 L600 45" />
                    <path
                      className="area"
                      d="M0 158 C55 145 92 122 142 115 S220 106 272 83 S355 53 410 45 L410 176 L0 176Z"
                    />
                    <path
                      className="actual-line"
                      d="M0 158 C55 145 92 122 142 115 S220 106 272 83 S355 53 410 45"
                    />
                    <circle cx="410" cy="45" r="11" />
                    <circle className="dot" cx="410" cy="45" r="5" />
                  </svg>
                </div>
                <footer>
                  ⚡　Ngày hội Flash-Sale Black Friday tập trung vào 28–29/10{" "}
                  <b>Dự phòng hoàn thành 108% kế hoạch</b>
                </footer>
              </article>
              <article className="dash-card heatmap-card">
                <div className="heat-head">
                  <div>
                    <span className="dash-eyebrow">
                      BIOMETRIC FACILITY HEATMAP
                    </span>
                    <h2>Mật độ Check-In Theo Giờ (06:00 - 22:00)</h2>
                  </div>
                  <b>Golden Hours: 17:30 - 20:30</b>
                </div>
                <div className="heatmap">
                  {hours.map((height, index) => (
                    <div key={index}>
                      <i
                        style={{ height: `${height}%` }}
                        className={
                          index > 9 && index < 13
                            ? "hot"
                            : index === 10 || index === 11
                              ? "warm"
                              : ""
                        }
                      />
                      <span>{String(index + 6).padStart(2, "0")}h</span>
                    </div>
                  ))}
                </div>
                <footer>
                  Khuyến nghị: Bật chế độ tự động điều phối tủ Locker số 2 & 4
                  tại cơ sở Vincom Q.1 <b>● AI Optimization On</b>
                </footer>
              </article>
            </div>
            <div className="dashboard-right">
              <article className="dash-card clubs-card">
                <div className="club-heading">
                  <h2>▦　Tình trạng 4 Cơ sở CLB</h2>
                  <b>
                    ● 4 Hubs
                    <br />
                    Sync
                  </b>
                </div>
                {clubs.map(([name, state, percent, people, shifts, gates]) => (
                  <div className="club-row" key={name}>
                    <div>
                      <strong>{name}</strong>
                      <em>{state}</em>
                      <b>{percent}%</b>
                    </div>
                    <i>
                      <span style={{ width: `${percent}%` }} />
                    </i>
                    <footer>
                      <span>
                        Đang có mặt: <b>{people} khách</b>
                      </span>
                      <span>{shifts}</span>
                      <span>{gates}</span>
                    </footer>
                  </div>
                ))}
              </article>
              <div className="club-summary">
                <span>
                  ⟳　TỶ LỆ GIA HẠN HĐ{" "}
                  <b>
                    78.5% <small>(+4.2%)</small>
                  </b>
                </span>
                <span>
                  ♧　AOV PRO SHOP <b>1.250.000 đ</b>
                </span>
              </div>
            </div>
          </section>

          <section className="operations-grid">
            <article className="dash-card activity-card">
              <h2>Nhật ký Check-in Cổng Turnstile (Real-time Stream)</h2>
              <p>Xác thực khuôn mặt FaceID 3D & QR động</p>
              {[
                "Trần Minh Hoàng　 DIAMOND VIP　15:41:22　Vincom Q.1 - Turnstile 02",
                "Nguyễn Thị Mai　 CLASSIC　15:39:05　Crescent Elite Q.7 - Gate 01",
                "Lê Khắc Minh　 MASTER COACH　15:35:48　Thảo Điền Hub - Gate Staff",
              ].map((item) => (
                <div className="activity" key={item}>
                  ◉　{item}
                  <b>✓ Hợp lệ</b>
                </div>
              ))}
            </article>
            <div>
              <article className="dash-card schedule-card">
                <h2>⚡　Lịch PT 1-1 Sắp Diễn Ra</h2>
                <div>
                  CA <b>16:00</b>　 HLV Trần Hoàng Nam · HV Đặng Quang Huy{" "}
                  <em>Chuẩn bị</em>
                </div>
                <div>
                  CA <b>16:30</b>　 HLV Nguyễn Minh Thư · HV Minh Anh{" "}
                  <em>Đã check-in</em>
                </div>
              </article>
              <article className="dash-card order-card">
                <h2>▣　Đơn Hàng Pro Shop Cần Điều Phối</h2>
                <b>#QA-ORD-90214　 GIAO 2H　 2.010.000 đ</b>
                <p>
                  Rule 1 Whey Protein Isolate (5lbs Vanilla) + C4 Original
                  Pre-Workout 60 servings
                </p>
                <button>In vận đơn & Giao ngay</button>
              </article>
            </div>
          </section>
          <footer className="system-footer">
            ▣ Turnstile IoT Cluster　● 18 Cổng hoạt động　　▥ InBody 770 Cloud
            Sync　● Đồng bộ thời gian thực　　▦ VietQR Banking Gateway　● Khớp
            lệnh hóa đơn VAT　　◉ Hotline Vận Hành CLB　1900 8899
          </footer>
        </div>
        ) : (
          <div className="module-content">
            {activePage === "trainers-list" ? <TrainerManagementPage onOpenRoster={() => setActivePage("trainer-roster")} /> : activePage === "pt-sessions" ? <PtSessionsPage /> : activePage === "trainer-roster" ? <TrainerRosterPage /> : activePage === "checkin-live" ? <CheckInLivePage /> : activePage === "checkin-history" ? <CheckInHistoryPage /> : activePage === "checkin-qr" ? <CheckInQrPage /> : <>
            <nav className="module-tabs" aria-label="Điều hướng quản lý gói tập">
              <button className={activePage === "packages-list" ? "active" : ""} onClick={() => setActivePage("packages-list")}>DANH SÁCH GÓI TẬP</button>
              <button className={activePage === "package-registrations" ? "active" : ""} onClick={() => setActivePage("package-registrations")}>QUẢN LÝ ĐĂNG KÝ</button>
            </nav>
            {activePage === "package-registrations" ? <RegistrationsPage /> : <PackagesPage />}
            </>}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
