import client from './client';

export type AttitudeType = '수면' | '태도' | '태블릿';

export interface AttitudeRecord {
  id: number;
  studentId: number;
  name: string;
  type: AttitudeType;
  detail: string;
  createdAt: string; // yyyy-MM-dd HH:mm
}

export interface AttitudeCreateRequest {
  studentId: number;
  type: AttitudeType;
  detail: string;
}

// 개발 환경용 Mock 데이터
const getMockAttitudeData = (): AttitudeRecord[] => {
  return [
    {
      id: 1,
      studentId: 1,
      name: '홍길동',
      type: '수면',
      detail: '고개 숙이고 10분 정도 졸음',
      createdAt: '2025-12-12 14:22',
    },
    {
      id: 2,
      studentId: 1,
      name: '홍길동',
      type: '태도',
      detail: '집중력이 좋았습니다.',
      createdAt: '2025-12-11 16:30',
    },
    {
      id: 3,
      studentId: 2,
      name: '이영희',
      type: '태블릿',
      detail: '태블릿 사용 시간이 적절했습니다.',
      createdAt: '2025-12-12 15:00',
    },
  ];
};

/**
 * 학습 태도 기록 조회
 * GET /api/v1/attitude?date=YYYY-MM-DD (optional)
 */
export const getAttitudeRecords = async (date?: string): Promise<AttitudeRecord[]> => {
  try {
    const response = await client.get<AttitudeRecord[]>('/attitude', {
      params: date ? { date } : undefined,
    });
    return response.data;
  } catch (error: any) {
    // 개발 환경에서는 mock 데이터 반환
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn('⚠️ 백엔드 API 미구현, Mock 데이터 사용');
      return new Promise((resolve) => {
        setTimeout(() => resolve(getMockAttitudeData()), 300);
      });
    }
    throw error;
  }
};

/**
 * 학습 태도 기록 작성
 * POST /api/v1/attitude
 */
export const createAttitudeRecord = async (
  data: AttitudeCreateRequest
): Promise<AttitudeRecord> => {
  try {
    const response = await client.post<AttitudeRecord>('/attitude', data);
    return response.data;
  } catch (error: any) {
    // 개발 환경에서는 mock 데이터 반환
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn('⚠️ 백엔드 API 미구현, Mock 처리');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: Date.now(),
            studentId: data.studentId,
            name: `학생${data.studentId}`,
            type: data.type,
            detail: data.detail,
            createdAt: new Date().toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }).replace(/,/g, ''),
          });
        }, 300);
      });
    }
    throw error;
  }
};
