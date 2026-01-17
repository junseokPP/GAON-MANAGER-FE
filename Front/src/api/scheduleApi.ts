import { AdminSchedule, StudentSchedule, DayOfWeek, ScheduleUpdateRequest, ScheduleUpdateAllRequest, ScheduleWithAttendanceResponse, FinalStatus } from './types';

const MOCK_DELAY = 500;

const delay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY);
  });
};

// Mock 스케줄 데이터 저장소
const STORAGE_KEY_SCHEDULES = 'mockSchedules';
const STORAGE_KEY_STUDENT_SCHEDULES = 'mockStudentSchedules';

// Mock 관리자 스케줄 데이터
const getMockAdminSchedules = (): ScheduleWithAttendanceResponse[] => {
  const stored = localStorage.getItem(STORAGE_KEY_SCHEDULES);
  if (stored) {
    return JSON.parse(stored);
  }
  // 초기 mock 데이터
  return [
    {
      scheduleId: 1,
      studentId: 1,
      studentName: '홍길동',
      day: 'MONDAY',
      scheduledAttendTime: '15:00',
      scheduledLeaveTime: '21:00',
      scheduledOutings: [
        { startTime: '18:00', endTime: '18:30', title: '저녁식사' },
      ],
      memo: '수학 집중 학습',
      status: 'APPROVED',
      attendanceStatusText: '미등원' as FinalStatus,
    },
    {
      scheduleId: 2,
      studentId: 2,
      studentName: '이영희',
      day: 'MONDAY',
      scheduledAttendTime: '16:00',
      scheduledLeaveTime: '20:30',
      scheduledOutings: null,
      memo: null,
      status: 'APPROVED',
      attendanceStatusText: '출석' as FinalStatus,
    },
  ];
};

const saveMockAdminSchedules = (schedules: ScheduleWithAttendanceResponse[]): void => {
  localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
};

// Mock 학생 스케줄 데이터
const getMockStudentSchedules = (): StudentSchedule[] => {
  const stored = localStorage.getItem(STORAGE_KEY_STUDENT_SCHEDULES);
  if (stored) {
    return JSON.parse(stored);
  }
  // 초기 mock 데이터
  return [
    {
      scheduleId: 1,
      studentId: 1,
      day: 'MONDAY',
      attendTime: '15:00',
      leaveTime: '21:00',
      outings: [
        { startTime: '18:00', endTime: '18:30', reason: '저녁식사' },
      ],
      status: 'APPROVED',
      memo: '수학 집중 학습',
    },
  ];
};

const saveMockStudentSchedules = (schedules: StudentSchedule[]): void => {
  localStorage.setItem(STORAGE_KEY_STUDENT_SCHEDULES, JSON.stringify(schedules));
};

// 백엔드에서 ScheduleWithAttendanceResponse[]를 반환
export const getAdminSchedules = async (day: DayOfWeek): Promise<ScheduleWithAttendanceResponse[]> => {
  const schedules = getMockAdminSchedules();
  const filtered = schedules.filter((s) => s.day === day);
  return delay(filtered);
};

export const getStudentSchedules = async (day?: DayOfWeek): Promise<StudentSchedule[]> => {
  const schedules = getMockStudentSchedules();
  if (day) {
    return delay(schedules.filter((s) => s.day === day));
  }
  return delay(schedules);
};

export const requestScheduleUpdate = async (scheduleId: number, data: ScheduleUpdateRequest): Promise<void> => {
  const schedules = getMockStudentSchedules();
  const index = schedules.findIndex((s) => s.scheduleId === scheduleId);
  if (index >= 0) {
    schedules[index] = {
      ...schedules[index],
      ...data,
      status: 'PENDING', // 수정 요청은 PENDING 상태
    };
    saveMockStudentSchedules(schedules);
  }
  return delay(undefined);
};

export const requestScheduleDelete = async (scheduleId: number): Promise<void> => {
  const schedules = getMockStudentSchedules();
  const filtered = schedules.filter((s) => s.scheduleId !== scheduleId);
  saveMockStudentSchedules(filtered);
  return delay(undefined);
};

export const requestScheduleUpdateAll = async (data: ScheduleUpdateAllRequest): Promise<void> => {
  const schedules = getMockStudentSchedules();
  const updated = schedules.map((s) => ({
    ...s,
    ...data,
    status: 'PENDING' as const,
  }));
  saveMockStudentSchedules(updated);
  return delay(undefined);
};
