export type AuditRow={id:number;log:string;time:string;member:string;tier:string;branch:string;gate:string;auth:string;match:number;cycle:string;status:string;kind:"valid"|"warning"|"out"};
const seed:AuditRow[]=[
  {id:1,log:"#LOG-982410",time:"31/10/2024 · 18:42:19",member:"Lê Đình Khang",tier:"BLACK DIAMOND",branch:"QA Thảo Điền",gate:"Turnstile 04",auth:"FaceID 3D",match:99.82,cycle:"Active · 28 phút",status:"Mở cửa (Hợp lệ)",kind:"valid"},
  {id:2,log:"#LOG-982409",time:"31/10/2024 · 18:39:04",member:"Nguyễn Vũ Tuấn Anh",tier:"STANDARD PLUS",branch:"QA Landmark 81",gate:"Turnstile 02",auth:"QR Động App",match:100,cycle:"Double tap 8 phút",status:"Khóa cảnh báo",kind:"warning"},
  {id:3,log:"#LOG-982398",time:"31/10/2024 · 18:31:02",member:"Đoàn Phương Mai",tier:"PLATINUM VIP",branch:"QA Sala Premier",gate:"Turnstile 01",auth:"FaceID 3D",match:98.48,cycle:"18 buổi/tháng",status:"Hoàn tất buổi tập",kind:"out"},
  {id:4,log:"#LOG-982381",time:"31/10/2024 · 18:24:50",member:"Trần Quốc Cường",tier:"HẾT HẠN",branch:"QA Thảo Điền",gate:"Turnstile 03",auth:"Thẻ RFID",match:0,cycle:"Gói tập hết hạn",status:"Từ chối mở cửa",kind:"warning"},
  {id:5,log:"#LOG-982375",time:"31/10/2024 · 18:15:10",member:"Hoàng Gia Bảo",tier:"VIP 1-ON-1",branch:"QA District 1",gate:"Turnstile 01",auth:"QR Động App",match:100,cycle:"Lịch hẹn PT",status:"Mở cửa (Hợp lệ)",kind:"valid"},
  {id:6,log:"#LOG-982362",time:"31/10/2024 · 18:02:44",member:"Hà Kiều Như",tier:"STANDARD PLUS",branch:"QA Thảo Điền",gate:"Turnstile 02",auth:"FaceID 3D",match:81.2,cycle:"Đang tập",status:"Cảnh báo - Cho phép",kind:"warning"},
  {id:7,log:"#LOG-982350",time:"31/10/2024 · 17:58:12",member:"Vũ Trí Dũng",tier:"CORPORATE PARTNER",branch:"QA Sala Premier",gate:"Turnstile 02",auth:"QR Động App",match:100,cycle:"Buổi 18/60",status:"Mở cửa (Hợp lệ)",kind:"valid"},
  {id:8,log:"#LOG-982341",time:"31/10/2024 · 17:45:00",member:"Trần Anh Dũng",tier:"SENIOR PT",branch:"QA District 1",gate:"Staff Lane",auth:"FaceID 3D",match:99.95,cycle:"Ca chiều 18:00",status:"Mở cửa Staff",kind:"valid"},
];
export const auditRows=Array.from({length:24},(_,i)=>i<seed.length?seed[i]:{...seed[i%seed.length],id:i+1,log:`#LOG-${982410-i}`,time:`${30-Math.floor(i/8)}/10/2024 · 17:${String(59-i).padStart(2,"0")}:00`});
export const heatmap=Array.from({length:31},(_,i)=>(i*7+3)%4);
