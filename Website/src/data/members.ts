export type Member = {
  id: string
  name: string
  phone: string
  tier: 'DIAMOND VIP' | 'CLASSIC SILVER' | 'PLATINUM PRO' | 'CLASSIC'
  packageName: string
  expiry: string
  club: string
  sessions: string
  coach: string
  checkIn: string
  status: string
  statusTone: 'active' | 'warning' | 'paused'
  avatar: string
}

export const statistics = [
  {
    label: 'TỔNG SỐ HỘI VIÊN',
    value: '25.840',
    note: '24.120 Active',
    icon: '♟',
    tone: 'lime',
  },
  {
    label: 'DIAMOND VIP CLUB',
    value: '3.420',
    note: 'Đóng góp 48% tổng doanh thu',
    icon: '◆',
    tone: 'gold',
  },
  {
    label: 'HẾT HẠN TRONG 7 NGÀY',
    value: '45',
    note: '18 cuộc gọi cần chốt hôm nay',
    icon: '♧',
    tone: 'red',
  },
  {
    label: 'HỘI VIÊN MỚI THÁNG NÀY',
    value: '382',
    note: '+14.2% so với cùng kỳ T9',
    icon: '♙',
    tone: 'aqua',
  },
]

export const members: Member[] = [
  {
    id: 'QA-84928',
    name: 'Alex Tran\n(Trần Minh Hoàng)',
    phone: '0903.118.990',
    tier: 'DIAMOND VIP',
    packageName: 'Diamond All-Access 12T',
    expiry: '24/10/2026\nCÒN 365+ NGÀY',
    club: 'Vincom Q.1\nCentral Flagship Club',
    sessions: '10 /24\nbuổi PT: Trần Hoàng Nam',
    coach: '15:41 hôm nay\nGate 02 - Cổng FaceID Q.1',
    checkIn: '15:41 hôm nay',
    status: 'Đang hoạt động',
    statusTone: 'active',
    avatar: 'AT',
  },
  {
    id: 'QA-77291',
    name: 'Nguyễn Thị\nMai',
    phone: '0918.442.109',
    tier: 'CLASSIC SILVER',
    packageName: 'Gói Classic Thường 8T',
    expiry: '05/11/2025\nHẾT HẠN SAU 12 NGÀY',
    club: 'Crescent Elite Q.7\nKhu Nam Sài Gòn',
    sessions: '4 buổi\nChưa đăng ký PT',
    coach: '15:39 hôm nay\nCổng xoay Q.7',
    checkIn: '15:39 hôm nay',
    status: 'Sắp hết hạn',
    statusTone: 'warning',
    avatar: 'NM',
  },
  {
    id: 'QA-93312',
    name: 'Đặng Quang\nHuy',
    phone: '0977.892.411',
    tier: 'PLATINUM PRO',
    packageName: 'Gói Platinum 12T Pro',
    expiry: '18/03/2026\nCÒN 142 NGÀY',
    club: 'Vincom Q.1\nCentral Toà 4',
    sessions: '18 /36\nbuổi PT: Lê Khắc Huy',
    coach: 'Hôm qua 18:30\nCổng Q.1 - Tầng 2',
    checkIn: 'Hôm qua 18:30',
    status: 'Đang hoạt động',
    statusTone: 'active',
    avatar: 'DH',
  },
  {
    id: 'QA-62914',
    name: 'Lê Vũ Phương\nThảo',
    phone: '0932.880.229',
    tier: 'DIAMOND VIP',
    packageName: 'Gói VIP Unlimited Life',
    expiry: '12/12/2025\nCÒN 45 NGÀY',
    club: 'Thảo Điền Hub\nPrivate Locker #12',
    sessions: '5 /12\nbuổi PT: Nguyễn Minh Thư',
    coach: '3 ngày trước\nStudio Yoga 1',
    checkIn: '3 ngày trước',
    status: 'Đang hoạt động',
    statusTone: 'active',
    avatar: 'LT',
  },
  {
    id: 'QA-45102',
    name: 'Võ Hoàng\nLong',
    phone: '0949.551.833',
    tier: 'CLASSIC',
    packageName: 'Gói Gym Off-Peak 3T',
    expiry: '20/10/2025\nQUÁ HẠN 4 NGÀY',
    club: 'Vincom Q.1\nCentral Giờ thấp điểm',
    sessions: '0 buổi\nKhông có PT',
    coach: '15:31 hôm nay\nHệ thống chặn tự động',
    checkIn: '15:31 hôm nay',
    status: 'Đã hết hạn',
    statusTone: 'paused',
    avatar: 'VL',
  },
  {
    id: 'QA-44218',
    name: 'Phạm Quỳnh\nNga',
    phone: '0983.190.552',
    tier: 'PLATINUM PRO',
    packageName: 'Gói Platinum Reformer',
    expiry: '15/11/2025\nCÒN 21 NGÀY',
    club: 'West Lake HM Hub\nHồ Tây Campus',
    sessions: '14 /20\nbuổi Tập cùng người yêu',
    coach: '12/10/2025\nStudio HN',
    checkIn: '12/10/2025',
    status: 'Đang bảo lưu',
    statusTone: 'paused',
    avatar: 'PN',
  },
]
