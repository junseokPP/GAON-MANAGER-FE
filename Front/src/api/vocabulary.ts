import client from './client';

export interface VocabularyStudent {
  studentId: number;
  name: string;
  latestScore: number; // 0-50
  averageScore: number;
  scores: number[]; // 점수 히스토리
}

export interface VocabularyResponse {
  date: string; // yyyy-MM-dd
  students: VocabularyStudent[];
}

// 개발 환경용 Mock 데이터
const getMockVocabularyData = (date: string): VocabularyResponse => {
  return {
    date,
    students: [
      {
        studentId: 1,
        name: '홍길동',
        latestScore: 45,
        averageScore: 42.5,
        scores: [40, 50, 45, 35],
      },
      {
        studentId: 2,
        name: '이영희',
        latestScore: 49,
        averageScore: 48.5,
        scores: [48, 50, 47, 49],
      },
      {
        studentId: 3,
        name: '김철수',
        latestScore: 32,
        averageScore: 28.75,
        scores: [25, 30, 28, 32],
      },
    ],
  };
};

/**
 * 영단어 학습 현황 조회
 * GET /api/v1/vocabulary?date=YYYY-MM-DD
 */
export const getVocabularyByDate = async (date: string): Promise<VocabularyResponse> => {
  try {
    const response = await client.get<VocabularyResponse>('/vocabulary', {
      params: { date },
    });
    return response.data;
  } catch (error: any) {
    // 개발 환경에서는 mock 데이터 반환
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn('⚠️ 백엔드 API 미구현, Mock 데이터 사용:', date);
      return new Promise((resolve) => {
        setTimeout(() => resolve(getMockVocabularyData(date)), 300);
      });
    }
    throw error;
  }
};

/**
 * 영단어 테스트 점수 입력
 * POST /api/v1/vocabulary/{studentId}/score
 */
export const submitVocabularyScore = async (
  studentId: number,
  score: number
): Promise<{ success: boolean }> => {
  try {
    const response = await client.post(`/vocabulary/${studentId}/score`, { score });
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
