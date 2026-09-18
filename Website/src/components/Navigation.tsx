type NavigationItem = {
  label: string;
  icon: string;
};

type NavigationProps = {
  activeItem: string;
  onNavigate: (item: string) => void;
  onLogout: () => void;
};

const navigation: { group: string; items: NavigationItem[] }[] = [
  {
    group: "Vận hành chính",
    items: [
      { label: "Dashboard", icon: "▦" },
      { label: "Hội viên", icon: "♙" },
      { label: "Gói tập", icon: "◇" },
      { label: "Check-In", icon: "✓" },
      { label: "Huấn luyện viên", icon: "♟" },
    ],
  },
  {
    group: "Kinh doanh & thương mại",
    items: [
      { label: "Sản phẩm", icon: "▣" },
      { label: "Danh mục", icon: "☷" },
      { label: "Đơn hàng", icon: "▤" },
      { label: "Kho hàng", icon: "□" },
      { label: "Hóa đơn", icon: "▧" },
      { label: "Khuyến mãi", icon: "%" },
    ],
  },
  {
    group: "Hệ thống",
    items: [
      { label: "Báo cáo thống kê", icon: "◔" },
      { label: "Nhân viên", icon: "♙" },
    ],
  },
];

export default function Navigation({
  activeItem,
  onNavigate,
  onLogout,
}: NavigationProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">QA</span>
        <div>
          <b>QA-GYM</b>
          <small>PERFORMANCE CLUB</small>
        </div>
      </div>
      <nav aria-label="Điều hướng chính">
        {navigation.map(({ group, items }) => (
          <section className="nav-group" key={group}>
            <p>{group}</p>
            {items.map(({ label, icon }) => (
              <button
                key={label}
                className={`nav-item ${activeItem === label ? "active" : ""}`}
                onClick={() => onNavigate(label)}
              >
                <span className="nav-icon">{icon}</span>
                {label}
              </button>
            ))}
          </section>
        ))}
      </nav>
      <button className="logout-button" type="button" onClick={onLogout}>
        <span className="nav-icon">↪</span>
        Đăng xuất
      </button>
      <div className="sidebar-bottom">
        <span className="online-dot" />
        Hệ thống hoạt động tốt
      </div>
    </aside>
  );
}
