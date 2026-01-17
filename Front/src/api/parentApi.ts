import { LinkParentChildRequest, LinkParentChildResponse } from './types';

const MOCK_DELAY = 500;

const delay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY);
  });
};

// Mock 학부모-학생 연결 데이터
const STORAGE_KEY = 'mockParentChildLinks';

const getMockLinks = (): Array<{ parentId: number; studentId: number }> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // 초기 mock 데이터
  return [
    { parentId: 1, studentId: 1 },
    { parentId: 2, studentId: 2 },
  ];
};

const saveMockLinks = (links: Array<{ parentId: number; studentId: number }>): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
};

export const linkParentChild = async (data: LinkParentChildRequest): Promise<LinkParentChildResponse> => {
  const links = getMockLinks();
  
  // 이미 연결되어 있는지 확인
  const exists = links.some(
    (link) => link.parentId === data.parentId && link.studentId === data.studentId
  );
  
  if (exists) {
    return delay({
      success: true,
      message: '이미 연결되어 있습니다.',
    });
  }
  
  // 연결 추가
  links.push({
    parentId: data.parentId,
    studentId: data.studentId,
  });
  
  saveMockLinks(links);
  
  return delay({
    success: true,
    message: '학부모-학생 연결이 완료되었습니다.',
  });
};
