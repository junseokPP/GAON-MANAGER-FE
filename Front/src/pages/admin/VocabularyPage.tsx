import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '../../components/Card';
import { Table, Thead, Th, Td, Tr } from '../../components/Table';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { SkeletonTable } from '../../components/Skeleton';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { getVocabularyByDate, submitVocabularyScore, VocabularyStudent } from '../../api/vocabulary';

console.log('📄 Loaded: VocabularyPage');

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

const ScoreDisplay = styled.span<{ $score: number }>`
  font-weight: 600;
  color: ${({ $score }) => {
    if ($score >= 45) return '#16a34a'; // 초록
    if ($score >= 30) return '#facc15'; // 노랑
    return '#ef4444'; // 빨강
  }};
`;

const ScoreInput = styled(Input)`
  width: 100px;
`;

const VocabularyPage = () => {
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [students, setStudents] = useState<VocabularyStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<VocabularyStudent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [scoreInput, setScoreInput] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVocabularyByDate(date);
      setStudents(response.students);
    } catch (err: any) {
      // Mock fallback이 처리하므로 여기서는 실제 에러만 처리
      if (err.response?.status !== 500 && err.response?.status !== 404) {
        setError(err.response?.data?.message || '영단어 데이터를 불러오지 못했습니다.');
        console.error('영단어 로드 실패:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (student: VocabularyStudent) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleOpenScoreModal = (student: VocabularyStudent) => {
    setSelectedStudent(student);
    setScoreInput(0);
    setScoreModalOpen(true);
  };

  const handleSubmitScore = async () => {
    if (!selectedStudent || scoreInput < 0 || scoreInput > 50) {
      return;
    }

    setSubmitting(true);
    try {
      await submitVocabularyScore(selectedStudent.studentId, scoreInput);
      setScoreModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || '점수 입력에 실패했습니다.');
      console.error('점수 입력 실패:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Title>영단어 학습 현황</Title>
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
            해당 날짜에 영단어 학습 학생이 없습니다.
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>학생명</Th>
                <Th>최근 점수</Th>
                <Th>평균 점수</Th>
                <Th>작업</Th>
              </tr>
            </Thead>
            <tbody>
              {students.map((student) => (
                <Tr key={student.studentId}>
                  <Td>{student.name}</Td>
                  <Td>
                    <ScoreDisplay $score={student.latestScore}>
                      {student.latestScore}점
                    </ScoreDisplay>
                  </Td>
                  <Td>{student.averageScore.toFixed(1)}점</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        $variant="secondary"
                        onClick={() => handleViewHistory(student)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        기록보기
                      </Button>
                      <Button
                        onClick={() => handleOpenScoreModal(student)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        점수입력
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {selectedStudent && (
        <>
          <Modal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedStudent(null);
            }}
            title={`${selectedStudent.name} 점수 히스토리`}
          >
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong>평균 점수:</strong> {selectedStudent.averageScore.toFixed(1)}점
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>점수 기록:</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedStudent.scores.map((score, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>테스트 {selectedStudent.scores.length - index}</span>
                    <ScoreDisplay $score={score}>{score}점</ScoreDisplay>
                  </div>
                ))}
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={scoreModalOpen}
            onClose={() => {
              setScoreModalOpen(false);
              setSelectedStudent(null);
            }}
            title={`${selectedStudent.name} 점수 입력`}
            footer={
              <>
                <Button
                  $variant="secondary"
                  onClick={() => setScoreModalOpen(false)}
                  disabled={submitting}
                >
                  취소
                </Button>
                <Button onClick={handleSubmitScore} disabled={submitting}>
                  {submitting ? '저장 중...' : '저장'}
                </Button>
              </>
            }
          >
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  점수 (0-50)
                </label>
                <ScoreInput
                  type="number"
                  min="0"
                  max="50"
                  value={scoreInput || ''}
                  onChange={(e) => setScoreInput(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default VocabularyPage;

