import type { ImageSourcePropType } from 'react-native';
import { diamondDurations } from '@/lib/package-logic';

export type PackageClass = { id: string; name: string; minutes: number; kcal: number; description: string; tag: string; image: ImageSourcePropType };
export const enrollmentGifts = [
  { id: 'duffle', quantity: 1, name: 'Túi trống thể thao QA-Gym Duffle Pro', detail: 'Trị giá 850.000₫ · Miễn phí', image: require('../../assets/packages/diamond/enrollment/duffle-pro.jpg') as ImageSourcePropType },
  { id: 'shaker', quantity: 1, name: 'Bình lắc Shaker Pro 800ml cách nhiệt', detail: 'Trị giá 320.000₫ · Miễn phí', image: require('../../assets/packages/diamond/enrollment/shaker-pro.jpg') as ImageSourcePropType },
  { id: 'pt-gift', quantity: 3, name: 'Buổi huấn luyện viên cá nhân 1-1 (PT)', detail: 'Đo InBody & xây dựng lộ trình tập', image: require('../../assets/packages/diamond/enrollment/pt-training.jpg') as ImageSourcePropType },
] as const;
export const homeClubs = [
  { id: 'q1-vincom', name: 'QA-Gym Center - Chi nhánh Quận 1' },
  { id: 'q7-platinum', name: 'QA-Gym Platinum - Chi nhánh Quận 7' },
  { id: 'cau-giay', name: 'QA-Gym Center - Cầu Giấy, Hà Nội' },
  { id: 'binh-thanh', name: 'QA-Gym Express - Bình Thạnh' },
] as const;
export const diamondPackage = {
  id: 'diamond-all-access',
  name: 'Diamond All-Access Pass',
  tier: 'QA-GYM ELITE CLUB',
  description: 'Trải nghiệm huấn luyện đỉnh cao không giới hạn tại toàn bộ không gian phòng tập hạng sang.',
  hero: require('../../assets/packages/diamond/diamond-club.jpg') as ImageSourcePropType,
  durations: diamondDurations,
  rating: 4.9,
  reviewCount: '850+ Hội viên',
  privileges: [
    { id: 'clubs', icon: 'infinite-outline', title: 'Tập luyện không giới hạn 24/7', badge: 'ALL CLUBS', description: 'Tự do check-in bất kỳ lúc nào tại toàn bộ 14 chi nhánh QA-Gym trên toàn quốc.', accent: 'lime' },
    { id: 'pt', icon: 'barbell-outline', title: '03 Buổi tập chuyên sâu 1-1', badge: 'Trị giá 1.500.000₫', description: 'Huấn luyện cá nhân hoá cùng HLV Pro Master định hướng giáo án tăng cơ - giảm mỡ.', accent: 'mint' },
    { id: 'inbody', icon: 'pulse-outline', title: 'Phân tích InBody 770 miễn phí', badge: 'Định kỳ tháng', description: 'Theo dõi tỷ lệ mỡ nội tạng, cơ nạc và khối lượng nước chuẩn y khoa qua hệ thống máy InBody 770 cao cấp.', accent: 'cyan' },
    { id: 'companion', icon: 'people-outline', title: 'Đi cùng 01 bạn đồng hành', badge: 'T7 & CN', description: 'Mang theo 01 người bạn cùng tập luyện và trải nghiệm toàn bộ tiện ích vào mỗi dịp cuối tuần.', accent: 'lime' },
    { id: 'sauna', icon: 'flame-outline', title: 'Tổ hợp Sauna Đá Muối Himalaya', badge: 'Không giới hạn', description: 'Phục hồi cơ bắp và thanh lọc độc tố với phòng xông khô đá muối Himalaya & xông ướt thảo dược tự nhiên.', accent: 'mint' },
    { id: 'daily', icon: 'cafe-outline', title: 'Nước Detox, Khăn tập & Smart Locker', badge: 'Free Daily', description: 'Cung cấp khăn cotton mềm kháng khuẩn, đồ uống detox ion kiềm và tủ locker thông minh bảo mật RFID.', accent: 'cyan' },
    { id: 'shop', icon: 'bag-handle-outline', title: 'Giảm 15% tại QA Pro Shop', badge: '-15% MỌI ĐƠN', description: 'Ưu đãi giảm giá độc quyền cho các dòng Whey Protein, Creatine, Pre-workout và phụ kiện nâng tạ cao cấp.', accent: 'lime' },
  ],
  classes: [
    { id: 'bodypump', name: 'BodyPump™', minutes: 55, kcal: 600, tag: 'Les Mills', description: 'Đốt cháy 600 calo với các bài nâng tạ nhịp điệu nhanh toàn thân.', image: require('../../assets/packages/diamond/classes/bodypump.jpg') },
    { id: 'rpm', name: 'RPM™ Cycling', minutes: 45, kcal: 680, tag: 'Cardio Peak', description: 'Đua xe đạp trong nhà theo nhịp điệu âm nhạc điện tử tràn đầy năng lượng.', image: require('../../assets/packages/diamond/classes/rpm-cycling.jpg') },
    { id: 'yoga', name: 'Power Yoga', minutes: 60, kcal: 350, tag: 'Mind & Body', description: 'Tăng cường độ dẻo dai cơ bắp, cân bằng và giảm stress hiệu quả.', image: require('../../assets/packages/diamond/classes/power-yoga.jpg') },
    { id: 'boxing', name: 'Boxing Kickfit', minutes: 50, kcal: 720, tag: 'Combat', description: 'Kỹ thuật đấm đá đối kháng kết hợp rèn luyện sức bền tốc độ cao.', image: require('../../assets/packages/diamond/classes/boxing-kickfit.jpg') },
    { id: 'zumba', name: 'Zumba Neon Beats', minutes: 50, kcal: 550, tag: 'Dance High', description: 'Bùng nổ cùng vũ đạo latin cuồng nhiệt dưới hệ thống âm thanh vòm club.', image: require('../../assets/packages/diamond/classes/zumba-neon.jpg') },
  ] as PackageClass[],
  reviews: [
    { id: 'nam', name: 'Trần Quốc Nam', detail: 'Hội viên Diamond • 14 tháng tập', avatar: require('../../assets/packages/diamond/reviews/quoc-nam.jpg') as ImageSourcePropType, quote: '"Gói Diamond cực kỳ đáng tiền! Cơ sở vật chất chuẩn quốc tế, phòng sauna đá muối sau mỗi buổi tập nặng giúp hồi phục cơ siêu nhanh. Mình thường dắt bạn đi tập cùng vào Chủ nhật rất vui."' },
    { id: 'my', name: 'Hoàng Thảo My', detail: 'Hội viên Diamond • 8 tháng tập', avatar: require('../../assets/packages/diamond/reviews/thao-my.jpg') as ImageSourcePropType, quote: '"3 buổi 1-1 với Pro Master chỉnh lại hoàn toàn form Deadlift và Squat cho mình. Lớp Yoga và RPM phòng studio âm thanh siêu đỉnh, không hề nhàm chán!"' },
  ],
  policies: [
    { id: 'pause', icon: 'pause-circle-outline', title: 'Bảo lưu thẻ tập tối đa 60 ngày', description: 'Thoải mái tạm ngưng khi bận công tác hoặc du lịch dài ngày mà không mất số ngày tập.' },
    { id: 'transfer', icon: 'swap-horizontal-outline', title: 'Chuyển nhượng hợp đồng dễ dàng', description: 'Hỗ trợ chuyển đổi chủ sở hữu gói tập nhanh gọn tại quầy lễ tân bất kỳ chi nhánh nào.' },
    { id: 'installment', icon: 'card-outline', title: 'Trả góp 0% lãi suất qua thẻ tín dụng', description: 'Kỳ hạn linh hoạt 3, 6, 9 hoặc 12 tháng liên kết cùng 25+ ngân hàng nội địa và quốc tế.' },
  ],
} as const;
