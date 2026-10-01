import { Modal } from '../components/AdminLayout'
import { Pagination } from '../components/MemberUi'
import { formatDate, money } from '../services/members'
import { receiptLabel } from '../services/warehouse'
import {
  useWarehousePage,
  type WarehouseMode,
} from '../services/useWarehousePage'

export default function WarehousePages({ mode }: { mode: WarehouseMode }) {
  const {
    changeSearch,
    changeWarehouse,
    changeStatus,
    changeFrom,
    changeTo,
    resetFilters,
    stats,
    visibleStock,
    visibleReceipts,
    activeWarehouses,
    activeEmployees,
    draftTotal,
    productUnit,
    openCreate,
    openReceipt,
    removeLine,
    canUpdateReceipt,
    data,
    loading,
    error,
    reload,
    search,
    warehouse,
    status,
    from,
    to,
    setPage,
    create,
    action,
    setAction,
    draft,
    busy,
    saveError,
    notice,
    products,
    warehouses,
    warehouseName,
    productName,
    employeeName,
    invalidRange,
    total,
    currentPage,
    current,
    currentLines,
    addLine,
    changeLine,
    close,
    save,
    download,
  } = useWarehousePage(mode)
  return (
    <div className="catalog-page warehouse-api-page member-api-page">
      <header className="catalog-heading">
        <div>
          <p className="catalog-eyebrow">VẬN HÀNH / KHO HÀNG</p>
          <h1>
            {mode === 'inbound'
              ? 'Quản lý nhập kho'
              : mode === 'inventory'
                ? 'Tồn kho & tổng hợp nhập hàng'
                : 'Lịch sử kho'}
          </h1>
          <p>
            {mode === 'history'
              ? 'Tra cứu phiếu nhập đã ghi nhận và trạng thái hiện tại.'
              : 'Theo dõi kho, sản phẩm và phiếu nhập hàng.'}
          </p>
        </div>
        <div className="catalog-actions">
          <button disabled={loading} onClick={reload}>
            ↻ Làm mới
          </button>
          <button disabled={loading || !!error || !total} onClick={download}>
            ↓ Xuất CSV
          </button>
          {mode === 'inbound' && (
            <button
              className="catalog-primary"
              disabled={loading || !!error}
              onClick={openCreate}
            >
              ＋ Tạo phiếu nhập
            </button>
          )}
        </div>
      </header>
      {mode === 'inventory' && (
        <p className="catalog-notice">
          Tồn thực tế lấy trực tiếp từ TonKho; lượng và giá trị nhập được tổng hợp từ phiếu COMPLETED.
        </p>
      )}
      {mode === 'history' && (
        <p className="catalog-notice">
          Lịch sử hiện gồm các phiếu nhập và trạng thái hiện tại; chưa có nhật
          ký xuất kho, điều chuyển hoặc thời điểm từng lần đổi trạng thái.
        </p>
      )}
      {notice && (
        <p className="catalog-notice" role="status">
          {notice}
        </p>
      )}
      {loading && (
        <p className="catalog-state" role="status">
          Đang tải dữ liệu kho…
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
            {stats.map(([label, count]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{count}</strong>
              </article>
            ))}
          </section>
          <section className="catalog-filters">
            <input
              aria-label="Tìm kiếm kho"
              placeholder={
                mode === 'inventory'
                  ? 'Tên hoặc mã sản phẩm, tên kho…'
                  : 'Mã phiếu, kho, nhân viên, ghi chú…'
              }
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
            />
            <select
              aria-label="Kho"
              value={warehouse}
              onChange={(e) => changeWarehouse(e.target.value)}
            >
              <option value="">Tất cả kho</option>
              {warehouses.map((w) => (
                <option key={w.KhoID} value={w.KhoID}>
                  {w.TenKho}
                </option>
              ))}
            </select>
            {mode !== 'inventory' && (
              <>
                <select
                  aria-label="Trạng thái phiếu"
                  value={status}
                  onChange={(e) => changeStatus(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  {['PENDING', 'COMPLETED', 'CANCELLED'].map((s) => (
                    <option key={s} value={s}>
                      {receiptLabel(s)}
                    </option>
                  ))}
                </select>
                <label>
                  Từ ngày
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => changeFrom(e.target.value)}
                  />
                </label>
                <label>
                  Đến ngày
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => changeTo(e.target.value)}
                  />
                </label>
              </>
            )}
            <button onClick={resetFilters}>Xóa bộ lọc</button>
          </section>
          {invalidRange && (
            <p className="catalog-error" role="alert">
              Khoảng ngày không hợp lệ.
            </p>
          )}
          <section className="catalog-table-card">
            <div className="catalog-table-scroll">
              <table className="catalog-table">
                <thead>
                  <tr>
                    {(mode === 'inventory'
                      ? [
                          'Sản phẩm',
                          'Kho',
                          'Đơn vị',
                          'Lượng đã nhập',
                          'Giá trị nhập',
                          'Tồn thực tế',
                        ]
                      : [
                          'Phiếu / Ngày lập',
                          'Kho',
                          'Nhân viên',
                          'Tổng tiền',
                          'Trạng thái',
                          'Thao tác',
                        ]
                    ).map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mode === 'inventory'
                    ? visibleStock.map((r) => (
                        <tr key={`${r.KhoID}:${r.SanPhamID}`}>
                          <td>
                            <strong>{productName(r.SanPhamID)}</strong>
                            <small>SP #{r.SanPhamID}</small>
                          </td>
                          <td>{warehouseName(r.KhoID)}</td>
                          <td>{productUnit(r.SanPhamID)}</td>
                          <td>{r.quantity}</td>
                          <td>{money(r.value)}</td>
                          <td>{r.SoLuongTon}</td>
                        </tr>
                      ))
                    : visibleReceipts.map((r) => (
                        <tr key={r.PhieuNhapID}>
                          <td>
                            <strong>PN #{r.PhieuNhapID}</strong>
                            <small>{formatDate(r.NgayNhap, true)}</small>
                          </td>
                          <td>{warehouseName(r.KhoID)}</td>
                          <td>{employeeName(r.NhanVienID)}</td>
                          <td>{money(Number(r.TongTien))}</td>
                          <td>
                            <span
                              className={`catalog-badge ${r.TrangThai.toLowerCase()}`}
                            >
                              {receiptLabel(r.TrangThai)}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => openReceipt(r.PhieuNhapID)}>
                              Chi tiết →
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            {!total && (
              <p className="catalog-state">Không có dữ liệu phù hợp.</p>
            )}
            <Pagination
              page={currentPage}
              total={total}
              size={10}
              onChange={setPage}
            />
          </section>
        </>
      )}
      {current && !action && (
        <Modal title={`Phiếu nhập #${current.PhieuNhapID}`} onClose={close}>
          <div className="warehouse-detail">
            <p>
              {warehouseName(current.KhoID)} ·{' '}
              {employeeName(current.NhanVienID)}
            </p>
            <p>
              {formatDate(current.NgayNhap, true)} ·{' '}
              {receiptLabel(current.TrangThai)}
            </p>
            <div className="catalog-table-scroll">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLines.map((l) => (
                    <tr key={l.ChiTietPhieuNhapID}>
                      <td>{productName(l.SanPhamID)}</td>
                      <td>{l.SoLuong}</td>
                      <td>{money(Number(l.DonGia))}</td>
                      <td>{money(Number(l.ThanhTien))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!currentLines.length && <p>Phiếu chưa có dòng hàng.</p>}
            <h3>Tổng tiền: {money(Number(current.TongTien))}</h3>
            <p className="warehouse-note">
              {current.GhiChu || 'Chưa có ghi chú.'}
            </p>
            {canUpdateReceipt && (
              <div className="catalog-actions">
                <button
                  disabled={!currentLines.length}
                  className="catalog-primary"
                  onClick={() =>
                    setAction({ receipt: current, status: 'COMPLETED' })
                  }
                >
                  Xác nhận đã nhập kho
                </button>
                <button
                  disabled={!currentLines.length}
                  className="catalog-danger"
                  onClick={() =>
                    setAction({ receipt: current, status: 'CANCELLED' })
                  }
                >
                  Hủy phiếu
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
      {action && (
        <Modal title="Xác nhận phiếu nhập" onClose={close}>
          <p>
            Chuyển phiếu #{action.receipt.PhieuNhapID} sang “
            {receiptLabel(action.status)}”?{' '}
            {action.status === 'COMPLETED' &&
              'Chỉ xác nhận khi hàng đã được kiểm đếm và nhận đủ.'}
          </p>
          {saveError && (
            <p className="catalog-error" role="alert">
              {saveError}
            </p>
          )}
          <div className="catalog-actions">
            <button disabled={busy} onClick={() => setAction(null)}>
              Quay lại
            </button>
            <button
              disabled={busy}
              className="catalog-primary"
              onClick={() => void save()}
            >
              {busy ? 'Đang lưu…' : 'Xác nhận'}
            </button>
          </div>
        </Modal>
      )}
      {create && (
        <Modal title="Tạo phiếu nhập kho" onClose={close}>
          <form className="catalog-form" onSubmit={save}>
            <fieldset disabled={busy}>
              <label>
                Kho nhận *
                <select name="warehouse" required defaultValue="">
                  <option value="" disabled>
                    Chọn kho
                  </option>
                  {activeWarehouses.map((w) => (
                    <option key={w.KhoID} value={w.KhoID}>
                      {w.TenKho}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nhân viên nhận *
                <select name="employee" required defaultValue="">
                  <option value="" disabled>
                    Chọn nhân viên
                  </option>
                  {activeEmployees.map((e) => (
                    <option key={e.NhanVienID} value={e.NhanVienID}>
                      {e.HoTen}
                    </option>
                  ))}
                </select>
              </label>
              <div className="catalog-full warehouse-lines">
                {draft.map((l, i) => (
                  <div className="warehouse-draft-line" key={l.key}>
                    <label>
                      Sản phẩm {i + 1}
                      <select
                        required
                        value={l.product}
                        onChange={(e) =>
                          changeLine(l.key, 'product', e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Chọn sản phẩm
                        </option>
                        {products.map((p) => (
                          <option key={p.SanPhamID} value={p.SanPhamID}>
                            {p.TenSanPham}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Số lượng
                      <input
                        type="number"
                        required
                        min="1"
                        max="1000000"
                        step="1"
                        value={l.quantity}
                        onChange={(e) =>
                          changeLine(l.key, 'quantity', e.target.value)
                        }
                      />
                    </label>
                    <label>
                      Đơn giá (VNĐ)
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={l.price}
                        onChange={(e) =>
                          changeLine(l.key, 'price', e.target.value)
                        }
                      />
                    </label>
                    <button
                      type="button"
                      disabled={draft.length === 1}
                      onClick={() => removeLine(l.key)}
                    >
                      Xóa dòng
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={draft.length >= 100}
                  onClick={addLine}
                >
                  ＋ Thêm dòng hàng
                </button>
              </div>
              <label className="catalog-full">
                Ghi chú
                <textarea name="note" maxLength={500} rows={3} />
              </label>
            </fieldset>
            <p>
              Tổng dự kiến: <strong>{money(draftTotal)}</strong>
            </p>
            <p className="warehouse-help">
              Phiếu mới ở trạng thái chờ nhập. Xác nhận sau khi nhận và kiểm đếm
              hàng.
            </p>
            {saveError && (
              <p className="catalog-error" role="alert">
                {saveError}
              </p>
            )}
            <footer>
              <button type="button" disabled={busy} onClick={close}>
                Hủy
              </button>
              <button className="catalog-primary" disabled={busy}>
                {busy ? 'Đang lưu…' : 'Tạo phiếu nhập'}
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  )
}
