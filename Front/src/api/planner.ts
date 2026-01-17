import client from './client';

export interface PlannerStudent {
  studentId: number;
  name: string;
  submitted: boolean;
  submittedAt: string | null; // yyyy-MM-dd
  content: string | null;
}

export interface PlannerResponse {
  date: string; // yyyy-MM-dd
  students: PlannerStudent[];
}

// 개발 환경용 Mock 데이터
const getMockPlannerData = (date: string): PlannerResponse => {
  return {
    date,
    students: [
      {
        studentId: 1,
        name: '홍길동',
        submitted: true,
        submittedAt: date,
        content: '오늘 수학 문제집 30쪽 완료',
      },
      {
        studentId: 2,
        name: '이영희',
        submitted: true,
        submittedAt: date,
        content: '영어 단어 암기 50개 완료',
      },
      {
        studentId: 3,
        name: '김철수',
        submitted: false,
        submittedAt: null,
        content: null,
      },
    ],
  };
};

/**
 * 플래너 제출 현황 조회
 * GET /api/v1/planner?date=YYYY-MM-DD
 */
export const getPlannerByDate = async (date: string): Promise<PlannerResponse> => {
  try {
    const response = await client.get<PlannerResponse>('/planner', {
      params: { date },
    });
    return response.data;
  } catch (error: any) {
    // 개발 환경에서는 mock 데이터 반환
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn('⚠️ 백엔드 API 미구현, Mock 데이터 사용:', date);
      return new Promise((resolve) => {
        setTimeout(() => resolve(getMockPlannerData(date)), 300);
      });
    }
    throw error;
  }
};
