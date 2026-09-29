import { useEffect, useMemo, useState } from 'react'
import { MetricCard } from '../components/AdminLayout'
import { getTodayCheckIns, type CheckInRow } from '../services/checkins'

export default function CheckInLivePage(){
  const [rows,setRows]=useState<CheckInRow[]>([]),[metrics,setMetrics]=useState({total:0,present:0,checkedOut:0}),[filter,setFilter]=useState('all'),[loading,setLoading]=useState(true),[error,setError]=useState('')
  const load=async()=>{try{const data=await getTodayCheckIns();setRows(data.rows);setMetrics(data.metrics);setError('')}catch(e){setError(e instanceof Error?e.message:'Không thể tải check-in')}finally{setLoading(false)}}
  // oxlint-disable-next-line react/set-state-in-effect -- fetch initializes server state
  useEffect(()=>{void load();const timer=window.setInterval(()=>void load(),15000);return()=>window.clearInterval(timer)},[])
  const shown=useMemo(()=>rows.filter(row=>filter==='all'||row.TrangThai===filter),[rows,filter])
  const exportCsv=()=>{const csv=['HoiVienID,Tên,SĐT,Check-in,Check-out,Trạng thái',...shown.map(x=>[x.HoiVienID,x.HoTen,x.SoDienThoai||'',x.ThoiGianCheckIn,x.ThoiGianCheckOut||'',x.TrangThai].join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='checkin-hom-nay.csv';a.click();URL.revokeObjectURL(a.href)}
  return <div className="admin-page checkin-page">
    <header className="page-heading"><div><p>VẬN HÀNH CHÍNH　›　CỔNG CHECK-IN　›　<b>CHECK-IN HÔM NAY</b></p><h1>GIÁM SÁT CHECK-IN HÔM NAY</h1><span className="online-badge">● DỮ LIỆU MYSQL · TỰ LÀM MỚI 15 GIÂY</span></div><div className="heading-actions"><button onClick={()=>void load()}>↻ LÀM MỚI</button><button onClick={exportCsv}>⇩ XUẤT DANH SÁCH</button></div></header>
    <section className="metrics-grid"><MetricCard label="TỔNG LƯỢT CHECK-IN" value={String(metrics.total)} note="Trong ngày hôm nay"/><MetricCard label="ĐANG CÓ MẶT" value={String(metrics.present)} note="Chưa checkout" tone="mint"/><MetricCard label="ĐÃ CHECK-OUT" value={String(metrics.checkedOut)} note="Đã rời CLB"/><MetricCard label="DỮ LIỆU HARDWARE" value="—" note="Chưa có trong database"/></section>
    <section className="live-section"><div className="section-title"><h2>● CHECK-IN HÔM NAY</h2><div className="chips">{[['all','Tất cả'],['CHECKED_IN','Đang có mặt'],['CHECKED_OUT','Đã checkout']].map(([key,label])=><button className={filter===key?'selected':''} onClick={()=>setFilter(key)} key={key}>{label}</button>)}</div></div>
      {loading&&<div className="empty-state">Đang tải...</div>}{error&&<div className="empty-state">{error}</div>}
      <div className="live-feed">{shown.map(x=><article key={x.CheckInID}><i>{x.HoTen[0]}</i><div><h3>{x.HoTen} <small>HV-{x.HoiVienID} · {x.SoDienThoai||'Không có SĐT'}</small></h3><p>Vào: {x.ThoiGianCheckIn}　•　Ra: {x.ThoiGianCheckOut||'Chưa checkout'}</p></div><strong>{x.TrangThai}</strong></article>)}</div>
      {!loading&&!error&&!shown.length&&<div className="empty-state">Chưa có lượt check-in phù hợp.</div>}
    </section>
  </div>
}
