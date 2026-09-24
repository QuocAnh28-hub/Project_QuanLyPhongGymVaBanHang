import { requestRecoveryCode, verifyRecoveryCode, changeRecoveredPassword } from '@/lib/recovery-api';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { readLocal, writeLocal } from '@/lib/local-store';
import { getAccount, getAccounts, isActiveCustomer, registerAccount, type ApiAccount } from '@/lib/account-api';
import { getMemberProfile } from '@/lib/profile-api';

type Account = { accountId: number | null; name: string; email: string; phone: string; password: string; role: 'member'; avatar: string | null; height: number | null; weight: number | null; birthDate: string | null; fitnessGoal: string | null };
type Registration = Pick<Account, 'name' | 'email' | 'phone' | 'password'>;
type Recovery = { email: string; verified: boolean; resetToken?: string; resendAt: number };
type AuthValue = {
  ready: boolean; user: Omit<Account, 'password'> | null; savedCredential: string;
  login: (credential: string, password: string, remember: boolean) => Promise<boolean>;
  register: (account: Registration) => Promise<string | null>;
  logout: () => Promise<void>;
  beginRecovery: (email: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
  recovery: Recovery | null;
  refreshUser: () => Promise<void>;
};

const SEED: Account = { accountId: null, name: 'Admin QA-Gym', email: 'admin', phone: '0123456789', password: '12345678', role: 'member', avatar: null, height: 178, weight: 74, birthDate: '1998-09-12', fitnessGoal: 'Tăng cơ siết mỡ (Lean Muscle)' };
const ACCOUNTS = 'qa-gym-dev-accounts-v2';

const SESSION = 'qa-gym-dev-session-v2';
const REMEMBERED = 'qa-gym-dev-credential-v2';
const API_SESSION = 'qa-gym-api-session-v1';
const AuthContext = createContext<AuthValue | null>(null);

async function profileIdentity(account: ApiAccount): Promise<Omit<Account, 'password'>> {
  const profile = await getMemberProfile(account.TaiKhoanID);
  return {
    accountId: account.TaiKhoanID, name: profile.HoTen, email: account.Email,
    phone: profile.SoDienThoai || '', role: 'member', avatar: profile.AnhDaiDien,
    height: profile.ChieuCao, weight: profile.CanNang,
    birthDate: profile.NgaySinh, fitnessGoal: profile.MucTieuTheHinh,
  };
}

function asMember(account: Registration & Partial<Account>): Account {
  const profile = account.email.toLowerCase() === SEED.email ? SEED : { accountId: null, avatar: null, height: null, weight: null, birthDate: null, fitnessGoal: null };
  return { ...profile, ...account, role: 'member' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthValue['user']>(null);
  const [savedCredential, setSavedCredential] = useState('');
  const [recovery, setRecovery] = useState<Recovery | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const [remembered, apiSession] = await Promise.all([readLocal(REMEMBERED), readLocal(API_SESSION)]);
        if (apiSession) {
          const account = await getAccount(Number(apiSession));
          if (account && isActiveCustomer(account)) setUser(await profileIdentity(account));
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
    setUser(await profileIdentity(account));
    return true;
  }
  async function refreshUser() {
    if (!user?.accountId) return;
    const account = await getAccount(user.accountId);
    if (account && isActiveCustomer(account)) setUser(await profileIdentity(account));
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
  async function beginRecovery(email: string) {
    const normalized = email.trim().toLowerCase();
    const result = await requestRecoveryCode(normalized);
    setRecovery({ email: normalized, verified: false, resendAt: Date.now() + result.retryAfter * 1000 });
  }
  async function verifyOtp(code: string) {
    if (!recovery) return false;
    const result = await verifyRecoveryCode(recovery.email, code);
    if (!result.resetToken) return false;
    setRecovery({ ...recovery, verified: true, resetToken: result.resetToken });
    return true;
  }
  async function resetPassword(password: string) {
    if (!recovery?.verified || !recovery.resetToken) return false;
    await changeRecoveredPassword(recovery.email, recovery.resetToken, password);
    setRecovery(null);
    return true;
  }
  return <AuthContext.Provider value={{ ready, user, savedCredential, login, register, logout, refreshUser, beginRecovery, verifyOtp, resetPassword, recovery }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('AuthProvider is missing'); return context; }
