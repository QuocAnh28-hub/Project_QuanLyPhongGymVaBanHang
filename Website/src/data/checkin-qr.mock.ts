export type QrToken={id:number;token:string;owner:string;type:string;branch:string;expiry:string;status:"active"|"guest"|"locked"};
export const initialQrTokens:QrToken[]=[
  {id:1,token:"#QA-TOTP-9921",owner:"Lê Hoàng Nam · 0903.481.889",type:"Diamond Member",branch:"Toàn hệ thống (4 CS)",expiry:"31/12/2026",status:"active"},
  {id:2,token:"#GUEST-VIP-0418",owner:"Nguyễn Thu Thảo (Khách)",type:"Khách mời 24h",branch:"Landmark 81",expiry:"Còn 18h 40m",status:"guest"},
  {id:3,token:"#QA-WARN-8812",owner:"Vũ Đình Quân · 0912.873.112",type:"Học viên PT",branch:"Thủ Thiêm Lakeview",expiry:"Đã khóa tạm",status:"locked"},
  {id:4,token:"#TRIAL-7D-1029",owner:"Bùi Cẩm Tú · Khách Marketing",type:"Dùng thử 7 ngày",branch:"Thảo Điền Garden",expiry:"Còn 5 ngày",status:"active"},
];
export const iotNodes=["LANDMARK 81 CLUB","THỦ THIÊM LAKEVIEW","THẢO ĐIỀN GARDEN","PHÚ MỸ HƯNG CENTRAL"].map((name,i)=>({name,lanes:i<2?5:4,latency:`0.0${3+i}s`,firmware:"v2.4.9",heartbeat:`18:${28+i}`}));
