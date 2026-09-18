export type CheckInFeed = { id:number; name:string; tier:string; memberId:string; time:string; gate:string; auth:string; result:string; kind:"valid"|"warning"|"vip"|"pt" };
export const gateClusters = [
  {name:"QA Flagship Vincom Q.1",lanes:[42,51,49,118],guests:142,range:"Gate 01 - 04 (4 Làn)"},
  {name:"QA Crescent Elite Q.7",lanes:[31,33,22,67],guests:86,range:"Gate 01 - 04 (4 Làn)"},
  {name:"QA Thảo Điền Hub",lanes:[18,19,17,12,45],guests:54,range:"Gate 01 - 05 (5 Làn)"},
  {name:"QA West Lake HN",lanes:[10,11,9,6,24],guests:30,range:"Gate 01 - 05 (5 Làn)"},
];
export const initialLiveFeed: CheckInFeed[] = [
  {id:1,name:"Trần Minh Hoàng",tier:"DIAMOND VIP",memberId:"#MB-880291",time:"15:41:22",gate:"Gate 02 - Vincom Q.1",auth:"FaceID 3D AI (Khớp 99.8%)",result:"Mở cổng Turnstile thành công",kind:"vip"},
  {id:2,name:"Nguyễn Thị Mai",tier:"CLASSIC 12M",memberId:"#MB-441029",time:"15:39:05",gate:"Gate 01 - Crescent Elite Q.7",auth:"Quét mã QR động App QA-Gym",result:"Hợp lệ - Mở cổng 01",kind:"valid"},
  {id:3,name:"Lê Khắc Huy",tier:"MASTER COACH",memberId:"#STAFF-902",time:"15:35:48",gate:"Cổng Staff Hub - Thảo Điền",auth:"Sinh trắc Vân tay nội bộ",result:"Điểm danh ca dạy thành công",kind:"pt"},
  {id:4,name:"Vũ Hoàng Long",tier:"CẢNH BÁO: HẾT HẠN",memberId:"#MB-118902",time:"15:31:10",gate:"Gate 03 - Vincom Q.1",auth:"Thẻ hết hạn quá 4 ngày",result:"Từ chối mở cửa",kind:"warning"},
  {id:5,name:"Đặng Quang Huy",tier:"PLATINUM PRO",memberId:"#MB-552918",time:"15:28:45",gate:"Gate 02 - Vincom Q.1",auth:"FaceID 3D Match",result:"Cổng mở - Khớp lịch PT 16:00",kind:"pt"},
];
