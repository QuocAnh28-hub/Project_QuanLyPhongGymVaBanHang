import { useMemo, useState, type FormEvent } from 'react'
import { MetricCard, Modal } from '../components/AdminLayout'
import { money } from '../data/admin-utils'
import {
  initialContracts,
  type Contract,
  type ContractStatus,
} from '../data/admin-contracts'

const statusFilters = [
  'Tất cả đơn',
  'Chờ thanh toán',
  'Chờ duyệt HĐ',
  'Đã kích hoạt',
  'Đã hủy / Hoàn tiền',
]
export default function RegistrationsPage() {
  const [contracts, setContracts] = useState(initialContracts)
  const [selected, setSelected] = useState(9922)
  const [ids, setIds] = useState<number[]>([9922])
  const [filter, setFilter] = useState('Tất cả đơn')
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('all')
  const [payment, setPayment] = useState('all')
  const [page, setPage] = useState(1)
  const [create, setCreate] = useState(false)
  const [reject, setReject] = useState(false)
  const [toast, setToast] = useState('')
  const notify = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(''), 2200)
  }
  const filtered = useMemo(
    () =>
      contracts.filter(
        (c) =>
          (filter === 'Tất cả đơn' || c.status === filter) &&
          (!search ||
            `${c.code} ${c.member} ${c.phone} ${c.coach}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (branch === 'all' || c.branch.includes(branch)) &&
          (payment === 'all' || c.payment.includes(payment))
      ),
    [contracts, filter, search, branch, payment]
  )
  const pageRows = filtered.slice((page - 1) * 5, page * 5),
    detail = contracts.find((c) => c.id === selected) || contracts[0]
  const update = (target: number[], status: ContractStatus) => {
    setContracts((x) =>
      x.map((c) => (target.includes(c.id) ? { ...c, status } : c))
    )
    notify(`Đã cập nhật ${target.length} hợp đồng`)
  }
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
          <span className="pending-badge">● 18 Đơn chờ duyệt</span>
        </div>
        <div className="heading-actions">
          <button onClick={() => notify('Chức năng sẽ kết nối backend sau')}>
            ◉ Xuất báo cáo hợp đồng
          </button>
          <button
            onClick={() =>
              ids.length
                ? update(ids, 'Đã kích hoạt')
                : notify('Hãy chọn hợp đồng cần duyệt')
            }
          >
            ✓ Duyệt nhanh hàng loạt ({ids.length})
          </button>
          <button className="primary" onClick={() => setCreate(true)}>
            ⊕ Tạo hợp đồng mới
          </button>
        </div>
      </header>
      <section className="metrics-grid">
        <MetricCard
          label="ĐĂNG KÝ MỚI HÔM NAY"
          value="28"
          note="↗ +14.8% · Tổng phát sinh 215.400.000đ"
        />
        <MetricCard
          label="ĐANG CHỜ DUYỆT / KÝ SỐ"
          value="18"
          note="Cần xác nhận · 146.900.000đ"
          tone="error"
        />
        <MetricCard
          label="ĐÃ KÍCH HOẠT"
          value="420"
          note="◎ 96.2% · 3.840.500.000đ"
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
                {s === 'Tất cả đơn' ? 438 : s === 'Chờ duyệt HĐ' ? 18 : 12}
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
            <option>MoMo</option>
            <option>VietQR</option>
            <option>VISA</option>
            <option>Tiền mặt</option>
          </select>
          <button>▣ Tháng này</button>
        </div>
      </section>
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
                    <td>{c.payment}</td>
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
                {Math.min(page * 5, filtered.length)} trên tổng số <b>438</b>{' '}
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
        <ContractDetail
          contract={detail}
          onApprove={() => update([detail.id], 'Đã kích hoạt')}
          onReject={() => setReject(true)}
          onPdf={() => notify('File PDF ký số sẽ kết nối backend sau')}
        />
      </div>
      <footer className="ops-footer">
        ● Hạ tầng NAPAS 24/7: <b>Bình thường (100% Khớp lệnh)</b>　 ● Dịch vụ
        chữ ký số VNPT CA: <b>Sẵn sàng</b>　 ● Đồng bộ cổng Turnstile:{' '}
        <b>4/4 Chi nhánh online</b>
      </footer>
      {create && (
        <ContractForm
          onClose={() => setCreate(false)}
          onSave={(c) => {
            setContracts([c, ...contracts])
            setCreate(false)
            setSelected(c.id)
            notify('Đã tạo hợp đồng mock')
          }}
        />
      )}
      {reject && (
        <Modal title="XÁC NHẬN TỪ CHỐI" onClose={() => setReject(false)}>
          <p>
            Bạn có chắc muốn từ chối {detail.code}? Thao tác chỉ cập nhật dữ
            liệu local.
          </p>
          <footer className="modal-actions">
            <button onClick={() => setReject(false)}>Hủy</button>
            <button
              className="danger"
              onClick={() => {
                update([detail.id], 'Đã từ chối')
                setReject(false)
              }}
            >
              Từ chối duyệt
            </button>
          </footer>
        </Modal>
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  )
}
const statusClass = (s: ContractStatus) =>
  s.includes('kích hoạt')
    ? 'ok'
    : s.includes('duyệt') || s.includes('ký')
      ? 'pending'
      : s.includes('từ chối') || s.includes('hủy')
        ? 'bad'
        : 'neutral'
function ContractDetail({
  contract: c,
  onApprove,
  onReject,
  onPdf,
}: {
  contract: Contract
  onApprove: () => void
  onReject: () => void
  onPdf: () => void
}) {
  return (
    <aside className="contract-detail">
      <header>
        <h2>♢ CHI TIẾT ĐƠN DUYỆT #{c.id}</h2>
        <span>{c.payment}</span>
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
          <strong>{money(c.value)}</strong>
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
      <button className="approve" onClick={onApprove}>
        ✓ DUYỆT HỢP ĐỒNG & KÍCH HOẠT THẺ
      </button>
      <div className="detail-actions">
        <button onClick={onPdf}>◉ FILE PDF KÝ SỐ</button>
        <button onClick={onReject}>⊗ TỪ CHỐI DUYỆT</button>
      </div>
    </aside>
  )
}
function ContractForm({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (c: Contract) => void
}) {
  const [member, setMember] = useState('')
  const [pkg, setPkg] = useState('Diamond All-Access 12T')
  const [branch, setBranch] = useState('QA-Gym Vincom Q.1')
  const [value, setValue] = useState(21600000)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const id = Date.now()
    onSave({
      id,
      code: `#QA-CTR-${String(id).slice(-4)}`,
      time: 'Vừa tạo',
      member,
      memberId: `HV-${String(id).slice(-5)}`,
      phone: '09**.***.***',
      age: 25,
      cccd: '079*****',
      packageName: pkg,
      coach: 'Chưa phân công',
      branch,
      value,
      listPrice: value,
      discount: 0,
      payment: 'VietQR',
      status: 'Chờ duyệt HĐ',
      term: '18/09/2026 → 18/09/2027',
      transaction: `LOCAL-${id}`,
    })
  }
  return (
    <Modal title="TẠO HỢP ĐỒNG MỚI" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Hội viên
            <input
              required
              value={member}
              onChange={(e) => setMember(e.target.value)}
            />
          </label>
          <label>
            Gói tập
            <select value={pkg} onChange={(e) => setPkg(e.target.value)}>
              <option>Diamond All-Access 12T</option>
              <option>Platinum Pro 06 Tháng</option>
              <option>Classic 3 Tháng</option>
            </select>
          </label>
          <label>
            Cơ sở
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option>QA-Gym Vincom Q.1</option>
              <option>Thảo Điền Hub</option>
              <option>Crescent Elite Q.7</option>
            </select>
          </label>
          <label>
            Ngày bắt đầu
            <input type="date" required />
          </label>
          <label>
            Ngày kết thúc
            <input type="date" required />
          </label>
          <label>
            Giá trị hợp đồng
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(+e.target.value)}
            />
          </label>
          <label>
            Phương thức thanh toán
            <select>
              <option>VietQR</option>
              <option>MoMo AutoPay</option>
              <option>Tiền mặt POS</option>
            </select>
          </label>
          <label>
            Trạng thái
            <select>
              <option>Chờ duyệt HĐ</option>
              <option>Chờ thanh toán</option>
            </select>
          </label>
        </div>
        <footer className="modal-actions">
          <button type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="primary">Tạo hợp đồng</button>
        </footer>
      </form>
    </Modal>
  )
}
