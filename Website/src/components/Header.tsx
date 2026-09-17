export default function Header() {
  return <header className="topbar">
    <label className="search"><span>⌕</span><input placeholder="Tìm hội viên, HĐ, HLV, dịch vụ..." /></label>
    <button className="club-select">⌖ &nbsp; HỆ THỐNG VẬN HÀNH 24/7 <b>⌄</b></button>
    <button className="icon-button" aria-label="Thông báo">♟<i /></button>
    <div className="user"><span>Trần Minh Hoàng<small>Head Operations / Master Admin</small></span><b>TH</b></div>
  </header>
}
