import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Table, Thead, Th, Td, Tr } from '../../components/Table';
import { Button } from '../../components/Button';
import { SkeletonTable } from '../../components/Skeleton';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { getStudents } from '../../api/studentApi';

console.log('📄 Loaded: MonthlyReportListPage');

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

const MonthlyReportListPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Array<{ id: number; name: string; school: string; grade: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents({ status: 'ACTIVE' });
      setStudents(data.map((s) => ({ id: s.id, name: s.name, school: s.school, grade: s.grade })));
    } catch (err: any) {
      setError(err.response?.data?.message || '학생 목록을 불러오지 못했습니다.');
      console.error('학생 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (studentId: number) => {
    navigate(`/admin/monthly-report/${studentId}`);
  };

  return (
    <Container>
      <Title>월별 보고서</Title>
      <Card>
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={loadStudents} />
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            학생이 없습니다.
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>학생명</Th>
                <Th>학교</Th>
                <Th>학년</Th>
                <Th>작업</Th>
              </tr>
            </Thead>
            <tbody>
              {students.map((student) => (
                <Tr key={student.id}>
                  <Td>{student.name}</Td>
                  <Td>{student.school}</Td>
                  <Td>{student.grade}</Td>
                  <Td>
                    <Button
                      $variant="secondary"
                      onClick={() => handleViewReport(student.id)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      보고서 보기
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
};

export default MonthlyReportListPage;







