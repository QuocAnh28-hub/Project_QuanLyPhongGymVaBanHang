export default function Header() {
  return (
    <header className="topbar">
      <label className="search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="5.8" />
          <path d="m16 16 4.1 4.1" />
        </svg>
        <input placeholder="Tìm kiếm hội viên, HĐ, HLV, đơn hàng..." />
      </label>
      <div className="system-status">
        <i />
        HỆ THỐNG 24/7 - TOÀN CẢNH CLB
      </div>
      <button className="location-select" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 10c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
        <span>Tất cả 4 Cơ sở</span>
        <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 9 5 5 5-5" />
        </svg>
      </button>
      <button className="icon-button" type="button" aria-label="Thông báo">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        <i />
      </button>
      <div className="user">
        <span>
          Trần Minh Hoàng<small>Head Operations / Master Admin</small>
        </span>
        <b aria-label="Tài khoản">♙</b>
      </div>
    </header>
  )
}
