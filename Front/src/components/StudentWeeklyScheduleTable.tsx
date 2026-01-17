import styled from 'styled-components';
import { StudentSchedule, DayOfWeek } from '../api/types';

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
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  color: #333333;
  border-bottom: 2px solid #E0E0E0;
  min-width: 120px;
`;

const ThContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const Td = styled.td`
  padding: 12px 8px;
  border-bottom: 1px solid #E0E0E0;
  color: #333333;
  text-align: center;
  vertical-align: top;
`;

const TdClickable = styled(Td)`
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #F9FAFB;
  }
`;

const Tr = styled.tr`
  &:last-child ${Td} {
    border-bottom: none;
  }
`;

const ScheduleCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px;
`;

const ScheduleItem = styled.div`
  padding: 8px;
  background-color: #fff7e6;
  border-radius: 6px;
  border: 1px solid #FFC107;
  font-size: 12px;
`;

const TimeInfo = styled.div`
  font-weight: 600;
  color: #333333;
  margin-bottom: 4px;
`;

const OutingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
`;

const OutingItem = styled.div`
  font-size: 11px;
  color: #6B7280;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
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
  display: inline-block;
`;

const formatTime = (time: string | null | undefined) => {
  if (!time) return '-';
  if (time.includes('T')) {
    return time.slice(11, 16);
  }
  return time.slice(0, 5);
};

const formatOuting = (outing: { startTime: string; endTime: string; title?: string; reason?: string }) => {
  const start = formatTime(outing.startTime);
  const end = formatTime(outing.endTime);
  const title = outing.title || outing.reason || '';
  const titleText = title ? ` (${title})` : '';
  return `${start}~${end}${titleText}`;
};

const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

const dayOrder: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

interface StudentWeeklyScheduleTableProps {
  schedules: StudentSchedule[];
  onDayClick?: (schedule: StudentSchedule) => void;
}

export const StudentWeeklyScheduleTable = ({ schedules, onDayClick }: StudentWeeklyScheduleTableProps) => {
  // 요일별로 스케줄 그룹화
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day]) {
      acc[schedule.day] = [];
    }
    acc[schedule.day].push(schedule);
    return acc;
  }, {} as Record<DayOfWeek, StudentSchedule[]>);

  const statusLabels: Record<string, string> = {
    APPROVED: '승인',
    PENDING: '대기',
    REJECTED: '거절',
  };

  return (
    <Table>
      <Thead>
        <tr>
          <Th>구분</Th>
          {dayOrder.map((day) => {
            const daySchedules = schedulesByDay[day] || [];
            const schedule = daySchedules.length > 0 ? daySchedules[0] : null;
            return (
              <Th
                key={day}
                style={{
                  backgroundColor: schedule
                    ? schedule.status === 'APPROVED'
                      ? '#d1fae5'
                      : schedule.status === 'PENDING'
                      ? '#fef3c7'
                      : '#fee2e2'
                    : '#F5F5F5',
                }}
              >
                <ThContent>
                  <div>{dayLabels[day]}</div>
                  {schedule && (
                    <StatusBadge $status={schedule.status}>
                      {statusLabels[schedule.status] || schedule.status}
                    </StatusBadge>
                  )}
                </ThContent>
              </Th>
            );
          })}
        </tr>
      </Thead>
      <tbody>
        <Tr>
          <Td style={{ fontWeight: 600, backgroundColor: '#F9FAFB' }}>등원</Td>
          {dayOrder.map((day) => {
            const daySchedules = schedulesByDay[day] || [];
            const schedule = daySchedules.length > 0 ? daySchedules[0] : null;
            return (
              <TdClickable
                key={day}
                onClick={() => schedule && onDayClick && onDayClick(schedule)}
              >
                <ScheduleCell>
                  {schedule ? (
                    <ScheduleItem>
                      <TimeInfo>{formatTime(schedule.attendTime)}</TimeInfo>
                    </ScheduleItem>
                  ) : (
                    <span style={{ color: '#9CA3AF' }}>-</span>
                  )}
                </ScheduleCell>
              </TdClickable>
            );
          })}
        </Tr>
        <Tr>
          <Td style={{ fontWeight: 600, backgroundColor: '#F9FAFB' }}>하원</Td>
          {dayOrder.map((day) => {
            const daySchedules = schedulesByDay[day] || [];
            const schedule = daySchedules.length > 0 ? daySchedules[0] : null;
            return (
              <TdClickable
                key={day}
                onClick={() => schedule && onDayClick && onDayClick(schedule)}
              >
                <ScheduleCell>
                  {schedule ? (
                    <ScheduleItem>
                      <TimeInfo>{formatTime(schedule.leaveTime)}</TimeInfo>
                    </ScheduleItem>
                  ) : (
                    <span style={{ color: '#9CA3AF' }}>-</span>
                  )}
                </ScheduleCell>
              </TdClickable>
            );
          })}
        </Tr>
        <Tr>
          <Td style={{ fontWeight: 600, backgroundColor: '#F9FAFB' }}>외출</Td>
          {dayOrder.map((day) => {
            const daySchedules = schedulesByDay[day] || [];
            const schedule = daySchedules.length > 0 ? daySchedules[0] : null;
            return (
              <TdClickable
                key={day}
                onClick={() => schedule && onDayClick && onDayClick(schedule)}
              >
                <ScheduleCell>
                  {schedule ? (
                    schedule.outings && schedule.outings.length > 0 ? (
                      <OutingList>
                        {schedule.outings.map((outing, idx) => (
                          <OutingItem key={idx}>{formatOuting(outing)}</OutingItem>
                        ))}
                      </OutingList>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>-</span>
                    )
                  ) : (
                    <span style={{ color: '#9CA3AF' }}>-</span>
                  )}
                </ScheduleCell>
              </TdClickable>
            );
          })}
        </Tr>
        <Tr>
          <Td style={{ fontWeight: 600, backgroundColor: '#F9FAFB' }}>메모</Td>
          {dayOrder.map((day) => {
            const daySchedules = schedulesByDay[day] || [];
            const schedule = daySchedules.length > 0 ? daySchedules[0] : null;
            return (
              <TdClickable
                key={day}
                onClick={() => schedule && onDayClick && onDayClick(schedule)}
              >
                <ScheduleCell>
                  {schedule ? (
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {schedule.memo || '-'}
                    </div>
                  ) : (
                    <span style={{ color: '#9CA3AF' }}>-</span>
                  )}
                </ScheduleCell>
              </TdClickable>
            );
          })}
        </Tr>
      </tbody>
    </Table>
  );
};

