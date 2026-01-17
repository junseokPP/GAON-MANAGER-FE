import { AttendanceResponse, AttendanceUpdateRequest, FinalStatus } from './types';

const MOCK_DELAY = 500;

const delay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY);
  });
};

// Mock 출결 데이터 저장소
const STORAGE_KEY = 'mockAttendanceRecords';

const getMockAttendanceRecords = (): AttendanceResponse[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

const saveMockAttendanceRecords = (records: AttendanceResponse[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 5); // HH:mm
};

/**
 * 등원 처리
 * POST /api/v1/attendance/{studentId}/check-in
 */
export const checkIn = async (studentId: number): Promise<AttendanceResponse> => {
  const records = getMockAttendanceRecords();
  const today = getToday();
  
  let record = records.find((r) => r.studentId === studentId && r.date === today);
  
  if (!record) {
    record = {
      attendanceId: Date.now(),
      studentId,
      date: today,
      attendTime: formatTime(new Date()),
      leaveTime: null,
      isOuting: false,
      excuseLate: false,
      excuseAbsent: false,
      finalStatus: '출석' as FinalStatus,
    };
    records.push(record);
  } else {
    record.attendTime = formatTime(new Date());
    record.finalStatus = '출석' as FinalStatus;
  }
  
  saveMockAttendanceRecords(records);
  return delay(record);
};

/**
 * 하원 처리
 * POST /api/v1/attendance/{studentId}/check-out
 */
export const checkOut = async (studentId: number): Promise<AttendanceResponse> => {
  const records = getMockAttendanceRecords();
  const today = getToday();
  
  const record = records.find((r) => r.studentId === studentId && r.date === today);
  
  if (!record) {
    throw new Error('등원 기록이 없습니다.');
  }
  
  record.leaveTime = formatTime(new Date());
  record.finalStatus = '하원' as FinalStatus;
  record.isOuting = false;
  
  saveMockAttendanceRecords(records);
  return delay(record);
};

/**
 * 외출 시작
 * POST /api/v1/attendance/{studentId}/outing/start
 */
export const startOuting = async (studentId: number): Promise<AttendanceResponse> => {
  const records = getMockAttendanceRecords();
  const today = getToday();
  
  const record = records.find((r) => r.studentId === studentId && r.date === today);
  
  if (!record) {
    throw new Error('등원 기록이 없습니다.');
  }
  
  record.isOuting = true;
  record.finalStatus = '외출중' as FinalStatus;
  
  saveMockAttendanceRecords(records);
  return delay(record);
};

/**
 * 외출 복귀
 * POST /api/v1/attendance/{studentId}/outing/end
 */
export const endOuting = async (studentId: number): Promise<AttendanceResponse> => {
  const records = getMockAttendanceRecords();
  const today = getToday();
  
  const record = records.find((r) => r.studentId === studentId && r.date === today);
  
  if (!record || !record.isOuting) {
    throw new Error('외출 기록이 없습니다.');
  }
  
  record.isOuting = false;
  record.finalStatus = '출석' as FinalStatus;
  
  saveMockAttendanceRecords(records);
  return delay(record);
};

/**
 * 통보지각
 * POST /api/v1/attendance/{studentId}/excuse-late
 */
export const excuseLate = async (studentId: number): Promise<AttendanceResponse> => {
  const records = getMockAttendanceRecords();
  const today = getToday();
  
  let record = records.find((r) => r.studentId === studentId && r.date === today);
  
  if (!record) {
    record = {
      attendanceId: Date.now(),
      studentId,
      date: today,
      attendTime: formatTime(new Date()),
      leaveTime: null,
      isOuting: false,
      excuseLate: true,
      excuseAbsent: false,
      finalStatus: '출석' as FinalStatus,
    };
    records.push(record);
  } else {
    record.excuseLate = !record.excuseLate; // 토글
  }
  
  saveMockAttendanceRecords(records);
  return delay(record);
};

/**
 * 통보결석
 * POST /api/v1/attendance/{studentId}/excuse-absent
 */
export const excuseAbsent = async (studentId: number): Promise<AttendanceResponse> => {
  const records = getMockAttendanceRecords();
  const today = getToday();
  
  let record = records.find((r) => r.studentId === studentId && r.date === today);
  
  if (!record) {
    record = {
      attendanceId: Date.now(),
      studentId,
      date: today,
      attendTime: null,
      leaveTime: null,
      isOuting: false,
      excuseLate: false,
      excuseAbsent: true,
      finalStatus: '출석' as FinalStatus,
    };
    records.push(record);
  } else {
    record.excuseAbsent = !record.excuseAbsent; // 토글
  }
  
  saveMockAttendanceRecords(records);
  return delay(record);
};

/**
 * 오늘의 출결 현황 조회
 * GET /api/v1/attendance/today
 */
export const getTodayAttendance = async (): Promise<AttendanceResponse[]> => {
  const records = getMockAttendanceRecords();
  const today = getToday();
  const todayRecords = records.filter((r) => r.date === today);
  return delay(todayRecords);
};

/**
 * 출결 수정
 * PUT /api/v1/attendance/{id}
 */
export const updateAttendance = async (
  id: number,
  payload: AttendanceUpdateRequest
): Promise<AttendanceResponse> => {
  const records = getMockAttendanceRecords();
  const index = records.findIndex((r) => r.attendanceId === id);
  
  if (index === -1) {
    throw new Error('출결 기록을 찾을 수 없습니다.');
  }
  
  // FinalStatus는 payload에서 직접 받지 않으므로 기존 값 유지
  records[index] = {
    ...records[index],
    attendTime: payload.attendTime || records[index].attendTime,
    leaveTime: payload.leaveTime || records[index].leaveTime,
  };
  
  saveMockAttendanceRecords(records);
  return delay(records[index]);
};
