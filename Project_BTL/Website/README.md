# Website quản trị QA-Gym

## Dashboard

Dashboard gọi BE qua `VITE_API_BASE_URL` (mặc định `/api`, được Vite proxy tới
`API_PROXY_TARGET` hoặc `http://127.0.0.1:3000`). Tự tải khi mở trang, cập nhật
lại sau mỗi 60 giây và hỗ trợ nút làm mới. Khi cập nhật thất bại, trang giữ
dữ liệu lần tải thành công trước đó kèm thông báo và thời điểm tải.

| API GET | Dữ liệu sử dụng |
| --- | --- |
| `/reports/admin?from=YYYY-MM-01&to=YYYY-MM-DD` | Hội viên, gói sắp hết hạn, thực thu tháng và từng ngày |
| `/checkin/admin/today` | Các phiên bắt đầu hôm nay, thống kê theo giờ và nhật ký gần nhất |
| `/pt`, `/lichpt`, `/thuept`, `/hoivien` | HLV hoạt động, lịch PT theo ngày diễn ra ca, tên HLV và hội viên |
| `/donhang` | Đơn mới hôm nay và các đơn chưa hoàn tất cần xử lý |

Ngày và giờ hiển thị theo Việt Nam (UTC+7); BE/database cần chạy cùng múi giờ
vì API check-in dùng `CURDATE()`. Thực thu chỉ tính thanh toán `SUCCESS`.
Doanh thu PT riêng, số cơ sở, KPI và thiết bị không được giả lập khi BE chưa
cung cấp dữ liệu. Số gói sắp hết hạn là số đăng ký gói, không phải số hội viên.

Kiểm tra tính toán Dashboard (Node.js 24):

```sh
node --test --test-isolation=none tests/dashboard.test.mjs
npm run build
npm run lint
```

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
