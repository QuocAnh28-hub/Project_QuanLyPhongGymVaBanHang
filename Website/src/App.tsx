import { useEffect, useState, type ReactNode } from 'react'
import {
  clearSession,
  logout,
  restoreSession,
  type AdminSession,
} from './services/auth'
import Header from './components/Header'
import Navigation from './components/Navigation'
import Login from './pages/Login'
import MemberList from './pages/MemberList'
import MemberDetail from './pages/MemberDetail'
import ActivityHistory from './pages/ActivityHistory'
import Promotions from './pages/Promotions'
import Reports from './pages/Reports'
import Employees from './pages/Employees'
import PackagesPage from './pages/PackagesPage'
import RegistrationsPage from './pages/RegistrationsPage'
import CheckInLivePage from './pages/CheckInLivePage'
import CheckInHistoryPage from './pages/CheckInHistoryPage'
import CheckInQrPage from './pages/CheckInQrPage'
import CheckInScanPage from './pages/CheckInScanPage'
import TrainerPages from './pages/TrainerPages'
import CatalogPage from './pages/CatalogPage'
import ShopOrdersPage from './pages/ShopOrdersPage'
import MemberRequestsPage from './pages/MemberRequestsPage'
import WarehousePages from './pages/WarehousePages'
import RevenueInvoicePage from './pages/RevenueInvoicePage'
import DashboardPage from './pages/DashboardPage'
import type { Member } from './services/members'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showActivityHistory, setShowActivityHistory] = useState(false)
  const [moduleTab, setModuleTab] = useState(0)
  const [session, setSession] = useState<AdminSession | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  useEffect(() => {
    let active = true
    void restoreSession().then((value) => {
      if (active) {
        setSession(value)
        setCheckingSession(false)
      }
    })
    return () => {
      active = false
    }
  }, [])
  useEffect(() => {
    if (!session) return
    const timer = window.setTimeout(
      () => {
        clearSession()
        setSession(null)
      },
      Math.max(0, session.expiresAt - Date.now())
    )
    return () => window.clearTimeout(timer)
  }, [session])
  useEffect(() => {
    const expired = () => setSession(null)
    window.addEventListener('qa-admin-session-expired', expired)
    return () => window.removeEventListener('qa-admin-session-expired', expired)
  }, [])

  const moduleViews: Record<string, { tabs: string[]; pages: ReactNode[] }> = {
    'Gói tập': {
      tabs: ['Danh sách gói tập', 'Quản lý đăng ký', 'Xác minh HSSV', 'Bảo lưu'],
      pages: [
        <PackagesPage key="packages" />,
        <RegistrationsPage key="registrations" />,
        <MemberRequestsPage key="student" kind="student" />,
        <MemberRequestsPage key="freeze" kind="freeze" />,
      ],
    },
    'Check-In': {
      tabs: ['Giám sát', 'Lịch sử', 'Quản lý QR', 'Quét / Nhập mã'],
      pages: [
        <CheckInLivePage key="live" />,
        <CheckInHistoryPage key="history" />,
        <CheckInQrPage key="qr" />,
        <CheckInScanPage key="scan" onShowToday={() => setModuleTab(0)} />,
      ],
    },
    'Huấn luyện viên': {
      tabs: ['Danh sách HLV', 'Lịch PT', 'Phân ca'],
      pages: [
        <TrainerPages
          key="trainers"
          mode="trainers"
          onOpenRoster={() => setModuleTab(2)}
        />,
        <TrainerPages key="sessions" mode="bookings" />,
        <TrainerPages key="roster" mode="roster" />,
      ],
    },
    'Sản phẩm': { tabs: [], pages: [<CatalogPage key="products" products />] },
    'Danh mục': {
      tabs: [],
      pages: [<CatalogPage key="categories" products={false} />],
    },
    'Đơn hàng': { tabs: [], pages: [<ShopOrdersPage key="orders" />] },
    'Kho hàng': {
      tabs: ['Nhập kho', 'Tồn kho', 'Lịch sử kho'],
      pages: [
        <WarehousePages key="inbound" mode="inbound" />,
        <WarehousePages key="inventory" mode="inventory" />,
        <WarehousePages key="audit" mode="history" />,
      ],
    },
    'Hóa đơn': { tabs: [], pages: [<RevenueInvoicePage key="vat" />] },
  }
  const activeModule = moduleViews[activePage]

  if (checkingSession)
    return (
      <main className="admin-session-loading" role="status">
        Đang kiểm tra phiên đăng nhập…
      </main>
    )
  if (!session)
    return (
      <Login
        onLogin={(value) => {
          setActivePage('Dashboard')
          setModuleTab(0)
          setSelectedMember(null)
          setShowActivityHistory(false)
          setSession(value)
        }}
      />
    )

  return (
    <main className="app-shell">
      <Navigation
        activeItem={activePage}
        onNavigate={(item) => {
          setActivePage(item)
          setModuleTab(0)
          setSelectedMember(null)
          setShowActivityHistory(false)
        }}
        onLogout={() => {
          void logout(session.token)
          setSession(null)
        }}
      />
      <section className="workspace">
        <Header account={session.account} />
        {activePage === 'Nhân viên' ? (
          <Employees />
        ) : activePage === 'Báo cáo thống kê' ? (
          <Reports />
        ) : activePage === 'Khuyến mãi' ? (
          <Promotions />
        ) : activePage === 'Hội viên' ? (
          selectedMember ? (
            showActivityHistory ? (
              <ActivityHistory
                member={selectedMember}
                onBack={() => setShowActivityHistory(false)}
              />
            ) : (
              <MemberDetail
                member={selectedMember}
                onBack={() => setSelectedMember(null)}
                onActivityHistory={() => setShowActivityHistory(true)}
              />
            )
          ) : (
            <MemberList onSelectMember={setSelectedMember} />
          )
        ) : activeModule ? (
          <div className="module-content">
            {activeModule.tabs.length > 0 && (
              <nav className="module-tabs" aria-label={`Trang ${activePage}`}>
                {activeModule.tabs.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={moduleTab === index ? 'active' : ''}
                    onClick={() => setModuleTab(index)}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            )}
            {activeModule.pages[moduleTab]}
          </div>
        ) : (
          <DashboardPage
            onNavigate={(page, tab = 0) => {
              setActivePage(page)
              setModuleTab(tab)
              setSelectedMember(null)
              setShowActivityHistory(false)
            }}
          />
        )}
      </section>
    </main>
  )
}

export default App
