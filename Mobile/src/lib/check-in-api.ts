import { authenticatedFetch, baseUrl } from '@/lib/account-api';

export type CheckInQrToken = {
  token: string;
  shortCode: string;
  issuedAt: string;
  expiresAt: string;
  expiresIn: number;
  DangKyID: number;
  HoiVienID: number;
};

export type ApiCheckInRecord = {
  CheckInID: number;
  HoiVienID: number;
  ThoiGianCheckIn: string;
  ThoiGianCheckOut: string | null;
  TrangThai: 'CHECKED_IN' | 'CHECKED_OUT';
};

export type GymCrowding = {
  currentCount: number;
  sampleSessions: number;
  days: number;
  dateFrom: string;
  dateTo: string;
  hours: { hour: number; sessions: number; averageCount: number }[];
};

export async function getGymCrowding(signal?: AbortSignal): Promise<GymCrowding> {
  return readResponse<GymCrowding>(await authenticatedFetch(`${baseUrl}/checkin/crowding`, { signal }));
}

export class CheckInApiError extends Error {
  constructor(
    message: string,
    readonly code?: string
  ) {
    super(message);
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string; code?: string })
    | null;
  if (!response.ok) {
    throw new CheckInApiError(
      data?.message || `HTTP ${response.status}`,
      data?.code
    );
  }
  return data as T;
}

export async function createCheckInToken(
  accountId: number
): Promise<CheckInQrToken> {
  const response = await authenticatedFetch(`${baseUrl}/checkin/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ TaiKhoanID: accountId }),
  });
  return readResponse<CheckInQrToken>(response);
}

export async function getCheckInHistory(
  accountId: number
): Promise<ApiCheckInRecord[]> {
  const response = await authenticatedFetch(
    `${baseUrl}/checkin/history/account/${accountId}`
  );
  return readResponse<ApiCheckInRecord[]>(response);
}
