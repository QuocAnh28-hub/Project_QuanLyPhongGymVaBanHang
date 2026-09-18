type NavigationItem = {
  label: string;
  icon: string;
  children?: string[];
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
      {
        label: "Quản lý Gói tập & Đăng ký",
        icon: "◇",
        children: ["Danh sách gói tập", "Quản lý đăng ký gói tập"],
      },
      { label: "Check-In", icon: "⌗" },
      { label: "Huấn luyện viên", icon: "⚒" },
    ],
  },
  {
    group: "Kinh doanh & thương mại",
    items: [
      { label: "Sản phẩm", icon: "▣" },
      { label: "Danh mục", icon: "☷" },
      { label: "Đơn hàng", icon: "▤" },
      { label: "Kho hàng", icon: "□" },
      { label: "Hóa đơn", icon: "▥" },
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

export default function Navigation({ activeItem, onNavigate, onLogout }: NavigationProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">QA</span>
        <div><b>QA-GYM</b><small>PERFORMANCE CLUB</small></div>
      </div>
      <nav aria-label="Điều hướng chính">
        {navigation.map(({ group, items }) => (
          <section className="nav-group" key={group}>
            <p>{group}</p>
            {items.map(({ label, icon, children }) => (
              <div className="nav-entry" key={label}>
                <button
                  className={`nav-item ${activeItem === label || children?.includes(activeItem) ? "active" : ""}`}
                  onClick={() => onNavigate(children?.[0] ?? label)}
                >
                  <span className="nav-icon">{icon}</span>{label}
                </button>
                {children && (
                  <div className="nav-submenu">
                    {children.map(child => (
                      <button className={activeItem === child ? "active" : ""} onClick={() => onNavigate(child)} key={child}>
                        {child}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        ))}
      </nav>
      <button className="logout-button" type="button" onClick={onLogout}><span className="nav-icon">↪</span>Đăng xuất</button>
      <div className="sidebar-bottom"><span className="online-dot" />Hệ thống hoạt động tốt</div>
    </aside>
  );
}
