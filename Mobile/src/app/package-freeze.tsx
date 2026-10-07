import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { authenticatedFetch, baseUrl } from '@/lib/account-api';
import { getCurrentMembership, type CurrentMembership } from '@/lib/membership-api';

type Freeze = { BaoLuuID: number; TrangThai: string; NgayBatDau: string; NgayKetThuc: string };
async function request<T>(body?: object): Promise<T> {
  const res = await authenticatedFetch(`${baseUrl}/member-requests/freeze/me`, {
    method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data as T;
}
export default function PackageFreezeScreen() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<CurrentMembership | null>(null);
  const [rows, setRows] = useState<Freeze[]>([]);
  const [from, setFrom] = useState(''), [to, setTo] = useState('');
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!user?.accountId) return;
    try {
      const [m,r] = await Promise.all([getCurrentMembership(user.accountId), request<Freeze[]>()]);
      setMembership(m); setRows(r);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Không tải được yêu cầu.'); }
  }, [user?.accountId]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  async function submit() {
    if (!membership || busy) return;
    setBusy(true);
    try {
      await request({ DangKyID: membership.DangKyID, NgayBatDau: from, NgayKetThuc: to });
      setMessage('Đã gửi yêu cầu chờ Admin duyệt.'); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Không thể gửi yêu cầu.'); }
    finally { setBusy(false); }
  }
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}>
    <Text style={s.title}>Bảo lưu gói tập</Text>
    <Text style={s.text}>Gói đang dùng và đã thanh toán mới được bảo lưu. Trong thời gian được duyệt, bạn không thể check-in. Khi kết thúc, thời hạn gói được cộng số ngày bảo lưu; các gói chờ được xếp sau.</Text>
    <Text style={s.text}>{membership ? membership.TenGoi : 'Chưa có gói đang dùng.'}</Text>
    <TextInput style={s.input} placeholderTextColor="#8b948e" placeholder="Từ ngày (YYYY-MM-DD)" value={from} onChangeText={setFrom}/>
    <TextInput style={s.input} placeholderTextColor="#8b948e" placeholder="Đến ngày (YYYY-MM-DD)" value={to} onChangeText={setTo}/>
    <Pressable style={s.button} disabled={busy || !membership} onPress={() => void submit()}><Text>{busy ? 'Đang gửi…' : 'Gửi yêu cầu'}</Text></Pressable>
    {!!message && <Text style={s.text}>{message}</Text>}
    {rows.map(r => <Text style={s.text} key={r.BaoLuuID}>#{r.BaoLuuID} · {r.NgayBatDau.slice(0,10)} – {r.NgayKetThuc.slice(0,10)} · {r.TrangThai}</Text>)}
    <Pressable onPress={() => router.back()}><Text style={s.text}>Quay lại</Text></Pressable>
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex:1, backgroundColor:'#0c0f10' }, content:{padding:20,gap:14}, title:{color:'#e5e9e3',fontSize:25,fontWeight:'900'},text:{color:'#aeb59e',lineHeight:20},input:{backgroundColor:'#202427',color:'#e5e9e3',padding:14,borderRadius:9},button:{backgroundColor:'#caff00',padding:15,borderRadius:9,alignItems:'center'} });
