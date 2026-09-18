import type { Member } from './MemberList'

type ActivityHistoryProps = {
    member: Member
    onBack: () => void
}

type Activity = {
    icon: string
    tone: string
    tag: string
    title: string
    time: string
    description: string
    detail?: string
}

const activities: Activity[] = [
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

const memberName = (member: Member) => member.name.replace('\n', ' ')

export default function ActivityHistory({
    member,
    onBack,
}: ActivityHistoryProps) {
    const name = memberName(member)

    return (
        <div className="activity-history-page">
            <header className="activity-history-heading">
                <div>
                    <p className="breadcrumb">
                        Vận hành chính <b>›</b> Danh sách hội viên <b>›</b> Hồ sơ {member.id}{' '}
                        <b>›</b> Lịch sử hoạt động
                    </p>
                    <h1>LỊCH SỬ HOẠT ĐỘNG: {name.toUpperCase()}</h1>
                    <p>
                        <span className="activity-member-avatar">{member.avatar}</span> ID:{' '}
                        {member.id} · Mọi hoạt động, giao dịch và sự kiện vận hành của hội viên.
                    </p>
                </div>
                <div className="activity-history-actions">
                    <button type="button" onClick={onBack}>
                        ← Quay lại hồ sơ
                    </button>
                    <button type="button">⇩ Xuất báo cáo (PDF)</button>
                    <button className="activity-live" type="button">
                        ⚡ Đồng bộ IoT Turnstile
                    </button>
                </div>
            </header>

            <section className="activity-summary">
                <article>
                    <span>TỔNG CHECK-IN NĂM 2024</span>
                    <strong>
                        184<small>LƯỢT</small>
                    </strong>
                    <p>Trung bình 4.2 buổi/tuần (Vượt 12% KPI cá nhân)</p>
                    <i>
                        <em />
                    </i>
                </article>
                <article>
                    <span>TỶ LỆ BUỔI PT 1-1</span>
                    <strong>
                        98%<small>CHUẨN XÁC</small>
                    </strong>
                    <p>Hoàn thành 24/25 buổi · 0 lần hủy không báo trước</p>
                    <i>
                        <em />
                    </i>
                </article>
                <article>
                    <span>CƠ SỞ TẬP CHÍNH</span>
                    <b className="summary-place">{member.club.split('\n')[0]}</b>
                    <p>Chiếm 72% tổng tần suất (132/184 lượt)</p>
                    <em>◉ Phụ: Crescent Elite Q.7 (28%)</em>
                </article>
                <article>
                    <span>GOLDEN TRAINING HOURS</span>
                    <strong className="summary-time">17:30 - 19:30</strong>
                    <p>Thời gian yêu thích tập luyện thứ Tư</p>
                    <em>Nhịp sinh học cao · Hypertrophy Peak</em>
                </article>
            </section>

            <section className="attendance-card">
                <header>
                    <h2>▥ Bản đồ nhiệt chuyên cần (Attendance Matrix 24 Tuần)</h2>
                    <span>
                        Ít hoạt động <i /><b />
                        <strong>Cường độ cao (2 ca/ngày)</strong>
                    </span>
                </header>
                <div className="attendance-grid">
                    {Array.from(
                        { length: 168 },
                        (_, index) => (
                            <i
                                className={
                                    index % 7 === 2 || index % 11 === 0
                                        ? 'hot'
                                        : index % 5 === 0
                                            ? 'warm'
                                            : ''
                                }
                                key={index}
                            />
                        ),
                    )}
                </div>
                <footer>
                    <span>Tháng 5</span>
                    <span>Tháng 6</span>
                    <span>Tháng 7</span>
                    <span>Tháng 8</span>
                    <span>Tháng 9</span>
                    <span>Tháng 10 (Hiện tại)</span>
                </footer>
            </section>

            <section className="activity-toolbar">
                <button className="active" type="button">
                    Tất cả hoạt động (All Logs)
                </button>
                <button type="button">Check-in Cổng Turnstile</button>
                <button type="button">Buổi tập PT 1-1</button>
                <button type="button">QA Pro Shop</button>
                <label>
                    ⌕ <input placeholder="Tìm theo HLV, cổng, đơn hàng..." />
                </label>
            </section>

            <section className="activity-stream">
                <div className="activity-stream-heading">
                    <b>● CHUỖI DÒNG THỜI GIAN CHI TIẾT (AUDIT TRAIL)</b>
                    <span>
                        Hiển thị {activities.length} sự kiện gần nhất · Khớp lệnh với máy chủ trung tâm
                    </span>
                </div>
                {activities.map((activity) => (
                    <article
                        className={`activity-event ${activity.tone}`}
                        key={activity.title}
                    >
                        <div className="activity-event-icon">{activity.icon}</div>
                        <div className="activity-event-content">
                            <header>
                                <span>{activity.tag}</span>
                                <h3>{activity.title}</h3>
                                <time>◷ {activity.time}</time>
                            </header>
                            <p>{activity.description}</p>
                            <footer>{activity.detail}</footer>
                        </div>
                    </article>
                ))}
                <button className="activity-load-more" type="button">
                    ⌄ Tải thêm 45 sự kiện trong 90 ngày trước
                </button>
            </section>
        </div>
    )
}