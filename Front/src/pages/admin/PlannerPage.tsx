import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '../../components/Card';
import { Table, Thead, Th, Td, Tr } from '../../components/Table';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { SkeletonTable } from '../../components/Skeleton';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { getPlannerByDate, PlannerStudent } from '../../api/planner';

console.log('📄 Loaded: PlannerPage');

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

const DateInput = styled(Input)`
  width: 200px;
`;

const StyledTr = styled(Tr)<{ $submitted: boolean }>`
  background-color: ${({ $submitted }) => ($submitted ? '#f0fdf4' : '#FFFFFF')};
  
  &:hover {
    background-color: ${({ $submitted }) => ($submitted ? '#dcfce7' : '#f9fafb')};
  }
`;

const StatusBadge = styled.span<{ $submitted: boolean }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ $submitted }) => ($submitted ? '#16a34a' : '#ef4444')};
  color: #FFFFFF;
`;

const PlannerPage = () => {
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [students, setStudents] = useState<PlannerStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<PlannerStudent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPlannerByDate(date);
      setStudents(response.students);
    } catch (err: any) {
      // Mock fallback이 처리하므로 여기서는 실제 에러만 처리
      if (err.response?.status !== 500 && err.response?.status !== 404) {
        setError(err.response?.data?.message || '플래너 데이터를 불러오지 못했습니다.');
        console.error('플래너 로드 실패:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (student: PlannerStudent) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    return dateStr;
  };

  return (
    <Container>
      <Title>플래너 제출 현황</Title>
      <HeaderRow>
        <DateInput
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </HeaderRow>
      <Card>
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={loadData} />
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            해당 날짜에 제출 대상 학생이 없습니다.
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>학생명</Th>
                <Th>제출 여부</Th>
                <Th>제출일</Th>
                <Th>작업</Th>
              </tr>
            </Thead>
            <tbody>
              {students.map((student) => (
                <StyledTr key={student.studentId} $submitted={student.submitted}>
                  <Td>{student.name}</Td>
                  <Td>
                    <StatusBadge $submitted={student.submitted}>
                      {student.submitted ? 'Yes' : 'No'}
                    </StatusBadge>
                  </Td>
                  <Td>{formatDate(student.submittedAt)}</Td>
                  <Td>
                    <Button
                      $variant="secondary"
                      onClick={() => handleViewDetail(student)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      보기
                    </Button>
                  </Td>
                </StyledTr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {selectedStudent && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedStudent(null);
          }}
          title={`${selectedStudent.name} 플래너 상세`}
        >
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '16px' }}>
              <strong>제출일:</strong> {formatDate(selectedStudent.submittedAt)}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>제출 내용:</strong>
            </div>
            <div
              style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                minHeight: '100px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedStudent.content || '제출 내용이 없습니다.'}
            </div>
          </div>
        </Modal>
      )}
    </Container>
  );
};

export default PlannerPage;

