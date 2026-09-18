import type { Member } from './MemberList'

type MemberDetailProps = {
    member: Member
    onBack: () => void
    onActivityHistory: () => void
}

const detailLines = (value: string) => value.split('\n')

export default function MemberDetail({
    member,
    onBack,
    onActivityHistory,
}: MemberDetailProps) {
    const [packageName] = detailLines(member.packageName)
    const [expiryDate] = detailLines(member.expiry)
    const [clubName] = detailLines(member.club)
    const [sessionCount, coachName] = detailLines(member.sessions)
    const fullName = member.name.replace('\n', ' ')

    return (
        <div className="member-detail-page">
            <header className="member-detail-heading">
                <div>
                    <p className="breadcrumb">
                        VẬN HÀNH CHÍNH <b>›</b> DANH SÁCH HỘI VIÊN <b>›</b> {member.id}
                    </p>
                    <h1>HỒ SƠ HỘI VIÊN: {fullName.toUpperCase()}</h1>
                    <span>
                        Hồ sơ vận hành, hợp đồng và lịch tập được đồng bộ theo thời gian thực.
                    </span>
                </div>
                <div className="member-detail-actions">
                    <button type="button" onClick={onBack}>
                        ← Danh sách
                    </button>
                    <button
                        className="member-history-button"
                        type="button"
                        onClick={onActivityHistory}
                    >
                        ◷ Lịch sử hoạt động
                    </button>
                    <button type="button">✎ Chỉnh sửa</button>
                    <button type="button">⇧ Cấp lại QR / Thẻ</button>
                    <button type="button">♧ Khóa tạm thời</button>
                    <button className="member-detail-primary" type="button">
                        ⟳ Gia hạn / Nâng cấp gói
                    </button>
                </div>
            </header>

            <div className="member-detail-layout">
                <aside className="member-detail-sidebar">
                    <section className="member-id-card">
                        <div className="member-detail-avatar">{member.avatar}</div>
                        <span className={`member-status ${member.statusTone}`}>
                            {member.status}
                        </span>
                        <h2>{fullName}</h2>
                        <p>{member.id} · Thành viên từ 2024</p>
                        <dl>
                            <div>
                                <dt>Điện thoại</dt>
                                <dd>{member.phone}</dd>
                            </div>
                            <div>
                                <dt>CCCD / Passport</dt>
                                <dd>0790••••••84</dd>
                            </div>
                            <div>
                                <dt>Địa chỉ chính</dt>
                                <dd>Landmark 81, Bình Thạnh, TP.HCM</dd>
                            </div>
                        </dl>
                        <div className="member-mini-stats">
                            <span>
                                Chi tiêu CLB<strong>32.45M<small>VNĐ</small></strong>
                            </span>
                            <span>
                                QA-Points<strong>1.450<small>KHẢ DỤNG</small></strong>
                            </span>
                            <span>
                                Uy tín<strong>AAA<small>Tối ưu</small></strong>
                            </span>
                        </div>
                    </section>
                    <section className="member-detail-side-panel">
                        <h3>◉ Sinh trắc học</h3>
                        <div>
                            <b>3D Neural FaceID</b>
                            <span>Đã kích hoạt · 99.8%</span>
                        </div>
                        <div>
                            <b>QR động QA-App</b>
                            <span>Đã liên kết · Live</span>
                        </div>
                        <div>
                            <b>Vòng đeo RFID / Locker</b>
                            <span>Đã ghép đôi</span>
                        </div>
                        <div>
                            <b>Tủ Locker VIP Chi nhánh</b>
                            <strong>#L-204</strong>
                        </div>
                    </section>
                    <section className="member-detail-side-panel member-quick-stats">
                        <h3>THỐNG SỐ VẬN HÀNH NHANH</h3>
                        <p>
                            Lượt check-in trong tháng <b>18 / 30 ngày</b>
                        </p>
                        <p>
                            Số lần bảo lưu đang nắm <b>0 lần</b>
                        </p>
                        <p>
                            Vé mời khách VIP đã dùng <b>2 / 2 vé</b>
                        </p>
                    </section>
                </aside>

                <main className="member-detail-main">
                    <section className="member-contract-card">
                        <div className="detail-card-title">
                            <span>GÓI ĐĂNG KÍ HOẠT ĐỘNG</span>
                            <em>● Hợp đồng #HD-2024-9968</em>
                        </div>
                        <div className="contract-title-row">
                            <div>
                                <h2>{packageName.toUpperCase()}</h2>
                                <p>
                                    Thời hạn: 12 tháng | Quyền ra vào 4/4 chi nhánh & khu dịch vụ VIP
                                </p>
                            </div>
                            <strong>
                                26.600.000<small>Giá trị hợp đồng</small>
                            </strong>
                        </div>
                        <div className="contract-progress">
                            <span>
                                Ngày bắt đầu: <b>24/10/2024</b>
                            </span>
                            <b>Còn 365 ngày hiệu lực</b>
                            <span>
                                Kết thúc: <b>{expiryDate}</b>
                            </span>
                            <i>
                                <em />
                            </i>
                        </div>
                        <div className="contract-meta">
                            <span>
                                Cơ sở đăng ký: <b>{clubName}</b>
                            </span>
                            <span>
                                Trạng thái số dư: <b>Đầy đủ quyền lợi</b>
                            </span>
                        </div>
                    </section>

                    <section className="member-benefits">
                        <article>
                            <b>♨ Sauna & Jacuzzi</b>
                            <span>Không giới hạn</span>
                        </article>
                        <article>
                            <b>♙ Khăn bông cao cấp</b>
                            <span>Set 2 khăn/buổi</span>
                        </article>
                        <article>
                            <b>▣ Mineral & Shake</b>
                            <span>Giảm 15% quầy Bar</span>
                        </article>
                        <article>
                            <b>♧ Vé khách VIP</b>
                            <span>2 vé / tháng</span>
                        </article>
                    </section>

                    <section className="member-coach-card detail-panel">
                        <div className="detail-card-title">
                            <h2>⚒ Khóa Huấn Luyện Cá Nhân (PT 1-1)</h2>
                            <span>
                                Chương trình tối ưu hình thể Hypertrophy & Sức mạnh Biomechanics
                            </span>
                        </div>
                        <b className="detail-chip">GÓI CHUYÊN HÓA 24 BUỔI</b>
                        <div className="coach-grid">
                            <div>
                                <small>MASTER TRAINER</small>
                                <strong>Trần Hoàng Nam</strong>
                                <span>Chứng chỉ CSCS / NASM</span>
                            </div>
                            <div>
                                <small>Tiến độ buổi tập</small>
                                <strong className="accent-text">{sessionCount}</strong>
                                <span>{coachName}</span>
                            </div>
                            <div>
                                <small>Mục tiêu hiện tại</small>
                                <strong>Deadlift 120kg PR</strong>
                                <span className="accent-text">↗ Đã đạt 110kg tại buổi 12</span>
                            </div>
                        </div>
                    </section>

                    <section className="member-inbody-card detail-panel">
                        <div className="detail-card-title">
                            <h2>▣ Chỉ Số Thể Chất & InBody 770 Mới Nhất</h2>
                            <button type="button">Xem lịch sử 6 lần →</button>
                            <span>Đo lần gần nhất: 18/02/2025 (Cơ sở Đồng Khởi)</span>
                        </div>
                        <div className="inbody-metrics">
                            <strong>
                                74.5<small>kg<br />Cân nặng toàn phần</small>
                            </strong>
                            <strong>
                                36.2<small>kg<br />Khối lượng cơ</small>
                            </strong>
                            <strong>
                                13.8<small>%<br />Tỷ lệ mỡ (PBF)</small>
                            </strong>
                            <strong>
                                86<small>/100<br />Điểm InBody Overall</small>
                            </strong>
                        </div>
                        <div className="body-zone">
                            <span>Vùng nhịp tim an toàn tối ưu khi Cardio (Cardio Zone Meter)</span>
                            <b>Zone 3 - Aerobic (136 - 152 BPM)</b>
                            <i>
                                <em />
                                <em />
                                <em />
                                <em />
                                <em />
                            </i>
                        </div>
                    </section>

                    <section className="member-notes detail-panel">
                        <div className="detail-card-title">
                            <h2>▤ Nhật Ký Ghi Chú Của Quản Trị & Huấn Luyện Viên</h2>
                            <button type="button">＋ Thêm ghi chú</button>
                        </div>
                        <article>
                            <b>● Master Trainer Trần Hoàng Nam</b>
                            <small>Hôm qua, 17:45</small>
                            <p>
                                “Học viên chăm chỉ, lực cuối thiên trên rõ tốt về tháng đầu. Kỹ thuật squat chuyển động ổn, chuẩn bị tốt cho buổi bench press tuần tới.”
                            </p>
                        </article>
                        <article>
                            <b>● Lễ tân Cơ Vincom Đồng Khởi</b>
                            <small>14/02/2025, 09:12</small>
                            <p>
                                “Khách đã gia hạn khóa thẻ đeo định danh #L-204 đồng bộ với gói Diamond 12 tháng.”
                            </p>
                        </article>
                        <div className="note-input">
                            <input placeholder="Nhập ghi chú quản trị nội bộ nhanh..." />
                            <button type="button">▷ Lưu</button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}