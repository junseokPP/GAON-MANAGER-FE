import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Modal } from './Modal';
import { Button } from './Button';
import { FormField } from './FormField';
import { Input } from './Input';
import { AttendanceResponse, FinalStatus, AttendanceUpdateRequest } from '../api/types';

const OutingContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

const OutingInputGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-grow: 1;
`;

const OutingTimeInput = styled(Input)`
  width: 100px;
`;

const RemoveButton = styled(Button)`
  padding: 6px 12px;
`;

// FinalStatus 옵션 (백엔드 응답 형식)
const statusOptions: { value: FinalStatus; label: string }[] = [
  { value: '출석', label: '출석' },
  { value: '하원', label: '하원' },
  { value: '외출중', label: '외출중' },
  { value: '무단결석', label: '무단결석' },
  { value: '미등원', label: '미등원' },
];

interface AttendanceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceResponse | null;
  onSubmit: (id: number, data: AttendanceUpdateRequest) => Promise<void>;
  loading: boolean;
}

export const AttendanceEditModal = ({
  isOpen,
  onClose,
  record,
  onSubmit,
  loading,
}: AttendanceEditModalProps) => {
  const [status, setStatus] = useState<FinalStatus>('미등원');
  const [attendTime, setAttendTime] = useState('');
  const [leaveTime, setLeaveTime] = useState('');
  const [memo, setMemo] = useState('');
  const [outings, setOutings] = useState<Array<{ startTime: string; endTime: string }>>([]);

  useEffect(() => {
    if (record) {
      setStatus(record.finalStatus);
      setAttendTime(record.attendTime?.slice(0, 5) || '');
      setLeaveTime(record.leaveTime?.slice(0, 5) || '');
      setMemo(''); // AttendanceResponse에는 memo 필드가 없으므로 빈 문자열
      setOutings([]); // AttendanceResponse에는 outings 필드가 없으므로 빈 배열
    }
  }, [record]);

  const handleAddOuting = () => {
    setOutings([...outings, { startTime: '', endTime: '' }]);
  };

  const handleRemoveOuting = (index: number) => {
    setOutings(outings.filter((_, i) => i !== index));
  };

  const handleOutingChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...outings];
    updated[index][field] = value;
    setOutings(updated);
  };

  const handleSubmit = async () => {
    if (!record) return;

    // FinalStatus를 AttendanceStatus로 변환 (백엔드 API 요구사항에 따라 조정 필요)
    const statusMap: Record<FinalStatus, string> = {
      '출석': 'PRESENT',
      '하원': 'LEAVE',
      '외출중': 'OUTING',
      '무단결석': 'UNNOTIFIED_ABSENT',
      '미등원': 'UNNOTIFIED_ABSENT',
    };

    const data: AttendanceUpdateRequest = {
      status: statusMap[status] as any, // AttendanceStatus로 변환
      attendTime: attendTime || undefined,
      leaveTime: leaveTime || undefined,
      outings: outings.filter((o) => o.startTime && o.endTime).length > 0
        ? outings.filter((o) => o.startTime && o.endTime)
        : undefined,
      memo: memo || undefined,
    };

    await onSubmit(record.attendanceId, data);
  };

  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="출결 수정"
      footer={
        <>
          <Button $variant="secondary" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '저장 중...' : '저장'}
          </Button>
        </>
      }
    >
      <FormField label="출결 상태" required>
        <Input
          as="select"
          value={status}
          onChange={(e) => setStatus(e.target.value as FinalStatus)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Input>
      </FormField>

      <FormField label="등원 시간">
        <Input
          type="time"
          value={attendTime}
          onChange={(e) => setAttendTime(e.target.value)}
        />
      </FormField>

      <FormField label="하원 시간">
        <Input
          type="time"
          value={leaveTime}
          onChange={(e) => setLeaveTime(e.target.value)}
        />
      </FormField>

      <FormField label="외출 시간 목록">
        {outings.map((outing, index) => (
          <OutingContainer key={index}>
            <OutingInputGroup>
              <OutingTimeInput
                type="time"
                value={outing.startTime}
                onChange={(e) => handleOutingChange(index, 'startTime', e.target.value)}
                placeholder="시작 시간"
              />
              <OutingTimeInput
                type="time"
                value={outing.endTime}
                onChange={(e) => handleOutingChange(index, 'endTime', e.target.value)}
                placeholder="종료 시간"
              />
            </OutingInputGroup>
            <RemoveButton $variant="danger" onClick={() => handleRemoveOuting(index)}>
              삭제
            </RemoveButton>
          </OutingContainer>
        ))}
        <Button $variant="secondary" onClick={handleAddOuting} style={{ marginTop: '8px' }}>
          + 외출 추가
        </Button>
      </FormField>

      <FormField label="관리자 메모">
        <Input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모 (선택)"
        />
      </FormField>
    </Modal>
  );
};
