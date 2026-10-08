import type { Promotion } from './admin-finance'
export const promotionLabels = { UPCOMING: 'Chưa bắt đầu', ACTIVE: 'Đang diễn ra', EXPIRED: 'Hết hạn', STOPPED: 'Đã ngừng' }
export const usageLabels = { SUCCESS: 'Đã thanh toán', PENDING: 'Chờ thanh toán', FAILED: 'Thất bại', CANCELLED: 'Đã hủy', UNVERIFIED: 'Chưa đối soát' }
export const promotionTime = (value: string) => new Date(value.replace(' ', 'T') + (/Z$|[+-]\d\d:\d\d$/.test(value) ? '' : '+07:00'))
export function dateInput(value?: string) {
  if (!value) return ''
  if (!/Z$|[+-]\d\d:\d\d$/.test(value)) return value.replace(' ', 'T').slice(0,19)
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value))
  const p=Object.fromEntries(parts.map(x=>[x.type,x.value]))
  return p.year+'-'+p.month+'-'+p.day+'T'+p.hour+':'+p.minute+':'+p.second
}
export function promotionState(p: Pick<Promotion,'TrangThai'|'NgayBatDau'|'NgayKetThuc'>, now=Date.now()): Promotion['TinhTrang'] {
  if(p.TrangThai==='INACTIVE')return 'STOPPED'
  if(p.TrangThai==='EXPIRED'||promotionTime(p.NgayKetThuc).getTime()<now)return 'EXPIRED'
  return promotionTime(p.NgayBatDau).getTime()>now?'UPCOMING':'ACTIVE'
}
export function validatePromotion(data: Partial<Promotion>) {
  const code=String(data.MaKhuyenMai||'').trim().toUpperCase(),name=String(data.TenKhuyenMai||'').trim()
  const percent=Number(data.PhanTramGiam ?? 0),amount=Number(data.SoTienGiam ?? 0)
  const decimal=(n:number)=>Number.isFinite(n)&&Math.abs(n*100-Math.round(n*100))<0.001
  if(!/^[A-Z0-9_-]{2,50}$/.test(code)||!name||name.length>150)throw new Error('Mã cần 2–50 ký tự A–Z, 0–9, _ hoặc -; tên cần 1–150 ký tự.')
  if(!decimal(percent)||!decimal(amount)||percent<0||percent>100||amount<0||amount>9999999999999.99||!((percent>0&&amount===0)||(amount>0&&percent===0)))throw new Error('Chỉ chọn một mức giảm dương: % tối đa 100 hoặc tiền cố định, tối đa 2 số thập phân.')
  const validDate=(s?:string)=>{if(!s||!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s))return false;const d=new Date(s.replace(' ','T')+'Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,19).replace('T',' ')===s}
  if(!validDate(data.NgayBatDau)||!validDate(data.NgayKetThuc)||data.NgayBatDau!>data.NgayKetThuc!)throw new Error('Thời gian kết thúc phải bằng hoặc sau thời gian bắt đầu.')
  if(!['ACTIVE','INACTIVE','EXPIRED'].includes(data.TrangThai||''))throw new Error('Trạng thái lưu không hợp lệ.')
  if((data.DieuKien?.length||0)>10000)throw new Error('Điều kiện tối đa 10.000 ký tự.')
  return {...data,MaKhuyenMai:code,TenKhuyenMai:name,PhanTramGiam:percent,SoTienGiam:amount}
}
// Matches the existing package redemption math; never changes payment logic.
export function previewDiscount(price:number,percent:number,amount:number) {
  return Math.min(price,Math.max(0,amount>0?amount:Math.round(price*percent/100)))
}
