import { useState } from "react";

type MenuKey = "packages" | "checkin" | "trainers";
export type PageId = "dashboard" | "members" | "packages-list" | "package-registrations" | "checkin-live" | "checkin-history" | "checkin-qr" | "trainers-list" | "pt-sessions" | "trainer-roster" | "orders" | "revenue" | "equipment" | "settings";
type NavigationItem = { id: PageId; label: string; icon: string; menu?: MenuKey; children?: { id: PageId; label: string }[] };
type NavigationProps = { activePage: PageId; onNavigate: (page: PageId) => void; onLogout: () => void };

const packagePages: PageId[] = ["packages-list", "package-registrations"];
const checkinPages: PageId[] = ["checkin-live", "checkin-history", "checkin-qr"];
const trainerPages: PageId[] = ["trainers-list", "pt-sessions", "trainer-roster"];
const menuFor = (page: PageId): MenuKey | null => packagePages.includes(page) ? "packages" : checkinPages.includes(page) ? "checkin" : trainerPages.includes(page) ? "trainers" : null;

const navigation: { group: string; items: NavigationItem[] }[] = [
  { group: "VẬN HÀNH CHÍNH", items: [
    { id: "dashboard", label: "Dashboard Tổng quan", icon: "dashboard" },
    { id: "members", label: "Quản lý Hội viên & HĐ", icon: "group" },
    { id: "packages-list", label: "Quản lý Gói tập & Đăng ký", icon: "card_membership", menu: "packages", children: [{ id: "packages-list", label: "Danh sách gói tập" }, { id: "package-registrations", label: "Quản lý đăng ký gói tập" }] },
    { id: "checkin-live", label: "Cổng Check-in & Kiểm soát QR", icon: "qr_code_scanner", menu: "checkin", children: [{ id: "checkin-live", label: "Giám sát Check-in hôm nay" }, { id: "checkin-history", label: "Lịch sử Check-in" }, { id: "checkin-qr", label: "Quản lý mã QR" }] },
    { id: "trainers-list", label: "HLV & Lịch tập PT", icon: "fitness_center", menu: "trainers", children: [{ id: "trainers-list", label: "Quản lý Huấn luyện viên" }, { id: "pt-sessions", label: "Lịch thuê PT & Buổi tập 1-1" }, { id: "trainer-roster", label: "Lịch làm việc & Phân ca HLV" }] },
  ]},
  { group: "KINH DOANH & THƯƠNG MẠI", items: [
    { id: "orders", label: "Đơn hàng QA Pro Shop", icon: "shopping_bag" },
    { id: "revenue", label: "Doanh thu & Báo cáo VAT", icon: "receipt_long" },
  ]},
  { group: "HỆ THỐNG KỸ THUẬT", items: [
    { id: "equipment", label: "Thiết bị & Bảo trì CLB", icon: "build" },
    { id: "settings", label: "Phân quyền & Cài đặt", icon: "settings" },
  ]},
];

export default function Navigation({ activePage, onNavigate }: NavigationProps) {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(() => menuFor(activePage));
  const select = (item: NavigationItem) => {
    if (item.menu) setOpenMenu(current => current === item.menu ? null : item.menu!);
    else { setOpenMenu(null); onNavigate(item.id); }
  };
  const selectChild = (menu: MenuKey, page: PageId) => { setOpenMenu(menu); onNavigate(page); };

  return <aside className="sidebar">
    <div className="brand">
      <span className="brand-mark material-symbols-outlined">bolt</span>
      <div><b>QA-GYM</b><small>PERFORMANCE CLUB</small></div>
      <i>v4.2</i>
    </div>
    <nav aria-label="Điều hướng chính">{navigation.map(({ group, items }) => <section className="nav-group" key={group}>
      <p>{group}</p>{items.map(item => {
        const expanded = !!item.menu && openMenu === item.menu;
        const active = item.menu ? menuFor(activePage) === item.menu : item.id === activePage;
        return <div className="nav-entry" key={item.label}>
          <button className={`nav-item ${active ? "active" : ""}`} onClick={() => select(item)} aria-expanded={item.children ? expanded : undefined}>
            <span className="nav-icon material-symbols-outlined">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.children && <i className={`nav-chevron material-symbols-outlined ${expanded ? "open" : ""}`}>chevron_right</i>}
          </button>
          {item.children && <div className={`nav-submenu ${expanded ? "open" : ""}`}>{item.children.map(child =>
            <button className={activePage === child.id ? "active" : ""} onClick={() => selectChild(item.menu!, child.id)} key={child.id}>{child.label}</button>
          )}</div>}
        </div>;
      })}
    </section>)}</nav>
    <div className="sidebar-bottom">
      <div><span className="online-dot"/> <b>TELEMETRY CORE</b><strong>100%</strong></div>
      <small>Node SG-04 Active <span>0.12ms</span></small>
    </div>
  </aside>;
}
