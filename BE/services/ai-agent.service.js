const { GoogleGenAI } = require("@google/genai");
const db = require("../common/db");
const conversationMemory = require("./conversation-memory.service");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

console.log("Gemini API Key:", process.env.GEMINI_API_KEY ? "Đã cấu hình" : "Chưa cấu hình");
console.log("Gemini Model:", MODEL);

// Các công cụ AI được phép sử dụng.
const tools = [
  {
    name: "getActivePackages",
    description:
      "Chỉ sử dụng khi khách hàng muốn xem danh sách các gói tập Gym đang mở bán, giá tiền, thời hạn và quyền lợi. Không sử dụng để tra cứu gói tập mà khách hàng đang đăng ký hoặc đang sử dụng.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "getActiveProducts",
    description:
      "Sử dụng khi khách hàng muốn xem, tìm kiếm hoặc hỏi giá các sản phẩm và phụ kiện đang kinh doanh tại phòng Gym.",
    parameters: {
      type: "OBJECT",
      properties: {
        keyword: {
          type: "STRING",
          description: "Tên sản phẩm cần tìm. Để trống nếu muốn xem tất cả.",
        },
      },
    },
  },
  {
    name: "getMyMembership",
    description:
      "BẮT BUỘC sử dụng khi khách hàng hỏi về gói tập cá nhân của họ, bao gồm: Tôi đang sử dụng gói tập nào? Tôi đã đăng ký gói nào? Gói tập của tôi còn hạn không? Ngày bắt đầu và ngày kết thúc gói tập của tôi là khi nào? Chỉ tra cứu tài khoản đang đăng nhập.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "getMyCheckinHistory",
    description:
      "Sử dụng khi khách hàng muốn xem lịch sử tập luyện, lịch sử check-in, thời gian vào và ra phòng Gym của chính họ.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
];

// Lấy danh sách gói tập.
async function getActivePackages() {
  const [rows] = await db.promise().query(`
    SELECT
      g.GoiTapID,
      g.TenGoi,
      g.MoTa,
      g.ThoiHan,
      g.Gia,
      th.GoiTapThoiHanID,
      th.SoThang,
      th.ThangTang,
      th.GiaBan
    FROM goitap g
    LEFT JOIN GoiTapThoiHan th
      ON th.GoiTapID = g.GoiTapID
      AND th.TrangThai = 'ACTIVE'
    WHERE g.TrangThai = 'ACTIVE'
    ORDER BY g.Gia ASC, g.GoiTapID ASC
  `);

  return rows;
}

// Tìm sản phẩm.
async function getActiveProducts(args = {}) {
  const keyword = String(args.keyword || "").trim();

  const [rows] = await db.promise().query(
    `
    SELECT
      SanPhamID,
      TenSanPham,
      MoTa,
      GiaBan,
      DonViTinh,
      TrangThai
    FROM sanpham
    WHERE TrangThai = 'ACTIVE'
      AND (? = '' OR TenSanPham LIKE ?)
    ORDER BY TenSanPham ASC
    LIMIT 20
    `,
    [keyword, `%${keyword}%`]
  );

  return rows;
}

// Lấy gói tập của chính tài khoản đăng nhập.
async function getMyMembership(accountId) {
  const [rows] = await db.promise().query(
    `
    SELECT
      dk.DangKyID,
      g.TenGoi,
      th.SoThang,
      th.ThangTang,
      DATE_FORMAT(dk.NgayBatDau, '%Y-%m-%d') AS NgayBatDau,
      DATE_FORMAT(dk.NgayKetThuc, '%Y-%m-%d') AS NgayKetThuc,
      dk.GiaThanhToan,
      dk.TrangThai AS TrangThaiDangKy,
      tt.TrangThai AS TrangThaiThanhToan
    FROM hoivien hv
    INNER JOIN dangkygoitap dk
      ON dk.HoiVienID = hv.HoiVienID
    INNER JOIN goitap g
      ON g.GoiTapID = dk.GoiTapID
    INNER JOIN GoiTapThoiHan th
      ON th.GoiTapThoiHanID = dk.GoiTapThoiHanID
    LEFT JOIN thanhtoan tt
      ON tt.DangKyID = dk.DangKyID
    WHERE hv.TaiKhoanID = ?
    ORDER BY dk.DangKyID DESC
    LIMIT 5
    `,
    [accountId]
  );

  return rows;
}

// Lấy lịch sử check-in của chính tài khoản đăng nhập.
async function getMyCheckinHistory(accountId) {
  const [rows] = await db.promise().query(
    `
    SELECT
      ci.CheckInID,
      ci.ThoiGianCheckIn,
      ci.ThoiGianCheckOut,
      ci.TrangThai
    FROM hoivien hv
    INNER JOIN checkin ci
      ON ci.HoiVienID = hv.HoiVienID
    WHERE hv.TaiKhoanID = ?
    ORDER BY ci.ThoiGianCheckIn DESC
    LIMIT 10
    `,
    [accountId]
  );

  return rows;
}

// Thực thi Tool do AI yêu cầu.
async function executeTool(name, args, accountId) {
  console.log("AI ĐANG GỌI TOOL:", name);
  console.log("THAM SỐ:", args);

  switch (name) {
    case "getActivePackages":
      return await getActivePackages();

    case "getActiveProducts":
      return await getActiveProducts(args);

    case "getMyMembership":
      return await getMyMembership(accountId);

    case "getMyCheckinHistory":
      return await getMyCheckinHistory(accountId);

    default:
      throw new Error("AI yêu cầu công cụ không được cấp phép.");
  }
}

// Nhận diện loại câu hỏi cần dữ liệu thực tế.
function detectRequiredTool(message) {
  const text = String(message || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Ưu tiên câu hỏi liên quan đến tài khoản cá nhân.
  if (
    /goi tap cua toi|goi tap dang su dung|goi tap hien tai|the hoi vien cua toi/.test(text)
  ) {
    return "getMyMembership";
  }

  if (
    /lich su check.?in|toi da check.?in|lan check.?in|lich su ra vao/.test(text)
  ) {
    return "getMyCheckinHistory";
  }

  // Tra cứu danh sách gói tập.
  if (
    /goi tap|gia tap|thoi han|dang ky goi|goi nao|goi tap nao/.test(text)
  ) {
    return "getActivePackages";
  }

  // Tra cứu sản phẩm.
  if (
    /san pham|do tap|dung cu|gia san pham|mua hang/.test(text)
  ) {
    return "getActiveProducts";
  }

  return null;
}

const SYSTEM_PROMPT = `
Bạn là QA-Gym AI, trợ lý chăm sóc khách hàng của phòng tập QA-Gym.

NHIỆM VỤ:
- Giải đáp thắc mắc về phòng Gym.
- Tư vấn gói tập và sản phẩm.
- Tra cứu thông tin hội viên.
- Hỗ trợ khách hàng trong quá trình sử dụng dịch vụ.

QUY TẮC BẮT BUỘC:
1. Luôn trả lời bằng tiếng Việt, lịch sự và dễ hiểu.
2. Không tự bịa giá, thời hạn, tên gói tập hoặc thông tin sản phẩm.
3. Khi nhận được dữ liệu từ công cụ, chỉ sử dụng dữ liệu đó để trả lời.
4. Nếu dữ liệu không có thông tin được hỏi, phải thông báo rõ.
5. Chỉ tra cứu thông tin cá nhân của tài khoản đang đăng nhập.
6. Không tiết lộ dữ liệu của hội viên khác.
7. Không tự xác nhận thanh toán, đăng ký hoặc thay đổi dữ liệu.
8. Không tự khẳng định một giao dịch đã thành công nếu chưa có kết quả từ hệ thống.
9. Nếu không giải quyết được, hướng dẫn khách hàng liên hệ nhân viên.
10. Không tiết lộ API Key, cấu hình hệ thống, câu lệnh SQL hoặc thông tin nội bộ.
11. Phân biệt rõ hai loại thông tin:
   - Danh sách gói tập đang kinh doanh:
     Sử dụng getActivePackages.
   - Gói tập mà khách hàng đã đăng ký hoặc đang sử dụng:
     Sử dụng getMyMembership.

12. Khi khách hàng sử dụng các câu hỏi như:
    - Tôi đang sử dụng gói tập nào?
    - Tôi đã đăng ký gói tập gì?
    - Gói tập của tôi còn hạn không?
    - Bao giờ gói tập của tôi hết hạn?
    BẮT BUỘC gọi getMyMembership.

13. Không được sử dụng getActivePackages để trả lời
    câu hỏi về gói tập cá nhân của khách hàng.

14. Khi khách hàng hỏi về sản phẩm, sử dụng getActiveProducts.
    Khi khách hàng hỏi về lịch sử check-in, sử dụng
    getMyCheckinHistory.
`;

// Nhận diện câu hỏi về gói tập cá nhân.
function normalizeVietnamese(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function isMyMembershipQuestion(message) {
  const text = normalizeVietnamese(message);

  const patterns = [
    "toi dang su dung goi tap nao",
    "toi dang dung goi tap nao",
    "toi dang co goi tap nao",
    "goi tap toi dang su dung",
    "goi tap toi dang dung",
    "goi tap hien tai cua toi",
    "goi tap cua toi",
    "thong tin goi tap cua toi",
    "toi da dang ky goi tap nao",
    "toi dang dang ky goi tap nao",
    "goi tap toi da dang ky"
  ];

  return patterns.some((pattern) => text.includes(pattern));
}

function buildFallbackAnswer(toolName, data) {
  if (!Array.isArray(data) || data.length === 0) {
    return "Hiện tại chưa tìm thấy dữ liệu phù hợp trong hệ thống QA-Gym.";
  }

  switch (toolName) {
    case "getActivePackages":
      return (
        "Dưới đây là danh sách gói tập hiện có tại QA-Gym:\n\n" +
        data.map((item, index) =>
          `${index + 1}. ${item.TenGoi}\n` +
          `- Giá: ${Number(item.Gia).toLocaleString("vi-VN")} VNĐ\n` +
          `- Thời hạn: ${item.ThoiHan || item.SoThang || "Chưa có thông tin"}`
        ).join("\n\n")
      );

    case "getActiveProducts":
      return (
        "Dưới đây là danh sách sản phẩm tại QA-Gym:\n\n" +
        data.map((item, index) =>
          `${index + 1}. ${item.TenSanPham}\n` +
          `- Giá bán: ${Number(item.GiaBan).toLocaleString("vi-VN")} VNĐ\n` +
          `- Đơn vị: ${item.DonViTinh || "Chưa cập nhật"}`
        ).join("\n\n")
      );

    case "getMyCheckinHistory":
      return (
        "Dưới đây là lịch sử check-in của bạn:\n\n" +
        data.map((item, index) =>
          `${index + 1}. ${item.ThoiGianCheckIn}\n` +
          `- Check-out: ${item.ThoiGianCheckOut || "Chưa ghi nhận"}\n` +
          `- Trạng thái: ${item.TrangThai || "Chưa cập nhật"}`
        ).join("\n\n")
      );

    default:
      return "Tôi đã truy vấn được dữ liệu nhưng hiện chưa thể xử lý câu trả lời. Bạn vui lòng thử lại sau.";
  }
}

function getLongestPackageAnswer(packages, includeBonus = false) {
    if (!Array.isArray(packages) || packages.length === 0) {
        return "Hiện chưa có dữ liệu về các gói tập đang hoạt động.";
    }

    const getDuration = (pkg) => {
        const months = Number(pkg.SoThang || 0);
        const bonus = Number(pkg.ThangTang || 0);

        return includeBonus ? months + bonus : months;
    };

    const maxDuration = Math.max(...packages.map(getDuration));

    const longestPackages = packages.filter(
        pkg => getDuration(pkg) === maxDuration
    );

    const packageList = longestPackages.map(pkg => {
        const months = Number(pkg.SoThang || 0);
        const bonus = Number(pkg.ThangTang || 0);

        return `- ${pkg.TenGoi}: ${months} tháng đăng ký, ${bonus} tháng tặng`;
    }).join("\n");

    if (includeBonus) {
        return `Các gói có tổng thời gian sử dụng dài nhất là ${maxDuration} tháng:\n${packageList}`;
    }

    return `Các gói có thời hạn đăng ký dài nhất là ${maxDuration} tháng:\n${packageList}`;
}

function asksTotalDuration(message) {
    const text = normalizeVietnamese(message);

    return (
        text.includes("tinh ca thang tang") ||
        text.includes("tong thoi gian") ||
        text.includes("ca thang tang")
    );
}


// Chuẩn hóa tiếng Việt để nhận diện câu hỏi.
function normalizeVietnamese(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function asksTotalDuration(message) {
  const text = normalizeVietnamese(message);

  return (
    text.includes("tong thoi gian") ||
    text.includes("tinh ca thang tang") ||
    text.includes("bao gom thang tang") ||
    text.includes("ca thang duoc tang") ||
    text.includes("thoi gian thuc te") ||
    text.includes("thoi gian sau khi tang")
  );
}

// Kiểm tra người dùng có muốn tính cả tháng được tặng không.
function asksTotalDuration(message) {
  const text = normalizeVietnamese(message);

  return (
    text.includes("tong thoi gian") ||
    text.includes("tinh ca thang tang") ||
    text.includes("bao gom thang tang") ||
    text.includes("ca thang duoc tang")
  );
}

// Tìm các gói có thời hạn dài nhất.

function isLongestPackageQuestion(message, history = []) {
  const text = normalizeVietnamese(message);

  const directPatterns = [
    "goi nao co thoi han dai nhat",
    "goi nao co thoi gian dai nhat",
    "goi nao co tong thoi gian su dung dai nhat",
    "goi nao su dung lau nhat",
    "goi tap nao dai nhat",
    "goi nao dai nhat"
  ];

  if (directPatterns.some(pattern => text.includes(pattern))) {
    return true;
  }

  const isShortFollowUp = [
    "goi nao",
    "goi nao dai nhat",
    "con goi nao dai nhat",
    "goi nao lau nhat"
  ].includes(text);

  const previousContext = history
    .map(item => normalizeVietnamese(item.text))
    .join(" ");

  return isShortFollowUp &&
    previousContext.includes("goi");
}

function asksTotalDuration(message) {
  const text = normalizeVietnamese(message);

  return (
    text.includes("tong thoi gian") ||
    text.includes("tinh ca thang tang") ||
    text.includes("bao gom thang tang") ||
    text.includes("ca thang duoc tang")
  );
}

function getLongestPackageAnswer(packages, includeBonus = false) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return "Hiện tại chưa có gói tập nào đang hoạt động.";
  }

  const getDuration = item => {
    const months = Number(item.SoThang || 0);
    const bonus = Number(item.ThangTang || 0);

    return includeBonus ? months + bonus : months;
  };

  const maxDuration = Math.max(...packages.map(getDuration));

  const longestPackages = packages.filter(
    item => getDuration(item) === maxDuration
  );

  const details = longestPackages.map((item, index) => {
    return [
      `${index + 1}. ${item.TenGoi}`,
      `   Thời hạn đăng ký: ${item.SoThang} tháng`,
      `   Tháng tặng: ${item.ThangTang || 0} tháng`,
      `   Giá bán: ${Number(item.GiaBan || 0).toLocaleString("vi-VN")} VNĐ`
    ].join("\n");
  }).join("\n\n");

  return includeBonus
    ? `Các gói có tổng thời gian sử dụng dài nhất là ${maxDuration} tháng:\n\n${details}`
    : `Các gói có thời hạn đăng ký dài nhất là ${maxDuration} tháng:\n\n${details}`;
}

// Trả lời dự phòng khi Gemini không khả dụng.
function buildFallbackAnswer(toolName, data) {
  if (!Array.isArray(data) || data.length === 0) {
    return "Hiện chưa tìm thấy dữ liệu phù hợp trong hệ thống QA-Gym.";
  }

  if (toolName === "getActivePackages") {
    const details = data.map((item, index) => {
      return [
        `${index + 1}. ${item.TenGoi}`,
        `   Thời hạn: ${item.SoThang} tháng`,
        `   Tháng tặng: ${item.ThangTang || 0} tháng`,
        `   Giá bán: ${Number(item.GiaBan || 0).toLocaleString("vi-VN")} VNĐ`
      ].join("\n");
    }).join("\n\n");

    return `Hiện tại QA-Gym có ${data.length} lựa chọn gói tập đang hoạt động:\n\n${details}`;
  }

  // Dự phòng cho các loại dữ liệu khác.
  const details = data.map((item, index) => {
    const values = Object.entries(item)
      .filter(([key, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    return `${index + 1}.\n${values}`;
  }).join("\n\n");

  return `Tôi đã tìm thấy ${data.length} kết quả trong hệ thống QA-Gym:\n\n${details}`;
}

// Kiểm tra câu hỏi đang hỏi tiếp về giá của gói tập trước đó.
function isPackagePriceFollowUp(message) {
  const text = normalizeVietnamese(message);

  const patterns = [
    "goi do co gia bao nhieu",
    "goi nay co gia bao nhieu",
    "gia goi do",
    "gia goi nay",
    "goi do bao nhieu tien",
    "goi nay bao nhieu tien",
    "con gia goi do",
    "gia tien goi do",
    "goi do gia bao nhieu"
  ];

  return patterns.some(pattern => text.includes(pattern));
}


// Tìm các gói tập được nhắc đến trong câu trả lời gần nhất của AI.
function findReferencedPackages(packages, history = []) {
  if (!Array.isArray(packages) || !Array.isArray(history)) {
    return [];
  }

  // Chỉ xét câu trả lời gần nhất của AI.
  const lastModelMessage = [...history]
    .reverse()
    .find(item => item.role === "model" && item.text);

  if (!lastModelMessage) {
    return [];
  }

  const previousAnswer = normalizeVietnamese(lastModelMessage.text);

  // Ưu tiên tên gói dài hơn để tránh trùng một phần tên.
  const matchedPackages = packages
    .filter(item => {
      if (!item.TenGoi) return false;

      const packageName = normalizeVietnamese(item.TenGoi);

      return packageName && previousAnswer.includes(packageName);
    })
    .sort((a, b) => {
      return String(b.TenGoi).length - String(a.TenGoi).length;
    });

  // Loại bỏ kết quả trùng tên gói.
  const uniquePackages = [];
  const usedNames = new Set();

  for (const item of matchedPackages) {
    const key = normalizeVietnamese(item.TenGoi);

    if (!usedNames.has(key)) {
      usedNames.add(key);
      uniquePackages.push(item);
    }
  }

  return uniquePackages;
}


// Tạo câu trả lời về giá các gói tập được nhắc đến.
function getReferencedPackagePriceAnswer(packages) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return "Tôi chưa xác định được gói tập mà bạn đang đề cập. Bạn vui lòng cho tôi biết tên gói tập nhé!";
  }

  if (packages.length === 1) {
    const item = packages[0];

    return [
      `Gói tập bạn đang hỏi là: ${item.TenGoi}.`,
      `Giá bán: ${Number(item.GiaBan || 0).toLocaleString("vi-VN")} VNĐ.`,
      `Thời hạn đăng ký: ${item.SoThang || 0} tháng.`,
      `Tháng được tặng: ${item.ThangTang || 0} tháng.`
    ].join("\n");
  }

  const details = packages.map((item, index) => {
    return [
      `${index + 1}. ${item.TenGoi}`,
      `   Giá bán: ${Number(item.GiaBan || 0).toLocaleString("vi-VN")} VNĐ`,
      `   Thời hạn đăng ký: ${item.SoThang || 0} tháng`,
      `   Tháng được tặng: ${item.ThangTang || 0} tháng`
    ].join("\n");
  }).join("\n\n");

  return [
    "Trong câu trả lời trước có nhiều gói tập phù hợp với mô tả của bạn. Giá của các gói đó như sau:",
    "",
    details,
    "",
    "Bạn muốn tìm hiểu cụ thể gói nào?"
  ].join("\n");
}

// Gửi câu hỏi và xử lý vòng lặp Tool Calling.

async function chat({
  message,
  accountId,
  conversationId
}) {
  if (!accountId) {
    throw new Error("Không xác định được tài khoản đang đăng nhập.");
  }

  if (typeof message !== "string" || !message.trim()) {
    throw new Error("Nội dung câu hỏi không được để trống.");
  }

  if (message.length > 3000) {
    throw new Error("Câu hỏi không được vượt quá 3000 ký tự.");
  }

  // 1. Tạo cuộc trò chuyện mới hoặc kiểm tra cuộc trò chuyện cũ.
  let currentConversationId = conversationId;

  if (!currentConversationId) {
    currentConversationId =
      conversationMemory.createConversation(accountId);
  } else {
    const conversation = conversationMemory.getConversation(
      currentConversationId,
      accountId
    );

    if (!conversation) {
      throw new Error(
        "Cuộc trò chuyện không tồn tại hoặc bạn không có quyền truy cập."
      );
    }
  }

  // 2. Lấy lịch sử hội thoại từ RAM.
  const storedHistory =
    conversationMemory.getConversationHistory(
      currentConversationId,
      accountId
    ) || [];

  const safeHistory = storedHistory.slice(-10);

  // 3. Lưu câu hỏi hiện tại.
  conversationMemory.saveMessage(
    currentConversationId,
    accountId,
    "user",
    message.trim()
  );

  // 4. Hàm trả lời và lưu câu trả lời vào RAM.
  const finishChat = (answer) => {
    const finalAnswer = String(answer || "").trim();

    conversationMemory.saveMessage(
      currentConversationId,
      accountId,
      "model",
      finalAnswer
    );

    return {
      conversationId: currentConversationId,
      answer: finalAnswer
    };
  };

  console.log("===== AI AGENT RAM MEMORY =====");
  console.log("ACCOUNT ID:", accountId);
  console.log("CONVERSATION ID:", currentConversationId);
  console.log("HISTORY LENGTH:", safeHistory.length);
  console.log("MESSAGE:", message);
  console.log("===============================");

  // 5. Ưu tiên tra cứu thông tin đăng ký gói tập cá nhân.
  if (isMyMembershipQuestion(message)) {
    const result = await executeTool(
      "getMyMembership",
      {},
      accountId
    );

    if (result.length === 0) {
      return finishChat(
        "Hiện tại tài khoản của bạn chưa có thông tin đăng ký gói tập trong hệ thống QA-Gym. Bạn vui lòng liên hệ nhân viên quầy lễ tân để được hỗ trợ kiểm tra nhé!"
      );
    }

    const answer = result.map((item, index) => {
      return [
        `Gói tập ${index + 1}: ${item.TenGoi}`,
        `Thời hạn: ${item.SoThang} tháng`,
        `Tháng được tặng: ${item.ThangTang || 0}`,
        `Ngày bắt đầu: ${item.NgayBatDau}`,
        `Ngày kết thúc: ${item.NgayKetThuc}`,
        `Giá thanh toán: ${Number(item.GiaThanhToan || 0).toLocaleString("vi-VN")} VNĐ`,
        `Trạng thái đăng ký: ${item.TrangThaiDangKy}`,
        `Trạng thái thanh toán: ${item.TrangThaiThanhToan || "Chưa có thông tin"}`
      ].join("\n");
    }).join("\n\n");

    return finishChat(
      `Thông tin gói tập của bạn tại QA-Gym:\n\n${answer}`
    );
  }

  // 6. Xử lý câu hỏi hỏi giá của gói tập được nhắc đến trước đó.
  if (isPackagePriceFollowUp(message)) {
    const packages = await executeTool(
      "getActivePackages",
      {},
      accountId
    );

    const referencedPackages = findReferencedPackages(
      packages,
      safeHistory
    );

    return finishChat(
      getReferencedPackagePriceAnswer(referencedPackages)
    );
  }

  // 7. Xử lý câu hỏi về gói tập có thời hạn dài nhất.
  if (isLongestPackageQuestion(message, safeHistory)) {
    const packages = await executeTool(
      "getActivePackages",
      {},
      accountId
    );

    return finishChat(
      getLongestPackageAnswer(
        packages,
        asksTotalDuration(message)
      )
    );
  }

  // 8. Xử lý câu hỏi về gói tập được tặng nhiều tháng nhất.
  if (isMostBonusPackageQuestion(message)) {
    const packages = await executeTool(
      "getActivePackages",
      {},
      accountId
    );

    return finishChat(
      getMostBonusPackageAnswer(packages)
    );
  }

  // 9. Nhận diện câu hỏi cần truy vấn dữ liệu.
  const requiredTool = detectRequiredTool(message);

  if (requiredTool) {
    const toolResult = await executeTool(
      requiredTool,
      {},
      accountId
    );

    return finishChat(
      buildFallbackAnswer(requiredTool, toolResult)
    );
  }

  // 10. Câu hỏi chưa được hỗ trợ.
  return finishChat(
    "Xin lỗi, tôi chưa tìm thấy chức năng phù hợp để xử lý câu hỏi này. Bạn có thể hỏi về gói tập, sản phẩm, thông tin đăng ký hoặc lịch sử check-in tại QA-Gym nhé!"
  );
}

function isLongestPackageQuestion(message, history = []) {
  const text = normalizeVietnamese(message);

  const directPatterns = [
    "goi nao co thoi han dai nhat",
    "goi nao co thoi gian dai nhat",
    "goi nao co tong thoi gian su dung dai nhat",
    "goi nao su dung lau nhat",
    "goi tap nao dai nhat",
    "goi nao dai nhat"
  ];

  if (directPatterns.some(pattern => text.includes(pattern))) {
    return true;
  }

  const isShortFollowUp = [
    "goi nao",
    "goi nao dai nhat",
    "con goi nao dai nhat",
    "goi nao lau nhat"
  ].includes(text);

  const previousContext = history
    .map(item => normalizeVietnamese(item.text))
    .join(" ");

  return isShortFollowUp &&
    previousContext.includes("goi");
}

function asksTotalDuration(message) {
  const text = normalizeVietnamese(message);

  return (
    text.includes("tong thoi gian") ||
    text.includes("tinh ca thang tang") ||
    text.includes("bao gom thang tang") ||
    text.includes("ca thang duoc tang")
  );
}


function isMostBonusPackageQuestion(message) {
  const text = normalizeVietnamese(message);

  return (
    text.includes("tang nhieu thang nhat") ||
    text.includes("duoc tang nhieu thang nhat") ||
    text.includes("goi nao tang nhieu thang") ||
    text.includes("nhieu thang tang nhat") ||
    text.includes("goi nao co thang tang cao nhat")
  );
}

function getMostBonusPackageAnswer(packages) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return "Hiện chưa có dữ liệu gói tập đang hoạt động.";
  }

  const maxBonus = Math.max(
    ...packages.map(item => Number(item.ThangTang || 0))
  );

  const results = packages.filter(
    item => Number(item.ThangTang || 0) === maxBonus
  );

  if (maxBonus === 0) {
    return "Hiện tại các gói tập đang hoạt động chưa có tháng tặng.";
  }

  const details = results.map((item, index) => {
    return [
      `${index + 1}. ${item.TenGoi}`,
      `   Thời hạn đăng ký: ${item.SoThang} tháng`,
      `   Tháng được tặng: ${item.ThangTang} tháng`,
      `   Giá bán: ${Number(item.GiaBan || 0).toLocaleString("vi-VN")} VNĐ`
    ].join("\n");
  }).join("\n\n");

  return `Các gói tập được tặng nhiều tháng nhất (${maxBonus} tháng):\n\n${details}`;
}


function getLongestPackageAnswer(packages, includeBonus = false) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return "Hiện tại chưa có gói tập nào đang hoạt động.";
  }

  const getDuration = item => {
    const months = Number(item.SoThang || 0);
    const bonus = Number(item.ThangTang || 0);

    return includeBonus ? months + bonus : months;
  };

  const maxDuration = Math.max(...packages.map(getDuration));

  const longestPackages = packages.filter(
    item => getDuration(item) === maxDuration
  );

  const details = longestPackages.map((item, index) => {
    return [
      `${index + 1}. ${item.TenGoi}`,
      `   Thời hạn đăng ký: ${item.SoThang} tháng`,
      `   Tháng tặng: ${item.ThangTang || 0} tháng`,
      `   Giá bán: ${Number(item.GiaBan || 0).toLocaleString("vi-VN")} VNĐ`
    ].join("\n");
  }).join("\n\n");

  return includeBonus
    ? `Các gói có tổng thời gian sử dụng dài nhất là ${maxDuration} tháng:\n\n${details}`
    : `Các gói có thời hạn đăng ký dài nhất là ${maxDuration} tháng:\n\n${details}`;
}

module.exports = { chat };
