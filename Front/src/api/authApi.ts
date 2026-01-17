import { LoginRequest, LoginResponse, ParentSetupRequest, ParentSetupResponse } from './types';

const MOCK_DELAY = 500;

const delay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY);
  });
};

// Mock 사용자 데이터
const MOCK_USERS = [
  { phone: '010-1234-5678', password: 'admin123', role: 'ADMIN' as const },
  { phone: '010-2345-6789', password: 'director123', role: 'DIRECTOR' as const },
  { phone: '010-3456-7890', password: 'student123', role: 'STUDENT' as const },
  { phone: '010-1111-2222', password: 'parent123', role: 'PARENT' as const },
];

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const user = MOCK_USERS.find(
    (u) => u.phone === data.phone && u.password === data.password
  );
  
  if (!user) {
    throw new Error('전화번호 또는 비밀번호가 올바르지 않습니다.');
  }
  
  const response: LoginResponse = {
    accessToken: `mock_token_${user.phone}_${Date.now()}`,
    refreshToken: `mock_refresh_token_${user.phone}_${Date.now()}`,
    role: user.role,
  };
  
  // 토큰 저장
  localStorage.setItem('accessToken', response.accessToken);
  localStorage.setItem('refreshToken', response.refreshToken);
  
  return delay(response);
};

export const parentSetupPassword = async (data: ParentSetupRequest): Promise<ParentSetupResponse> => {
  // Mock 인증 코드 검증 (실제로는 서버에서 검증)
  const STORAGE_KEY_VERIFICATION = 'mockVerificationCodes';
  const stored = localStorage.getItem(STORAGE_KEY_VERIFICATION);
  const codes = stored ? JSON.parse(stored) : {};
  
  // Mock: 인증 코드는 항상 '123456'로 통과
  if (data.verificationCode !== '123456') {
    throw new Error('인증 코드가 올바르지 않습니다.');
  }
  
  // 비밀번호 설정 완료
  const response: ParentSetupResponse = {
    success: true,
    message: '비밀번호가 성공적으로 설정되었습니다.',
  };
  
  return delay(response);
};
