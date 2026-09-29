import { useEffect, useMemo, useState } from 'react'
import { MetricCard } from '../components/AdminLayout'
import { money } from '../data/admin-utils'
import { confirmPayment, getRegistrations, renewRegistration, type Contract, type ContractStatus } from '../services/registrations'

const statusFilters = [
  'Tất cả đơn',
  'PENDING',
  'ACTIVE',
  'SẮP HẾT HẠN',
  'EXPIRED',
  'CANCELLED',
]
export default function RegistrationsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [selected, setSelected] = useState(0)
  const [ids, setIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('Tất cả đơn')
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('all')
  const [payment, setPayment] = useState('all')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState('')
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<number | null>(null)
  const notify = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(''), 2200)
  }
  const load = async () => {
    try {
      const rows = await getRegistrations()
      setContracts(rows)
      setSelected((current) => current || rows[0]?.id || 0)
      setError('')
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tải đăng ký') }
    finally { setLoading(false) }
  }
  // oxlint-disable-next-line react/set-state-in-effect -- fetch result initializes server state
  useEffect(() => { void load() }, [])
  const filtered = useMemo(
    () =>
      contracts.filter(
        (c) =>
          (filter === 'Tất cả đơn' || c.status === filter ||
            (filter === 'SẮP HẾT HẠN' && c.status === 'ACTIVE' && (c.daysLeft ?? 0) <= 30)) &&
          (!search ||
            `${c.code} ${c.member} ${c.phone} ${c.coach}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (branch === 'all' || c.branch.includes(branch)) &&
          (payment === 'all' || c.paymentMethod === payment)
      ),
    [contracts, filter, search, branch, payment]
  )
  const pageRows = filtered.slice((page - 1) * 5, page * 5),
    detail = contracts.find((c) => c.id === selected) || contracts[0]
  const toggleAll = () =>
    setIds(
      pageRows.every((c) => ids.includes(c.id))
        ? ids.filter((id) => !pageRows.some((c) => c.id === id))
        : [...new Set([...ids, ...pageRows.map((c) => c.id)])]
    )
  return (
    <div className="admin-page registrations-page">
      <header className="page-heading">
        <div>
          <p>
            VẬN HÀNH CHÍNH　›　GÓI TẬP & HĐ　›　<b>QUẢN LÝ ĐĂNG KÝ GÓI TẬP</b>
          </p>
          <h1>QUẢN LÝ ĐĂNG KÝ GÓI TẬP & HỢP ĐỒNG</h1>
          <span className="pending-badge">● {contracts.filter(c => c.status === 'PENDING').length} đơn chờ thanh toán</span>
        </div>
        <div className="heading-actions">
          <button onClick={() => notify('Chức năng sẽ kết nối backend sau')}>
            ◉ Xuất báo cáo hợp đồng
          </button>
          <button disabled>
            ✓ Duyệt nhanh hàng loạt ({ids.length})
          </button>
          <button className="primary" onClick={() => notify('Đăng ký mới được tạo từ flow mua gói của hội viên')}>
            ⊕ Tạo hợp đồng mới
          </button>
        </div>
      </header>
      <section className="metrics-grid">
        <MetricCard
          label="ĐĂNG KÝ MỚI HÔM NAY"
          value={String(contracts.filter(c => c.time.startsWith(new Date().toISOString().slice(0, 10))).length)}
          note="Dữ liệu đăng ký thực từ hệ thống"
        />
        <MetricCard
          label="ĐANG CHỜ DUYỆT / KÝ SỐ"
          value={String(contracts.filter(c => c.status === 'PENDING').length)}
          note="Chưa được kích hoạt khi thanh toán chưa SUCCESS"
          tone="error"
        />
        <MetricCard
          label="ĐÃ KÍCH HOẠT"
          value={String(contracts.filter(c => c.status === 'ACTIVE').length)}
          note={`${contracts.filter(c => c.status === 'ACTIVE' && (c.daysLeft ?? 0) <= 30).length} gói sắp hết hạn`}
          tone="mint"
        />
        <MetricCard
          label="TỶ LỆ CHỐT TRỰC TUYẾN"
          value="64.2%"
          note="+5.4% MoM · App: 270 | Web: 150"
        />
      </section>
      <section className="filter-panel contract-filters">
        <div className="chips">
          {statusFilters.map((s) => (
            <button
              className={filter === s ? 'selected' : ''}
              onClick={() => {
                setFilter(s)
                setPage(1)
              }}
              key={s}
            >
              {s}{' '}
              <small>
                {s === 'Tất cả đơn' ? contracts.length : contracts.filter(c => c.status === s || (s === 'SẮP HẾT HẠN' && c.status === 'ACTIVE' && (c.daysLeft ?? 0) <= 30)).length}
              </small>
            </button>
          ))}
          <span>CẬP NHẬT LÚC: 15:42:09　↻</span>
        </div>
        <div className="filter-row">
          <label>
            ⌕
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã HĐ, Họ tên, Số điện thoại hoặc Coach..."
            />
          </label>
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="all">Tất cả 4 Cơ sở hoạt động</option>
            <option>Vincom</option>
            <option>Thảo Điền</option>
            <option>Crescent</option>
          </select>
          <select value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="all">Cổng thanh toán</option>
            <option value="CHUYEN_KHOAN">CHUYEN_KHOAN</option>
            <option value="THE">THE</option>
            <option value="TIEN_MAT">TIEN_MAT</option>
          </select>
          <button>▣ Tháng này</button>
        </div>
      </section>
      {loading && <div className="empty-state">Đang tải dữ liệu...</div>}
      {error && <div className="empty-state">{error}</div>}
      <div className="contracts-layout">
        <section>
          <div className="table-caption">
            <b>DANH SÁCH ĐƠN & HỢP ĐỒNG GẦN NHẤT</b>
            <label>
              Chọn hàng loạt:{' '}
              <input
                type="checkbox"
                checked={
                  !!pageRows.length && pageRows.every((c) => ids.includes(c.id))
                }
                onChange={toggleAll}
              />
            </label>
          </div>
          <div className="contract-table-wrap">
            <table className="contract-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        !!pageRows.length &&
                        pageRows.every((c) => ids.includes(c.id))
                      }
                      onChange={toggleAll}
                    />
                  </th>
                  <th>MÃ HĐ & THỜI GIAN</th>
                  <th>HỘI VIÊN & ĐỊNH DANH</th>
                  <th>GÓI TẬP ĐĂNG KÝ</th>
                  <th>TRỊ GIÁ HĐ</th>
                  <th>THANH TOÁN</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((c) => (
                  <tr
                    className={selected === c.id ? 'selected-row' : ''}
                    onClick={() => setSelected(c.id)}
                    key={c.id}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={ids.includes(c.id)}
                        onChange={() =>
                          setIds(
                            ids.includes(c.id)
                              ? ids.filter((x) => x !== c.id)
                              : [...ids, c.id]
                          )
                        }
                      />
                    </td>
                    <td>
                      <b className="contract-code">{c.code}</b>
                      <small>{c.time}</small>
                    </td>
                    <td>
                      <div className="member-cell">
                        <i>{c.member.charAt(0)}</i>
                        <span>
                          <b>{c.member}</b>
                          <small>
                            {c.memberId} · {c.phone}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <b>{c.packageName}</b>
                      <small>{c.coach}</small>
                    </td>
                    <td>
                      <strong>{money(c.value)}</strong>
                      <small>
                        {c.discount
                          ? `Ưu đãi -${money(c.discount)}`
                          : 'Nguyên giá'}
                      </small>
                    </td>
                    <td>{c.paymentId ? <>{c.paymentMethod} · {c.paymentStatus}</> : 'Chưa có yêu cầu thanh toán'}</td>
                    <td>
                      <span className={`status ${statusClass(c.status)}`}>
                        ● {c.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setSelected(c.id)}>◉</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination table-page">
              <span>
                Hiển thị {(page - 1) * 5 + 1} -{' '}
                {Math.min(page * 5, filtered.length)} trên tổng số <b>{filtered.length}</b>{' '}
                hợp đồng đăng ký
              </span>
              <div>
                <button onClick={() => setPage(Math.max(1, page - 1))}>
                  ‹
                </button>
                {[1, 2, 3].map((p) => (
                  <button
                    className={page === p ? 'current' : ''}
                    onClick={() => setPage(p)}
                    key={p}
                  >
                    {p}
                  </button>
                ))}
                <span>…</span>
                <button onClick={() => setPage(5)}>88</button>
                <button onClick={() => setPage(Math.min(5, page + 1))}>
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>
        {detail && <ContractDetail
          contract={detail}
          confirming={confirmingPaymentId === detail.paymentId}
          onConfirm={async () => {
            if (!detail.paymentId) return
            try {
              setConfirmingPaymentId(detail.paymentId)
              const result = await confirmPayment(detail.paymentId)
              await load()
              notify(result.message)
            } catch (e) { notify(e instanceof Error ? e.message : 'Không thể xác nhận thanh toán') }
            finally { setConfirmingPaymentId(null) }
          }}
          onRenew={async () => {
            try { const result = await renewRegistration(detail.id); await load(); notify(result.message) }
            catch (e) { notify(e instanceof Error ? e.message : 'Không thể gia hạn') }
          }}
          onReject={() => notify('Hủy đăng ký phải đi qua flow thanh toán hiện tại')}
          onPdf={() => notify('File PDF ký số sẽ kết nối backend sau')}
        />}
      </div>
      <footer className="ops-footer">
        ● Hạ tầng NAPAS 24/7: <b>Bình thường (100% Khớp lệnh)</b>　 ● Dịch vụ
        chữ ký số VNPT CA: <b>Sẵn sàng</b>　 ● Đồng bộ cổng Turnstile:{' '}
        <b>4/4 Chi nhánh online</b>
      </footer>
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  )
}
const statusClass = (s: ContractStatus) =>
  s === 'ACTIVE'
    ? 'ok'
    : s === 'PENDING'
      ? 'pending'
      : s === 'CANCELLED' || s === 'EXPIRED'
        ? 'bad'
        : 'neutral'
function ContractDetail({
  contract: c,
  confirming,
  onConfirm,
  onRenew,
  onReject,
  onPdf,
}: {
  contract: Contract
  confirming: boolean
  onConfirm: () => void
  onRenew: () => void
  onReject: () => void
  onPdf: () => void
}) {
  return (
    <aside className="contract-detail">
      <header>
        <h2>♢ CHI TIẾT ĐƠN DUYỆT #{c.id}</h2>
        <span>{c.paymentId ? <>{c.paymentMethod} · {c.paymentStatus}</> : 'Chưa có yêu cầu thanh toán'}</span>
      </header>
      <div className="detail-member">
        <i>{c.member.charAt(0)}</i>
        <div>
          <b>{c.member}</b>
          <small>
            CCCD: {c.cccd} · {c.age} tuổi
          </small>
        </div>
        <button>⌕</button>
      </div>
      <dl>
        <div>
          <dt>Gói hội viên:</dt>
          <dd>{c.packageName}</dd>
        </div>
        <div>
          <dt>Cơ sở đăng ký:</dt>
          <dd>{c.branch}</dd>
        </div>
        <div>
          <dt>Sales tư vấn:</dt>
          <dd className="mint">{c.coach}</dd>
        </div>
        <div>
          <dt>Kỳ hạn hợp đồng:</dt>
          <dd>{c.term}</dd>
        </div>
        <div>
          <dt>Mã giao dịch:</dt>
          <dd>
            <code>{c.transaction}</code>
          </dd>
        </div>
      </dl>
      <div className="receipt">
        <p>
          <span>Giá niêm yết:</span>
          {money(c.listPrice)}
        </p>
        <p>
          <span>Discount:</span>
          <b>-{money(c.discount)}</b>
        </p>
        <p>
          <strong>Tổng thanh toán:</strong>
          <strong>{money(c.paymentAmount)}</strong>
        </p>
      </div>
      <div className="signature">
        <header>
          <span>CHỮ KÝ ĐIỆN TỬ</span>
          <b>✓ Đã ký OTP qua App</b>
        </header>
        <div>
          〰〰〰　<small>Sign-ID: 0x88F1...90A</small>
        </div>
      </div>
      <div className="qr">
        <b>▦</b>
        <span>
          <strong>Cổng Turnstile Tự Động</strong>
          <small>
            QR check-in sẽ tự kích hoạt ngay trên Mobile App hội viên sau khi
            duyệt.
          </small>
        </span>
      </div>
      {c.status === 'PENDING' && c.paymentStatus === 'PENDING' && c.paymentId ? (
        <button className="approve" disabled={confirming} onClick={onConfirm}>
          {confirming ? 'ĐANG XÁC NHẬN...' : '✓ XÁC NHẬN THANH TOÁN & KÍCH HOẠT'}
        </button>
      ) : c.status === 'ACTIVE' && c.paymentStatus === 'SUCCESS' ? (
        <button className="approve" disabled>✓ ĐÃ THANH TOÁN & KÍCH HOẠT</button>
      ) : !c.paymentId ? (
        <button className="approve" disabled>CHƯA CÓ YÊU CẦU THANH TOÁN</button>
      ) : (
        <button className="approve" disabled>THANH TOÁN {c.paymentStatus}</button>
      )}
      <div className="detail-actions">
        {c.status === 'ACTIVE' && c.paymentStatus === 'SUCCESS' && <button onClick={onRenew}>↻ GIA HẠN GÓI</button>}
        <button onClick={onPdf}>◉ FILE PDF KÝ SỐ</button>
        <button onClick={onReject}>⊗ TỪ CHỐI DUYỆT</button>
      </div>
    </aside>
  )
}
