import styled from 'styled-components';

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #FFFFFF;
`;

export const Thead = styled.thead`
  background-color: #F5F5F5;
`;

export const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333333;
  border-bottom: 2px solid #E0E0E0;
`;

export const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #E0E0E0;
  color: #333333;
`;

export const Tr = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #F9F9F9;
  }

  &:last-child ${Td} {
    border-bottom: none;
  }
`;











