export type PaymentTransaction = {
  id: string
  timestamp: string
  memberName: string
  memberId: string
  service: string
  category: string
  amount: number
  vat: number
  gateway: string
  vatStatus: string
  status: string
  invoiceId: string
  companyTaxCode: string
  companyName?: string
  address?: string
}
export const paymentTransactions: PaymentTransaction[] = [
  {
    id: 'TXN-882104',
    timestamp: '18/10/2025 15:42',
    memberName: 'Nguyễn Hoàng Anh',
    memberId: 'QA-025840',
    service: 'Gói Diamond 12 tháng',
    category: 'Gói tập hội viên',
    amount: 18900000,
    vat: 1512000,
    gateway: 'VietQR',
    vatStatus: 'Đã phát hành',
    status: 'Thành công',
    invoiceId: 'QA-VAT-002184',
    companyTaxCode: '0312789421',
  },
  {
    id: 'TXN-882103',
    timestamp: '18/10/2025 14:18',
    memberName: 'Trần Minh Khoa',
    memberId: 'QA-019244',
    service: 'PT Elite 24 buổi',
    category: 'Thuê HLV PT',
    amount: 12960000,
    vat: 1036800,
    gateway: 'VNPay',
    vatStatus: 'Chờ xuất hóa đơn',
    status: 'Thành công',
    invoiceId: '—',
    companyTaxCode: '',
  },
  {
    id: 'TXN-882102',
    timestamp: '18/10/2025 12:05',
    memberName: 'Lê Phương Linh',
    memberId: 'QA-023411',
    service: 'Rule 1 Isolate 5lbs',
    category: 'Đơn hàng Pro Shop',
    amount: 2190000,
    vat: 175200,
    gateway: 'POS',
    vatStatus: 'Đã phát hành',
    status: 'Thành công',
    invoiceId: 'QA-VAT-002183',
    companyTaxCode: '',
  },
  {
    id: 'TXN-882101',
    timestamp: '17/10/2025 18:31',
    memberName: 'Phạm Đức Long',
    memberId: 'QA-017721',
    service: 'Gói Classic 6 tháng',
    category: 'Gói tập hội viên',
    amount: 6800000,
    vat: 544000,
    gateway: 'VietQR',
    vatStatus: 'Hoàn tiền',
    status: 'Đã hoàn tiền',
    invoiceId: 'QA-VAT-002182',
    companyTaxCode: '',
  },
]
