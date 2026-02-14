# GAON Manager FE 인수인계서 (백엔드 연동 관점)

작성일: 2026-02-14  
핵심 메시지: **현재 Mock로 동작하는 영역은 “완성 기능”이 아니라 “백엔드 미구현/미연동 상태”입니다.**

## 1) 프로젝트 요약

이 프로젝트는 독서실 운영 관리 프론트엔드입니다.
- 관리자/원장: 학생관리, 스케줄/출결, 학습 데이터, 월별 보고서
- 학생: 본인 스케줄 조회/수정요청, 학습 입력(일부 미완성)

현재 상태는 UI는 대부분 만들어졌지만, 데이터 계층은 아래처럼 3단계로 나뉩니다.
1. 완전 Mock(localStorage)만 사용
2. API 호출 후 실패 시 Mock 폴백
3. 실제 API 연동 중심

즉, **Mock 구간은 반드시 백엔드 구현 + 프론트 API 연결로 교체해야 운영 가능**합니다.

## 2) 실행/환경

```bash
cd Front
npm install
npm run dev
```

- FE: `http://localhost:5173`
- 프록시: `/api -> http://localhost:8080` (`/Users/parkjunseok/GAON-Manager-FE/Front/vite.config.ts`)

## 3) 구조

```text
Front/src
  api/            # 도메인 API
  components/     # 공통/도메인 UI
  pages/
    auth/
    admin/
    student/
    parent/
  styles/
  App.tsx
```

## 4) 라우팅/권한

핵심 파일: `/Users/parkjunseok/GAON-Manager-FE/Front/src/App.tsx`
- `/login`
- `/auth/parent/setup-password`
- `/admin/*` (토큰 필요)
- `/student/*` (토큰 필요)

주의:
- `PrivateRoute`는 토큰 존재 여부만 검사
- role 권한 검증은 약함 (보완 필요)

## 5) 가장 중요한 인수인계 포인트: Mock = 백엔드 구현 필요

## 5-1. 완전 Mock로만 동작하는 도메인 (우선순위 매우 높음)

아래는 지금 백엔드 없이도 돌아가지만, 운영 기준으로는 **미구현 상태**입니다.

1. 인증
- 파일: `/Users/parkjunseok/GAON-Manager-FE/Front/src/api/authApi.ts`
- 현재: 하드코딩 사용자로 로그인
- 백엔드 필요:
  - 로그인 API
  - 토큰 재발급 API
  - 학부모 비밀번호 초기설정/인증 API

2. 학생관리
- 파일: `/Users/parkjunseok/GAON-Manager-FE/Front/src/api/studentApi.ts`
- 현재: `localStorage(mockStudents)` CRUD
- 백엔드 필요:
  - 학생 생성/목록/상세/수정/비활성화(탈퇴)

3. 스케줄
- 파일: `/Users/parkjunseok/GAON-Manager-FE/Front/src/api/scheduleApi.ts`
- 현재: `mockSchedules`, `mockStudentSchedules`
- 백엔드 필요:
  - 관리자 요일별 스케줄 조회
  - 학생 스케줄 조회
  - 학생 스케줄 수정/삭제 요청
  - 스케줄 일괄 변경 요청
  - 승인/반려 프로세스(서버 상태값)

4. 출결
- 파일: `/Users/parkjunseok/GAON-Manager-FE/Front/src/api/attendanceApi.ts`
- 현재: `mockAttendanceRecords`
- 백엔드 필요:
  - 등원/하원/외출 시작/외출 복귀
  - 통보지각/통보결석 처리
  - 당일 출결 조회
  - 출결 수정 API

5. 학부모-자녀 연결
- 파일: `/Users/parkjunseok/GAON-Manager-FE/Front/src/api/parentApi.ts`
- 현재: `mockParentChildLinks`
- 백엔드 필요:
  - 학부모 검색/학생 검색
  - 연결 생성/조회/중복 검증

## 5-2. API처럼 보이지만 실제로는 Mock 폴백이 있는 도메인

아래 기능은 API를 호출하지만, 404/500이면 Mock 반환합니다.
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/api/planner.ts`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/api/vocabulary.ts`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/api/attitude.ts`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/api/mockExam.ts`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/api/monthlyReport.ts`

의미:
- 화면이 정상처럼 보여도, 백엔드가 비어 있으면 Mock 데이터로 보일 수 있음
- 운영 전에는 폴백 제거 또는 개발환경에서만 동작하게 분리해야 함

## 6) 화면별 구현상태 (연동 기준)

## 6-1. Auth/Parent

- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/auth/LoginPage.tsx`
  - 현재: Mock 로그인
  - 해야 할 일: 실제 로그인/오류코드/권한 처리 연결

- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/parent/ParentSetupPage.tsx`
  - 현재: 인증번호 `123456` 고정 통과
  - 해야 할 일: 인증번호 검증/비밀번호 정책/만료 처리 백엔드 연동

- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/parent/LinkParentChildPage.tsx`
  - 현재: 검색 클릭 시 임시 ID=1 세팅
  - 해야 할 일: 학부모/학생 검색 API 및 결과 선택 UI 연결

## 6-2. 학생관리

- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/student/StudentListPage.tsx`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/student/StudentCreatePage.tsx`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/student/StudentDetailPage.tsx`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/student/StudentEditPage.tsx`

현재 CRUD는 Mock 저장소를 쓰므로, 백엔드 CRUD로 교체 필요.

## 6-3. 스케줄/출결

- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/admin/AdminSchedulePage.tsx`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/admin/AttendanceDashboardPage.tsx`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/student/StudentSchedulePage.tsx`

UI 흐름은 갖춰졌지만 핵심 데이터가 Mock입니다.  
특히 출결 상태 전환(등원/하원/외출/복귀/통보)은 서버 단일 소스로 정합성 보장 필요.

## 6-4. 학습 관리

- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/admin/PlannerPage.tsx`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/admin/VocabularyPage.tsx`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/admin/AttitudePage.tsx`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/admin/MockExamPage.tsx`
- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/admin/MonthlyReportPage.tsx`

화면 완성도는 높지만 API 미구현 시 Mock 폴백으로 동작함.  
운영 전에는 실제 API 100% 응답 기반으로 바꿔야 함.

- `/Users/parkjunseok/GAON-Manager-FE/Front/src/pages/student/StudentStudyPage.tsx`
  - 현재: `setTimeout` 임시 제출
  - 해야 할 일: 학생 플래너 제출 API 연결 + 영단어 기능 구현

## 7) 백엔드팀과 먼저 확정할 계약 (필수)

1. 인증/권한
- Access/Refresh 만료 정책
- role 클레임 규칙
- 401/403 에러 포맷

2. 날짜/시간 포맷
- `HH:mm` vs ISO datetime 통일
- timezone 기준(KST 고정 여부)

3. 출결 상태 표준
- 내부상태 코드(`PRESENT`, `LEAVE`...)와 표시값(`출석`, `하원`...) 매핑 주체 확정

4. 스케줄 승인 플로우
- 학생 요청 -> 관리자 승인/반려 상태전이 정의

5. 월별 보고서 집계 책임
- 총공부시간/지각/결석 카운트 계산 주체는 서버로 고정 권장

## 8) 바로 해야 할 작업 순서 (실행용)

1. 빌드 깨짐 먼저 해결
- 현재 `npm run build` 실패 중 (타입/unused 7건)

2. Mock 제거 1순위
- `authApi.ts`, `studentApi.ts`, `scheduleApi.ts`, `attendanceApi.ts`, `parentApi.ts`

3. 폴백 제거 2순위
- planner/vocabulary/attitude/mockExam/monthlyReport의 404/500 Mock 반환 제거
- 실패 시 사용자 오류표시로 전환

4. 페이지 연동 마감
- LinkParentChild 실제 검색
- StudentStudy API 연동

5. 운영 검증
- localStorage 초기화 후 전 플로우 실데이터 테스트

## 9) 현재 빌드 상태

2026-02-14 기준 `/Users/parkjunseok/GAON-Manager-FE/Front`에서 `npm run build` 실패:
1. `src/api/authApi.ts`: `codes` 미사용
2. `src/api/monthlyReport.ts`: `studentId` 미사용
3. `src/api/scheduleApi.ts`: `AdminSchedule` import 미사용
4. `src/api/scheduleApi.ts`: `saveMockAdminSchedules` 미사용
5. `src/api/studentApi.ts`: `memo: null` 타입 불일치
6. `src/components/AttendanceEditModal.tsx`: `React` import 미사용
7. `src/components/ScheduleEditModal.tsx`: `Outing` 타입에 `title` 접근

## 10) 최종 정리

이 프로젝트 인수인계의 핵심은 아래 한 문장입니다.

**“지금 Mock로 동작하는 구간은 완료된 기능이 아니라, 백엔드가 아직 구현되지 않았거나 연결되지 않은 구간이다.”**

따라서 후임자는 UI 유지보수보다 먼저:
1. 백엔드 API 계약 확정
2. Mock 제거 및 실연동
3. 빌드/권한/상태 정합성 확보

이 순서로 진행해야 합니다.

