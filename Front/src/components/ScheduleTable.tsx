import styled from 'styled-components';
import { AdminSchedule, StudentSchedule, FinalStatus, ScheduleWithAttendanceResponse } from '../api/types';
import { AttendanceButtons } from './attendance/AttendanceButtons';
import { StatusBadge } from './StatusBadge';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
`;

const Thead = styled.thead`
  background-color: #F5F5F5;
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333333;
  border-bottom: 2px solid #E0E0E0;
`;

const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #E0E0E0;
  color: #333333;
`;

interface TrProps {
  $finalStatus?: FinalStatus;
}

const Tr = styled.tr<TrProps>`
  background-color: ${({ $finalStatus }) => {
    if (!$finalStatus) return 'transparent';
    switch ($finalStatus) {
      case '출석':
        return '#f0fdf4'; // 연한 초록
      case '하원':
        return '#f9fafb'; // 연한 회색
      case '외출중':
        return '#eff6ff'; // 연한 파랑
      case '무단결석':
        return '#fef2f2'; // 연한 빨강
      case '미등원':
        return 'transparent';
      default:
        return 'transparent';
    }
  }};
  
  &:last-child ${Td} {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${({ $finalStatus }) => {
      if (!$finalStatus) return '#f9fafb';
      switch ($finalStatus) {
        case '출석':
          return '#dcfce7';
        case '하원':
          return '#f3f4f6';
        case '외출중':
          return '#dbeafe';
        case '무단결석':
          return '#fee2e2';
        case '미등원':
          return '#f9fafb';
        default:
          return '#f9fafb';
      }
    }};
  }
`;

const OutingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OutingItem = styled.div`
  font-size: 13px;
  color: #6B7280;
`;

const ScheduleStatusBadge = styled.span<{ $status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'APPROVED':
        return '#d1fae5';
      case 'PENDING':
        return '#fef3c7';
      case 'REJECTED':
        return '#fee2e2';
      default:
        return '#E0E0E0';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'APPROVED':
        return '#065f46';
      case 'PENDING':
        return '#92400e';
      case 'REJECTED':
        return '#991b1b';
      default:
        return '#333333';
    }
  }};
`;

const formatTime = (time: string | null | undefined) => {
  if (!time) return '-';
  // "15:00:00" 형식이면 그대로 사용, ISO 형식이면 시간 부분만 추출
  if (time.includes('T')) {
    return time.slice(11, 16);
  }
  // "HH:mm:ss" 형식이면 "HH:mm"만 반환
  return time.slice(0, 5);
};

const formatOuting = (outing: { startTime: string; endTime: string; title?: string; reason?: string }) => {
  const start = formatTime(outing.startTime);
  const end = formatTime(outing.endTime);
  const title = outing.title || outing.reason || '';
  const titleText = title ? ` (${title})` : '';
  return `${start}~${end}${titleText}`;
};

// 스케줄 외출 포맷팅 (title 포함)
const formatScheduledOuting = (outing: { startTime: string; endTime: string; title?: string }) => {
  const start = formatTime(outing.startTime);
  const end = formatTime(outing.endTime);
  const title = outing.title || '';
  const titleText = title ? ` (${title})` : '';
  return `${start}~${end}${titleText}`;
};

// 출결 상태 인터페이스
interface StudentAttendanceState {
  finalStatus: FinalStatus;
  attendTime: string | null;
  leaveTime: string | null;
  isOuting: boolean;
  excuseLate: boolean;
  excuseAbsent: boolean;
}

interface AdminScheduleTableProps {
  schedules: ScheduleWithAttendanceResponse[] | AdminSchedule[]; // ScheduleWithAttendanceResponse 우선 사용
  attendanceStates?: Map<number, StudentAttendanceState>;
  onAttend?: (studentId: number) => Promise<void>;
  onLeave?: (studentId: number) => Promise<void>;
  onOuting?: (studentId: number) => Promise<void>;
  onReturn?: (studentId: number) => Promise<void>;
  onNotifyLate?: (studentId: number) => Promise<void>;
  onNotifyAbsent?: (studentId: number) => Promise<void>;
  attendanceLoading?: number | null; // 특정 학생 ID 또는 null
}

export const AdminScheduleTable = ({ 
  schedules,
  attendanceStates,
  onAttend,
  onLeave,
  onOuting,
  onReturn,
  onNotifyLate,
  onNotifyAbsent,
  attendanceLoading = null,
}: AdminScheduleTableProps) => {
  const hasAttendanceButtons = onAttend && onLeave && onOuting && onReturn && onNotifyLate && onNotifyAbsent;

  return (
    <Table>
      <Thead>
        <tr>
          <Th>학생명</Th>
          <Th>등원시간</Th>
          <Th>하원시간</Th>
          <Th>외출시간 목록</Th>
          <Th>메모</Th>
          {hasAttendanceButtons && <Th>출결 상태</Th>}
          {hasAttendanceButtons && <Th>출결</Th>}
        </tr>
      </Thead>
      <tbody>
        {schedules.length === 0 ? (
          <tr>
            <Td colSpan={hasAttendanceButtons ? 7 : 5} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
              스케줄이 없습니다.
            </Td>
          </tr>
        ) : (
          schedules.map((schedule) => {
            const attendanceState = attendanceStates?.get(schedule.studentId);
            // attendanceStates를 우선 사용 (출결 액션 후 즉시 반영), 없으면 스케줄의 attendanceStatusText 사용
            const finalStatus = attendanceState?.finalStatus 
              || (schedule as ScheduleWithAttendanceResponse).attendanceStatusText 
              || '미등원';
            const isStudentLoading = attendanceLoading === schedule.studentId;

            // 스케줄 데이터 표시 (ScheduleWithAttendanceResponse 우선, 호환성을 위해 AdminSchedule도 지원)
            const isScheduleWithAttendance = 'scheduledAttendTime' in schedule;
            const scheduledAttendTime = isScheduleWithAttendance 
              ? (schedule as ScheduleWithAttendanceResponse).scheduledAttendTime 
              : (schedule as AdminSchedule).attendTime;
            const scheduledLeaveTime = isScheduleWithAttendance 
              ? (schedule as ScheduleWithAttendanceResponse).scheduledLeaveTime 
              : (schedule as AdminSchedule).leaveTime;
            const scheduledOutings = isScheduleWithAttendance 
              ? (schedule as ScheduleWithAttendanceResponse).scheduledOutings 
              : (schedule as AdminSchedule).outings;

            return (
              <Tr key={schedule.scheduleId} $finalStatus={finalStatus}>
                <Td>{schedule.studentName}</Td>
                <Td>{formatTime(scheduledAttendTime)}</Td>
                <Td>{formatTime(scheduledLeaveTime)}</Td>
                <Td>
                  {scheduledOutings && scheduledOutings.length > 0 ? (
                    <OutingList>
                      {scheduledOutings.map((outing, idx) => (
                        <OutingItem key={idx}>
                          {isScheduleWithAttendance 
                            ? formatScheduledOuting(outing as { startTime: string; endTime: string; title?: string })
                            : formatOuting(outing as { startTime: string; endTime: string; title?: string; reason?: string })
                          }
                        </OutingItem>
                      ))}
                    </OutingList>
                  ) : (
                    '-'
                  )}
                </Td>
                <Td>{schedule.memo || '-'}</Td>
                {hasAttendanceButtons && (
                  <Td>
                    <StatusBadge status={finalStatus} />
                  </Td>
                )}
                {hasAttendanceButtons && (
                  <Td>
                    <AttendanceButtons
                      studentId={schedule.studentId}
                      finalStatus={finalStatus}
                      onAttend={async () => {
                        if (onAttend) await onAttend(schedule.studentId);
                      }}
                      onLeave={async () => {
                        if (onLeave) await onLeave(schedule.studentId);
                      }}
                      onOuting={async () => {
                        if (onOuting) await onOuting(schedule.studentId);
                      }}
                      onReturn={async () => {
                        if (onReturn) await onReturn(schedule.studentId);
                      }}
                      onNotifyLate={async () => {
                        if (onNotifyLate) await onNotifyLate(schedule.studentId);
                      }}
                      onNotifyAbsent={async () => {
                        if (onNotifyAbsent) await onNotifyAbsent(schedule.studentId);
                      }}
                      loading={isStudentLoading}
                    />
                  </Td>
                )}
              </Tr>
            );
          })
        )}
      </tbody>
    </Table>
  );
};

interface StudentScheduleTableProps {
  schedules: StudentSchedule[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const StudentScheduleTable = ({ schedules, onEdit, onDelete }: StudentScheduleTableProps) => {
  const statusLabels: Record<string, string> = {
    APPROVED: '승인',
    PENDING: '대기',
    REJECTED: '거절',
  };

  return (
    <Table>
      <Thead>
        <tr>
          <Th>요일</Th>
          <Th>등원</Th>
          <Th>하원</Th>
          <Th>외출 목록</Th>
          <Th>상태</Th>
          <Th>메모</Th>
          {(onEdit || onDelete) && <Th>작업</Th>}
        </tr>
      </Thead>
      <tbody>
        {schedules.length === 0 ? (
          <tr>
            <Td colSpan={onEdit || onDelete ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
              스케줄이 없습니다.
            </Td>
          </tr>
        ) : (
          schedules.map((schedule) => (
            <Tr key={schedule.scheduleId}>
              <Td>
                {schedule.day === 'MONDAY' ? '월' :
                 schedule.day === 'TUESDAY' ? '화' :
                 schedule.day === 'WEDNESDAY' ? '수' :
                 schedule.day === 'THURSDAY' ? '목' :
                 schedule.day === 'FRIDAY' ? '금' :
                 schedule.day === 'SATURDAY' ? '토' : '일'}
              </Td>
              <Td>{formatTime(schedule.attendTime)}</Td>
              <Td>{formatTime(schedule.leaveTime || '')}</Td>
              <Td>
                {schedule.outings && schedule.outings.length > 0 ? (
                  <OutingList>
                    {schedule.outings.map((outing, idx) => (
                      <OutingItem key={idx}>{formatOuting(outing)}</OutingItem>
                    ))}
                  </OutingList>
                ) : (
                  '-'
                )}
              </Td>
              <Td>
                <ScheduleStatusBadge $status={schedule.status}>{statusLabels[schedule.status] || schedule.status}</ScheduleStatusBadge>
              </Td>
              <Td>{schedule.memo || '-'}</Td>
              {(onEdit || onDelete) && (
                <Td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(schedule.scheduleId)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          border: '1px solid #FFC107',
                          borderRadius: '4px',
                          backgroundColor: '#fff7e6',
                          color: '#333333',
                          cursor: 'pointer',
                        }}
                      >
                        수정
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(schedule.scheduleId)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          border: '1px solid #ef4444',
                          borderRadius: '4px',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          cursor: 'pointer',
                        }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </Td>
              )}
            </Tr>
          ))
        )}
      </tbody>
    </Table>
  );
};
