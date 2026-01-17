import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card } from '../components/Card';
import { DayTabs } from '../components/DayTabs';
import { AdminScheduleTable } from '../components/ScheduleTable';
import { getAdminSchedules } from '../api/scheduleApi';
import { checkIn, checkOut, startOuting, endOuting, excuseLate, excuseAbsent, getTodayAttendance } from '../api/attendanceApi';
import { DayOfWeek, ScheduleWithAttendanceResponse, AttendanceResponse, FinalStatus } from '../api/types';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 24px;
  color: #333333;
`;

// 출결 상태를 관리하는 인터페이스
interface StudentAttendanceState {
  finalStatus: FinalStatus;
  attendTime: string | null;
  leaveTime: string | null;
  isOuting: boolean;
  excuseLate: boolean;
  excuseAbsent: boolean;
}

const AdminSchedulePage = () => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [schedules, setSchedules] = useState<ScheduleWithAttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState<number | null>(null); // 특정 학생 ID 또는 null
  const [attendanceStates, setAttendanceStates] = useState<Map<number, StudentAttendanceState>>(new Map());

  useEffect(() => {
    loadSchedules();
    loadAttendance();
  }, [selectedDay]);

  // 오늘의 출결 현황 로드
  const loadAttendance = async () => {
    try {
      const attendanceData = await getTodayAttendance();
      const attendanceMap = new Map<number, StudentAttendanceState>();
      
      attendanceData.forEach((attendance: AttendanceResponse) => {
        attendanceMap.set(attendance.studentId, {
          finalStatus: attendance.finalStatus,
          attendTime: attendance.attendTime,
          leaveTime: attendance.leaveTime,
          isOuting: attendance.isOuting,
          excuseLate: attendance.excuseLate,
          excuseAbsent: attendance.excuseAbsent,
        });
      });
      
      setAttendanceStates(attendanceMap);
    } catch (err: any) {
      console.error('출결 현황 로드 실패:', err);
      // 에러가 발생해도 스케줄은 표시 (출결 정보만 없음)
    }
  };

  const loadSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminSchedules(selectedDay);
      console.log('📊 관리자 스케줄 원본 데이터:', data);
      
      // 백엔드에서 이미 승인된 스케줄만 내려주므로 필터링 불필요
      // scheduledOutings가 null인 경우 빈 배열로 변환
      const processedSchedules = data.map((schedule) => ({
        ...schedule,
        scheduledOutings: schedule.scheduledOutings || [],
      }));
      
      console.log('🔄 처리된 스케줄:', processedSchedules);
      setSchedules(processedSchedules);
    } catch (err: any) {
      setError(err.response?.data?.message || '스케줄을 불러오지 못했습니다.');
      console.error('❌ 스케줄 로드 실패:', err);
      console.error('에러 상세:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // 출결 응답을 상태로 업데이트하는 헬퍼 함수
  const updateAttendanceState = (response: AttendanceResponse) => {
    setAttendanceStates((prev) => {
      const updated = new Map(prev);
      updated.set(response.studentId, {
        finalStatus: response.finalStatus,
        attendTime: response.attendTime,
        leaveTime: response.leaveTime,
        isOuting: response.isOuting,
        excuseLate: response.excuseLate,
        excuseAbsent: response.excuseAbsent,
      });
      return updated;
    });
  };

  // 출결 액션 핸들러들
  const handleAttend = async (studentId: number) => {
    setAttendanceLoading(studentId);
    try {
      const response = await checkIn(studentId);
      updateAttendanceState(response);
      // 출결 현황과 스케줄 모두 리프레시 (즉시 반영)
      await Promise.all([loadAttendance(), loadSchedules()]);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '등원 처리에 실패했습니다.');
      console.error('등원 처리 실패:', err);
    } finally {
      setAttendanceLoading(null);
    }
  };

  const handleLeave = async (studentId: number) => {
    setAttendanceLoading(studentId);
    try {
      const response = await checkOut(studentId);
      updateAttendanceState(response);
      await Promise.all([loadAttendance(), loadSchedules()]);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '하원 처리에 실패했습니다.');
      console.error('하원 처리 실패:', err);
    } finally {
      setAttendanceLoading(null);
    }
  };

  const handleOuting = async (studentId: number) => {
    setAttendanceLoading(studentId);
    try {
      const response = await startOuting(studentId);
      updateAttendanceState(response);
      await Promise.all([loadAttendance(), loadSchedules()]);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '외출 처리에 실패했습니다.');
      console.error('외출 처리 실패:', err);
    } finally {
      setAttendanceLoading(null);
    }
  };

  const handleReturn = async (studentId: number) => {
    setAttendanceLoading(studentId);
    try {
      const response = await endOuting(studentId);
      updateAttendanceState(response);
      await Promise.all([loadAttendance(), loadSchedules()]);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '복귀 처리에 실패했습니다.');
      console.error('복귀 처리 실패:', err);
    } finally {
      setAttendanceLoading(null);
    }
  };

  const handleNotifyLate = async (studentId: number) => {
    setAttendanceLoading(studentId);
    try {
      const response = await excuseLate(studentId);
      updateAttendanceState(response);
      await Promise.all([loadAttendance(), loadSchedules()]);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '통보지각 처리에 실패했습니다.');
      console.error('통보지각 처리 실패:', err);
    } finally {
      setAttendanceLoading(null);
    }
  };

  const handleNotifyAbsent = async (studentId: number) => {
    setAttendanceLoading(studentId);
    try {
      const response = await excuseAbsent(studentId);
      updateAttendanceState(response);
      await Promise.all([loadAttendance(), loadSchedules()]);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '통보결석 처리에 실패했습니다.');
      console.error('통보결석 처리 실패:', err);
    } finally {
      setAttendanceLoading(null);
    }
  };

  return (
    <Container>
      <Title>전체 스케줄 보기</Title>
      <Card>
        <DayTabs selectedDay={selectedDay} onDayChange={setSelectedDay} />
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <AdminScheduleTable
            schedules={schedules}
            attendanceStates={attendanceStates}
            onAttend={handleAttend}
            onLeave={handleLeave}
            onOuting={handleOuting}
            onReturn={handleReturn}
            onNotifyLate={handleNotifyLate}
            onNotifyAbsent={handleNotifyAbsent}
            attendanceLoading={attendanceLoading}
          />
        )}
      </Card>
    </Container>
  );
};

export default AdminSchedulePage;
