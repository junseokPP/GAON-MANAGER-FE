import {
  Student,
  StudentCreateRequest,
  StudentCreateResponse,
  StudentUpdateRequest,
} from './types';

const MOCK_DELAY = 500;

const delay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY);
  });
};

// Mock 학생 데이터 저장소
const STORAGE_KEY = 'mockStudents';

const getMockStudents = (): Student[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // 초기 mock 데이터
  return [
    {
      id: 1,
      name: '홍길동',
      phone: '010-1234-5678',
      gender: 'Male',
      school: '서울고등학교',
      grade: 'High1',
      parentPhone: '010-1111-2222',
      emergencyContact: '010-9999-8888',
      seatNumber: 1,
      memo: '수학 집중 학습 필요',
      registrationDate: '2024-01-15',
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: '이영희',
      phone: '010-2345-6789',
      gender: 'Female',
      school: '서울여자고등학교',
      grade: 'High2',
      parentPhone: '010-2222-3333',
      emergencyContact: '010-8888-7777',
      seatNumber: 2,
      memo: null,
      registrationDate: '2024-02-01',
      status: 'ACTIVE',
    },
    {
      id: 3,
      name: '김철수',
      phone: '010-3456-7890',
      gender: 'Male',
      school: '서울중앙고등학교',
      grade: 'High3',
      parentPhone: '010-3333-4444',
      emergencyContact: '010-7777-6666',
      seatNumber: 3,
      memo: '재수생',
      registrationDate: '2024-01-20',
      status: 'ACTIVE',
    },
  ];
};

const saveMockStudents = (students: Student[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

export const createStudent = async (data: StudentCreateRequest): Promise<StudentCreateResponse> => {
  const students = getMockStudents();
  const newId = Math.max(...students.map((s) => s.id), 0) + 1;
  
  const newStudent: Student = {
    id: newId,
    name: data.name,
    phone: data.phone,
    gender: data.gender,
    school: data.school,
    grade: data.grade,
    parentPhone: data.parentPhone,
    emergencyContact: data.emergencyContact,
    seatNumber: data.seatNumber,
    memo: data.memo,
    registrationDate: data.registrationDate,
    status: 'ACTIVE',
  };
  
  students.push(newStudent);
  saveMockStudents(students);
  
  const response: StudentCreateResponse = {
    id: newStudent.id,
    name: newStudent.name,
    phoneNumber: newStudent.phone,
    gender: newStudent.gender,
    school: newStudent.school,
    grade: newStudent.grade,
    parentPhoneNumber: newStudent.parentPhone,
    emergencyContact: newStudent.emergencyContact,
    seatNumber: newStudent.seatNumber,
    memo: newStudent.memo,
    registrationDate: newStudent.registrationDate,
  };
  
  return delay(response);
};

export const getStudents = async (params?: { name?: string; status?: string }): Promise<Student[]> => {
  let students = getMockStudents();
  
  if (params?.name) {
    students = students.filter((s) => s.name.includes(params.name!));
  }
  
  if (params?.status) {
    students = students.filter((s) => s.status === params.status);
  }
  
  return delay(students);
};

export const getStudent = async (id: number): Promise<Student> => {
  const students = getMockStudents();
  const student = students.find((s) => s.id === id);
  
  if (!student) {
    throw new Error('학생을 찾을 수 없습니다.');
  }
  
  return delay(student);
};

export const updateStudent = async (id: number, data: StudentUpdateRequest): Promise<Student> => {
  const students = getMockStudents();
  const index = students.findIndex((s) => s.id === id);
  
  if (index === -1) {
    throw new Error('학생을 찾을 수 없습니다.');
  }
  
  students[index] = {
    ...students[index],
    ...data,
  };
  
  saveMockStudents(students);
  return delay(students[index]);
};

export const deleteStudent = async (id: number): Promise<void> => {
  const students = getMockStudents();
  const index = students.findIndex((s) => s.id === id);
  
  if (index === -1) {
    throw new Error('학생을 찾을 수 없습니다.');
  }
  
  // 상태를 INACTIVE로 변경 (실제 삭제 대신)
  students[index].status = 'INACTIVE';
  saveMockStudents(students);
  
  return delay(undefined);
};
