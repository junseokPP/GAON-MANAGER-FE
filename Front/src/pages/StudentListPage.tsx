import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Card } from '../components/Card';
import { Table, Thead, Th, Td, Tr } from '../components/Table';
import { getStudents } from '../api/studentApi';
import { Student } from '../api/types';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  color: #333333;
`;

const Filters = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchInput = styled(Input)`
  flex: 1;
  min-width: 200px;
`;

const StatusSelect = styled(Select)`
  width: 150px;
`;

const gradeLabels: Record<string, string> = {
  High1: '고1',
  High2: '고2',
  High3: '고3',
  REPEATER: '재수',
};

const StudentListPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadStudents();
  }, [searchName, statusFilter]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params: { name?: string; status?: string } = {};
      if (searchName) params.name = searchName;
      if (statusFilter) params.status = statusFilter;
      const data = await getStudents(params);
      setStudents(data);
    } catch (err) {
      console.error('학생 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (id: number) => {
    navigate(`/admin/students/${id}`);
  };

  return (
    <Container>
      <Header>
        <Title>학생 목록</Title>
        <Button onClick={() => navigate('/admin/students/create')}>학생 등록</Button>
      </Header>

      <Card>
        <Filters>
          <SearchInput
            type="text"
            placeholder="이름으로 검색..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <StatusSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
          </StatusSelect>
        </Filters>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            학생이 없습니다.
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>이름</Th>
                <Th>학교</Th>
                <Th>학년</Th>
                <Th>좌석</Th>
                <Th>학부모 연락처</Th>
                <Th>상태</Th>
              </tr>
            </Thead>
            <tbody>
              {students.map((student) => (
                <Tr key={student.id} onClick={() => handleStudentClick(student.id)}>
                  <Td>{student.name}</Td>
                  <Td>{student.school}</Td>
                  <Td>{gradeLabels[student.grade] || student.grade}</Td>
                  <Td>{student.seatNumber}</Td>
                  <Td>{student.parentPhone}</Td>
                  <Td>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: student.status === 'INACTIVE' ? '#fee2e2' : '#d1fae5',
                        color: student.status === 'INACTIVE' ? '#991b1b' : '#065f46',
                      }}
                    >
                      {student.status === 'INACTIVE' ? '비활성' : '활성'}
                    </span>
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

export default StudentListPage;

