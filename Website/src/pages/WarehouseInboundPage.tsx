import { useState, type FormEvent } from 'react'
import { Modal } from '../components/AdminLayout'
import { PageTop, Toast } from '../components/CommerceUi'
import { money } from '../data/admin-utils'
import {
  inboundOrders,
  type InboundOrder,
} from '../data/warehouse-inbound.mock'
const statuses = [
  'Tất cả',
  'Chờ nhập kho',
  'Đang kiểm đếm',
  'Đã nhập kho hoàn tất',
  'Đã hủy / Trả hàng',
]
export default function WarehouseInboundPage() {
  const [orders, setOrders] = useState(inboundOrders),
    [selectedId, setSelectedId] = useState(inboundOrders[0].id),
    [status, setStatus] = useState('Tất cả'),
    [search, setSearch] = useState(''),
    [warehouse, setWarehouse] = useState('Tất cả'),
    [month, setMonth] = useState(''),
    [payment, setPayment] = useState('Tất cả'),
    [modal, setModal] = useState<'create' | 'confirm' | null>(null),
    [toast, setToast] = useState('')
  const notify = (s: string) => {
    setToast(s)
    setTimeout(() => setToast(''), 2500)
  }
  const selected = orders.find((x) => x.id === selectedId) ?? orders[0]
  const filtered = orders.filter(
    (x) =>
      (status === 'Tất cả' || x.status === status) &&
      (warehouse === 'Tất cả' || x.warehouse === warehouse) &&
      (payment === 'Tất cả' || x.paymentStatus === payment) &&
      (!month ||
        x.createdAt.slice(3, 10).split('/').reverse().join('-') === month) &&
      `${x.id} ${x.supplier} ${x.items.map((i) => i.sku).join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase())
  )
  const create = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = new FormData(e.currentTarget),
      quantity = Number(d.get('quantity')),
      price = Number(d.get('price')),
      vat = Number(d.get('vat')),
      item = {
        sku: String(d.get('sku')),
        name: String(d.get('product')),
        quantity,
        price,
        vat,
      }
    const order: InboundOrder = {
      id: String(d.get('id')),
      supplier: String(d.get('supplier')),
      warehouse: String(d.get('warehouse')),
      createdAt: new Date(
        String(d.get('date')) + 'T00:00:00'
      ).toLocaleDateString('vi-VN'),
      amount: Math.round(quantity * price * (1 + vat / 100)),
      paymentStatus: String(d.get('payment')),
      inspectionStatus: 'Chờ kiểm đếm',
      progress: 0,
      invoice: 'Chờ NCC',
      shippingRef: 'Chưa có',
      items: [item],
      status: 'Chờ nhập kho',
    }
    if (orders.some((x) => x.id === order.id)) {
      notify('Mã PO đã tồn tại')
      return
    }
    setOrders([order, ...orders])
    setSelectedId(order.id)
    setModal(null)
    notify('Đã tạo phiếu nhập kho')
  }
  const confirm = () => {
    setOrders(
      orders.map((x) =>
        x.id === selectedId
          ? {
              ...x,
              status: 'Đã nhập kho hoàn tất',
              inspectionStatus: 'Hoàn tất',
              progress: 100,
            }
          : x
      )
    )
    setModal(null)
    notify('Đã xác nhận nhập kho và cập nhật tồn mock')
  }
  return (
    <div className="admin-page commerce-page">
      <PageTop
        trail="KHO VẬN PRO SHOP　›　QUẢN LÝ NHẬP KHO"
        title="QUẢN LÝ NHẬP KHO & ĐỐI SOÁT NHÀ CUNG CẤP"
        actions={
          <>
            <button onClick={() => notify('Đã nhận file PO / Excel mock')}>
              Nhập file PO / Excel
            </button>
            <button className="primary" onClick={() => setModal('create')}>
              ＋ TẠO PHIẾU NHẬP KHO MỚI
            </button>
          </>
        }
        metrics={[
          [
            'TỔNG GIÁ TRỊ NHẬP THÁNG',
            money(orders.reduce((s, x) => s + x.amount, 0)),
            '18 đơn nhập',
          ],
          [
            'CHỜ KIỂM ĐẾM THỰC TẾ',
            String(
              orders.filter(
                (x) => x.progress < 100 && x.status !== 'Đã hủy / Trả hàng'
              ).length
            ),
            'Phiếu đang xử lý',
          ],
          ['CHỜ ĐỐI SOÁT HÓA ĐƠN NCC', '05', 'Phiếu chờ VAT'],
          ['TỶ LỆ KHỚP CHỨNG TỪ SLA', '99.2%', '+1.8% tháng trước'],
        ]}
      />
      <div className="commerce-filters">
        <div className="chips">
          {statuses.map((x) => (
            <button
              key={x}
              className={status === x ? 'selected' : ''}
              onClick={() => setStatus(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="commerce-fields">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã phiếu, nhà cung cấp, SKU"
          />
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
          >
            <option>Tất cả</option>
            {[...new Set(orders.map((x) => x.warehouse))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <input
            aria-label="Tháng"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <select value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option>Tất cả</option>
            {[...new Set(orders.map((x) => x.paymentStatus))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="commerce-split">
        <section className="commerce-card">
          <h2>DANH SÁCH LÔ HÀNG NHẬP</h2>
          <div className="commerce-table-wrap">
            <table className="commerce-table">
              <thead>
                <tr>
                  {[
                    'MÃ PO / NHÀ CUNG CẤP',
                    'KHO / THỜI GIAN',
                    'GIÁ TRỊ',
                    'KIỂM ĐẾM',
                    'THANH TOÁN',
                    'TRẠNG THÁI',
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((x) => (
                  <tr
                    key={x.id}
                    className={selectedId === x.id ? 'selected' : ''}
                    onClick={() => setSelectedId(x.id)}
                  >
                    <td>
                      <b>{x.id}</b>
                      <small>{x.supplier}</small>
                    </td>
                    <td>
                      {x.warehouse}
                      <small>{x.createdAt}</small>
                    </td>
                    <td>{money(x.amount)}</td>
                    <td>
                      <progress max="100" value={x.progress} />
                      <small>
                        {x.inspectionStatus} · {x.progress}%
                      </small>
                    </td>
                    <td>{x.paymentStatus}</td>
                    <td>
                      <span className="commerce-badge">{x.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <p className="empty">Không có phiếu phù hợp.</p>
            )}
          </div>
        </section>
        <aside className="commerce-card commerce-detail">
          <h2>PHIẾU ĐANG CHỌN</h2>
          <h3>{selected.id}</h3>
          <dl>
            {[
              ['Nhà cung cấp', selected.supplier],
              ['Vận đơn', selected.shippingRef],
              ['Người tạo phiếu', 'Trần Minh Hoàng'],
              ['Kho tiếp nhận', selected.warehouse],
              ['Hóa đơn VAT', selected.invoice],
            ].map(([a, b]) => (
              <div key={a}>
                <dt>{a}</dt>
                <dd>{b}</dd>
              </div>
            ))}
          </dl>
          <p>Tiến độ quét Barcode/QR</p>
          <progress max="100" value={selected.progress} />
          <b>{selected.progress}% đã kiểm đếm</b>
          <h4>DANH SÁCH SKU NHẬP KHO</h4>
          {selected.items.map((i) => (
            <div className="commerce-line" key={i.sku}>
              <span>
                {i.name}
                <small>
                  {i.sku} · {i.quantity} × {money(i.price)}
                </small>
              </span>
              <b>{money(i.quantity * i.price)}</b>
            </div>
          ))}
          <dl>
            <div>
              <dt>VAT</dt>
              <dd>{selected.items[0]?.vat ?? 8}%</dd>
            </div>
            <div>
              <dt>Tổng thanh toán</dt>
              <dd>{money(selected.amount)}</dd>
            </div>
            <div>
              <dt>Thủ kho xác nhận</dt>
              <dd>{selected.progress === 100 ? 'Đã xác nhận' : 'Chờ ký'}</dd>
            </div>
            <div>
              <dt>Kế toán kho duyệt</dt>
              <dd>{selected.progress === 100 ? 'Đã duyệt' : 'Chờ duyệt'}</dd>
            </div>
          </dl>
          <button
            className="primary full"
            disabled={
              selected.status === 'Đã nhập kho hoàn tất' ||
              selected.status === 'Đã hủy / Trả hàng'
            }
            onClick={() => setModal('confirm')}
          >
            XÁC NHẬN NHẬP KHO & CẬP NHẬT TỒN
          </button>
          <div className="commerce-actions">
            <button onClick={() => notify('Đã in phiếu nhập PDF mock')}>
              In phiếu nhập PDF
            </button>
            <button onClick={() => notify('Đã xuất biên bản NCC mock')}>
              Xuất biên bản NCC
            </button>
          </div>
        </aside>
      </div>
      {modal === 'confirm' && (
        <Modal title="XÁC NHẬN NHẬP KHO" onClose={() => setModal(null)}>
          <p>
            Xác nhận {selected.id} đã được kiểm đếm và nhập vào{' '}
            {selected.warehouse}?
          </p>
          <footer className="modal-actions">
            <button onClick={() => setModal(null)}>Hủy</button>
            <button className="primary" onClick={confirm}>
              Xác nhận
            </button>
          </footer>
        </Modal>
      )}
      {modal === 'create' && (
        <Modal title="TẠO PHIẾU NHẬP KHO MỚI" onClose={() => setModal(null)}>
          <form onSubmit={create}>
            <div className="form-grid">
              <label>
                Mã PO
                <input name="id" required />
              </label>
              <label>
                Nhà cung cấp
                <input name="supplier" required />
              </label>
              <label>
                Kho nhận
                <select name="warehouse">
                  {[
                    'Kho Tổng HQ',
                    'Kho Crescent Q7',
                    'Kho Thảo Điền',
                    'Kho West Lake HN',
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Ngày nhập
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </label>
              <label>
                Sản phẩm
                <input name="product" required />
              </label>
              <label>
                SKU
                <input name="sku" required />
              </label>
              <label>
                Số lượng
                <input name="quantity" type="number" min="1" required />
              </label>
              <label>
                Đơn giá
                <input name="price" type="number" min="1" required />
              </label>
              <label>
                VAT %
                <input
                  name="vat"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue="8"
                  required
                />
              </label>
              <label>
                Thanh toán
                <select name="payment">
                  <option>Chờ thanh toán</option>
                  <option>Đã thanh toán</option>
                </select>
              </label>
            </div>
            <footer className="modal-actions">
              <button type="button" onClick={() => setModal(null)}>
                Hủy
              </button>
              <button className="primary">Tạo phiếu</button>
            </footer>
          </form>
        </Modal>
      )}
      <Toast message={toast} />
    </div>
  )
}
