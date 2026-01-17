import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '../../components/Card';
import { Table, Thead, Th, Td, Tr } from '../../components/Table';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Select, Textarea } from '../../components/Input';
import { FormField } from '../../components/FormField';
import { SkeletonTable } from '../../components/Skeleton';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { getAttitudeRecords, createAttitudeRecord, AttitudeRecord, AttitudeType } from '../../api/attitude';
import { getStudents } from '../../api/studentApi';

console.log('📄 Loaded: AttitudePage');

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
`;

const TypeBadge = styled.span<{ $type: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ $type }) => {
    switch ($type) {
      case '수면':
        return '#dbeafe';
      case '태도':
        return '#fef3c7';
      case '태블릿':
        return '#e0e7ff';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${({ $type }) => {
    switch ($type) {
      case '수면':
        return '#1e40af';
      case '태도':
        return '#92400e';
      case '태블릿':
        return '#4338ca';
      default:
        return '#6b7280';
    }
  }};
`;

const AttitudePage = () => {
  const [records, setRecords] = useState<AttitudeRecord[]>([]);
  const [students, setStudents] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 폼 상태
  const [studentId, setStudentId] = useState<number>(0);
  const [type, setType] = useState<AttitudeType | ''>('');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    loadData();
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data.map((s) => ({ id: s.id, name: s.name })));
    } catch (err) {
      console.error('학생 목록 로드 실패:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttitudeRecords();
      // 날짜 최신순 정렬
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecords(sorted);
    } catch (err: any) {
      // Mock fallback이 처리하므로 여기서는 실제 에러만 처리
      if (err.response?.status !== 500 && err.response?.status !== 404) {
        setError(err.response?.data?.message || '학습 태도 데이터를 불러오지 못했습니다.');
        console.error('학습 태도 로드 실패:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setStudentId(0);
    setType('');
    setDetail('');
  };

  const handleSubmit = async () => {
    if (!studentId || !type || !detail.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createAttitudeRecord({
        studentId,
        type: type as AttitudeType,
        detail,
      });
      
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      alert(err.response?.data?.message || '기록 저장에 실패했습니다.');
      console.error('기록 저장 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <HeaderRow>
        <Title>학습 태도 기록</Title>
        <Button onClick={handleOpenModal}>새 기록 작성</Button>
      </HeaderRow>
      <Card>
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={loadData} />
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            기록이 없습니다.
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>학생명</Th>
                <Th>유형</Th>
                <Th>세부 내용</Th>
                <Th>기록일시</Th>
              </tr>
            </Thead>
            <tbody>
              {records.map((record) => (
                <Tr key={record.id}>
                  <Td>{record.name}</Td>
                  <Td>
                    <TypeBadge $type={record.type}>{record.type}</TypeBadge>
                  </Td>
                  <Td>{record.detail}</Td>
                  <Td>{record.createdAt}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="새 기록 작성"
        footer={
          <>
            <Button $variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </>
        }
      >
        <FormField label="학생 선택" required>
          <Select
            value={studentId || ''}
            onChange={(e) => setStudentId(parseInt(e.target.value))}
          >
            <option value="">학생을 선택하세요</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="태도 유형" required>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as AttitudeType)}
          >
            <option value="">유형을 선택하세요</option>
            <option value="수면">수면</option>
            <option value="태도">태도</option>
            <option value="태블릿">태블릿</option>
          </Select>
        </FormField>
        <FormField label="상세 설명" required>
          <Textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="학습 태도에 대한 상세 내용을 입력하세요..."
            style={{ minHeight: '120px' }}
          />
        </FormField>
      </Modal>
    </Container>
  );
};

export default AttitudePage;

