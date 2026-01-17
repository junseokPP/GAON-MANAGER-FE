import styled from 'styled-components';
import { DayOfWeek } from '../api/types';

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${({ $active }) => ($active ? '#FFC107' : '#FFFFFF')};
  color: ${({ $active }) => ($active ? '#333333' : '#6B7280')};
  box-shadow: ${({ $active }) => ($active ? '0 2px 8px rgba(255, 193, 7, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)')};

  &:hover {
    background-color: ${({ $active }) => ($active ? '#FFC107' : '#F5F5F5')};
  }
`;

const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
};

interface DayTabsProps {
  selectedDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
}

export const DayTabs = ({ selectedDay, onDayChange }: DayTabsProps) => {
  const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <TabsContainer>
      {days.map((day) => (
        <Tab key={day} $active={selectedDay === day} onClick={() => onDayChange(day)}>
          {dayLabels[day]}
        </Tab>
      ))}
    </TabsContainer>
  );
};










