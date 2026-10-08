import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Modal } from '../components/AdminLayout'
import { Pagination } from '../components/MemberUi'
import { catalogRequest, searchText, type Product } from '../services/catalog'
import {
  exportCsv,
  formatDate,
  money,
  useMemberData,
  type Member,
} from '../services/members'
import { dateKey } from '../services/trainers'
import { confirmShopPayment } from '../services/admin-finance'
import {
  deliveryPayload,
  loadOrderDetail,
  loadOrders,
  nextStatuses,
  orderLabel,
  orderStatuses,
  validateTransition,
} from '../services/orders'

export default function ShopOrdersPage() {
  const { data, loading, error, reload } = useMemberData(loadOrders)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [notice, setNotice] = useState('')
  const members = data?.members || []
  const orders = data?.orders || []
  const customer = (id: number) =>
    members.find((m) => Number(m.HoiVienID) === Number(id))
  const invalidRange = !!from && !!to && from > to
  const filtered = orders
    .filter((o) => {
      const member = customer(o.HoiVienID)
      return (
        !invalidRange &&
        (!status || o.TrangThai === status) &&
        (!from || dateKey(o.NgayDat) >= from) &&
        (!to || dateKey(o.NgayDat) <= to) &&
        searchText(
          `${o.DonHangID} ${member?.HoTen || ''} ${member?.SoDienThoai || ''} ${o.DiaChiGiaoHang || ''}`
        ).includes(searchText(search))
      )
    })
    .sort((a, b) => b.DonHangID - a.DonHangID)
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 10))
  )
  return (
    <div className="catalog-page orders-api-page member-api-page">
      <header className="catalog-heading">
        <div>
          <p className="catalog-eyebrow">QA PRO SHOP / ĐƠN HÀNG</p>
          <h1>Quản lý đơn hàng & điều phối vận chuyển</h1>
          <p>Theo dõi đơn hàng, thông tin giao nhận và tiến độ xử lý.</p>
        </div>
        <div className="catalog-actions">
          <button disabled={loading} onClick={reload}>
            ↻ Làm mới
          </button>
          <button
            disabled={loading || !!error || !filtered.length}
            onClick={() =>
              exportCsv('don-hang.csv', [
                [
                  'Mã đơn',
                  'Hội viên',
                  'Điện thoại hội viên',
                  'Ngày đặt',
                  'Tổng tiền',
                  'Trạng thái',
                  'Địa chỉ',
                  'Ghi chú',
                ],
                ...filtered.map((o) => [
                  o.DonHangID,
                  customer(o.HoiVienID)?.HoTen || '',
                  customer(o.HoiVienID)?.SoDienThoai || '',
                  formatDate(o.NgayDat, true),
                  o.TongTien,
                  orderLabel(o.TrangThai),
                  o.DiaChiGiaoHang || '',
                  o.GhiChu || '',
                ]),
              ])
            }
          >
            ↓ Xuất CSV
          </button>
        </div>
      </header>
      {notice && (
        <p className="catalog-notice" role="status">
          {notice}
        </p>
      )}
      {loading && (
        <p className="catalog-state" role="status">
          Đang tải đơn hàng…
        </p>
      )}
      {error && (
        <div className="catalog-error" role="alert">
          <p>{error}</p>
          <button onClick={reload}>Thử lại</button>
        </div>
      )}
      {!loading && !error && data && (
        <>
          <section className="catalog-stats">
            {orderStatuses.map((s) => (
              <article key={s}>
                <span>{orderLabel(s)}</span>
                <strong>
                  {orders.filter((o) => o.TrangThai === s).length}
                </strong>
              </article>
            ))}
          </section>
          <section className="catalog-filters">
            <input
              aria-label="Tìm đơn hàng"
              placeholder="Mã đơn, tên hội viên, điện thoại, địa chỉ…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            <select
              aria-label="Trạng thái đơn"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {orderStatuses.map((s) => (
                <option key={s} value={s}>
                  {orderLabel(s)}
                </option>
              ))}
            </select>
            <label>
              Từ ngày
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value)
                  setPage(1)
                }}
              />
            </label>
            <label>
              Đến ngày
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value)
                  setPage(1)
                }}
              />
            </label>
            <button
              onClick={() => {
                setSearch('')
                setStatus('')
                setFrom('')
                setTo('')
                setPage(1)
              }}
            >
              Xóa bộ lọc
            </button>
          </section>
          {invalidRange && (
            <p className="catalog-error" role="alert">
              Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.
            </p>
          )}
          <section className="catalog-table-card">
            <div className="catalog-table-scroll">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th>Đơn hàng / Hội viên</th>
                    <th>Ngày đặt</th>
                    <th>Địa chỉ giao hàng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice((currentPage - 1) * 10, currentPage * 10)
                    .map((o) => (
                      <tr key={o.DonHangID}>
                        <td>
                          <strong>ĐH #{o.DonHangID}</strong>
                          <small className="orders-sub">
                            {customer(o.HoiVienID)?.HoTen ||
                              `Hội viên #${o.HoiVienID}`}
                          </small>
                          <small className="orders-sub">
                            {customer(o.HoiVienID)?.SoDienThoai ||
                              'Chưa có điện thoại'}
                          </small>
                        </td>
                        <td>{formatDate(o.NgayDat, true)}</td>
                        <td>{o.DiaChiGiaoHang || 'Chưa có địa chỉ'}</td>
                        <td>{money(Number(o.TongTien))}</td>
                        <td>
                          <OrderBadge status={o.TrangThai} />
                        </td>
                        <td>
                          <button onClick={() => setSelectedId(o.DonHangID)}>
                            Chi tiết →
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && (
              <p className="catalog-state">Không có đơn hàng phù hợp.</p>
            )}
            <Pagination
              page={currentPage}
              total={filtered.length}
              size={10}
              onChange={setPage}
            />
          </section>
        </>
      )}
      {selectedId !== null && (
        <OrderDetail
          key={selectedId}
          id={selectedId}
          products={data?.products || []}
          members={members}
          onClose={() => setSelectedId(null)}
          onSaved={() => {
            setNotice('Đã cập nhật đơn hàng.')
            reload()
          }}
        />
      )}
    </div>
  )
}

function OrderBadge({ status }: { status: string }) {
  return (
    <span className={`catalog-badge ${status.toLowerCase()}`}>
      {orderLabel(status)}
    </span>
  )
}
function OrderDetail({
  id,
  products,
  members,
  onClose,
  onSaved,
}: {
  id: number
  products: Product[]
  members: Member[]
  onClose: () => void
  onSaved: () => void
}) {
  const loader = useCallback(
    (signal: AbortSignal) => loadOrderDetail(id, signal),
    [id]
  )
  const { data, loading, error, reload } = useMemberData(loader)
  const [action, setAction] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [saveError, setSaveError] = useState('')
  const order = data?.order
  const checkout = data?.checkout
  const member = members.find(
    (m) => Number(m.HoiVienID) === Number(order?.HoiVienID)
  )
  const terminal =
    order?.TrangThai === 'COMPLETED' || order?.TrangThai === 'CANCELLED'
  async function confirmReceived() {
    if (!order || !checkout || lock.current || terminal || checkout.TrangThaiThanhToan !== 'PENDING') return
    if (!window.confirm(`Bạn đã nhận đủ ${money(Number(order.TongTien))} cho đơn #${id}? Chỉ xác nhận sau khi kiểm tra tiền thực nhận.`)) return
    lock.current = true
    setBusy(true)
    setSaveError('')
    try {
      await confirmShopPayment(id)
      reload()
      onSaved()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Không xác nhận được thu tiền. Tải lại để kiểm tra trạng thái trước khi thử lại.')
    } finally { lock.current = false; setBusy(false) }
  }
  async function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (!data || lock.current) return
    const form = event ? new FormData(event.currentTarget) : null
    lock.current = true
    setBusy(true)
    setSaveError('')
    try {
      const fresh = await loadOrderDetail(id, new AbortController().signal)
      if (form) {
        if (['COMPLETED', 'CANCELLED'].includes(fresh.order.TrangThai))
          throw new Error('Đơn đã kết thúc, không thể sửa thông tin giao hàng.')
        await catalogRequest(`donhang/${id}/delivery`, {
          method: 'PATCH',
          body: JSON.stringify(deliveryPayload(form)),
        })
      } else {
        if (!action) return
        validateTransition(
          fresh.order,
          action,
          fresh.checkoutState,
          fresh.checkout
        )
        await catalogRequest(`donhang/${id}/status`, {
          method: 'POST',
          body: JSON.stringify({ TrangThai: action }),
        })
      }
      setEditing(false)
      setAction(null)
      reload()
      onSaved()
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : 'Không thể cập nhật đơn hàng.'
      )
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return (
    <Modal
      title={`Chi tiết đơn hàng #${id}`}
      onClose={() => {
        if (!lock.current) onClose()
      }}
    >
      {loading && (
        <p className="catalog-state" role="status">
          Đang tải chi tiết…
        </p>
      )}
      {error && (
        <div className="catalog-error" role="alert">
          <p>{error}</p>
          <button onClick={reload}>Thử lại</button>
        </div>
      )}
      {!loading && data && order && (
        <div className="orders-detail">
          <div className="orders-detail-heading">
            <OrderBadge status={order.TrangThai} />
            <span>Đặt lúc {formatDate(order.NgayDat, true)}</span>
          </div>
          <section className="orders-info">
            <div>
              <h3>Hội viên</h3>
              <strong>{member?.HoTen || `Hội viên #${order.HoiVienID}`}</strong>
              <p>
                Điện thoại hội viên: {member?.SoDienThoai || 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <h3>Giao nhận</h3>
              {checkout && (
                <>
                  <strong>{checkout.TenNguoiNhan}</strong>
                  <p>{checkout.SoDienThoai}</p>
                  <p>
                    {checkout.CachNhan === 'DELIVERY'
                      ? 'Giao tận nơi'
                      : checkout.CachNhan === 'PICKUP'
                        ? 'Nhận tại quầy'
                        : checkout.CachNhan}
                  </p>
                </>
              )}
              <p>{order.DiaChiGiaoHang || 'Chưa có địa chỉ giao hàng'}</p>
            </div>
          </section>
          <h3>Sản phẩm trong đơn</h3>
          <div className="catalog-table-scroll">
            <table className="catalog-table orders-items">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SL</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.ChiTietDonHangID}>
                    <td>
                      {products.find(
                        (p) => Number(p.SanPhamID) === Number(item.SanPhamID)
                      )?.TenSanPham || `Sản phẩm #${item.SanPhamID}`}
                    </td>
                    <td>{item.SoLuong}</td>
                    <td>{money(Number(item.DonGia))}</td>
                    <td>{money(Number(item.ThanhTien))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.items.length && <p>Chưa có chi tiết sản phẩm.</p>}
          <div className="orders-totals">
            <span>Tổng tiền đơn hàng</span>
            <strong>{money(Number(order.TongTien))}</strong>
          </div>
          {checkout ? (
            <section className="orders-payment">
              <h3>Thanh toán</h3>
              <p>Phương thức: {checkout.PhuongThucThanhToan}</p>
              <p>
                Trạng thái:{' '}
                {{
                  SUCCESS: 'Thành công',
                  PENDING: 'Chờ thanh toán',
                  FAILED: 'Thất bại',
                  CANCELLED: 'Đã hủy',
                }[checkout.TrangThaiThanhToan] || checkout.TrangThaiThanhToan}
              </p>
              <p>Phí vận chuyển: {money(Number(checkout.PhiVanChuyen))}</p>
              {checkout.HoaDonID && <p>Hóa đơn #{checkout.HoaDonID}</p>}
            </section>
          ) : (
            <p className="catalog-notice">
              {data.checkoutState === 'unlinked'
                ? 'Đơn chưa có thông tin thanh toán checkout liên kết.'
                : 'Chưa tải được thông tin thanh toán checkout.'}{' '}
              {data.checkoutState === 'unavailable' && (
                <button onClick={reload}>Thử lại</button>
              )}
            </p>
          )}
          <h3>Ghi chú giao nhận</h3>
          <p className="orders-note">{order.GhiChu || 'Chưa có ghi chú.'}</p>
          {editing ? (
            <form className="catalog-form" onSubmit={save}>
              <fieldset disabled={busy}>
                <label className="catalog-full">
                  Địa chỉ giao hàng
                  <textarea
                    name="address"
                    rows={2}
                    maxLength={255}
                    defaultValue={order.DiaChiGiaoHang || ''}
                  />
                </label>
                <label className="catalog-full">
                  Ghi chú
                  <textarea
                    name="note"
                    rows={3}
                    maxLength={500}
                    defaultValue={order.GhiChu || ''}
                  />
                </label>
              </fieldset>
              <footer>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditing(false)}
                >
                  Hủy sửa
                </button>
                <button className="catalog-primary" disabled={busy}>
                  {busy ? 'Đang lưu…' : 'Lưu thông tin'}
                </button>
              </footer>
            </form>
          ) : (
            <div className="catalog-actions">
              {checkout?.TrangThaiThanhToan === 'PENDING' && !terminal && (
                <button className="catalog-primary" disabled={busy || !!action} onClick={() => void confirmReceived()}>
                  {busy ? 'Đang xử lý…' : 'Xác nhận đã thu tiền'}
                </button>
              )}
              <button
                disabled={terminal || busy || !!action}
                onClick={() => {
                  setEditing(true)
                  setSaveError('')
                }}
              >
                Sửa giao nhận
              </button>
              {nextStatuses(order.TrangThai).filter(s => !(s === 'CONFIRMED' && checkout?.TrangThaiThanhToan === 'PENDING')).map((s) => (
                <button
                  key={s}
                  disabled={
                    busy ||
                    data.checkoutState === 'unavailable' ||
                    !!action ||
                    (!!checkout &&
                      (s === 'CANCELLED'
                        ? checkout.TrangThaiThanhToan === 'SUCCESS'
                        : checkout.TrangThaiThanhToan !== 'SUCCESS'))
                  }
                  className={s === 'CANCELLED' ? 'catalog-danger' : ''}
                  onClick={() => {
                    setAction(s)
                    setSaveError('')
                  }}
                >
                  {s === 'CONFIRMED'
                    ? 'Xác nhận đơn'
                    : s === 'PROCESSING'
                      ? 'Bắt đầu xử lý'
                      : s === 'COMPLETED'
                        ? 'Hoàn tất đơn'
                        : 'Hủy đơn'}
                </button>
              ))}
            </div>
          )}
          {checkout?.TrangThaiThanhToan === 'PENDING' && !terminal && (
            <p className="orders-sub">
              Kiểm tra tiền thực nhận, sau đó bấm “Xác nhận đã thu tiền”. Hệ thống sẽ lập hóa đơn và xác nhận đơn.
            </p>
          )}
          {checkout?.TrangThaiThanhToan === 'SUCCESS' && !terminal && (
            <p className="orders-sub">
              Đơn đã thu tiền; việc hủy cần được xử lý cùng hoàn tiền.
            </p>
          )}
          {action && (
            <section className="orders-confirm">
              <p>
                Chuyển đơn #{id} sang “{orderLabel(action)}”?{' '}
                {action === 'COMPLETED' &&
                  'Chỉ xác nhận khi đã hoàn tất giao/nhận hàng.'}
                {action === 'CANCELLED' &&
                  'Thao tác này không tự hoàn tiền hoặc điều chỉnh tồn kho.'}
              </p>
              <div className="catalog-actions">
                <button disabled={busy} onClick={() => setAction(null)}>
                  Quay lại
                </button>
                <button
                  className="catalog-primary"
                  disabled={busy}
                  onClick={() => void save()}
                >
                  {busy ? 'Đang lưu…' : 'Xác nhận'}
                </button>
              </div>
            </section>
          )}
          {saveError && (
            <p className="catalog-error" role="alert">
              {saveError}
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}
