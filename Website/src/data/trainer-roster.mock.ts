export type ShiftType = 'pt' | 'floor_duty' | 'available' | 'leave' | 'break'
export type TrainerShift = {
  id: number
  trainerId: number
  trainerName: string
  trainerLevel: string
  date: string
  startTime: string
  endTime: string
  type: ShiftType
  memberName?: string
  activity?: string
  status: string
  branch: string
}
export const trainerShifts: TrainerShift[] = [
  {
    id: 1,
    trainerId: 1,
    trainerName: 'Vũ Hoàng Nam',
    trainerLevel: 'Master Coach',
    date: '2026-09-18',
    startTime: '06:00',
    endTime: '08:00',
    type: 'floor_duty',
    activity: 'Trực sàn tầng 2',
    status: 'confirmed',
    branch: 'Vincom Q.1',
  },
  {
    id: 2,
    trainerId: 1,
    trainerName: 'Vũ Hoàng Nam',
    trainerLevel: 'Master Coach',
    date: '2026-09-18',
    startTime: '08:00',
    endTime: '09:30',
    type: 'pt',
    memberName: 'Alex Trần',
    activity: 'Biomechanics',
    status: 'confirmed',
    branch: 'Vincom Q.1',
  },
  {
    id: 3,
    trainerId: 2,
    trainerName: 'Đặng Thảo Linh',
    trainerLevel: 'Senior PT',
    date: '2026-09-18',
    startTime: '07:00',
    endTime: '08:00',
    type: 'available',
    activity: 'Trống',
    status: 'open',
    branch: 'Thảo Điền Hub',
  },
  {
    id: 4,
    trainerId: 2,
    trainerName: 'Đặng Thảo Linh',
    trainerLevel: 'Senior PT',
    date: '2026-09-18',
    startTime: '08:00',
    endTime: '10:00',
    type: 'pt',
    memberName: 'Nguyễn Mai',
    activity: 'Cadillac Core',
    status: 'confirmed',
    branch: 'Thảo Điền Hub',
  },
  {
    id: 5,
    trainerId: 3,
    trainerName: 'Lê Minh Tuấn',
    trainerLevel: 'Pro Trainer',
    date: '2026-09-18',
    startTime: '06:00',
    endTime: '12:00',
    type: 'break',
    activity: 'Ca sáng nghỉ xoay ca',
    status: 'confirmed',
    branch: 'Crescent Elite Q.7',
  },
  {
    id: 6,
    trainerId: 4,
    trainerName: 'Nguyễn Quang Huy',
    trainerLevel: 'Senior PT',
    date: '2026-09-18',
    startTime: '06:00',
    endTime: '10:00',
    type: 'leave',
    activity: 'Nghỉ phép buổi sáng',
    status: 'approved',
    branch: 'West Lake HN',
  },
]
