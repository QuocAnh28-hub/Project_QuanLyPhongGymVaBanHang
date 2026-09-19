import { activities } from '../data/activity-history'
import type { Member } from '../data/members'

type ActivityHistoryProps = {
    member: Member
    onBack: () => void
}

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