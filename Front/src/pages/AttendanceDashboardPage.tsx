import { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { Card } from '../components/Card';
import { Table, Thead, Th, Td, Tr } from '../components/Table';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { AttendanceEditModal } from '../components/AttendanceEditModal';
import { getTodayAttendance, updateAttendance } from '../api/attendanceApi';
import { AttendanceResponse, AttendanceUpdateRequest, FinalStatus } from '../api/types';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 24px;
  color: #333333;
`;

const DashboardSection = styled(Card)`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  margin-bottom: 16px;
  color: #333333;
  font-size: 20px;
`;

const AlertBox = styled(Card)`
  margin-bottom: 16px;
  padding: 16px;
  background-color: ${({ $type }: { $type: 'late' | 'absent' }) =>
    $type === 'late' ? '#fef3c7' : '#fee2e2'};
  border-left: 4px solid ${({ $type }: { $type: 'late' | 'absent' }) =>
    $type === 'late' ? '#facc15' : '#ef4444'};
`;

const AlertTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #333333;
  font-size: 16px;
`;

const StudentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StudentItem = styled.span`
  padding: 6px 12px;
  background-color: #FFFFFF;
  border-radius: 6px;
  font-size: 14px;
  color: #333333;
`;

const AttendanceDashboardPage = () => {
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceResponse | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [studentNames, setStudentNames] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTodayAttendance();
      setRecords(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '출결 현황을 불러오지 못했습니다.');
      console.error('출결 현황 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: AttendanceResponse) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };

  const handleUpdate = async (id: number, data: AttendanceUpdateRequest) => {
    setUpdateLoading(true);
    try {
      await updateAttendance(id, data);
      await loadAttendance(); // 리프레시
      setEditModalOpen(false);
      setSelectedRecord(null);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '출결 수정에 실패했습니다.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // 무단지각/무단결석 분류 (백엔드 finalStatus 기준)
  const { lateStudents, absentStudents } = useMemo(() => {
    const late: AttendanceResponse[] = [];
    const absent: AttendanceResponse[] = [];

    records.forEach((record) => {
      // 백엔드에서 내려준 finalStatus 기준으로 분류
      // 무단지각은 백엔드에서 "무단지각"으로 내려주거나 별도 필드로 관리될 수 있음
      // 현재는 finalStatus가 "무단결석"인 경우만 확인
      if (record.finalStatus === '무단결석') {
        absent.push(record);
      }
      // 무단지각은 백엔드에서 별도로 관리하거나 excuseLate가 false이고 지각인 경우
      // 백엔드 응답에 따라 조정 필요
    });

    return {
      lateStudents: late,
      absentStudents: absent,
    };
  }, [records]);

  const formatTime = (time: string | null | undefined): string => {
    if (!time) return '-';
    return time.slice(0, 5); // HH:mm
  };

  // 총 공부시간 계산 (등원시간과 하원시간이 모두 있을 때)
  const calculateTotalStudyTime = (record: AttendanceResponse): string => {
    if (!record.attendTime || !record.leaveTime) {
      return '-';
    }

    const [attendHour, attendMin] = record.attendTime.split(':').map(Number);
    const [leaveHour, leaveMin] = record.leaveTime.split(':').map(Number);
    
    let totalMinutes = (leaveHour * 60 + leaveMin) - (attendHour * 60 + attendMin);
    
    // 외출 시간은 백엔드에서 계산되어 있을 수 있으므로 여기서는 간단히 표시
    // 실제 외출 시간 차감은 백엔드에서 처리되어야 함
    
    if (totalMinutes < 0) {
      return '-';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}시간 ${minutes}분`;
  };

  // 외출 상태 표시
  const formatOutingStatus = (record: AttendanceResponse): string => {
    if (record.isOuting) {
      return '외출 중';
    }
    return '-';
  };

  return (
    <Container>
      <Title>출결 현황 보기</Title>

      {/* 무단지각/무단결석 알림 박스 */}
      {(lateStudents.length > 0 || absentStudents.length > 0) && (
        <DashboardSection>
          {lateStudents.length > 0 && (
            <AlertBox $type="late">
              <AlertTitle>🟡 무단지각 학생</AlertTitle>
              <StudentList>
                {lateStudents.map((student) => (
                  <StudentItem key={student.attendanceId}>
                    학생 ID: {student.studentId} <StatusBadge status={student.finalStatus} />
                  </StudentItem>
                ))}
              </StudentList>
            </AlertBox>
          )}
          {absentStudents.length > 0 && (
            <AlertBox $type="absent">
              <AlertTitle>🔴 무단결석 학생</AlertTitle>
              <StudentList>
                {absentStudents.map((student) => (
                  <StudentItem key={student.attendanceId}>
                    학생 ID: {student.studentId} <StatusBadge status={student.finalStatus} />
                  </StudentItem>
                ))}
              </StudentList>
            </AlertBox>
          )}
        </DashboardSection>
      )}

      {/* 오늘의 출결 현황 테이블 */}
      <DashboardSection>
        <SectionTitle>오늘의 출결 현황</SectionTitle>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            오늘 출결 기록이 없습니다.
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>학생 ID</Th>
                <Th>출결 상태</Th>
                <Th>등원시간</Th>
                <Th>하원시간</Th>
                <Th>외출 여부</Th>
                <Th>총 공부시간</Th>
                <Th>수정</Th>
              </tr>
            </Thead>
            <tbody>
              {records.map((record) => (
                <Tr key={record.attendanceId}>
                  <Td>{record.studentId}</Td>
                  <Td>
                    <StatusBadge status={record.finalStatus} />
                  </Td>
                  <Td>{formatTime(record.attendTime)}</Td>
                  <Td>{formatTime(record.leaveTime)}</Td>
                  <Td>{formatOutingStatus(record)}</Td>
                  <Td>{calculateTotalStudyTime(record)}</Td>
                  <Td>
                    <Button
                      $variant="secondary"
                      onClick={() => handleEdit(record)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      수정
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </DashboardSection>

      {/* 출결 수정 모달 */}
      {selectedRecord && (
        <AttendanceEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          onSubmit={handleUpdate}
          loading={updateLoading}
        />
      )}
    </Container>
  );
};

export default AttendanceDashboardPage;
