import { useMemo, useState, type FormEvent } from 'react'
import { MetricCard, Modal } from '../components/AdminLayout'
import { money } from '../data/admin-utils'
import { initialPackages, type GymPackage } from '../data/admin-packages'

const categories = [
  ['all', 'TẤT CẢ GÓI'],
  ['system', 'TOÀN HỆ THỐNG ALL-ACCESS'],
  ['single', 'CƠ SỞ ĐƠN LẺ SINGLE'],
  ['pt', 'HLV CÁ NHÂN PT 1-1'],
  ['trial', 'TRẢI NGHIỆM & TRIAL'],
]
const emptyPackage: GymPackage = {
  id: 0,
  name: '',
  sku: '',
  category: 'all',
  badge: 'NEW PACKAGE',
  duration: 12,
  price: 0,
  active: true,
  description: '',
  features: [''],
  members: 0,
  renewal: 0,
}

export default function PackagesPage() {
  const [packages, setPackages] = useState(initialPackages)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [duration, setDuration] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [editing, setEditing] = useState<GymPackage | null>(null)
  const [report, setReport] = useState<GymPackage | null>(null)
  const [promo, setPromo] = useState(false)
  const [toast, setToast] = useState('')
  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }
  const filtered = useMemo(
    () =>
      packages.filter(
        (p) =>
          (category === 'all' ||
            (category === 'system'
              ? p.category === 'all'
              : p.category === category)) &&
          (!search ||
            `${p.name} ${p.sku} ${p.features.join(' ')}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (duration === 'all' || p.duration === +duration) &&
          (status === 'all' || p.active === (status === 'active'))
      ),
    [packages, category, search, duration, status]
  )
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const shown = filtered.slice(
    (Math.min(page, pages) - 1) * pageSize,
    Math.min(page, pages) * pageSize
  )
  const save = (value: GymPackage) => {
    setPackages((current) =>
      value.id
        ? current.map((p) => (p.id === value.id ? value : p))
        : [{ ...value, id: Date.now() }, ...current]
    )
    setEditing(null)
    notify(value.id ? 'Đã cập nhật gói tập' : 'Đã thêm gói tập mới')
  }
  return (
    <div className="admin-page packages-page">
      <PageHeader
        onPdf={() => notify('Chức năng sẽ kết nối backend sau')}
        onPromo={() => setPromo(true)}
        onCreate={() => setEditing(emptyPackage)}
      />
      <section className="metrics-grid">
        <MetricCard
          label="TỔNG GÓI ĐANG KÍCH HOẠT"
          value="14 Gói"
          note="10 Gói Public Portal · 4 Gói Private VIP"
        />
        <MetricCard
          label="GÓI BÁN CHẠY NHẤT"
          value="Diamond All-Access 12T"
          note="3.420 HV ACTIVE"
          tone="mint"
        />
        <MetricCard
          label="DOANH THU BÁN GÓI"
          value="1.144 Tỷ đồng"
          note="↗ +14.5% MoM"
          tone="cyan"
        />
        <MetricCard
          label="TỶ LỆ GIA HẠN TRUNG BÌNH"
          value="78.4%"
          note="86% tái tục gói 12 tháng"
          tone="mint"
        />
      </section>
      <section className="filter-panel">
        <div className="chips">
          {categories.map(([key, label]) => (
            <button
              className={category === key ? 'selected' : ''}
              onClick={() => {
                setCategory(key)
                setPage(1)
              }}
              key={key}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <label>
            ⌕
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm tên gói, mã SKU, tiện ích..."
            />
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="all">Thời hạn: Tất cả thời hạn</option>
            <option value="3">3 tháng</option>
            <option value="6">6 tháng</option>
            <option value="12">12 tháng</option>
            <option value="0">14 ngày</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Trạng thái: Tất cả</option>
            <option value="active">Đang kích hoạt</option>
            <option value="paused">Đã tạm dừng</option>
          </select>
          <button onClick={() => notify('Bộ lọc hiện tại đã được áp dụng')}>
            ☷ Bộ lọc nâng cao
          </button>
        </div>
      </section>
      <section className="package-grid">
        {shown.map((item) => (
          <PackageCard
            key={item.id}
            item={item}
            onEdit={() => setEditing(item)}
            onDuplicate={() => {
              setPackages((x) => [
                ...x,
                {
                  ...item,
                  id: Date.now(),
                  name: item.name + ' (Bản sao)',
                  sku: item.sku + '-COPY',
                },
              ])
              notify('Đã nhân bản gói tập')
            }}
            onReport={() => setReport(item)}
            onToggle={() =>
              setPackages((x) =>
                x.map((p) =>
                  p.id === item.id ? { ...p, active: !p.active } : p
                )
              )
            }
          />
        ))}
      </section>
      {!shown.length && (
        <div className="empty-state">Không tìm thấy gói tập phù hợp.</div>
      )}
      <BenefitMatrix />
      <div className="pagination">
        <span>
          Hiển thị{' '}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(+e.target.value)
              setPage(1)
            }}
          >
            <option>6</option>
            <option>12</option>
            <option>24</option>
          </select>{' '}
          trên tổng số {filtered.length} gói tập
        </span>
        <div>
          <button onClick={() => setPage(Math.max(1, page - 1))}>‹</button>
          {[1, 2, 3].map((p) => (
            <button
              disabled={p > pages}
              className={page === p ? 'current' : ''}
              onClick={() => setPage(p)}
              key={p}
            >
              {p}
            </button>
          ))}
          <button onClick={() => setPage(Math.min(pages, page + 1))}>›</button>
        </div>
      </div>
      {editing && (
        <PackageForm
          value={editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}{' '}
      {report && (
        <Modal
          title={`BÁO CÁO · ${report.name}`}
          onClose={() => setReport(null)}
        >
          <div className="mock-report">
            <strong>{report.members.toLocaleString('vi-VN')}</strong>
            <span>Hội viên đang kích hoạt</span>
            <strong>{report.renewal}%</strong>
            <span>Tỷ lệ gia hạn</span>
            <p>Báo cáo mẫu frontend, chưa kết nối dữ liệu máy chủ.</p>
          </div>
        </Modal>
      )}
      {promo && (
        <Modal title="CẤU HÌNH KHUYẾN MÃI" onClose={() => setPromo(false)}>
          <div className="form-grid">
            <label>
              Tên chương trình
              <input defaultValue="Flash Sale Gym" />
            </label>
            <label>
              Mức giảm (%)
              <input type="number" defaultValue="15" />
            </label>
            <label className="full">
              Thời gian áp dụng
              <input type="date" />
            </label>
          </div>
          <footer className="modal-actions">
            <button onClick={() => setPromo(false)}>Hủy</button>
            <button
              className="primary"
              onClick={() => {
                setPromo(false)
                notify('Đã lưu cấu hình khuyến mãi mock')
              }}
            >
              Lưu cấu hình
            </button>
          </footer>
        </Modal>
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  )
}

function PageHeader({
  onPdf,
  onPromo,
  onCreate,
}: {
  onPdf: () => void
  onPromo: () => void
  onCreate: () => void
}) {
  return (
    <header className="page-heading">
      <div>
        <p>
          VẬN HÀNH CHÍNH　›　QUẢN LÝ GÓI TẬP　›　<b>DANH SÁCH GÓI TẬP</b>
        </p>
        <h1>
          DANH MỤC GÓI TẬP &<br />
          DỊCH VỤ CLB
        </h1>
      </div>
      <div className="heading-actions">
        <button onClick={onPdf}>▣ Xuất bảng giá PDF</button>
        <button onClick={onPromo}>% Cấu hình khuyến mãi</button>
        <button className="primary" onClick={onCreate}>
          ＋ Tạo gói tập mới
        </button>
      </div>
    </header>
  )
}
function PackageCard({
  item,
  onEdit,
  onDuplicate,
  onReport,
  onToggle,
}: {
  item: GymPackage
  onEdit: () => void
  onDuplicate: () => void
  onReport: () => void
  onToggle: () => void
}) {
  return (
    <article className={`package-card ${item.active ? '' : 'paused'}`}>
      <header>
        <div>
          <span className="tag">{item.badge}</span>
          <small>SKU: {item.sku}</small>
          <h2>{item.name}</h2>
        </div>
        <button
          aria-label="Đổi trạng thái"
          className={`toggle ${item.active ? 'on' : ''}`}
          onClick={onToggle}
        >
          <i />
        </button>
      </header>
      <div className="price">
        <strong>{money(item.price).replace(' đ', '')}</strong>
        <span>
          VNĐ / {item.duration || 14}
          <br />
          {item.duration ? 'Tháng' : 'Ngày'}
        </span>
        {item.originalPrice && <del>{money(item.originalPrice)}</del>}
        <small>{item.description}</small>
      </div>
      <ul>
        {item.features.map((f, i) => (
          <li key={f}>
            <b>{['◉', '♧', '▣', '♙'][i]}</b>
            {f}
          </li>
        ))}
      </ul>
      <footer>
        <div>
          <span>
            ♙ {item.members.toLocaleString('vi-VN')}{' '}
            <small>Hội viên đang kích hoạt</small>
          </span>
          <b>{item.renewal}% Gia hạn</b>
        </div>
        <nav>
          <button title="Chỉnh sửa" onClick={onEdit}>
            ✎
          </button>
          <button title="Nhân bản" onClick={onDuplicate}>
            ▣
          </button>
          <button title="Báo cáo" onClick={onReport}>
            ⌁
          </button>
          <button
            title={item.active ? 'Tạm dừng' : 'Kích hoạt'}
            onClick={onToggle}
          >
            {item.active ? '⏸' : '▶'}
          </button>
        </nav>
      </footer>
    </article>
  )
}
function BenefitMatrix() {
  return (
    <section className="benefit">
      <header>
        <div>
          <h2>MA TRẬN QUYỀN LỢI & PHÂN TẦNG HỘI VIÊN</h2>
          <p>
            Bản quy chiếu phân tầng kiểm soát cửa QR tự động theo từng hạng thẻ
          </p>
        </div>
        <b>● ĐÃ ĐỒNG BỘ 4 CLB</b>
      </header>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {[
                'HẠNG THẺ HỘI VIÊN',
                'SỐ CƠ SỞ ÁP DỤNG',
                'KHUNG GIỜ CHECK-IN',
                'KHĂN TẬP & ĐỒ DÙNG',
                'LOCKER',
                'SAUNA & JACUZZI',
                'KHÁCH ĐI KÈM',
              ].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>♢ Diamond VIP</th>
              <td>Toàn bộ 04 Cơ sở</td>
              <td>24/7 (Không giới hạn)</td>
              <td>Khăn tắm sợi tre VIP trọn gói</td>
              <td>Tủ riêng cố định gần tân</td>
              <td>VIP Jacuzzi + Sauna tuyết</td>
              <td>01 Khách/tháng</td>
            </tr>
            <tr>
              <th>◉ Platinum Pro</th>
              <td>Toàn bộ 04 Cơ sở</td>
              <td>06:00 – 23:00</td>
              <td>01 Khăn tập mỗi buổi</td>
              <td>Locker thẻ thông minh</td>
              <td>Phòng xông hơi tiêu chuẩn</td>
              <td>Không bao gồm</td>
            </tr>
            <tr>
              <th>⚒ Classic & Off-Peak</th>
              <td>01 Cơ sở đăng ký</td>
              <td>Theo khung giờ gói</td>
              <td>Tự túc hoặc thuê</td>
              <td>Locker có mã pin</td>
              <td>Không bao gồm</td>
              <td>Không bao gồm</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
function PackageForm({
  value,
  onClose,
  onSave,
}: {
  value: GymPackage
  onClose: () => void
  onSave: (v: GymPackage) => void
}) {
  const [form, setForm] = useState(value)
  const field = (
    key: keyof GymPackage,
    val: string | number | boolean | string[]
  ) => setForm({ ...form, [key]: val })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSave(form)
  }
  return (
    <Modal
      title={value.id ? 'CHỈNH SỬA GÓI TẬP' : 'TẠO GÓI TẬP MỚI'}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Tên gói
            <input
              required
              value={form.name}
              onChange={(e) => field('name', e.target.value)}
            />
          </label>
          <label>
            SKU
            <input
              required
              value={form.sku}
              onChange={(e) => field('sku', e.target.value)}
            />
          </label>
          <label>
            Loại gói
            <select
              value={form.category}
              onChange={(e) => field('category', e.target.value)}
            >
              <option value="all">Toàn hệ thống</option>
              <option value="single">Cơ sở đơn lẻ</option>
              <option value="pt">HLV cá nhân</option>
              <option value="trial">Trải nghiệm</option>
            </select>
          </label>
          <label>
            Thời hạn (tháng)
            <input
              type="number"
              value={form.duration}
              onChange={(e) => field('duration', +e.target.value)}
            />
          </label>
          <label>
            Giá
            <input
              required
              type="number"
              value={form.price}
              onChange={(e) => field('price', +e.target.value)}
            />
          </label>
          <label>
            Giá gốc
            <input
              type="number"
              value={form.originalPrice || ''}
              onChange={(e) => field('originalPrice', +e.target.value)}
            />
          </label>
          <label>
            Trạng thái
            <select
              value={String(form.active)}
              onChange={(e) => field('active', e.target.value === 'true')}
            >
              <option value="true">Đang kích hoạt</option>
              <option value="false">Tạm dừng</option>
            </select>
          </label>
          <label className="full">
            Mô tả
            <textarea
              value={form.description}
              onChange={(e) => field('description', e.target.value)}
            />
          </label>
          <label className="full">
            Quyền lợi (mỗi dòng một quyền lợi)
            <textarea
              value={form.features.join('\n')}
              onChange={(e) => field('features', e.target.value.split('\n'))}
            />
          </label>
        </div>
        <footer className="modal-actions">
          <button type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="primary">Lưu gói</button>
        </footer>
      </form>
    </Modal>
  )
}
