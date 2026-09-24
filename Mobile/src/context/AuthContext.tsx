import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { readLocal, writeLocal } from '@/lib/local-store';
import { getAccount, getAccounts, isActiveCustomer, registerAccount, type ApiAccount } from '@/lib/account-api';

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
const API_SESSION = 'qa-gym-api-session-v1';
const AuthContext = createContext<AuthValue | null>(null);

// ponytail: local development accounts only; replace this store with server auth before production.
function apiIdentity(account: ApiAccount): Omit<Account, 'password'> {
  return { name: account.Email.split('@')[0], email: account.Email, phone: '', role: 'member', avatar: null, height: null, weight: null, birthDate: null, fitnessGoal: null };
}
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
        const [savedAccounts, remembered, apiSession] = await Promise.all([readLocal(ACCOUNTS), readLocal(REMEMBERED), readLocal(API_SESSION)]);
        const list: Account[] = savedAccounts ? JSON.parse(savedAccounts) : [];
        const all = list.length ? list.map(asMember) : [SEED];
        if (list.length) await writeLocal(ACCOUNTS, JSON.stringify(all));
        setAccounts(all);
        if (apiSession) {
          const account = await getAccount(Number(apiSession));
          if (account && isActiveCustomer(account)) setUser(apiIdentity(account));
          else await writeLocal(API_SESSION, null);
        }
        setSavedCredential(remembered ?? '');
      } catch { setUser(null); }
      finally { setReady(true); }
    })();
  }, []);
  async function login(credential: string, password: string, remember: boolean) {
    const normalized = credential.trim().toLowerCase();
    const account = (await getAccounts()).find(a => a.Email?.toLowerCase() === normalized && a.MatKhau === password);
    if (!account || !isActiveCustomer(account)) return false;
    try {
      await writeLocal(API_SESSION, String(account.TaiKhoanID));
      await writeLocal(REMEMBERED, remember ? credential.trim() : null);
    } catch (error) {
      throw new Error(`Không lưu được phiên đăng nhập: ${error instanceof Error ? error.message : String(error)}`);
    }
    setSavedCredential(remember ? credential.trim() : '');
    setUser(apiIdentity(account));
    return true;
  }
  async function register(account: Registration) {
    await registerAccount({
      ...account,
      name: account.name.trim(),
      email: account.email.trim().toLowerCase(),
      phone: account.phone.replace(/\s/g, '').replace(/^\+84/, '0'),
    });
    return null;
  }
  async function logout() { await Promise.all([writeLocal(SESSION, null), writeLocal(API_SESSION, null)]); setUser(null); setRecovery(null); }
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
