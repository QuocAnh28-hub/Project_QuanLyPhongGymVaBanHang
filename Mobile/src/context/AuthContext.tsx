import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { readLocal, writeLocal } from '@/lib/local-store';

type Account = { name: string; email: string; phone: string; password: string; role: 'member'; avatar: string | null; height: number | null; weight: number | null; birthDate: string | null; fitnessGoal: string | null };
type Registration = Pick<Account, 'name' | 'email' | 'phone' | 'password'>;
type Recovery = { email: string; verified: boolean };
type AuthValue = {
  ready: boolean; user: Omit<Account, 'password'> | null; savedCredential: string;
  login: (credential: string, password: string, remember: boolean) => Promise<boolean>;
  register: (account: Registration) => Promise<string | null>;
  logout: () => Promise<void>;
  beginRecovery: (credential: string, method: 'sms' | 'email') => string | null;
  verifyOtp: (code: string) => boolean;
  resetPassword: (password: string) => Promise<boolean>;
  recovery: Recovery | null;
};
const SEED: Account = { name: 'Admin QA-Gym', email: 'admin', phone: '0123456789', password: '12345678', role: 'member', avatar: null, height: 178, weight: 74, birthDate: '1998-09-12', fitnessGoal: 'Tăng cơ siết mỡ (Lean Muscle)' };
const ACCOUNTS = 'qa-gym-dev-accounts-v2';
const SESSION = 'qa-gym-dev-session-v2';
const REMEMBERED = 'qa-gym-dev-credential-v2';
const AuthContext = createContext<AuthValue | null>(null);

// ponytail: local development accounts only; replace this store with server auth before production.
function identity(account: Account) { const { password: _password, ...user } = account; return user; }
function asMember(account: Registration & Partial<Account>): Account {
  const profile = account.email.toLowerCase() === SEED.email ? SEED : { avatar: null, height: null, weight: null, birthDate: null, fitnessGoal: null };
  return { ...profile, ...account, role: 'member' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthValue['user']>(null);
  const [accounts, setAccounts] = useState<Account[]>([SEED]);
  const [savedCredential, setSavedCredential] = useState('');
  const [recovery, setRecovery] = useState<Recovery | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const [savedAccounts, session, remembered] = await Promise.all([readLocal(ACCOUNTS), readLocal(SESSION), readLocal(REMEMBERED)]);
        const list: Account[] = savedAccounts ? JSON.parse(savedAccounts) : [];
        const all = list.length ? list.map(asMember) : [SEED];
        if (list.length) await writeLocal(ACCOUNTS, JSON.stringify(all));
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
    await writeLocal(SESSION, account.email);
    await writeLocal(REMEMBERED, remember ? credential.trim() : null);
    setSavedCredential(remember ? credential.trim() : '');
    setUser(identity(account));
    return true;
  }
  async function register(account: Registration) {
    if (accounts.some(a => a.email.toLowerCase() === account.email.trim().toLowerCase() || a.phone.replace(/\s/g, '') === account.phone.replace(/\s/g, ''))) return 'Email hoặc số điện thoại đã được sử dụng.';
    const next = [...accounts, asMember({ ...account, email: account.email.trim().toLowerCase(), phone: account.phone.replace(/\s/g, '') })];
    await writeLocal(ACCOUNTS, JSON.stringify(next));
    setAccounts(next);
    await writeLocal(SESSION, account.email.trim().toLowerCase());
    setUser(identity(next[next.length - 1]));
    return null;
  }
  async function logout() { await writeLocal(SESSION, null); setUser(null); setRecovery(null); }
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
    await writeLocal(ACCOUNTS, JSON.stringify(updated));
    setAccounts(updated);
    setRecovery(null);
    return true;
  }
  return <AuthContext.Provider value={{ ready, user, savedCredential, login, register, logout, beginRecovery, verifyOtp, resetPassword, recovery }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('AuthProvider is missing'); return context; }
