import styled from 'styled-components';
import { Button } from '../Button';
import { FinalStatus } from '../../api/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const AttendButton = styled(Button)`
  padding: 6px 12px;
  font-size: 12px;
  background-color: #16a34a; // 초록
  color: #FFFFFF;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #15803d;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LeaveButton = styled(Button)`
  padding: 6px 12px;
  font-size: 12px;
  background-color: #6b7280; // 회색
  color: #FFFFFF;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #4b5563;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OutingButton = styled(Button)`
  padding: 6px 12px;
  font-size: 12px;
  background-color: #3b82f6; // 파랑
  color: #FFFFFF;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ReturnButton = styled(Button)`
  padding: 6px 12px;
  font-size: 12px;
  background-color: #a855f7; // 보라
  color: #FFFFFF;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #9333ea;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotifyLateButton = styled(Button)`
  padding: 6px 12px;
  font-size: 12px;
  background-color: #fb923c; // 주황
  color: #FFFFFF;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #f97316;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotifyAbsentButton = styled(Button)`
  padding: 6px 12px;
  font-size: 12px;
  background-color: #dc2626; // 진한 빨강
  color: #FFFFFF;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #b91c1c;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface AttendanceButtonsProps {
  studentId: number;
  finalStatus?: FinalStatus;
  onAttend: (studentId: number) => Promise<void>;
  onLeave: (studentId: number) => Promise<void>;
  onOuting: (studentId: number) => Promise<void>;
  onReturn: (studentId: number) => Promise<void>;
  onNotifyLate: (studentId: number) => Promise<void>;
  onNotifyAbsent: (studentId: number) => Promise<void>;
  loading?: boolean;
}

export const AttendanceButtons = ({
  studentId,
  finalStatus = '미등원',
  onAttend,
  onLeave,
  onOuting,
  onReturn,
  onNotifyLate,
  onNotifyAbsent,
  loading = false,
}: AttendanceButtonsProps) => {
  // 버튼 활성화 조건 판단
  const isAttendDisabled = loading || finalStatus === '하원' || finalStatus === '외출중';
  const isLeaveDisabled = loading || finalStatus === '하원' || finalStatus === '미등원' || finalStatus === '외출중';
  const isOutingDisabled = loading || finalStatus === '하원' || finalStatus === '미등원' || finalStatus === '외출중';
  const isReturnDisabled = loading || finalStatus !== '외출중';
  // 통보지각/통보결석은 언제든 누를 수 있음 (토글 가능)
  const isNotifyLateDisabled = loading || finalStatus === '하원';
  const isNotifyAbsentDisabled = loading || finalStatus === '하원';

  return (
    <Container>
      <ButtonGroup>
        <AttendButton
          onClick={() => onAttend(studentId)}
          disabled={isAttendDisabled}
          type="button"
        >
          등원
        </AttendButton>
        <LeaveButton
          onClick={() => onLeave(studentId)}
          disabled={isLeaveDisabled}
          type="button"
        >
          하원
        </LeaveButton>
        <OutingButton
          onClick={() => onOuting(studentId)}
          disabled={isOutingDisabled}
          type="button"
        >
          외출
        </OutingButton>
        <ReturnButton
          onClick={() => onReturn(studentId)}
          disabled={isReturnDisabled}
          type="button"
        >
          복귀
        </ReturnButton>
        <NotifyLateButton
          onClick={() => onNotifyLate(studentId)}
          disabled={isNotifyLateDisabled}
          type="button"
        >
          통보지각
        </NotifyLateButton>
        <NotifyAbsentButton
          onClick={() => onNotifyAbsent(studentId)}
          disabled={isNotifyAbsentDisabled}
          type="button"
        >
          통보결석
        </NotifyAbsentButton>
      </ButtonGroup>
    </Container>
  );
};
