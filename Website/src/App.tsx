import { useState } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import './App.css'

const metrics = [
  {
    eyebrow: 'TỔNG QUAN HỘI VIÊN',
    title: 'Hội viên Active',
    value: '25.840',
    trend: '↗ +148 mới tuần này',
  },
  {
    eyebrow: 'DOANH THU HỆ THỐNG',
    title: 'Doanh thu MTD',
    value: '1.845.600.000',
    trend: '↗ +18,2% vượt KPIs',
  },
  {
    eyebrow: 'LƯỢT CHECK-IN HÔM NAY',
    title: 'Turnstile Live',
    value: '1.428',
    trend: '● Hiện có mặt: 312',
  },
  {
    eyebrow: 'QA PRO SHOP',
    title: 'Đơn hàng',
    value: '38',
    trend: '● Hoàn tất: 24 đơn',
  },
]

const clubs = ['Vincom Đồng Khởi Q.1', 'QA Gym Landmark 81', 'QA Gym Phú Nhuận']

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const pageTitle = activePage === 'Dashboard' ? 'TRUNG TÂM ĐIỀU HÀNH & GIÁM SÁT TOÀN DIỆN' : activePage.toUpperCase()

  return (
    <main className="app-shell">
      <Navigation activeItem={activePage} onNavigate={setActivePage} />

      <section className="workspace">
        <Header />

        <div className="page-content">
          <section className="welcome-card">
            <div>
              <span className="live">LIVE STREAM V4.2</span>
              <span className="telemetry">● Telemetry Ingest: 4 CLB Connected</span>
              <h1>{pageTitle}</h1>
              <p>Quản lý vận hành phòng tập tập trung, hiệu quả và theo thời gian thực.</p>
            </div>

            <div className="quick-actions">
              <button className="primary">♙ &nbsp; Thêm hội viên mới</button>
              <button>▦ &nbsp; Quét Check-in</button>
              <button>♜ &nbsp; Tạo đơn Pro Shop</button>
              <button>⇩ &nbsp; Xuất báo cáo ngày</button>
            </div>

            <div className="status-strip">
              <b>▣ &nbsp; Hôm nay, 24/10/2025</b>
              <span>◷ &nbsp; 15:42:02 <small>REALTIME SYNC</small></span>
              <label>
                PHẠM VI CƠ SỞ
                <select>
                  <option>Toàn hệ thống (4 cơ sở)</option>
                </select>
              </label>
            </div>
          </section>

          <section className="metrics">
            {metrics.map(({ eyebrow, title, value, trend }) => (
              <article className="metric-card" key={title}>
                <span className="eyebrow">{eyebrow}</span>
                <h2>{title}</h2>
                <strong>{value}</strong>
                <em>{trend}</em>
                <div className="metric-footer">
                  Hiệu suất đang được cập nhật<br />
                  <b>Realtime 100% online</b>
                </div>
              </article>
            ))}
          </section>

          <section className="lower-grid">
            <article className="chart-card">
              <span className="eyebrow">PERFORMANCE TRACKING</span>
              <h2>Xu hướng Doanh thu & Chỉ tiêu Tháng 10/2025</h2>
              <div className="chart">
                {Array.from({ length: 7 }).map((_, index) => <span key={index} />)}
              </div>
            </article>

            <article className="club-card">
              <h2>▦ &nbsp; Tình trạng 4 Cơ sở CLB</h2>
              {clubs.map((club, index) => {
                const capacity = 82 - index * 11

                return (
                  <div className="club-line" key={club}>
                    <b>{club}</b>
                    <span>{capacity}%</span>
                    <i style={{ width: `${capacity}%` }} />
                  </div>
                )
              })}
            </article>
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
