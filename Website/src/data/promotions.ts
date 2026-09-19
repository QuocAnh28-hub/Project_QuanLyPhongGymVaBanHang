export type Promotion = {
  id: string
  discount: string
  limit: string
  scope: string
  title: string
  period: string
  category: string
  revenue: string
  used: number
  total: number
  status: 'Đang hoạt động' | 'Sắp hết lượt'
  accent: string
}

export const promotions: Promotion[] = [
  {
    id: 'SUMMER-FIT-25',
    discount: '-25%',
    limit: 'MAX 1.5M',
    scope: 'Toàn chuỗi CLB',
    title: 'Flash Sale Hè Rực Lửa - Gói Diamond',
    period: '15/10 - 31/10/2025',
    category: 'Diamond / Platinum',
    revenue: '218.400.000 đ',
    used: 312,
    total: 500,
    status: 'Đang hoạt động',
    accent: 'lime',
  },
  {
    id: 'WHEY-ISOLATE-50K',
    discount: '-50K',
    limit: 'MIN 800K',
    scope: 'QA Pro Shop',
    title: 'Giảm 50K Nutrition & Supplements',
    period: '01/10 - 25/10/2025',
    category: 'Whey & Pre-workout',
    revenue: '142.000.000 đ',
    used: 284,
    total: 300,
    status: 'Sắp hết lượt',
    accent: 'mint',
  },
  {
    id: 'TRIAL-FREE-14D',
    discount: '14D',
    limit: 'TRẢI NGHIỆM',
    scope: 'QR Quầy Lễ tân',
    title: 'Tặng 14 ngày trải nghiệm Full club',
    period: '01/10 - 15/11/2025',
    category: 'Hội viên mới chưa kích hoạt',
    revenue: '410 lượt scan',
    used: 165,
    total: 200,
    status: 'Đang hoạt động',
    accent: 'blue',
  },
  {
    id: 'PT-BOOST-20',
    discount: '-20%',
    limit: 'COMBO PT',
    scope: 'HLV 1-1 + Shop',
    title: 'Giảm 20% khi mua gói PT 24 buổi',
    period: '10/10 - 10/11/2025',
    category: 'PT 1-1 Chuyên sâu',
    revenue: '122.200.000 đ',
    used: 81,
    total: 150,
    status: 'Đang hoạt động',
    accent: 'lime',
  },
]

export const tabs = [
  ['Tất cả', 18],
  ['Đang diễn ra', 4],
  ['Sắp bắt đầu', 3],
  ['Đã kết thúc', 9],
  ['Tạm dừng', 2],
] as const
