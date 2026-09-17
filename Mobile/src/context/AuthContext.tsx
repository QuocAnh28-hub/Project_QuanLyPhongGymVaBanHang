import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

type Account = { name: string; email: string; phone: string; password: string };
type Recovery = { email: string; verified: boolean };
type AuthValue = {
  ready: boolean; user: Omit<Account, 'password'> | null; savedCredential: string;
  login: (credential: string, password: string, remember: boolean) => Promise<boolean>;
  register: (account: Account) => Promise<string | null>;
  logout: () => Promise<void>;
  beginRecovery: (credential: string, method: 'sms' | 'email') => string | null;
  verifyOtp: (code: string) => boolean;
  resetPassword: (password: string) => Promise<boolean>;
  recovery: Recovery | null;
};
const SEED: Account = { name: 'QA-Gym Admin', email: 'admin@qagym.vn', phone: '0988123678', password: '12345678' };
const ACCOUNTS = 'qa-gym-dev-accounts';
const SESSION = 'qa-gym-dev-session';
const REMEMBERED = 'qa-gym-dev-credential';
const AuthContext = createContext<AuthValue | null>(null);

// ponytail: local development accounts only; replace this store with server auth before production.
async function read(key: string) { return Platform.OS === 'web' ? globalThis.localStorage?.getItem(key) ?? null : SecureStore.getItemAsync(key); }
async function write(key: string, value: string | null) {
  if (Platform.OS === 'web') { if (value === null) globalThis.localStorage?.removeItem(key); else globalThis.localStorage?.setItem(key, value); }
  else if (value === null) await SecureStore.deleteItemAsync(key);
  else await SecureStore.setItemAsync(key, value);
}
function identity(account: Account) { const { password: _password, ...user } = account; return user; }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthValue['user']>(null);
  const [accounts, setAccounts] = useState<Account[]>([SEED]);
  const [savedCredential, setSavedCredential] = useState('');
  const [recovery, setRecovery] = useState<Recovery | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const [savedAccounts, session, remembered] = await Promise.all([read(ACCOUNTS), read(SESSION), read(REMEMBERED)]);
        const list: Account[] = savedAccounts ? JSON.parse(savedAccounts) : [];
        const all = list.length ? list : [SEED];
        setAccounts(all);
        const active = all.find(a => a.email === session);
        setUser(active ? identity(active) : null);
        setSavedCredential(remembered ?? '');
      } catch { setUser(null); }
      finally { setReady(true); }
    })();
  }, []);
  async function login(credential: string, password: string, remember: boolean) {
    const normalized = credential.trim().toLowerCase().replace(/\s/g, '');
    const account = accounts.find(a => (a.email.toLowerCase() === normalized || a.phone.replace(/\s/g, '') === normalized) && a.password === password);
    if (!account) return false;
    await write(SESSION, account.email);
    await write(REMEMBERED, remember ? credential.trim() : null);
    setSavedCredential(remember ? credential.trim() : '');
    setUser(identity(account));
    return true;
  }
  async function register(account: Account) {
    if (accounts.some(a => a.email.toLowerCase() === account.email.trim().toLowerCase() || a.phone.replace(/\s/g, '') === account.phone.replace(/\s/g, ''))) return 'Email hoặc số điện thoại đã được sử dụng.';
    const next = [...accounts, { ...account, email: account.email.trim().toLowerCase(), phone: account.phone.replace(/\s/g, '') }];
    await write(ACCOUNTS, JSON.stringify(next));
    setAccounts(next);
    await write(SESSION, account.email.trim().toLowerCase());
    setUser(identity(account));
    return null;
  }
  async function logout() { await write(SESSION, null); setUser(null); setRecovery(null); }
  function beginRecovery(credential: string, method: 'sms' | 'email') {
    const normalized = credential.trim().toLowerCase().replace(/\s/g, '');
    const account = accounts.find(a => method === 'sms' ? a.phone === normalized : a.email === normalized);
    if (!account) return 'Không tìm thấy tài khoản tương ứng.';
    setRecovery({ email: account.email, verified: false });
    return null;
  }
  function verifyOtp(code: string) { if (code !== '123456' || !recovery) return false; setRecovery({ ...recovery, verified: true }); return true; }
  async function resetPassword(password: string) {
    if (!recovery?.verified) return false;
    const updated = accounts.map(a => a.email === recovery.email ? { ...a, password } : a);
    await write(ACCOUNTS, JSON.stringify(updated));
    setAccounts(updated);
    setRecovery(null);
    return true;
  }
  return <AuthContext.Provider value={{ ready, user, savedCredential, login, register, logout, beginRecovery, verifyOtp, resetPassword, recovery }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('AuthProvider is missing'); return context; }
