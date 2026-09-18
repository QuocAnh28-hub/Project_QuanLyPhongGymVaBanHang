export type ContractStatus = "Chờ thanh toán" | "Chờ duyệt HĐ" | "Chờ ký số" | "Đã kích hoạt" | "Đã hủy / Hoàn tiền" | "Đã từ chối";
export type Contract = {
  id: number; code: string; time: string; member: string; memberId: string; phone: string;
  age: number; cccd: string; packageName: string; coach: string; branch: string;
  value: number; listPrice: number; discount: number; payment: string; status: ContractStatus;
  term: string; transaction: string;
};

const seed: Contract[] = [
  { id: 9921, code: "#QA-CTR-9921", time: "Hôm nay, 15:20", member: "Trần Minh Hào", memberId: "HV-99820", phone: "0908.234.***", age: 31, cccd: "07919100****", packageName: "Diamond All-Access 12T", coach: "Coach Anh Khoa", branch: "Toàn bộ 4 CLB", value: 21600000, listPrice: 24000000, discount: 2400000, payment: "VietQR (100%)", status: "Đã kích hoạt", term: "25/10/2025 → 25/10/2026", transaction: "VQR-20251025-9921" },
  { id: 9922, code: "#QA-CTR-9922", time: "Hôm nay, 14:48", member: "Nguyễn Thị Mai", memberId: "HV-10294", phone: "0912.888.***", age: 28, cccd: "07919800****", packageName: "Platinum Pro 06 Tháng", coach: "Đoàn Đức Tuấn (Senior PT)", branch: "QA-Gym Vincom Q.1", value: 11800000, listPrice: 12300000, discount: 500000, payment: "MoMo AutoPay", status: "Chờ duyệt HĐ", term: "25/10/2025 → 25/04/2026", transaction: "MOM-20251025-9922" },
  { id: 9923, code: "#QA-CTR-9923", time: "Hôm nay, 13:15", member: "Đặng Quang Huy", memberId: "HV-30911", phone: "0983.456.***", age: 26, cccd: "07920011****", packageName: "Gói PT 1-1 Master Coach 24B", coach: "Coach Kenzo Tuấn", branch: "Crescent Elite Q.7", value: 18500000, listPrice: 18500000, discount: 0, payment: "VISA (*** 8892)", status: "Chờ ký số", term: "26/10/2025 → 26/04/2026", transaction: "VISA-8892-9923" },
  { id: 9924, code: "#QA-CTR-9924", time: "Hôm nay, 11:05", member: "Lê Vũ Phương Thảo", memberId: "HV-88120", phone: "0938.990.***", age: 33, cccd: "07918891****", packageName: "Diamond VIP 12T", coach: "Trần Hoàng Nam", branch: "Thảo Điền Hub", value: 21600000, listPrice: 21600000, discount: 0, payment: "VietinBank CK", status: "Chờ thanh toán", term: "01/11/2025 → 01/11/2026", transaction: "VTB-20251025-9924" },
  { id: 9925, code: "#QA-CTR-9925", time: "Hôm nay, 09:30", member: "Vũ Hoàng Long", memberId: "HV-09214", phone: "0903.112.***", age: 24, cccd: "07920210****", packageName: "Classic 3 Tháng", coach: "Lê Quang Dũng", branch: "QA-Gym Vincom Q.1", value: 3200000, listPrice: 3200000, discount: 0, payment: "Tiền mặt POS", status: "Đã kích hoạt", term: "25/10/2025 → 25/01/2026", transaction: "POS-20251025-9925" },
];

export const initialContracts: Contract[] = Array.from({ length: 24 }, (_, index) => {
  const base = seed[index % seed.length];
  return index < seed.length ? base : { ...base, id: 9921 + index, code: `#QA-CTR-${9921 + index}`, time: `${Math.floor(index / 5) + 1} ngày trước`, member: `${base.member} ${index + 1}` };
});
