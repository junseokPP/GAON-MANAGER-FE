import styled from 'styled-components';
import { FinalStatus } from '../api/types';

const Badge = styled.span<{ $status: FinalStatus }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #FFFFFF;
  background-color: ${({ $status }) => {
    switch ($status) {
      case '출석':
        return '#16a34a'; // 초록
      case '하원':
        return '#6b7280'; // 회색
      case '외출중':
        return '#3b82f6'; // 파랑
      case '무단결석':
        return '#ef4444'; // 빨강
      case '미등원':
        return '#000000'; // 기본색 (검정)
      default:
        return '#6b7280';
    }
  }};
`;

interface StatusBadgeProps {
  status: FinalStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <Badge $status={status}>{status}</Badge>;
};
