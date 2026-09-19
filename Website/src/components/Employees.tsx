import { useState } from 'react'

const employees = [
  [
    'Trần Minh Hoàng',
    'QA-EMP-001',
    'Master Admin',
    'Head Operations · Cơ sở: Crescent Elite Q.7',
    '2FA FaceID / Authenticate',
    'IP: 192.168.88.42',
    'green',
  ],
  [
    'Lê Văn Duyệt',
    'QA-EMP-014',
    'Kho & Logistics',
    'Quản Trị Kho Trung tâm · Cơ sở: Thảo Điền Hub',
    'Google OTP',
    'Đăng nhập: 08:15 hôm nay',
    'mint',
  ],
  [
    'Nguyễn Thị Mai',
    'QA-EMP-022',
    'Lễ tân & Soát vé',
    'Lễ tân Trưởng ca A · Cơ sở: Vincom Đồng Khởi Q.1',
    'FaceID Turnstile Auth',
    'Truy cập: Cổng Turnstile 01',
    'green',
  ],
  [
    'Trần Hoàng Nam',
    'QA-EMP-031',
    'HLV Thể hình',
    'Head PT / Chuyên gia Thể lực · Cơ sở: West Lake HN',
    'QA Coach Mobile App',
    '12 ca PT hôm nay',
    'mint',
  ],
  [
    'Nguyễn Thanh Nga',
    'QA-EMP-045',
    'Kế toán',
    'Kế toán trưởng Tập đoàn · Cơ sở: Trụ sở Landmark',
    'Khóa tạm thời',
    'Khóa bởi Admin: 10/01/2025',
    'gray',
  ],
]

const permissions = [
  'Dashboard Tổng quan CLB',
  'Quản lý Hội viên & Hợp đồng',
  'Cổng Turnstile & Soát vé QR',
  'Kho hàng & Pro Shop Chi nhánh',
  'Doanh thu & Xuất Hóa đơn VAT',
  'Khuyến mãi & Chính sách Giảm giá',
  'Cấu hình Phân quyền Hệ thống',
]

function EmployeeStats() {
  const stats = [
    [
      'TỔNG NHÂN SỰ',
      'Tổng Nhân Sự Vận hành',
      '84',
      'cán bộ NV',
      '42 HLV · 18 Lễ tân · 12 Sales',
      '6 Kho/K.T · 6 Quản lý',
    ],
    [
      'TRẠNG THÁI TRUY CẬP',
      'Tài Khoản Hoạt động',
      '82',
      '/ 84 Kích hoạt',
      'Tạm khóa (Nghỉ thai sản &',
      'Phép dài)',
    ],
    [
      'CHÍNH SÁCH PHÂN QUYỀN',
      'Vai Trò Hệ Thống',
      '06',
      'Nhóm quyền RBAC',
      'Master Admin, GĐ CLB, Kế toán,...',
      '',
    ],
    [
      'CẢNH BÁO AN NINH 24H',
      'Cảnh Báo An Ninh',
      '00',
      'Sự cố vi phạm',
      '100% 2FA & Không IP rủi ro',
      'CLB',
    ],
  ]

  return (
    <section className="employee-stats">
      {stats.map(([eyebrow, title, value, suffix, first, second], index) => (
        <article key={title}>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <strong>{value}</strong>
          <em>{suffix}</em>
          <footer>
            <b>{first}</b>
            <small>{second}</small>
          </footer>
          <i>{['▣', '♢', '◉', '♢'][index]}</i>
        </article>
      ))}
    </section>
  )
}

function EmployeeList() {
  return (
    <section className="employee-list">
      <header>
        <h2>♧ &nbsp;Danh Sách Nhân Sự Chuỗi QA-Gym</h2>
        <b>Hiển thị 5 / 84 nhân sự</b>
      </header>

      {employees.map(([name, id, role, position, security, detail, tone], index) => (
        <article key={id}>
          <div className={`employee-avatar ${tone}`}>
            {index === 4 ? 'TN' : '♟'}
            <i />
          </div>

          <div>
            <header>
              <h3>{name}</h3>
              <small>#{id}</small>
              <b>{role}</b>
            </header>
            <p>{position}</p>
            <footer>
              <span>● &nbsp;{security}</span>
              <small>{detail}</small>
            </footer>
          </div>

          <nav>
            <button>⌘</button>
            <button>↻</button>
            <button>◉</button>
          </nav>
        </article>
      ))}

      <footer className="employee-pagination">
        <span>Hiển thị trang 1 trên 17 trang nhân sự</span>
        <div>
          <button>‹</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>...</button>
          <button>17</button>
          <button>›</button>
        </div>
      </footer>
    </section>
  )
}

function PermissionMatrix() {
  return (
    <section className="permission-matrix">
      <header>
        <h2>♢ &nbsp;Ma Trận Phân Quyền Theo Vai Trò (RBAC)</h2>
        <button>Tùy chỉnh nhóm　›</button>
      </header>

      <div className="matrix-card">
        <header>
          <b>ĐANG XEM QUYỀN:</b>
          <select defaultValue="Giám đốc Vận hành CLB">
            <option>Giám đốc Vận hành CLB</option>
          </select>
          <span>✓ Khiếu CLB-Branch-Policy</span>
        </header>

        <div className="permission-table">
          <header>
            <span>MODULE CHỨC NĂNG</span>
            <b>XEM</b>
            <b>TẠO</b>
            <b>SỬA</b>
            <b>XÓA / DUYỆT</b>
          </header>

          {permissions.map((item, index) => (
            <div key={item}>
              <span>▣ &nbsp;{item}</span>
              <b>✓</b>
              <b className={index === 0 || index === 4 || index === 6 ? 'off' : ''}>✓</b>
              <b className={index > 2 ? 'off' : ''}>✓</b>
              <b className={index === 3 || index === 6 ? 'off' : ''}>✓</b>
            </div>
          ))}
        </div>

        <footer className="policy-note">
          <i>⚙</i>
          <span>
            <b>Chính sách Nguyên tắc Đặc quyền Tối thiểu (PoLP)</b>
            <br />
            Mọi thay đổi trên ma trận quyền cần ít nhất 02 chữ ký phê duyệt từ Master Admin
            và Ban Giám đốc An ninh Thông tin.
          </span>
          <button>Khôi phục mặc định</button>
          <button>Lưu thay đổi ma trận</button>
        </footer>
      </div>
    </section>
  )
}

function SecurityAudit() {
  return (
    <section className="security-audit">
      <header>
        <h2>▣ &nbsp;NHẬT KÝ BẢO MẬT GẦN NHẤT (AUDIT TRAIL)</h2>
        <b>Real-time Stream</b>
      </header>

      {[
        '#QA-EMP-001 (Admin) cập nhật phân quyền cho Lễ tân Q.1',
        '#QA-EMP-022 (Lễ tân) vừa xác thực FaceID mở phiên giao ca',
        'Hệ thống SSO tự động đóng bộ khóa mã hash 82 ca nhập',
      ].map((event, index) => (
        <p key={event}>
          <i />
          {event}
          <time>{[2, 14, 45][index]} phút trước</time>
        </p>
      ))}
    </section>
  )
}

export default function Employees() {
  const [tab, setTab] = useState('Danh sách nhân sự (84)')

  return (
    <div className="employees-page">
      <header className="employee-heading">
        <div>
          <span>
            <i /> ACCESS CONTROL & IDENTITY GOVERNANCE
          </span>
          <h1>
            QUẢN LÝ NHÂN SỰ &amp; MA TRẬN PHÂN
            <br />
            QUYỀN HỆ THỐNG
          </h1>
          <p>
            Quản lý tài khoản cán bộ nhân viên toàn chuỗi 4 CLB, cấu hình quyền truy cập RBAC
            và giám sát nhật ký an ninh đăng nhập.
          </p>
        </div>

        <div>
          <button>♢ &nbsp; Xuất nhật ký bảo mật</button>
          <button className="add-employee">♧ &nbsp; Thêm nhân sự mới</button>
        </div>
      </header>

      <EmployeeStats />

      <section className="employee-tabs">
        {[
          'Danh sách nhân sự (84)',
          'Ma trận Phân quyền (RBAC Matrix)',
          'Nhóm vai trò (Roles)',
          'Nhật ký bảo mật (Security Audit Trail)',
        ].map((item) => (
          <button
            key={item}
            className={tab === item ? 'active' : ''}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </section>

      <p className="employee-sync">● &nbsp; Đồng bộ máy chủ Auth SSO: 12 giây trước</p>

      <section className="employee-filters">
        <label>
          ⌕ <input placeholder="Tìm theo tên, mã NV (QA-EMP-...), email..." />
        </label>
        <button>▣　Tất cả chi nhánh (4 Hub)⌄</button>
        <button>●　Tất cả phòng ban &amp; Chức vụ⌄</button>
        <button>⊂　Tất cả trạng thái⌄</button>
      </section>

      <EmployeeList />
      <PermissionMatrix />
      <SecurityAudit />
    </div>
  )
}
