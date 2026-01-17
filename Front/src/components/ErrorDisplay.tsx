import styled from 'styled-components';
import { Button } from './Button';

const Container = styled.div`
  padding: 40px;
  text-align: center;
  color: #6B7280;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  margin-bottom: 24px;
  color: #ef4444;
`;

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorDisplay = ({ message = '데이터를 불러오는 중 오류가 발생했습니다.', onRetry }: ErrorDisplayProps) => {
  return (
    <Container>
      <ErrorIcon>⚠️</ErrorIcon>
      <ErrorMessage>{message}</ErrorMessage>
      {onRetry && (
        <Button onClick={onRetry} $variant="secondary">
          다시 시도
        </Button>
      )}
    </Container>
  );
};







