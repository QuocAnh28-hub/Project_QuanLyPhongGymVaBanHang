export const products = [
  ['Whey Isolate 100% Rule1 5lbs - Hương...', 'Hấp thu siêu nhanh, 25g protein', '1.450.000đ', '1.650.000đ', '5.0', '142', 'BEST-SELLER', 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=700&q=85'],
  ['Pre-Workout C4 Original Cellucor 30...', 'Bùng nổ sức mạnh tức thì', '650.000đ', '720.000đ', '4.9', '98', 'TĂNG NĂNG LƯỢNG', 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=700&q=85'],
  ['BCAA & EAA Xtend hương hội có bắp 30...', '7g BCAA, bù điện giải sâu', '590.000đ', '', '4.8', '76', '', 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=700&q=85'],
  ['Bình lắc shaker QA-Gym Pro 800ml thép', 'Giữ lạnh 24h, inox 304 cao cấp', '220.000đ', '', '5.0', '210', 'QA-GEAR', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&q=85'],
  ['Dây quấn cổ tay & đai lưng tập gym...', 'Da bò cao cấp, khóa thép đúc', '380.000đ', '450.000đ', '4.9', '85', 'CHỐNG CHẤN THƯƠNG', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&q=85'],
  ['Găng tay tập gym thoáng khí chống...', 'Đệm gel êm ái, thoát mồ hôi', '180.000đ', '', '4.8', '64', '', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&q=85'],
  ['Thanh Protein Bar yến mạch bổ dưỡng...', '20g Protein, không đường tinh luyện', '55.000đ', '', '5.0', '189', 'SNACK HEALTHY', 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=700&q=85'],
  ['Nước điện giải dừa tươi khoáng chất lon', 'Bù khoáng cấp tốc, mát lạnh', '35.000đ', '', '4.9', '310', '', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=700&q=85'],
] as const;

export type Product = (typeof products)[number];
