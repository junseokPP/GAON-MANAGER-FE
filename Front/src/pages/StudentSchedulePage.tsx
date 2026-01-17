import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card } from '../components/Card';
import { StudentWeeklyScheduleTable } from '../components/StudentWeeklyScheduleTable';
import { ScheduleEditModal } from '../components/ScheduleEditModal';
import { ScheduleUpdateAllModal } from '../components/ScheduleUpdateAllModal';
import { getStudentSchedules, requestScheduleUpdate, requestScheduleDelete, requestScheduleUpdateAll } from '../api/scheduleApi';
import { StudentSchedule, ScheduleUpdateRequest, ScheduleUpdateAllRequest } from '../api/types';

const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 16px;
`;

const Title = styled.h1`
  margin-bottom: 24px;
  color: #333333;
  font-size: 24px;
`;

const ScheduleCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' | 'all' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${({ $variant }) => {
    if ($variant === 'edit') return '#FFC107';
    if ($variant === 'delete') return '#ef4444';
    return '#6B7280';
  }};
  color: ${({ $variant }) => ($variant === 'all' ? '#FFFFFF' : '#333333')};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StudentSchedulePage = () => {
  const [schedules, setSchedules] = useState<StudentSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updateAllModalOpen, setUpdateAllModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<StudentSchedule | null>(null);

  useEffect(() => {
    loadAllSchedules();
  }, []);

  const loadAllSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('스케줄 로드 시작...');
      // day 파라미터 없이 모든 요일의 스케줄을 한 번에 가져오기
      const data = await getStudentSchedules();
      console.log('✅ 학생 스케줄 데이터 로드 성공:', data);
      console.log('📊 전체 스케줄 개수:', data.length);
      
      // 외출 데이터 확인
      data.forEach((schedule) => {
        console.log(`📅 ${schedule.day} 스케줄:`, {
          scheduleId: schedule.scheduleId,
          attendTime: schedule.attendTime,
          leaveTime: schedule.leaveTime,
          outings: schedule.outings,
          outingsCount: schedule.outings?.length || 0,
        });
        if (schedule.outings && schedule.outings.length > 0) {
          console.log(`  🚶 ${schedule.day} 외출 상세:`, schedule.outings);
        }
      });
      setSchedules(data);
    } catch (err: any) {
      console.error('❌ 스케줄 로드 실패:', err);
      console.error('에러 상세:', err.response?.data);
      setError(err.response?.data?.message || '스케줄을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (schedule: StudentSchedule) => {
    setSelectedSchedule(schedule);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (data: ScheduleUpdateRequest) => {
    if (!selectedSchedule) return;
    await requestScheduleUpdate(selectedSchedule.scheduleId, data);
    await loadAllSchedules();
    alert('수정 요청이 완료되었습니다. 관리자 승인을 기다려주세요.');
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    if (window.confirm('정말 삭제 요청하시겠습니까?')) {
      try {
        await requestScheduleDelete(selectedSchedule.scheduleId);
        await loadAllSchedules();
        alert('삭제 요청이 완료되었습니다. 관리자 승인을 기다려주세요.');
        setEditModalOpen(false);
        setSelectedSchedule(null);
      } catch (err: any) {
        alert(err.response?.data?.message || '삭제 요청에 실패했습니다.');
      }
    }
  };

  const handleUpdateAllSubmit = async (data: ScheduleUpdateAllRequest) => {
    await requestScheduleUpdateAll(data);
    await loadAllSchedules();
    alert('전체 일괄 변경 요청이 완료되었습니다. 관리자 승인을 기다려주세요.');
  };

  return (
    <Container>
      <Header>
        <Title>내 스케줄</Title>
        <ActionButton $variant="all" onClick={() => setUpdateAllModalOpen(true)}>
          전체 일괄 변경
        </ActionButton>
      </Header>
      <ScheduleCard>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <StudentWeeklyScheduleTable schedules={schedules} onDayClick={handleDayClick} />
          </div>
        )}
      </ScheduleCard>

      <ScheduleEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
        onSubmit={handleEditSubmit}
        onDelete={handleDelete}
      />

      <ScheduleUpdateAllModal
        isOpen={updateAllModalOpen}
        onClose={() => setUpdateAllModalOpen(false)}
        onSubmit={handleUpdateAllSubmit}
      />
    </Container>
  );
};

export default StudentSchedulePage;

