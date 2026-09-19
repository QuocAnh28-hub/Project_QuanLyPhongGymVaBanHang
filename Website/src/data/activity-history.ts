type Activity = {
    icon: string
    tone: string
    tag: string
    title: string
    time: string
    description: string
    detail?: string
}

export const activities: Activity[] = [
    {
        icon: '▣',
        tone: 'green',
        tag: 'TURNSTILE #02',
        title: 'Check-in Hợp lệ qua Cổng 02 - Vincom Q.1',
        time: '24/10/2025 · 15:41:22',
        description:
            'Phương thức: Xác thực FaceID 3D Biometric AI. Độ trễ xử lý turnstile: 0.08 giây.',
        detail: 'Khớp mẫu sinh trắc 99.8% · IP Thiết bị: 192.168.10.42',
    },
    {
        icon: '⚒',
        tone: 'lime',
        tag: 'KỶ LỤC PR MỚI',
        title: 'Buổi tập PT 14: Lưng Xô & Deadlift Chuyên sâu',
        time: '23/10/2025 · 18:30 - 19:35 (65 phút)',
        description:
            'Huấn luyện viên phụ trách: Trần Hoàng Nam (Master PT). Hoàn thành giáo án 5 bài tập phức hợp.',
        detail: 'Deadlift 120kg × 3 reps tại hiệp cuối cùng.',
    },
    {
        icon: '▣',
        tone: 'aqua',
        tag: 'QA PRO SHOP #ORD-4491',
        title: 'Giao dịch mua thực phẩm bổ sung',
        time: '21/10/2025 · 19:10:05',
        description:
            'Mặt hàng: Rule 1 Whey Protein Isolate 5lbs (Hương Chocolate Fudge). Nhân viên quầy POS: Lê Thanh Trúc.',
        detail: '2.010.000 đ · Đã thanh toán qua QR Code.',
    },
    {
        icon: '♧',
        tone: 'yellow',
        tag: 'BUỔI 13 / 25',
        title: 'Hoàn thành Buổi tập PT 13: Ngực & Vai Trước',
        time: '19/10/2025 · 18:30 - 19:35 (65 phút)',
        description:
            'HLV: Trần Hoàng Nam. Bài tập trọng tâm: Barbell Incline Bench Press 80kg (4 sets), Cable Crossover.',
        detail: 'Trạng thái: Đủ giờ · Khấu trừ tự động: -1 buổi vào hợp đồng.',
    },
    {
        icon: '↻',
        tone: 'mint',
        tag: 'HỢP ĐỒNG MỚI',
        title: 'Gia hạn thành công Gói Diamond All-Access 12 Tháng',
        time: '12/10/2025 · 09:15:00',
        description:
            'Hợp đồng mới #QA-2025-8840. Thời hạn kích hoạt: 15/10/2025 đến 15/10/2026.',
        detail: '21.600.000 đ · Kênh giao dịch: VietQR Pro (NAPAS 24/7).',
    },
    {
        icon: '!',
        tone: 'red',
        tag: 'CẢNH BÁO AN NINH CỔNG',
        title: 'Cổng Turnstile báo thẻ chạm 2 lần liên tiếp (Double-Tap)',
        time: '05/10/2025 · 17:45:10',
        description:
            'Địa điểm: Crescent Elite Q.7 - Turnstile 01. Cơ chế bảo vệ Turnstile Security kích hoạt do khoảng cách giữa 2 lần quét.',
        detail:
            'Xử lý tại chỗ: Nhân viên lễ tân đã kiểm tra camera & hỗ trợ mở bypass thủ công.',
    },
]
