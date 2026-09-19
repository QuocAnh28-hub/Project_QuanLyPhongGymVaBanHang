import { useState, type ReactNode } from 'react'
import { promotions, tabs, type Promotion } from '../data/promotions'

function Icon({ children }: { children: ReactNode }) {
  return <span className="promo-icon">{children}</span>
}

function PromotionStats() {
  return (
    <section className="promo-stats">
      <article>
        <div>
          <span>DOANH THU TỪ VOUCHER</span>
          <Icon>▣</Icon>
        </div>
        <strong>482.6M</strong>
        <footer>
          <b>
            ↗ +24.5%
            <br />
            MoM
          </b>
          <span>386 lượt sử dụng</span>
        </footer>
      </article>

      <article>
        <div>
          <span>CHIẾN DỊCH ACTIVE</span>
          <Icon>⌘</Icon>
        </div>
        <strong className="lime-text">04</strong>
        <em>chiến dịch</em>
        <footer>
          <b>
            ● &nbsp;1 Flash-sale &nbsp;•&nbsp; 1 VIP &nbsp;•&nbsp; 1 Newbi...
          </b>
        </footer>
      </article>

      <article>
        <div>
          <span>PHÁT HÀNH / ĐÃ DÙNG</span>
          <Icon>▤</Icon>
        </div>
        <strong>
          842<small>/ 1.250</small>
        </strong>
        <footer>
          <b>
            Tỷ lệ quy đổi:
            <br />
            67.36%
          </b>
          <i>
            <em />
          </i>
        </footer>
      </article>

      <article>
        <div>
          <span>BUDGET BURN (CHIẾT KHẤU)</span>
          <Icon>▱</Icon>
        </div>
        <strong>
          58.4M <small>đ</small>
        </strong>
        <footer>
          <span>58.4% ngân sách tháng</span>
          <b>
            Quota:
            <br />
            100.0M đ
          </b>
        </footer>
      </article>
    </section>
  )
}

function PromotionRow({
  promo,
  selected,
  onSelect,
}: {
  promo: Promotion
  selected: boolean
  onSelect: () => void
}) {
  const usage = Math.round((promo.used / promo.total) * 100)

  return (
    <button
      type="button"
      className={`promo-row ${selected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className={`promo-discount ${promo.accent}`}>
        <strong>{promo.discount}</strong>
        <small>{promo.limit}</small>
      </div>

      <div className="promo-main">
        <header>
          <b>{promo.id}</b>
          <em className={promo.status === 'Sắp hết lượt' ? 'warning' : ''}>
            ● {promo.status}
          </em>
        </header>
        <small>{promo.scope}</small>
        <h2>{promo.title}</h2>
        <p>
          ▣ &nbsp;{promo.period} <span>⌁ &nbsp;{promo.category}</span>
        </p>
        <strong className="promo-revenue">◉ {promo.revenue}</strong>
      </div>

      <div className="promo-use">
        <b>
          Đã dùng: {promo.used} / {promo.total}
        </b>
        <em>{usage}%</em>
        <i>
          <span style={{ width: `${usage}%` }} />
        </i>
        <footer>
          <span>▣</span>
          <span>✎</span>
          <span>▣</span>
          <i>●</i>
        </footer>
      </div>
    </button>
  )
}

function PromotionDetail({ promotion }: { promotion: Promotion }) {
  return (
    <aside className="promo-detail">
      <header>
        <h2>
          ⚙ Chi tiết
          <br />
          &nbsp;&nbsp;&nbsp;Voucher
        </h2>
        <b>
          Live
          <br />
          Monitoring
        </b>
      </header>

      <div className="voucher-card">
        <span>
          ● QA VOUCHER PASS &nbsp; <small>Member App v3.2</small>
        </span>
        <strong>{promotion.id}</strong>
        <p>
          Giảm ngay 25% gói Hội viên 6 Tháng*
          <br />
          <small>Áp dụng cho hạng Diamond &amp; Platinum tại 4 CLB QA-Gym</small>
        </p>
        <div className="barcode">▌▌▍▌▌▍▌▌▍▌▌▍▌▌▍</div>
        <footer>QA-VCH-88392-2025</footer>
      </div>

      <div className="detail-metrics">
        <header>
          <span>PHIẾU CHUYỂN ĐỔI (ROI FUNNEL)</span>
          <b>
            Conv. Rate:
            <br />
            20.5%
          </b>
        </header>
        <p>
          ◉ Lượt xem chiến dịch <b>1.520 views</b>
        </p>
        <p>
          ▣ Đã lưu vào ví <b>890 saved (58.5%)</b>
        </p>
        <p>
          ● Thanh toán hoàn tất <b>312 paid (20.5%)</b>
        </p>
        <i>
          <em />
        </i>
        <i>
          <em />
        </i>
        <i>
          <em />
        </i>
      </div>

      <div className="detail-rules">
        <span>QUY TẮC ÁP DỤNG &amp; RÀNG BUỘC</span>
        <p>◎ Áp dụng 01 lần duy nhất cho mỗi tài khoản Hội viên.</p>
        <p>◎ Không cộng dồn đồng thời với Voucher sinh nhật.</p>
        <p>◎ Yêu cầu thanh toán qua VietQR hoặc MoMo AutoPay.</p>
      </div>

      <button className="promo-clone">▣ &nbsp; Nhân bản chiến dịch này</button>
      <button className="promo-send">
        ▷ &nbsp; Gửi Push Notification tới
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;3.420 VIP
      </button>
    </aside>
  )
}

export default function Promotions() {
  const [selectedId, setSelectedId] = useState(promotions[0].id)
  const [tab, setTab] = useState('Tất cả')
  const [query, setQuery] = useState('')
  const selected = promotions.find((item) => item.id === selectedId) ?? promotions[0]
  const visiblePromotions = promotions.filter(({ id, title }) =>
    `${id} ${title}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="promotions-page">
      <header className="promo-heading">
        <div>
          <span className="promo-engine">
            <i /> ENGINE MARKETING QA-GYM V4.8
          </span>
          <h1>
            QUẢN LÝ CHƯƠNG TRÌNH KHUYẾN MÃI
            <br />
            &amp; VOUCHER
          </h1>
          <p>
            Cấu hình mã ưu đãi, flash-sale gói tập, chiết khấu Pro Shop và theo dõi tỷ lệ
            chuyển đổi (ROI) toàn hệ thống.
          </p>
        </div>

        <div className="promo-heading-actions">
          <button className="promo-report">↧ &nbsp; Xuất báo cáo (Excel)</button>
          <button className="promo-create">⊕ &nbsp; Tạo chiến dịch / Voucher mới</button>
        </div>
      </header>

      <PromotionStats />

      <section className="promo-control">
        <div className="promo-tabs">
          {tabs.map(([label, count]) => (
            <button
              key={label}
              onClick={() => setTab(label)}
              className={tab === label ? 'active' : ''}
            >
              {label}
              <b>{count}</b>
            </button>
          ))}
          <span>☷ &nbsp; Sắp xếp: Mới nhất</span>
        </div>

        <div className="promo-filters">
          <label>
            ⌕ 
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nhập mã voucher (VD: SUMMER25, VIPPRO...), tên chương trình..."
            />
          </label>
          <button>Phạm vi: Toàn chuỗi (4 CLB)⌄</button>
          <button>Loại: Tất cả⌄</button>
          <button>Hình thức: Giảm⌄</button>
        </div>
      </section>

      <section className="promo-content">
        <div className="promo-list">
          {visiblePromotions.map((promo) => (
            <PromotionRow
              key={promo.id}
              promo={promo}
              selected={promo.id === selectedId}
              onSelect={() => setSelectedId(promo.id)}
            />
          ))}

          <footer className="promo-pagination">
            <span>Hiển thị 1–4 trong 18 chiến dịch</span>
            <div>
              <button>‹</button>
              <button className="current">1</button>
              <button>2</button>
              <button>3</button>
              <button>›</button>
            </div>
          </footer>
        </div>

        <PromotionDetail promotion={selected} />
      </section>
    </div>
  )
}
