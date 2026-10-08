import { useEffect, useMemo, useState } from 'react'
import { PageTop } from '../components/CommerceUi'
import { money } from '../data/admin-utils'
import { getPayments, type Payment } from '../services/admin-finance'

const statuses = ['', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
  methods = ['', 'TIEN_MAT', 'CHUYEN_KHOAN', 'THE']
const methodLabels: Record<string, string> = { TIEN_MAT: 'Tiền mặt', CHUYEN_KHOAN: 'Chuyển khoản', THE: 'Thẻ' }
const statusLabels: Record<string, string> = { PENDING: 'Chờ thanh toán', SUCCESS: 'Thành công', FAILED: 'Thất bại', CANCELLED: 'Đã hủy' }
const typeLabels: Record<string, string> = { SHOP: 'Đơn hàng', PACKAGE: 'Gói tập', PT: 'Thuê PT', OTHER: 'Khác' }
export default function RevenueInvoicePage() {
  const [items, setItems] = useState<Payment[]>([]),
    [selected, setSelected] = useState<Payment>(),
    [search, setSearch] = useState(''),
    [status, setStatus] = useState(''),
    [method, setMethod] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [error, setError] = useState('')
  useEffect(() => {
    getPayments()
      .then((rows) => {
        setItems(rows)
        setSelected(rows[0])
      })
      .catch((e) => setError(e.message))
  }, [])
  const shown = useMemo(
    () =>
      items.filter(
        (x) =>
          (!status || x.TrangThai === status) &&
          (!method || x.PhuongThucThanhToan === method) &&
          (!from || x.NgayThanhToan.slice(0, 10) >= from) &&
          (!to || x.NgayThanhToan.slice(0, 10) <= to) &&
          `${x.ThanhToanID} ${x.HoaDonID || ''} ${x.HoiVien} ${x.NoiDung || ''}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [items, status, method, from, to, search]
  )
  return (
    <div className="admin-page commerce-page finance-admin-page">
      <PageTop
        trail="TÀI CHÍNH › THANH TOÁN & HÓA ĐƠN / BIÊN NHẬN"
        title="THANH TOÁN & HÓA ĐƠN / BIÊN NHẬN"
        actions={null}
        metrics={[
          [
            'DOANH THU ĐÃ THU',
            money(
              items
                .filter((x) => x.TrangThai === 'SUCCESS')
                .reduce((s, x) => s + Number(x.SoTien), 0)
            ),
            'Chỉ giao dịch SUCCESS',
          ],
          [
            'THÀNH CÔNG',
            String(items.filter((x) => x.TrangThai === 'SUCCESS').length),
            'Giao dịch',
          ],
          [
            'ĐANG CHỜ',
            String(items.filter((x) => x.TrangThai === 'PENDING').length),
            'Không tính doanh thu',
          ],
          [
            'BIÊN NHẬN',
            String(items.filter((x) => x.HoaDonID).length),
            'Hóa đơn trong hệ thống',
          ],
        ]}
      />
      <div className="commerce-filters finance-filters">
        <div className="commerce-fields">
          <input
            placeholder="Mã giao dịch, hóa đơn, hội viên, nội dung"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((x) => (
              <option key={x} value={x}>
                {x || 'Tất cả trạng thái'}
              </option>
            ))}
          </select>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            {methods.map((x) => (
              <option key={x} value={x}>
                {x || 'Tất cả phương thức'}
              </option>
            ))}
          </select>
          <label>
            Từ ngày
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            Đến ngày
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
      </div>
      {error && <p className="empty">{error}</p>}
      <div className="commerce-split finance-split">
        <section className="commerce-card">
          <header className="panel-heading">
            <div>
              <span>GIAO DỊCH</span>
              <h2>Danh sách thanh toán</h2>
            </div>
            <b>{shown.length} bản ghi</b>
          </header>
          <div className="commerce-table-wrap">
            <table className="commerce-table finance-table">
              <colgroup>
                {[13, 18, 29, 13, 14, 13].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}
              </colgroup>
              <thead>
                <tr>
                  <th>MÃ / NGÀY</th>
                  <th>HỘI VIÊN</th>
                  <th>NỘI DUNG / LOẠI</th>
                  <th className="numeric">SỐ TIỀN</th>
                  <th>PHƯƠNG THỨC</th>
                  <th>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((x) => (
                  <tr
                    key={x.ThanhToanID}
                    className={
                      selected?.ThanhToanID === x.ThanhToanID ? 'selected' : ''
                    }
                    onClick={() => setSelected(x)}
                    tabIndex={0}
                    aria-label={`Xem thanh toán TT-${x.ThanhToanID} của ${x.HoiVien}`}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelected(x)
                      }
                    }}
                  >
                    <td>
                      <b className="transaction-id">TT-{x.ThanhToanID}</b>
                      <small>
                        <span>{new Date(x.NgayThanhToan).toLocaleDateString('vi-VN')}</span>
                        <span className="finance-time">{new Date(x.NgayThanhToan).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </small>
                    </td>
                    <td>
                      <b>{x.HoiVien}</b>
                      <small>HV-{x.HoiVienID}</small>
                    </td>
                    <td>
                      <span className="finance-note" title={x.NoiDung || undefined}>{x.NoiDung || '—'}</span>
                      <small>{typeLabels[x.Loai] || x.Loai}</small>
                    </td>
                    <td className="numeric amount-cell">
                      {money(Number(x.SoTien))}
                    </td>
                    <td>
                      <span className="method-chip">
                        {methodLabels[x.PhuongThucThanhToan] || x.PhuongThucThanhToan}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge status-${x.TrangThai.toLowerCase()}`}
                      >
                        {statusLabels[x.TrangThai] || x.TrangThai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!shown.length && (
              <p className="empty">Không có giao dịch phù hợp.</p>
            )}
          </div>
        </section>
        <aside className="commerce-card commerce-detail payment-detail">
          <header className="panel-heading">
            <div>
              <span>THÔNG TIN</span>
              <h2>Chi tiết thanh toán</h2>
            </div>
          </header>
          {selected ? (
            <>
              <div className="payment-identity">
                <h3>TT-{selected.ThanhToanID}</h3>
                <span
                  className={`status-badge status-${selected.TrangThai.toLowerCase()}`}
                >
                  {statusLabels[selected.TrangThai] || selected.TrangThai}
                </span>
              </div>
              <strong className="detail-amount">
                {money(Number(selected.SoTien))}
              </strong>
              <dl>
                {[
                  ['Hội viên', selected.HoiVien],
                  ['Nội dung', selected.NoiDung || '—'],
                  ['Loại', typeLabels[selected.Loai] || selected.Loai],
                  ['Phương thức', methodLabels[selected.PhuongThucThanhToan] || selected.PhuongThucThanhToan],
                  [
                    'Ngày thanh toán',
                    new Date(selected.NgayThanhToan).toLocaleString('vi-VN'),
                  ],
                  [
                    'HoaDonID',
                    selected.HoaDonID ? `#${selected.HoaDonID}` : 'Chưa có',
                  ],
                ].map(([a, b]) => (
                  <div key={a}>
                    <dt>{a}</dt>
                    <dd className={a === 'HoaDonID' ? 'invoice-id' : ''}>
                      {b}
                    </dd>
                  </div>
                ))}
              </dl>
              <p>
                Hệ thống chưa có dữ liệu VAT, MST, XML hoặc chữ ký số. Không hỗ
                trợ hoàn tiền từ trang này.
              </p>
            </>
          ) : (
            <p>Chưa có dữ liệu.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
