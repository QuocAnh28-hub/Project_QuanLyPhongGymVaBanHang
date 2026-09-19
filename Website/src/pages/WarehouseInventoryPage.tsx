import { useState, type FormEvent } from 'react'
import { Modal } from '../components/AdminLayout'
import { PageTop, Toast } from '../components/CommerceUi'
import {
  inventoryItems,
  expiryAlerts,
  type InventoryItem,
} from '../data/warehouse-inventory.mock'
const warehouses = [
  'Kho Tổng HQ',
  'Kho Crescent Q7',
  'Kho Thảo Điền',
  'Kho West Lake HN',
] as const
const fields = ['stockHQ', 'stockQ7', 'stockThaoDien', 'stockWestLake'] as const
export default function WarehouseInventoryPage() {
  const [items, setItems] = useState(inventoryItems),
    [warehouse, setWarehouse] = useState('Tất cả 4 Kho'),
    [search, setSearch] = useState(''),
    [category, setCategory] = useState('Tất cả'),
    [status, setStatus] = useState('Tất cả'),
    [modal, setModal] = useState<'transfer' | 'detail' | null>(null),
    [selected, setSelected] = useState<InventoryItem>(items[0]),
    [toast, setToast] = useState(''),
    [ignored, setIgnored] = useState<string[]>([]),
    [transfers, setTransfers] = useState([
      {
        id: 'TR-24018',
        source: 'Kho Tổng HQ',
        destination: 'Kho West Lake HN',
        progress: 65,
        carrier: 'Viettel Post',
        eta: '19/10/2025',
        status: 'Đang vận chuyển',
      },
    ])
  const notify = (s: string) => {
    setToast(s)
    setTimeout(() => setToast(''), 2500)
  }
  const filtered = items.filter(
    (i) =>
      (category === 'Tất cả' || i.category === category) &&
      (status === 'Tất cả' || i.status === status) &&
      (warehouse === 'Tất cả 4 Kho' ||
        i[
          fields[warehouses.indexOf(warehouse as (typeof warehouses)[number])]
        ] > 0) &&
      `${i.name} ${i.sku} ${i.brand}`
        .toLowerCase()
        .includes(search.toLowerCase())
  )
  const transfer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = new FormData(e.currentTarget),
      sku = String(d.get('sku')),
      source = String(d.get('source')),
      destination = String(d.get('destination')),
      quantity = Number(d.get('quantity')),
      a = warehouses.indexOf(source as (typeof warehouses)[number]),
      b = warehouses.indexOf(destination as (typeof warehouses)[number])
    if (a === b) {
      notify('Kho nguồn và kho đích phải khác nhau')
      return
    }
    const item = items.find((i) => i.sku === sku)!
    if (quantity > item[fields[a]]) {
      notify('Số lượng vượt tồn kho nguồn')
      return
    }
    const updated = {
      ...item,
      [fields[a]]: item[fields[a]] - quantity,
      [fields[b]]: item[fields[b]] + quantity,
    }
    setItems(items.map((i) => (i.sku === sku ? updated : i)))
    setSelected(updated)
    setTransfers([
      {
        id: `TR-${Date.now().toString().slice(-5)}`,
        source,
        destination,
        progress: 0,
        carrier: 'Nội bộ QA',
        eta: 'Chờ điều phối',
        status: 'Mới tạo',
      },
      ...transfers,
    ])
    setModal(null)
    notify('Đã tạo lệnh điều chuyển kho')
  }
  return (
    <div className="admin-page commerce-page">
      <PageTop
        trail="KHO VẬN PRO SHOP　›　BẢNG TỒN KHO & ĐIỀU CHUYỂN"
        title="QUẢN LÝ TỒN KHO TOÀN HỆ THỐNG"
        actions={
          <>
            <button onClick={() => notify('Đã mở kiểm kê định kỳ mock')}>
              Kiểm kê định kỳ
            </button>
            <button onClick={() => notify('Đã xuất báo cáo mock')}>
              Xuất Báo Cáo
            </button>
            <button className="primary" onClick={() => setModal('transfer')}>
              ＋ LỆNH ĐIỀU CHUYỂN KHO NỘI BỘ
            </button>
          </>
        }
        metrics={[
          ['TỔNG GIÁ TRỊ TỒN KHO', '845.200.000 đ', '4 chi nhánh active'],
          [
            'TỔNG MẶT HÀNG TỒN SẴN',
            String(items.filter((i) => i.total > 0).length),
            'SKU đang có hàng',
          ],
          [
            'CẢNH BÁO TỒN THẤP',
            String(
              items.filter(
                (i) => i.status === 'Low stock' || i.status === 'Stockout'
              ).length
            ),
            'Cần đặt hàng',
          ],
          [
            'TỒN CHẬM LUÂN CHUYỂN',
            String(items.filter((i) => i.status === 'Overstock').length),
            'SKU cần xử lý',
          ],
        ]}
      />
      <div className="commerce-filters">
        <div className="chips">
          {['Tất cả 4 Kho', ...warehouses].map((x) => (
            <button
              key={x}
              className={warehouse === x ? 'selected' : ''}
              onClick={() => setWarehouse(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="commerce-fields">
          <input
            placeholder="Tên sản phẩm, Barcode, SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {[
              'Tất cả',
              'Whey',
              'Pre-workout',
              'Vitamin/BCAA',
              'Phụ kiện',
              'Trang phục',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {['Tất cả', 'Tồn tối ưu', 'Low stock', 'Stockout', 'Overstock'].map(
              (x) => (
                <option key={x}>{x}</option>
              )
            )}
          </select>
        </div>
      </div>
      <section className="commerce-card">
        <h2>MA TRẬN CÂN BẰNG TỒN KHO 4 CHI NHÁNH</h2>
        <div className="commerce-table-wrap">
          <table className="commerce-table">
            <thead>
              <tr>
                {[
                  'SẢN PHẨM & SKU',
                  'PHÂN LOẠI / BRAND',
                  'KHO HQ',
                  'KHO Q7',
                  'KHO THẢO ĐIỀN',
                  'KHO TÂY HỒ',
                  'TỔNG TỒN',
                  'ĐỊNH MỨC MIN',
                  'TÌNH TRẠNG',
                  'THAO TÁC',
                ].map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.sku}>
                  <td>
                    <b>
                      {i.image} {i.name}
                    </b>
                    <small>{i.sku}</small>
                  </td>
                  <td>
                    {i.category}
                    <small>{i.brand}</small>
                  </td>
                  {fields.map((f) => (
                    <td key={f}>{i[f]}</td>
                  ))}
                  <td>
                    <b>{i.total}</b>
                  </td>
                  <td>{i.minimum}</td>
                  <td>
                    <span className="commerce-badge">{i.status}</span>
                  </td>
                  <td className="row-actions">
                    <button
                      onClick={() => {
                        setSelected(i)
                        setModal('transfer')
                      }}
                    >
                      Điều chuyển
                    </button>
                    <button
                      onClick={() => notify(`Đã tạo PO cho ${i.sku} mock`)}
                    >
                      Tạo PO
                    </button>
                    <button
                      onClick={() => {
                        setSelected(i)
                        setModal('detail')
                      }}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="empty">Không có sản phẩm phù hợp.</p>
          )}
        </div>
      </section>
      <div className="commerce-bottom">
        <section className="commerce-card">
          <h2>CẢNH BÁO HẠN DÙNG (EXPIRY)</h2>
          {expiryAlerts
            .filter((x) => !ignored.includes(x.batch))
            .map((x) => (
              <div className="commerce-line" key={x.batch}>
                <span>
                  <b>{x.product}</b>
                  <small>
                    Batch {x.batch} · HSD {x.expiry} · {x.quantity} SP ·{' '}
                    {x.location}
                  </small>
                </span>
                <button
                  onClick={() => notify(`Đã tạo voucher cho ${x.batch} mock`)}
                >
                  Tạo voucher
                </button>
                <button onClick={() => setIgnored([...ignored, x.batch])}>
                  Bỏ qua
                </button>
              </div>
            ))}
        </section>
        <section className="commerce-card">
          <h2>LỆNH CHUYỂN KHO ĐANG CHẠY</h2>
          {transfers.map((t) => (
            <div className="commerce-line" key={t.id}>
              <span>
                <b>{t.id}</b>
                <small>
                  {t.source} → {t.destination} · {t.carrier} · ETA {t.eta}
                </small>
              </span>
              <span>
                {t.progress}%<small>{t.status}</small>
              </span>
            </div>
          ))}
        </section>
      </div>
      {modal === 'detail' && (
        <Modal title="CHI TIẾT TỒN KHO" onClose={() => setModal(null)}>
          <h3>{selected.name}</h3>
          <p>
            {selected.sku} · {selected.category} · {selected.brand}
          </p>
          {warehouses.map((w, k) => (
            <p key={w}>
              {w}: {selected[fields[k]]}
            </p>
          ))}
          <p>
            Tổng tồn: {selected.total} · Định mức: {selected.minimum}
          </p>
          <footer className="modal-actions">
            <button onClick={() => setModal(null)}>Đóng</button>
          </footer>
        </Modal>
      )}
      {modal === 'transfer' && (
        <Modal
          title="LỆNH ĐIỀU CHUYỂN KHO NỘI BỘ"
          onClose={() => setModal(null)}
        >
          <form onSubmit={transfer}>
            <div className="form-grid">
              <label>
                Sản phẩm
                <select name="sku" defaultValue={selected.sku}>
                  {items.map((i) => (
                    <option value={i.sku} key={i.sku}>
                      {i.name} · {i.sku}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Kho nguồn
                <select name="source">
                  {warehouses.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Kho đích
                <select name="destination" defaultValue={warehouses[1]}>
                  {warehouses.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Số lượng
                <input name="quantity" type="number" min="1" required />
              </label>
              <label>
                Lý do
                <input name="reason" required />
              </label>
            </div>
            <footer className="modal-actions">
              <button type="button" onClick={() => setModal(null)}>
                Hủy
              </button>
              <button className="primary">Tạo lệnh</button>
            </footer>
          </form>
        </Modal>
      )}
      <Toast message={toast} />
    </div>
  )
}
