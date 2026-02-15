# GAON Manager FE 인수인계서
## 관리자 메인 화면과 출석/출결 설계 의도 분석

작성일: 2026-02-15
대상: 이 프로젝트를 처음 맡는 프론트/백엔드/기획 담당자

---

## 1) 한 줄 요약

이 프로젝트의 관리자 화면은 **학원 운영자가 실제로 하는 일의 순서**에 맞춰 설계되어 있습니다.

- `/admin/schedules`: "지금 당장 처리"하는 운영 화면 (등원/하원/외출/복귀/통보 버튼)
- `/admin/attendance`: "오늘 기록을 검수/수정"하는 정리 화면 (테이블 + 수정 모달)

즉, 출결을 한 화면에 몰아넣지 않고,
**실시간 처리(오퍼레이션)** 와 **사후 정산(감사/정정)** 을 분리한 구조입니다.

근거:
- 라우팅에서 두 페이지를 별도 경로로 분리: `Front/src/App.tsx:51`, `Front/src/App.tsx:52`
- 네비게이션에서도 "전체 스케줄 보기"와 "출결 현황 보기"를 나란히 배치: `Front/src/components/Navigation.tsx:69`, `Front/src/components/Navigation.tsx:75`

---

## 2) 코드 전체 관점에서 본 정보 구조(IA)

관리자 메뉴는 다음 흐름으로 배치되어 있습니다.

1. 전체 스케줄 보기
2. 출결 현황 보기
3. 학생 관리
4. 플래너/영단어/학습태도/모의고사
5. 월별 보고서

이 순서는 "운영 당일 업무 -> 학생 데이터 관리 -> 학습 데이터 관리 -> 월간 리포트" 흐름과 일치합니다.

근거:
- 메뉴 구성: `Front/src/components/Navigation.tsx:67-116`
- 관리자 라우트 그룹: `Front/src/App.tsx:44-67`

해석:
- 출결은 관리자 업무의 앞단(당일 운영)이라서, 학생관리보다 앞에 배치됨
- 월별 보고서는 후행 분석 기능이라 가장 뒤에 배치됨

---

## 3) 왜 관리자 페이지가 메인인가

이 코드베이스는 역할상 관리자 중심으로 설계되어 있습니다.

- 학생 화면은 상대적으로 제한적(내 스케줄, 학습 입력): `Front/src/App.tsx:69-78`
- 관리자 화면은 운영/학습/보고서까지 전 범위를 포함: `Front/src/App.tsx:44-67`

즉 제품의 중심 유저는 학생이 아니라 **운영자(ADMIN/DIRECTOR)** 입니다.

근거:
- 관리자/원장 판별 후 관리자 메뉴 전체 노출: `Front/src/components/Navigation.tsx:62-67`

---

## 4) 출석/출결을 왜 이렇게 두 화면으로 쪼갰는가

### A. `/admin/schedules`는 "실시간 제어판" 역할

이 화면의 테이블 한 행은 "학생 1명의 오늘 운영 컨트롤 패널"입니다.

행에 동시에 표시되는 정보:
- 스케줄(등원/하원/외출 계획)
- 현재 출결 상태
- 즉시 액션 버튼(등원/하원/외출/복귀/통보)

근거:
- 행에 스케줄 컬럼 + 출결 상태 + 출결 버튼 동시 배치: `Front/src/components/ScheduleTable.tsx:188-194`, `Front/src/components/ScheduleTable.tsx:247-277`

의도:
- 관리자가 "스케줄 확인 -> 버튼 조작"을 행 이동 없이 한 번에 처리
- 운영 중 클릭 횟수와 화면 전환을 최소화

---

### B. `/admin/attendance`는 "사후 검수/정정" 역할

이 화면은 오늘 기록을 목록으로 모아 보여주고, 필요시 개별 수정하는 구조입니다.

핵심 UI:
- 오늘 출결 테이블
- 무단결석/지각 알림 박스(현재는 결석 위주)
- 수정 모달(시간/상태/메모 보정)

근거:
- 테이블 중심 구성: `Front/src/pages/admin/AttendanceDashboardPage.tsx:210-271`
- 경고 박스: `Front/src/pages/admin/AttendanceDashboardPage.tsx:178-207`
- 수정 모달 호출: `Front/src/pages/admin/AttendanceDashboardPage.tsx:274-286`

의도:
- 실시간 조작과 분리해, "마감 전 검수" 업무에 집중
- 스케줄 화면을 과도하게 복잡하게 만들지 않음

---

## 5) 왜 스케줄 화면에서 출결 버튼을 눌러도 출결 화면까지 같이 갱신하나

`AdminSchedulePage`는 출결 액션 후 `loadAttendance()`와 `loadSchedules()`를 동시에 다시 불러옵니다.

근거:
- 액션 직후 동시 리프레시: `Front/src/pages/admin/AdminSchedulePage.tsx:133-134`, `Front/src/pages/admin/AdminSchedulePage.tsx:152`, `Front/src/pages/admin/AdminSchedulePage.tsx:170`, `Front/src/pages/admin/AdminSchedulePage.tsx:188`, `Front/src/pages/admin/AdminSchedulePage.tsx:206`, `Front/src/pages/admin/AdminSchedulePage.tsx:224`

의도:
- 스케줄 화면 자체는 즉시 반응(operational UX)
- 동시에 "오늘 출결 집계" 데이터도 최신으로 유지(audit UX)

추가 의도:
- `attendanceStates` Map을 별도로 들고 있어서, 백엔드 응답이 느려도 학생 행 단위로 상태를 빠르게 반영
- 근거: `Front/src/pages/admin/AdminSchedulePage.tsx:53-55`, `Front/src/pages/admin/AdminSchedulePage.tsx:111-125`

---

## 6) 버튼 활성/비활성 규칙을 강하게 건 이유

`AttendanceButtons`는 상태 기반으로 버튼을 막아 잘못된 상태 전이를 예방합니다.

예:
- 하원 후 등원/외출 불가
- 미등원 상태에서 하원/외출 불가
- 외출중일 때만 복귀 가능

근거:
- 비활성 조건: `Front/src/components/attendance/AttendanceButtons.tsx:143-149`

의도:
- UI에서 1차 방어하여 운영 실수를 줄임
- 백엔드가 최종 검증하더라도, 현장 사용성(실수 클릭 방지)을 먼저 챙긴 설계

---

## 7) 상태를 한국어 `finalStatus` 중심으로 쓴 이유

타입을 보면 출결 상태가 두 계층입니다.

- 내부/도메인 상태: `AttendanceStatus` (영문 enum) `Front/src/api/types.ts:154-162`
- 화면 표시 상태: `FinalStatus` (출석/하원/외출중/무단결석/미등원) `Front/src/api/types.ts:165`

실제 관리자 화면은 `FinalStatus` 중심으로 표시/색상/버튼 제어를 수행합니다.

근거:
- 상태 배지와 행 배경이 `FinalStatus`로 동작: `Front/src/components/StatusBadge.tsx:4-16`, `Front/src/components/ScheduleTable.tsx:36-53`

의도:
- 운영자가 즉시 읽기 쉬운 한국어 상태로 통일
- 기획/운영 언어와 UI 언어를 일치

---

## 8) 왜 출결 계산 유틸이 있는데 실제 화면에서 안 쓰나

`attendanceUtils.ts`에는 "스케줄 시간 기준 자동판정(무단지각/무단결석)" 로직이 있습니다.
하지만 현재 관리자 주 화면은 이 유틸 대신 `finalStatus`를 직접 사용합니다.

근거:
- 자동판정 유틸 파일 존재: `Front/src/components/attendance/attendanceUtils.ts:10-67`
- 실제 사용 검색 결과 없음(미참조)

해석:
- 초기에는 프론트에서 상태를 계산하려던 설계가 있었고,
- 이후에는 백엔드가 내려주는 최종 상태(`finalStatus`)를 신뢰하는 방향으로 이동한 흔적입니다.

인수인계 포인트:
- 향후에는 "상태 판정 책임"을 백엔드로 완전히 고정하는 것이 일관성 측면에서 유리합니다.

---

## 9) 출결 수정 모달을 둔 이유(그리고 현재 한계)

수정 모달은 현장 운영에서 자주 필요한 "기록 보정"을 위해 존재합니다.

근거:
- 상태/시간/외출/메모 수정 입력 제공: `Front/src/components/AttendanceEditModal.tsx:127-191`

의도:
- 출결 수집 단계에서 누락/오입력을 사후 정정
- 월말 집계 전에 데이터 품질을 보완

현재 한계(중요):
- `updateAttendance()` mock 구현은 실질적으로 `attendTime`, `leaveTime`만 저장하고 상태/외출/메모는 반영하지 않음
- 근거: `Front/src/api/attendanceApi.ts:218-223`

즉 현재는 "수정 UI는 완성", "저장 로직은 부분 반영" 상태입니다.

---

## 10) 왜 색상과 배지를 강하게 썼나

출결은 한눈 판단이 중요해서 색상을 상태와 1:1로 매핑했습니다.

예:
- 출석: 녹색
- 하원: 회색
- 외출중: 파랑
- 무단결석: 빨강

근거:
- 상태 배지 컬러: `Front/src/components/StatusBadge.tsx:8-16`
- 행 배경 컬러: `Front/src/components/ScheduleTable.tsx:36-53`
- 버튼별 색상 분리: `Front/src/components/attendance/AttendanceButtons.tsx:17-117`

의도:
- 텍스트를 읽기 전에 상태를 시각적으로 구분
- 동시에 여러 학생을 관리할 때 인지 부하를 줄임

---

## 11) 이 설계가 실제 운영에서 주는 장점

1. 관리자 업무 순서와 UI가 일치한다.
2. 실시간 액션과 사후 정정을 분리해 실수를 줄인다.
3. 학생 행 단위로 상태/버튼을 묶어 현장 조작 속도가 빠르다.
4. 한국어 상태 중심으로 운영자 이해도가 높다.
5. 월별 보고서(후행 집계)로 자연스럽게 연결된다.

연결 근거:
- 월별 보고서에서 출결 탭/지표 사용: `Front/src/pages/admin/MonthlyReportPage.tsx:496-517`, `Front/src/pages/admin/MonthlyReportPage.tsx:529-550`

---

## 12) 후임자가 반드시 알고 시작해야 할 현실

현재 출결 API는 `localStorage` 기반 mock입니다.

근거:
- 저장소 키 `mockAttendanceRecords` 사용: `Front/src/api/attendanceApi.ts:12`, `Front/src/api/attendanceApi.ts:23`

즉 "화면 설계 의도"는 운영 기준으로 잘 잡혀 있지만,
실제 운영 품질은 백엔드 연동 완성도에 달려 있습니다.

우선순위 권장:
1. 출결 수정 API를 서버 기준으로 완전 반영(상태/외출/메모 포함)
2. 무단지각 상태를 `finalStatus`로 명시적으로 내려주도록 백엔드 계약 확정
3. 프론트의 상태 계산 책임을 최소화하고 서버 단일소스로 정리

---

## 부록) "왜 이렇게 만들었는지"를 한 문장으로 설명하면

"관리자는 당일 운영 중에는 빠르게 버튼으로 처리하고, 마감 전에 대시보드에서 기록을 검수해야 하므로, 출결을 실시간 조작 화면과 사후 정정 화면으로 분리했다."

