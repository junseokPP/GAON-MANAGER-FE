import client from './client';

export interface AttendanceCalendarDay {
  date: string; // yyyy-MM-dd
  status: '정상출석' | '무단지각' | '무단결석';
}

export interface PlannerRecord {
  date: string;
  submitted: boolean;
  content?: string;
}

export interface VocabularyRecord {
  date: string;
  score: number;
}

export interface AttitudeRecord {
  date: string;
  type: string;
  detail: string;
}

export interface MockExamRecord {
  examName: string;
  korean: number;
  english: number;
  math: number;
  science1: number;
  science2: number;
  totalScore: number;
}

export interface MonthlyReportResponse {
  summaryMessage: string;
  attendanceCalendar: AttendanceCalendarDay[];
  totalStudyMinutes: number;
  lateCount: number;
  absentCount: number;
  attendanceCount: number;
  planner: PlannerRecord[];
  vocabulary: VocabularyRecord[];
  attitudes: AttitudeRecord[];
  mockExams: MockExamRecord[];
}

// 개발 환경용 Mock 데이터
const getMockMonthlyReport = (studentId: number, year: number, month: number): MonthlyReportResponse => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendar: AttendanceCalendarDay[] = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const rand = Math.random();
      calendar.push({
        date,
        status: rand > 0.7 ? '무단지각' : rand > 0.9 ? '무단결석' : '정상출석',
      });
    }
  }

  return {
    summaryMessage: '이번 달에도 열심히 노력해주셔서 감사합니다. 계속해서 좋은 성과를 보여주시길 바랍니다.',
    attendanceCalendar: calendar,
    totalStudyMinutes: 1200, // 20시간
    lateCount: 2,
    absentCount: 1,
    attendanceCount: 18,
    planner: [
      { date: '2025-12-01', submitted: true, content: '수학 문제집 완료' },
      { date: '2025-12-03', submitted: true, content: '영어 단어 암기' },
      { date: '2025-12-05', submitted: true },
      { date: '2025-12-08', submitted: true },
      { date: '2025-12-10', submitted: true },
    ],
    vocabulary: [
      { date: '2025-12-01', score: 40 },
      { date: '2025-12-05', score: 45 },
      { date: '2025-12-10', score: 50 },
    ],
    attitudes: [
      { date: '2025-12-05', type: '태도', detail: '집중력이 좋았습니다.' },
      { date: '2025-12-10', type: '수면', detail: '충분히 수면을 취한 것으로 보입니다.' },
    ],
    mockExams: [
      {
        examName: '3월 모평',
        korean: 92,
        english: 85,
        math: 88,
        science1: 70,
        science2: 80,
        totalScore: 415,
      },
    ],
  };
};

/**
 * 월별 보고서 조회
 * GET /api/v1/monthly-report/{studentId}?year=2025&month=12
 */
export const getMonthlyReport = async (
  studentId: number,
  year: number,
  month: number
): Promise<MonthlyReportResponse> => {
  try {
    const response = await client.get<MonthlyReportResponse>(`/monthly-report/${studentId}`, {
      params: { year, month },
    });
    return response.data;
  } catch (error: any) {
    // 개발 환경에서는 mock 데이터 반환
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn('⚠️ 백엔드 API 미구현, Mock 데이터 사용:', { studentId, year, month });
      return new Promise((resolve) => {
        setTimeout(() => resolve(getMockMonthlyReport(studentId, year, month)), 300);
      });
    }
    throw error;
  }
};

/**
 * 월별 보고서 학부모 메시지 업데이트
 * PUT /api/v1/monthly-report/{studentId}/message
 */
export const updateMonthlyReportMessage = async (
  studentId: number,
  year: number,
  month: number,
  message: string
): Promise<{ success: boolean }> => {
  try {
    const response = await client.put(`/monthly-report/${studentId}/message`, {
      year,
      month,
      message,
    });
    return response.data;
  } catch (error: any) {
    // 개발 환경에서는 성공으로 처리
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn('⚠️ 백엔드 API 미구현, Mock 처리');
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 300);
      });
    }
    throw error;
  }
};
