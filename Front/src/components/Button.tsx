import styled from 'styled-components';

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'danger';
  $fullWidth?: boolean;
}

export const Button = styled.button<ButtonProps>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  background-color: ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return '#FFC107';
      case 'danger':
        return '#ef4444';
      case 'secondary':
        return '#E0E0E0';
      default:
        return '#FFC107';
    }
  }};

  color: ${({ $variant }) => {
    switch ($variant) {
      case 'secondary':
        return '#333333';
      default:
        return '#333333';
    }
  }};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;











