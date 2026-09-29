import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MetricCard, Modal } from '../components/AdminLayout'
import { money } from '../data/admin-utils'
import { deletePackage, getPackages, savePackage, setPackageStatus, type GymPackage } from '../services/packages'

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
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<GymPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [duration, setDuration] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [editing, setEditing] = useState<GymPackage | null>(null)
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
  const load = async () => {
    try { setPackages(await getPackages()); setError('') }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể tải gói tập') }
    finally { setLoading(false) }
  }
  // oxlint-disable-next-line react/set-state-in-effect -- fetch result initializes server state
  useEffect(() => { void load() }, [])
  const save = async (value: GymPackage) => {
    try { await savePackage(value); await load() }
    catch (e) { notify(e instanceof Error ? e.message : 'Không thể lưu gói tập'); return }
    setEditing(null)
    notify(value.id ? 'Đã cập nhật gói tập' : 'Đã thêm gói tập mới')
  }
  return (
    <div className="admin-page packages-page">
      <PageHeader
        onPdf={() => notify('Chức năng sẽ kết nối backend sau')}
        onPromo={() => notify('Chưa có API cấu hình khuyến mãi')}
        onCreate={() => setEditing(emptyPackage)}
      />
      <section className="metrics-grid">
        <MetricCard
          label="TỔNG GÓI ĐANG KÍCH HOẠT"
          value={`${packages.filter(p => p.active).length} Gói`}
          note={`${packages.filter(p => !p.active).length} gói ngừng hoạt động`}
        />
        <MetricCard
          label="GÓI BÁN CHẠY NHẤT"
          value={packages.reduce((best, p) => p.members > (best?.members ?? -1) ? p : best, packages[0])?.name || '—'}
          note="Theo số hội viên ACTIVE thực tế"
          tone="mint"
        />
        <MetricCard
          label="DOANH THU BÁN GÓI"
          value="—"
          note="Chưa có API báo cáo doanh thu"
          tone="cyan"
        />
        <MetricCard
          label="TỶ LỆ GIA HẠN TRUNG BÌNH"
          value="—"
          note="Chưa có dữ liệu tỷ lệ gia hạn"
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
      {loading && <div className="empty-state">Đang tải dữ liệu...</div>}
      {error && <div className="empty-state">{error}</div>}
      <section className="package-grid">
        {shown.map((item) => (
          <PackageCard
            key={item.id}
            item={item}
            onEdit={() => setEditing(item)}
            onDuplicate={() => {
              void deletePackage(item.id).then(result => load().then(() => notify(result.message))).catch(e => notify(e.message))
            }}
            onReport={() => notify(`Gói ${item.name} có ${item.members} hội viên ACTIVE`)}
            onToggle={() => {
              void setPackageStatus(item.id, !item.active).then(load).catch(e => notify(e.message))
            }}
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
        </div>
        <nav>
          <button title="Chỉnh sửa" onClick={onEdit}>
            ✎
          </button>
          <button title="Xóa hoặc ngừng hoạt động" onClick={onDuplicate}>
            ×
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
