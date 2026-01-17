import { useState } from 'react';
import styled from 'styled-components';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, Textarea } from './Input';
import { FormField } from './FormField';
import { ScheduleUpdateAllRequest } from '../api/types';

const InfoBox = styled.div`
  padding: 12px;
  background-color: #fff7e6;
  border: 1px solid #FFC107;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #92400e;
  font-size: 14px;
`;

interface ScheduleUpdateAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleUpdateAllRequest) => Promise<void>;
}

export const ScheduleUpdateAllModal = ({ isOpen, onClose, onSubmit }: ScheduleUpdateAllModalProps) => {
  const [attendTime, setAttendTime] = useState('');
  const [leaveTime, setLeaveTime] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!attendTime || !leaveTime) {
      setError('등원 시간과 하원 시간을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        attendTime,
        leaveTime,
        memo: memo || undefined,
      });

      onClose();
      setAttendTime('');
      setLeaveTime('');
      setMemo('');
    } catch (err: any) {
      setError(err.response?.data?.message || '일괄 변경 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="전체 일괄 변경 요청"
      footer={
        <>
          <Button $variant="secondary" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '요청 중...' : '일괄 변경 요청 보내기'}
          </Button>
        </>
      }
    >
      {error && (
        <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
          {error}
        </div>
      )}
      <InfoBox>
        💡 모든 요일(월~일)에 동일한 스케줄이 적용됩니다.
      </InfoBox>
      <form onSubmit={handleSubmit}>
        <FormField label="등원 시간" required>
          <Input
            type="time"
            value={attendTime}
            onChange={(e) => setAttendTime(e.target.value)}
            required
          />
        </FormField>

        <FormField label="하원 시간" required>
          <Input
            type="time"
            value={leaveTime}
            onChange={(e) => setLeaveTime(e.target.value)}
            required
          />
        </FormField>

        <FormField label="메모">
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
          />
        </FormField>
      </form>
    </Modal>
  );
};










