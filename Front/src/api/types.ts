// Auth Types
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role?: 'ADMIN' | 'DIRECTOR' | 'STUDENT' | 'PARENT';
}

// Student Types
export interface StudentCreateRequest {
  name: string;
  phone: string;
  gender: 'Male' | 'Female';
  school: string;
  grade: 'High1' | 'High2' | 'High3' | 'REPEATER';
  parentPhone: string;
  emergencyContact: string;
  seatNumber: number;
  memo?: string;
  registrationDate: string; // YYYY-MM-DD
}

export interface StudentCreateResponse {
  id: number;
  name: string;
  phoneNumber: string;
  gender: 'Male' | 'Female';
  school: string;
  grade: 'High1' | 'High2' | 'High3' | 'REPEATER';
  parentPhoneNumber: string;
  emergencyContact: string;
  seatNumber: number;
  memo?: string;
  registrationDate: string;
  setupUrl?: string;
}

export interface Student {
  id: number;
  name: string;
  phone: string;
  gender: 'Male' | 'Female';
  school: string;
  grade: 'High1' | 'High2' | 'High3' | 'REPEATER';
  parentPhone: string;
  emergencyContact: string;
  seatNumber: number;
  memo?: string;
  registrationDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StudentUpdateRequest {
  name: string;
  school: string;
  grade: 'High1' | 'High2' | 'High3' | 'REPEATER';
  seatNumber: number;
  emergencyContact: string;
  memo?: string;
}

// Parent Setup Types
export interface ParentSetupRequest {
  phoneNumber: string;
  verificationCode: string;
  newPassword: string;
}

export interface ParentSetupResponse {
  success: boolean;
  message: string;
}

// Link Parent Child Types
export interface LinkParentChildRequest {
  parentId: number;
  studentId: number;
}

export interface LinkParentChildResponse {
  success: boolean;
  message: string;
}

// Schedule Types
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface Outing {
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface AdminSchedule {
  scheduleId: number;
  studentId: number;
  studentName: string;
  day: DayOfWeek;
  attendTime: string;
  leaveTime?: string | null;
  outings: Outing[] | null;
  memo?: string | null;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

// 백엔드 ScheduleWithAttendanceResponse 타입
export interface ScheduleWithAttendanceResponse {
  scheduleId: number;
  studentId: number;
  studentName: string;
  day: DayOfWeek;
  scheduledAttendTime: string; // 스케줄 등원시간
  scheduledLeaveTime?: string | null; // 스케줄 하원시간
  scheduledOutings?: Array<{
    startTime: string;
    endTime: string;
    title?: string;
  }> | null; // 스케줄 외출목록
  memo?: string | null;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  attendanceStatusText?: FinalStatus; // 출결 상태 (백엔드에서 내려줌)
}

export interface StudentSchedule {
  scheduleId: number;
  studentId: number;
  day: DayOfWeek;
  attendTime: string;
  leaveTime?: string | null;
  outings: Outing[] | null;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  memo?: string | null;
}

// Schedule Request Types
export interface ScheduleUpdateRequest {
  attendTime: string;
  leaveTime?: string;
  outings?: Outing[];
  memo?: string;
}

export interface ScheduleUpdateAllRequest {
  attendTime: string;
  leaveTime: string;
  memo?: string;
}

// Attendance Types
export type AttendanceStatus = 
  | 'PRESENT'           // 출석
  | 'LEAVE'             // 하원
  | 'OUTING'            // 외출중
  | 'RETURN'            // 복귀
  | 'UNNOTIFIED_LATE'   // 무단지각 (UI 자동 계산)
  | 'UNNOTIFIED_ABSENT' // 무단결석 (UI 자동 계산)
  | 'NOTIFY_LATE'       // 통보지각
  | 'NOTIFY_ABSENT';    // 통보결석

// 백엔드 AttendanceResponse 타입
export type FinalStatus = '출석' | '하원' | '외출중' | '무단결석' | '미등원';

export interface AttendanceResponse {
  attendanceId: number;
  studentId: number;
  date: string;            // yyyy-MM-dd
  attendTime: string | null;
  leaveTime: string | null;
  isOuting: boolean;
  excuseLate: boolean;
  excuseAbsent: boolean;
  finalStatus: FinalStatus;     // "출석" | "하원" | "외출중" | "무단결석" | "미등원"
}

// 공통 Attendance 인터페이스
export interface Attendance {
  studentId: number;
  studentName?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  attendTime?: string; // HH:mm
  leaveTime?: string; // HH:mm
  outingLogs?: Array<{ startTime: string; endTime: string }>; // HH:mm
  memo?: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  status: AttendanceStatus;
  attendTime?: string | null; // HH:mm
  leaveTime?: string | null; // HH:mm
  outings: Array<{ startTime: string; endTime: string }>; // HH:mm
  totalStudyTime?: string; // "HH:mm" format
  memo?: string;
  date: string; // YYYY-MM-DD
  scheduleAttendTime?: string; // 스케줄 등원시간 (HH:mm)
}

export interface AttendanceAction {
  type: 'IN' | 'OUT' | 'LEAVE' | 'RETURN' | 'NOTIFY_LATE' | 'NOTIFY_ABSENT';
  timestamp?: string;
}

export interface AttendanceUpdateRequest {
  status: AttendanceStatus;
  attendTime?: string;
  leaveTime?: string;
  outings?: Array<{ startTime: string; endTime: string }>;
  memo?: string;
}

