import styled from 'styled-components';
import { ReactNode } from 'react';

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333333;
`;

interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
}

export const FormField = ({ label, children, required }: FormFieldProps) => {
  return (
    <FieldContainer>
      <Label>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
      </Label>
      {children}
    </FieldContainer>
  );
};











