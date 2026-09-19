export type SessionStatus =
  | 'upcoming'
  | 'live'
  | 'completed'
  | 'reschedule'
  | 'no_show'
export type PtSession = {
  id: number
  code: string
  date: string
  startTime: string
  endTime: string
  memberId: string
  memberName: string
  memberAvatar: string
  membershipTier: string
  trainerId: number
  trainerName: string
  trainerAvatar: string
  trainerLevel: string
  packageName: string
  sessionUsed: number
  sessionTotal: number
  branch: string
  room: string
  checkInAt: string
  status: SessionStatus
}
export const ptSessions: PtSession[] = [
  {
    id: 92,
    code: 'PT-2410-092',
    date: '2026-09-18',
    startTime: '16:00',
    endTime: '17:00',
    memberId: 'HV-88921',
    memberName: 'Phan Tuấn Hùng',
    memberAvatar: 'PH',
    membershipTier: 'Diamond',
    trainerId: 1,
    trainerName: 'Vũ Hoàng Nam',
    trainerAvatar: 'VN',
    trainerLevel: 'Master Coach',
    packageName: 'Diamond PT 24',
    sessionUsed: 14,
    sessionTotal: 24,
    branch: 'Vincom Q.1',
    room: 'Studio Pilates 02',
    checkInAt: '15:52',
    status: 'live',
  },
  {
    id: 93,
    code: 'PT-2410-093',
    date: '2026-09-18',
    startTime: '16:15',
    endTime: '17:15',
    memberId: 'HV-66419',
    memberName: 'Ngô Hoài An',
    memberAvatar: 'NA',
    membershipTier: 'Platinum',
    trainerId: 2,
    trainerName: 'Đặng Thảo Linh',
    trainerAvatar: 'TL',
    trainerLevel: 'Senior PT',
    packageName: 'Pilates Elite',
    sessionUsed: 8,
    sessionTotal: 16,
    branch: 'Thảo Điền Hub',
    room: 'Pilates 01',
    checkInAt: '16:08',
    status: 'live',
  },
  {
    id: 94,
    code: 'PT-2410-094',
    date: '2026-09-18',
    startTime: '17:00',
    endTime: '18:00',
    memberId: 'HV-33109',
    memberName: 'Lê Đăng Khoa',
    memberAvatar: 'LK',
    membershipTier: 'Gold',
    trainerId: 1,
    trainerName: 'Vũ Hoàng Nam',
    trainerAvatar: 'VN',
    trainerLevel: 'Master Coach',
    packageName: 'Strength 12',
    sessionUsed: 3,
    sessionTotal: 12,
    branch: 'Vincom Q.1',
    room: 'Free Weight',
    checkInAt: '—',
    status: 'upcoming',
  },
  {
    id: 90,
    code: 'PT-2410-090',
    date: '2026-09-18',
    startTime: '14:00',
    endTime: '15:00',
    memberId: 'HV-10294',
    memberName: 'Võ Thị Mai',
    memberAvatar: 'VM',
    membershipTier: 'Diamond',
    trainerId: 5,
    trainerName: 'Trần Mai Anh',
    trainerAvatar: 'MA',
    trainerLevel: 'Pro Trainer',
    packageName: 'Nutrition PT',
    sessionUsed: 9,
    sessionTotal: 12,
    branch: 'Vincom Q.1',
    room: 'Studio 03',
    checkInAt: '13:55',
    status: 'completed',
  },
  {
    id: 91,
    code: 'PT-2410-091',
    date: '2026-09-18',
    startTime: '15:00',
    endTime: '16:00',
    memberId: 'HV-49931',
    memberName: 'Trần Bích Ngọc',
    memberAvatar: 'BN',
    membershipTier: 'Gold',
    trainerId: 3,
    trainerName: 'Lê Minh Tuấn',
    trainerAvatar: 'MT',
    trainerLevel: 'Pro Trainer',
    packageName: 'Boxing 20',
    sessionUsed: 5,
    sessionTotal: 20,
    branch: 'Crescent Elite Q.7',
    room: 'Boxing Ring',
    checkInAt: '—',
    status: 'reschedule',
  },
]
