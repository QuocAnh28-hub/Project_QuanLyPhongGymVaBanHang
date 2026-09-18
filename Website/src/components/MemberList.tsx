type Member = {
  id: string
  name: string
  phone: string
  tier: 'DIAMOND VIP' | 'CLASSIC SILVER' | 'PLATINUM PRO' | 'CLASSIC'
  packageName: string
  expiry: string
  club: string
  sessions: string
  coach: string
  checkIn: string
  status: string
  statusTone: 'active' | 'warning' | 'paused'
  avatar: string
}

const statistics = [
  {
    label: 'TỔNG SỐ HỘI VIÊN',
    value: '25.840',
    note: '24.120 Active',
    icon: '♟',
    tone: 'lime',
  },
  {
    label: 'DIAMOND VIP CLUB',
    value: '3.420',
    note: 'Đóng góp 48% tổng doanh thu',
    icon: '◆',
    tone: 'gold',
  },
  {
    label: 'HẾT HẠN TRONG 7 NGÀY',
    value: '45',
    note: '18 cuộc gọi cần chốt hôm nay',
    icon: '♧',
    tone: 'red',
  },
  {
    label: 'HỘI VIÊN MỚI THÁNG NÀY',
    value: '382',
    note: '+14.2% so với cùng kỳ T9',
    icon: '♙',
    tone: 'aqua',
  },
]

const members: Member[] = [
  {
    id: 'QA-84928',
    name: 'Alex Tran\n(Trần Minh Hoàng)',
    phone: '0903.118.990',
    tier: 'DIAMOND VIP',
    packageName: 'Diamond All-Access 12T',
    expiry: '24/10/2026\nCÒN 365+ NGÀY',
    club: 'Vincom Q.1\nCentral Flagship Club',
    sessions: '10 /24\nbuổi PT: Trần Hoàng Nam',
    coach: '15:41 hôm nay\nGate 02 - Cổng FaceID Q.1',
    checkIn: '15:41 hôm nay',
    status: 'Đang hoạt động',
    statusTone: 'active',
    avatar: 'AT',
  },
  {
    id: 'QA-77291',
    name: 'Nguyễn Thị\nMai',
    phone: '0918.442.109',
    tier: 'CLASSIC SILVER',
    packageName: 'Gói Classic Thường 8T',
    expiry: '05/11/2025\nHẾT HẠN SAU 12 NGÀY',
    club: 'Crescent Elite Q.7\nKhu Nam Sài Gòn',
    sessions: '4 buổi\nChưa đăng ký PT',
    coach: '15:39 hôm nay\nCổng xoay Q.7',
    checkIn: '15:39 hôm nay',
    status: 'Sắp hết hạn',
    statusTone: 'warning',
    avatar: 'NM',
  },
  {
    id: 'QA-93312',
    name: 'Đặng Quang\nHuy',
    phone: '0977.892.411',
    tier: 'PLATINUM PRO',
    packageName: 'Gói Platinum 12T Pro',
    expiry: '18/03/2026\nCÒN 142 NGÀY',
    club: 'Vincom Q.1\nCentral Toà 4',
    sessions: '18 /36\nbuổi PT: Lê Khắc Huy',
    coach: 'Hôm qua 18:30\nCổng Q.1 - Tầng 2',
    checkIn: 'Hôm qua 18:30',
    status: 'Đang hoạt động',
    statusTone: 'active',
    avatar: 'DH',
  },
  {
    id: 'QA-62914',
    name: 'Lê Vũ Phương\nThảo',
    phone: '0932.880.229',
    tier: 'DIAMOND VIP',
    packageName: 'Gói VIP Unlimited Life',
    expiry: '12/12/2025\nCÒN 45 NGÀY',
    club: 'Thảo Điền Hub\nPrivate Locker #12',
    sessions: '5 /12\nbuổi PT: Nguyễn Minh Thư',
    coach: '3 ngày trước\nStudio Yoga 1',
    checkIn: '3 ngày trước',
    status: 'Đang hoạt động',
    statusTone: 'active',
    avatar: 'LT',
  },
  {
    id: 'QA-45102',
    name: 'Võ Hoàng\nLong',
    phone: '0949.551.833',
    tier: 'CLASSIC',
    packageName: 'Gói Gym Off-Peak 3T',
    expiry: '20/10/2025\nQUÁ HẠN 4 NGÀY',
    club: 'Vincom Q.1\nCentral Giờ thấp điểm',
    sessions: '0 buổi\nKhông có PT',
    coach: '15:31 hôm nay\nHệ thống chặn tự động',
    checkIn: '15:31 hôm nay',
    status: 'Đã hết hạn',
    statusTone: 'paused',
    avatar: 'VL',
  },
  {
    id: 'QA-44218',
    name: 'Phạm Quỳnh\nNga',
    phone: '0983.190.552',
    tier: 'PLATINUM PRO',
    packageName: 'Gói Platinum Reformer',
    expiry: '15/11/2025\nCÒN 21 NGÀY',
    club: 'West Lake HM Hub\nHồ Tây Campus',
    sessions: '14 /20\nbuổi Tập cùng người yêu',
    coach: '12/10/2025\nStudio HN',
    checkIn: '12/10/2025',
    status: 'Đang bảo lưu',
    statusTone: 'paused',
    avatar: 'PN',
  },
]

const splitLine = (value: string) =>
  value.split('\n').map((line) => <span key={line}>{line}</span>)

export default function MemberList() {
  return (
    <div className="members-page">
      <section className="members-heading">
        <div>
          <p className="breadcrumb">
            VẬN HÀNH CHÍNH <b>›</b> HỘI VIÊN & HỢP ĐỒNG <b>›</b> DANH SÁCH HỘI
            VIÊN
          </p>
          <h1>QUẢN LÝ DANH SÁCH HỘI VIÊN</h1>
          <p>
            Hệ thống cơ sở dữ liệu hội viên tập trung toàn hệ thống 4 cơ sở
            QA-Gym Performance Club.
          </p>
        </div>
        <div className="member-heading-actions">
          <b>
            <small>25.840 THẺ</small> ACTIVE
          </b>
          <button type="button">↥ Nhập Excel</button>
          <button type="button">⇩ Xuất CSV</button>
          <button className="member-add" type="button">
            ♧　+ Thêm hội viên mới
          </button>
        </div>
      </section>

      <section className="member-statistics">
        {statistics.map((stat) => (
          <article className={`member-stat ${stat.tone}`} key={stat.label}>
            <p>
              {stat.label}
              <i>{stat.icon}</i>
            </p>
            <strong>{stat.value}</strong>
            <span>{stat.note}</span>
            {stat.tone === 'lime' && (
              <footer>
                <b>↗ 24.120 Active</b>
                <b>↓ 1.250 Lưu</b>
                <b>470 Hết hạn</b>
              </footer>
            )}
            {stat.tone === 'gold' && (
              <footer>
                <b>Tỉ lệ gia hạn: 65.2%</b>
                <b>Tăng 2.4% MoM</b>
              </footer>
            )}
            {stat.tone === 'red' && (
              <footer>
                <b>Tỉ lệ gia hạn T8: 78.4%</b>
                <b>Xử lý ngay</b>
              </footer>
            )}
            {stat.tone === 'aqua' && (
              <footer>
                <b>KPI tháng: 420 (91%)</b>
                <b>Còn 8 ngày</b>
              </footer>
            )}
          </article>
        ))}
      </section>

      <section className="member-filters">
        <div className="filter-row">
          <label className="member-search">
            ⌕<input placeholder="Tìm theo tên, SĐT, mã hội viên..." />
          </label>
          <button type="button">Tất cả cơ sở (4 Clubs)⌄</button>
          <button type="button">Tất cả hạng thẻ⌄</button>
          <button type="button">Trạng thái: Toàn bộ⌄</button>
          <button type="button">HLV PT Phụ trách: Tất cả⌄</button>
          <button className="filter-icon" type="button">
            ☷
          </button>
        </div>
        <div className="filter-tags">
          <b>ĐANG ÁP DỤNG:</b>
          <span>Cơ sở: Toàn hệ thống　×</span>
          <span>Trạng thái: Tất cả trừ Đã hủy　×</span>
          <button type="button">XÓA TẤT CẢ BỘ LỌC</button>
        </div>
      </section>

      <section className="members-table-card">
        <header className="member-table-toolbar">
          <label>
            <input type="checkbox" /> CHỌN TẤT CẢ (10 TRÊN TRANG)
          </label>
          <span>Đã chọn: 0 hội viên</span>
          <div>
            <button>▣ GỬI SMS/ZNS</button>
            <button>▱ GẮN THẺ TAG</button>
            <button>▥ CỘT</button>
          </div>
        </header>
        <div className="members-table-wrap">
          <table className="members-table">
            <thead>
              <tr>
                <th></th>
                <th>HỘI VIÊN & MÃ ID</th>
                <th>HẠNG THẺ</th>
                <th>GÓI TẬP & HẠN SỬ DỤNG</th>
                <th>CƠ SỞ CHÍNH</th>
                <th>BUỔI PT CÒN LẠI</th>
                <th>CHECK-IN GẦN NHẤT</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className={
                    member.statusTone === 'paused' ? 'member-paused' : ''
                  }
                >
                  <td>
                    <input aria-label={`Chọn ${member.name}`} type="checkbox" />
                  </td>
                  <td>
                    <div className="member-profile">
                      <i>{member.avatar}</i>
                      <div>
                        <strong>{splitLine(member.name)}</strong>
                        <small>⌁ {member.id}</small>
                        <em>{member.phone}</em>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`tier tier-${member.tier.split(' ')[0].toLowerCase()}`}
                    >
                      ◈ {member.tier}
                    </span>
                  </td>
                  <td className="member-detail">
                    {splitLine(member.packageName)}
                    <b>{splitLine(member.expiry)}</b>
                  </td>
                  <td className="member-detail">{splitLine(member.club)}</td>
                  <td className="member-sessions">
                    {splitLine(member.sessions)}
                  </td>
                  <td
                    className={`member-checkin ${member.statusTone === 'paused' ? 'overdue' : ''}`}
                  >
                    {splitLine(member.coach)}
                  </td>
                  <td>
                    <span className={`member-status ${member.statusTone}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <div className="member-actions">
                      <button aria-label="Xem chi tiết">◉</button>
                      <button aria-label="Chỉnh sửa">✎</button>
                      <button aria-label="Thêm thao tác">⋮</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="member-pagination">
          <span>
            Hiển thị 1–10 trong số <b>25.840</b> hội viên toàn quốc　|　
            <b>86 dòng</b>
          </span>
          <label>
            10 dòng{' '}
            <select defaultValue="10">
              <option>10</option>
            </select>
          </label>
          <div>
            <button>‹</button>
            <button className="current">1</button>
            <button>2</button>
            <button>3</button>
            <b>… 2584</b>
            <button>›</button>
          </div>
        </footer>
      </section>

      <section className="member-insights">
        <article>
          <i>◔</i>
          <div>
            <b>Tỷ lệ Check-in Đúng thời Giờ Cao điểm</b>
            <span>
              Hiện đang có 1.890 hội viên đăng tập tại 4 cơ sở (78% sức chứa
              định mức).
            </span>
          </div>
        </article>
        <article>
          <i>♢</i>
          <div>
            <b>Xác thực Sinh trắc FaceID 3D</b>
            <span>
              99.4% hội viên đã kích hoạt mã định danh khuôn mặt không chạm tại
              cổng turnstile.
            </span>
          </div>
        </article>
        <article>
          <i>♧</i>
          <div>
            <b>Dịch vụ Chăm sóc VIP Concierge</b>
            <span>
              24/7 hỗ trợ đặt lịch PT riêng, tủ Locker cá nhân & đồ bổ sung dinh
              dưỡng Pro Shop.
            </span>
          </div>
        </article>
      </section>
    </div>
  )
}
