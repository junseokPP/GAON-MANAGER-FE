import styled from 'styled-components';

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 16px;
  background-color: #FFFFFF;
  color: #333333;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #FFC107;
  }

  &::placeholder {
    color: #9CA3AF;
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 16px;
  background-color: #FFFFFF;
  color: #333333;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #FFC107;
  }

  &::placeholder {
    color: #9CA3AF;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 16px;
  background-color: #FFFFFF;
  color: #333333;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #FFC107;
  }
`;











