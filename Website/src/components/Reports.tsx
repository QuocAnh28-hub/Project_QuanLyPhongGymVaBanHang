const revenueByClub = [
  [
    'QA Vincom Đồng Khởi Q.1',
    'Top 1',
    '1.450.000.000 đ',
    '40.4%',
    'Hiệu suất: High Performer',
    '1.240 active members',
    'lime',
  ],
  [
    'QA Crescent Mall Elite Q.7',
    'Hạng 2',
    '745.000.000 đ',
    '26.2%',
    'Hiệu suất: Vượt Target',
    '890 active members',
    'mint',
  ],
  [
    'QA Thảo Điền Garden',
    'Hạng 3',
    '580.000.000 đ',
    '20.4%',
    'Hiệu suất: Ổn định',
    '615 active members',
    'blue',
  ],
  [
    'QA West Lake Hà Nội',
    'Mới mở',
    '370.200.000 đ',
    '13.0%',
    'Giai đoạn: Scale up',
    '420 active members',
    'gray',
  ],
]

const columns = [
  [98, 42],
  [78, 29],
  [116, 76],
  [132, 94],
  [54, 39],
  [22, 0],
  [86, 0],
  [96, 0],
  [112, 0],
  [191, 145],
  [152, 0],
  [180, 0],
]

function SummaryCards() {
  const cards = [
    ['TỔNG DOANH THU TOÀN CHUỖI (MTH)', '2.845.200.000', 'Mục tiêu: 2.700.000.000 đ', 'Đạt 105.3%'],
    ['GÓI TẬP (MEMBERSHIP)', '1.580.000.000', '438 hợp đồng mới', '+12.1% YoY'],
    ['DỊCH VỤ HUẤN LUYỆN (PT 1-1)', '785.400.000', '3.420 ca dạy hoàn thành', '98.2% Slot'],
    ['BÁN LẺ QA PRO SHOP', '479.800.000', 'Biên LN gộp: 38.2%', '1.890 SP'],
  ]

  return (
    <section className="report-summary">
      {cards.map(([title, value, left, right], index) => (
        <article key={title}>
          <header>
            <span>{title}</span>
            {index > 0 && (
              <b>
                Tỷ trọng:
                <br />
                {[55.5, 27.6, 16.9][index - 1]}%
              </b>
            )}
          </header>
          <strong>{value}</strong>
          <small>đ</small>
          <footer>
            <span>{left}</span>
            <b>{right}</b>
          </footer>
          <i>
            <em style={{ width: `${[100, 55, 28, 17][index]}%` }} />
          </i>
        </article>
      ))}
    </section>
  )
}

function RevenueChart() {
  return (
    <article className="report-card revenue-report">
      <header>
        <div>
          <h2>
            Xu hướng Doanh thu &
            <br />
            Dự phóng AI
          </h2>
          <span>
            CHUỖI: Tổng thực tế (T1–T10) kết hợp mô hình học máy dự báo P&amp;L tháng
            11/2025
          </span>
        </div>
        <b>
          AI FORECAST
          <br />
          READY
        </b>
      </header>

      <div className="revenue-legend">
        <span>■ &nbsp;Gói tập (Base)</span>
        <span>■ &nbsp;PT 1-1</span>
        <span>■ &nbsp;Pro Shop</span>
        <b>⌁ &nbsp;Dự phóng (+8.9%)</b>
      </div>

      <div className="report-chart">
        <div className="chart-scale">
          <span>2.85 Tỷ</span>
          <span>2.5 Tỷ</span>
          <span>1.5 Tỷ</span>
          <span>0.5 Tỷ</span>
        </div>
        <div className="forecast-line" />
        {columns.map(([base, extra], index) => (
          <div className={`report-bar ${index === 9 ? 'highlight' : ''}`} key={index}>
            <i style={{ height: `${base}px` }} />
            <em style={{ height: `${extra}px` }} />
            <small>T{index + 1}</small>
          </div>
        ))}
        <div className="forecast-value">2.845 Tỷ</div>
      </div>

      <footer className="forecast-note">
        <i>◉</i>
        <div>
          <b>
            Dự phóng tăng trưởng Doanh thu Tháng 11/2025:
            <br />
            +312.000.000 đ
          </b>
          <span>
            Dựa trên 185 suất hợp đồng thẻ Platinum và chiến dịch ưu đãi Black Friday sắp
            kích hoạt.
          </span>
        </div>
        <button>
          Xem mô hình
          <br />
          toàn học
        </button>
      </footer>
    </article>
  )
}

function RevenueStructure() {
  return (
    <article className="report-card revenue-structure">
      <header>
        <h2>
          Cơ cấu Doanh thu <small>4 chi nhánh</small>
        </h2>
        <p>Đóng góp doanh số của từng cơ sở trên tổng chu kỳ báo cáo hiện tại.</p>
      </header>

      {revenueByClub.map(([club, rank, value, percent, state, members, tone]) => (
        <div className="club-revenue" key={club}>
          <header>
            <span className={tone}>●</span>
            <b>{club}</b>
            <small>{rank}</small>
          </header>
          <strong>{value}</strong>
          <em>{percent}</em>
          <i>
            <span style={{ width: percent }} />
          </i>
          <footer>
            <span>{state}</span>
            <b>{members}</b>
          </footer>
        </div>
      ))}

      <button className="compare-button">Xem bảng so sánh P&amp;L 4 cơ sở chi tiết →</button>
    </article>
  )
}

function Retention() {
  return (
    <article className="report-card retention-card">
      <header>
        <h2>
          ↪ &nbsp;Chỉ số Giữ chân &amp; Vòng đời
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;Hội viên
        </h2>
        <b>
          Health:
          <br />
          Tốt
        </b>
      </header>

      <span>RETENTION &amp; CHURN RATE DIAGNOSTICS</span>

      <div className="retention-grid">
        <div>
          <small>TỶ LỆ GIA HẠN (RETENTION RATE)</small>
          <strong>78.4%</strong>
          <em>↗ +4.2% so với Q2</em>
          <p>
            Nhóm chỉ số chiến lược dài buổi tập tại Master Trainer và quà tặng thẻ thao.
          </p>
        </div>

        <div>
          <small>TỶ LỆ RỜI BỎ (CHURN RATE)</small>
          <strong>4.6%</strong>
          <em>◎ Ổn định an toàn</em>
          <p>Thấp hơn mức bình quân thị trường 1.8%.</p>
        </div>

        <div>
          <small>GIÁ TRỊ VÒNG ĐỜI TB (LTV)</small>
          <strong>18.25M</strong>
          <em>đ / hội viên</em>
          <p>Tính trên thời gian gắn bó trung bình 16.8 tháng.</p>
        </div>

        <div>
          <small>CHI PHÍ SỞ HỮU MỚI (CAC)</small>
          <strong className="green">420K</strong>
          <em>đ / hội viên</em>
          <p>
            ◉ TỶ LỆ LTV / CAC: <b>43.4x</b>
          </p>
        </div>
      </div>

      <footer>
        Cập nhật thuật toán LTV định kỳ mỗi 24h <b>Xem danh sách hội viên sắp hết hạn hợp đồng ↗</b>
      </footer>
    </article>
  )
}

function FacilityEfficiency() {
  const bars: [string, string, number][] = [
    ['Công suất thiết bị Gym trong khung giờ cao điểm (17h - 20h30)', '86.4%', 86],
    ['Tỷ lệ lấp đầy Studio PT 1-1 & Pilates Reformer', '94.6%', 94],
    ['Tỷ lệ Check-in tự động qua FaceID / QR AI Gate', '89.2%', 89],
  ]

  return (
    <article className="report-card efficiency-card">
      <header>
        <h2>
          ▣ &nbsp;Hiệu suất Sàn tập &amp; Tài
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp; sản
        </h2>
        <b>
          Sức chứa: 91%
          <br />
          Peak
        </b>
      </header>

      <span>FACILITY &amp; ASSET UTILIZATION</span>

      {bars.map(([label, value, width]) => (
        <div className="efficiency-row" key={label}>
          <header>
            <b>{label}</b>
            <em>{value}</em>
          </header>
          <i>
            <span style={{ width: `${width}%` }} />
          </i>
          <p>
            {label.includes('Gym')
              ? 'Đo lường qua cảm biến IOT tại khu vực Cardio & FreeTai cao, phân bổ ổn'
              : label.includes('Studio')
                ? 'Ghi nhận 1.840 giờ đặt phòng trước trên tổng số 1.945 Gần chạm giới hạn'
                : 'Giảm tải 100% nhân sự soát vé thủ công tại quầy. Thời gian quét: 0.28s'}
          </p>
        </div>
      ))}

      <div className="revenue-per-area">
        <small>DOANH THU TRUNG BÌNH TRÊN MÉT VUÔNG SÀN (REVENUE / M²)</small>
        <strong>
          1.420.000 <em>đ / m²</em>
        </strong>
        <b>
          +14.8% YoY
          <br />
          <small>Diện tích: 2.600m² sàn</small>
        </b>
      </div>

      <footer>
        Số liệu phân tích từ Hệ thống Kiểm soát Cổng IOT Gateways{' '}
        <b>Xem biểu đồ mật độ nhiệt &amp; Heatmap Facility ↗</b>
      </footer>
    </article>
  )
}

export default function Reports() {
  return (
    <div className="reports-page">
      <header className="report-heading">
        <div>
          <span>
            <i /> EXECUTIVE INTELLIGENCE ENGINE V4.2
          </span>
          <h1>
            BÁO CÁO TÀI CHÍNH &amp; THỐNG KÊ
            <br />
            HOẠT ĐỘNG TOÀN CHUỖI
          </h1>
          <p>
            Dữ liệu thời gian thực từ doanh thu, đến tỷ lệ giữ chân hội viên, hiệu suất sàn
            tập và tỷ suất lợi nhuận trên toàn bộ hệ thống cơ sở QA-Gym.
          </p>
        </div>

        <div className="report-actions">
          <nav>
            <button>Hôm nay</button>
            <button>Tuần này</button>
            <button className="active">Tháng 10/2025</button>
            <button>Quý 3/2025</button>
            <button>Tùy chỉnh ▣</button>
          </nav>
          <button>▣ &nbsp; Toàn bộ 4 CLB (Hệ thống) ⌄</button>
          <button className="export-report">⌄ &nbsp; Xuất báo cáo PDF / Excel chi tiết</button>
        </div>
      </header>

      <SummaryCards />

      <section className="report-main">
        <RevenueChart />
        <RevenueStructure />
      </section>

      <section className="report-bottom">
        <Retention />
        <FacilityEfficiency />
      </section>
    </div>
  )
}
