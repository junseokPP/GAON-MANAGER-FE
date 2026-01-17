import client from './client';

export interface MockExamScore {
  id: number;
  studentId: number;
  studentName: string;
  examName: string; // 예: "12월 학평"
  korean: number;
  english: number;
  math: number;
  science1: number;
  science2: number;
  totalScore: number;
  date: string; // yyyy-MM-dd
}

export interface MockExamCreateRequest {
  studentId: number;
  examName: string;
  korean: number;
  english: number;
  math: number;
  science1: number;
  science2: number;
}

// 개발 환경용 Mock 데이터
const getMockExamData = (): MockExamScore[] => {
  return [
    {
      id: 1,
      studentId: 1,
      studentName: '홍길동',
      examName: '3월 모평',
      korean: 92,
      english: 85,
      math: 88,
      science1: 70,
      science2: 80,
      totalScore: 415,
      date: '2025-03-15',
    },
    {
      id: 2,
      studentId: 2,
      studentName: '이영희',
      examName: '3월 모평',
      korean: 95,
      english: 90,
      math: 92,
      science1: 85,
      science2: 88,
      totalScore: 450,
      date: '2025-03-15',
    },
    {
      id: 3,
      studentId: 3,
      studentName: '김철수',
      examName: '3월 모평',
      korean: 78,
      english: 75,
      math: 80,
      science1: 65,
      science2: 70,
      totalScore: 368,
      date: '2025-03-15',
    },
  ];
};

/**
 * 모의고사 성적 조회
 * GET /api/v1/mock-exam
 */
export const getMockExamScores = async (): Promise<MockExamScore[]> => {
  try {
    const response = await client.get<MockExamScore[]>('/mock-exam');
    return response.data;
  } catch (error: any) {
    // 개발 환경에서는 mock 데이터 반환
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn('⚠️ 백엔드 API 미구현, Mock 데이터 사용');
      return new Promise((resolve) => {
        setTimeout(() => resolve(getMockExamData()), 300);
      });
    }
    throw error;
  }
};

/**
 * 모의고사 성적 입력
 * POST /api/v1/mock-exam
 */
export const createMockExamScore = async (
  data: MockExamCreateRequest
): Promise<MockExamScore> => {
  try {
    const response = await client.post<MockExamScore>('/mock-exam', data);
    return response.data;
  } catch (error: any) {
    // 개발 환경에서는 mock 데이터 반환
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn('⚠️ 백엔드 API 미구현, Mock 처리');
      return new Promise((resolve) => {
        setTimeout(() => {
          const totalScore = data.korean + data.english + data.math + data.science1 + data.science2;
          resolve({
            id: Date.now(),
            studentId: data.studentId,
            studentName: `학생${data.studentId}`,
            examName: data.examName,
            korean: data.korean,
            english: data.english,
            math: data.math,
            science1: data.science1,
            science2: data.science2,
            totalScore,
            date: new Date().toISOString().split('T')[0],
          });
        }, 300);
      });
    }
    throw error;
  }
};

/**
 * 모의고사 성적 수정
 * PUT /api/v1/mock-exam/{id}
 */
export const updateMockExamScore = async (
  id: number,
  data: Partial<MockExamCreateRequest>
): Promise<MockExamScore> => {
  try {
    const response = await client.put<MockExamScore>(`/mock-exam/${id}`, data);
    return response.data;
  } catch (error: any) {
    // 개발 환경에서는 mock 데이터 반환
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn('⚠️ 백엔드 API 미구현, Mock 처리');
      return new Promise((resolve) => {
        setTimeout(() => {
          const existing = getMockExamData().find((s) => s.id === id);
          if (existing) {
            const updated = {
              ...existing,
              ...data,
              totalScore: (data.korean || existing.korean) +
                (data.english || existing.english) +
                (data.math || existing.math) +
                (data.science1 || existing.science1) +
                (data.science2 || existing.science2),
            };
            resolve(updated);
          } else {
            throw new Error('기록을 찾을 수 없습니다.');
          }
        }, 300);
      });
    }
    throw error;
  }
};
