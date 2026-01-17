import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, Textarea } from './Input';
import { FormField } from './FormField';
import { StudentSchedule, Outing, ScheduleUpdateRequest } from '../api/types';

const OutingContainer = styled.div`
  margin-top: 16px;
`;

const OutingItem = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
`;

const OutingInput = styled(Input)`
  flex: 1;
`;

const RemoveButton = styled.button`
  padding: 8px 12px;
  background-color: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    background-color: #fecaca;
  }
`;

const AddButton = styled.button`
  padding: 8px 16px;
  background-color: #F5F5F5;
  color: #333333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;

  &:hover {
    background-color: #E0E0E0;
  }
`;

interface ScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: StudentSchedule | null;
  onSubmit: (data: ScheduleUpdateRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export const ScheduleEditModal = ({ isOpen, onClose, schedule, onSubmit, onDelete }: ScheduleEditModalProps) => {
  const [attendTime, setAttendTime] = useState('');
  const [leaveTime, setLeaveTime] = useState('');
  const [memo, setMemo] = useState('');
  const [outings, setOutings] = useState<Array<{ startTime: string; endTime: string; reason: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (schedule) {
      setAttendTime(schedule.attendTime.slice(0, 5) || '');
      setLeaveTime(schedule.leaveTime?.slice(0, 5) || '');
      setMemo(schedule.memo || '');
      setOutings(
        schedule.outings?.map((o) => ({
          startTime: o.startTime.includes('T') ? o.startTime.slice(11, 16) : o.startTime.slice(0, 5),
          endTime: o.endTime.includes('T') ? o.endTime.slice(11, 16) : o.endTime.slice(0, 5),
          reason: o.title || o.reason || '',
        })) || []
      );
    }
  }, [schedule]);

  const handleAddOuting = () => {
    setOutings([...outings, { startTime: '', endTime: '', reason: '' }]);
  };

  const handleRemoveOuting = (index: number) => {
    setOutings(outings.filter((_, i) => i !== index));
  };

  const handleOutingChange = (index: number, field: 'startTime' | 'endTime' | 'reason', value: string) => {
    const updated = [...outings];
    updated[index] = { ...updated[index], [field]: value };
    setOutings(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!attendTime) {
      setError('등원 시간을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const outingData: Outing[] = outings
        .filter((o) => o.startTime && o.endTime)
        .map((o) => ({
          startTime: `2000-01-01T${o.startTime}:00`,
          endTime: `2000-01-01T${o.endTime}:00`,
          title: o.reason || undefined,
        }));

      await onSubmit({
        attendTime: `2000-01-01T${attendTime}:00`,
        leaveTime: leaveTime ? `2000-01-01T${leaveTime}:00` : undefined,
        outings: outingData.length > 0 ? outingData : undefined,
        memo: memo || undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '수정 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm('정말 삭제 요청하시겠습니까?')) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '삭제 요청에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (!schedule) return null;

  const dayLabels: Record<string, string> = {
    MONDAY: '월요일',
    TUESDAY: '화요일',
    WEDNESDAY: '수요일',
    THURSDAY: '목요일',
    FRIDAY: '금요일',
    SATURDAY: '토요일',
    SUNDAY: '일요일',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${dayLabels[schedule.day]} 스케줄 수정 요청`}
      footer={
        <>
          {onDelete && (
            <Button $variant="danger" onClick={handleDelete} disabled={loading || deleting}>
              {deleting ? '삭제 중...' : '삭제 요청 보내기'}
            </Button>
          )}
          <Button $variant="secondary" onClick={onClose} disabled={loading || deleting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading || deleting}>
            {loading ? '요청 중...' : '수정 요청 보내기'}
          </Button>
        </>
      }
    >
      {error && (
        <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <FormField label="등원 시간" required>
          <Input
            type="time"
            value={attendTime}
            onChange={(e) => setAttendTime(e.target.value)}
            required
          />
        </FormField>

        <FormField label="하원 시간">
          <Input
            type="time"
            value={leaveTime}
            onChange={(e) => setLeaveTime(e.target.value)}
          />
        </FormField>

        <FormField label="외출">
          <OutingContainer>
            {outings.map((outing, index) => (
              <OutingItem key={index}>
                <OutingInput
                  type="time"
                  placeholder="시작"
                  value={outing.startTime}
                  onChange={(e) => handleOutingChange(index, 'startTime', e.target.value)}
                />
                <span>~</span>
                <OutingInput
                  type="time"
                  placeholder="종료"
                  value={outing.endTime}
                  onChange={(e) => handleOutingChange(index, 'endTime', e.target.value)}
                />
                <OutingInput
                  type="text"
                  placeholder="사유"
                  value={outing.reason}
                  onChange={(e) => handleOutingChange(index, 'reason', e.target.value)}
                />
                <RemoveButton type="button" onClick={() => handleRemoveOuting(index)}>
                  삭제
                </RemoveButton>
              </OutingItem>
            ))}
            <AddButton type="button" onClick={handleAddOuting}>
              + 외출 추가
            </AddButton>
          </OutingContainer>
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

