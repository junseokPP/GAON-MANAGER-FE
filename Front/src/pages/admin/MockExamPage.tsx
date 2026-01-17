import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '../../components/Card';
import { Table, Thead, Th, Td, Tr } from '../../components/Table';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import { FormField } from '../../components/FormField';
import { SkeletonTable } from '../../components/Skeleton';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { getMockExamScores, createMockExamScore, updateMockExamScore, MockExamScore } from '../../api/mockExam';
import { getStudents } from '../../api/studentApi';

console.log('📄 Loaded: MockExamPage');

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

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TotalScoreDisplay = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #FFC107;
  text-align: center;
  padding: 16px;
  background-color: #fffbf0;
  border-radius: 8px;
  margin-top: 16px;
`;

const MockExamPage = () => {
  const [scores, setScores] = useState<MockExamScore[]>([]);
  const [students, setStudents] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<MockExamScore | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 상태
  const [studentId, setStudentId] = useState<number>(0);
  const [examName, setExamName] = useState('');
  const [korean, setKorean] = useState<number>(0);
  const [english, setEnglish] = useState<number>(0);
  const [math, setMath] = useState<number>(0);
  const [science1, setScience1] = useState<number>(0);
  const [science2, setScience2] = useState<number>(0);

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
      const data = await getMockExamScores();
      setScores(data);
    } catch (err: any) {
      // Mock fallback이 처리하므로 여기서는 실제 에러만 처리
      if (err.response?.status !== 500 && err.response?.status !== 404) {
        setError(err.response?.data?.message || '모의고사 데이터를 불러오지 못했습니다.');
        console.error('모의고사 로드 실패:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (score: MockExamScore) => {
    setSelectedScore(score);
    setStudentId(score.studentId);
    setExamName(score.examName);
    setKorean(score.korean);
    setEnglish(score.english);
    setMath(score.math);
    setScience1(score.science1);
    setScience2(score.science2);
    setModalOpen(true);
  };

  const handleNewRecord = () => {
    setSelectedScore(null);
    setStudentId(0);
    setExamName('');
    setKorean(0);
    setEnglish(0);
    setMath(0);
    setScience1(0);
    setScience2(0);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedScore(null);
    setStudentId(0);
    setExamName('');
    setKorean(0);
    setEnglish(0);
    setMath(0);
    setScience1(0);
    setScience2(0);
  };

  const handleSubmit = async () => {
    if (!studentId || !examName.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (selectedScore) {
        // 수정
        await updateMockExamScore(selectedScore.id, {
          examName,
          korean,
          english,
          math,
          science1,
          science2,
        });
      } else {
        // 신규
        await createMockExamScore({
          studentId,
          examName,
          korean,
          english,
          math,
          science1,
          science2,
        });
      }
      
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      alert(err.response?.data?.message || '성적 저장에 실패했습니다.');
      console.error('성적 저장 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalScore = korean + english + math + science1 + science2;

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title>모의고사 성적 입력</Title>
        <Button onClick={handleNewRecord}>새 기록 작성</Button>
      </div>
      <Card>
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={loadData} />
        ) : scores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            데이터가 없습니다.
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>학생명</Th>
                <Th>시험명</Th>
                <Th>국어</Th>
                <Th>영어</Th>
                <Th>수학</Th>
                <Th>탐구1</Th>
                <Th>탐구2</Th>
                <Th>총점</Th>
              </tr>
            </Thead>
            <tbody>
              {scores.map((score) => (
                <Tr key={score.id}>
                  <Td>
                    <button
                      onClick={() => handleStudentClick(score)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      {score.studentName}
                    </button>
                  </Td>
                  <Td>{score.examName}</Td>
                  <Td>{score.korean}</Td>
                  <Td>{score.english}</Td>
                  <Td>{score.math}</Td>
                  <Td>{score.science1}</Td>
                  <Td>{score.science2}</Td>
                  <Td style={{ fontWeight: 700, color: '#FFC107' }}>{score.totalScore}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={selectedScore ? '모의고사 성적 수정' : '모의고사 성적 입력'}
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
            disabled={!!selectedScore}
          >
            <option value="">학생을 선택하세요</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="모의고사 이름" required>
          <Input
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="예: 12월 학평"
          />
        </FormField>
        <ScoreGrid>
          <FormField label="국어">
            <Input
              type="number"
              min="0"
              max="100"
              value={korean || ''}
              onChange={(e) => setKorean(parseInt(e.target.value) || 0)}
            />
          </FormField>
          <FormField label="영어">
            <Input
              type="number"
              min="0"
              max="100"
              value={english || ''}
              onChange={(e) => setEnglish(parseInt(e.target.value) || 0)}
            />
          </FormField>
          <FormField label="수학">
            <Input
              type="number"
              min="0"
              max="100"
              value={math || ''}
              onChange={(e) => setMath(parseInt(e.target.value) || 0)}
            />
          </FormField>
          <FormField label="탐구1">
            <Input
              type="number"
              min="0"
              max="100"
              value={science1 || ''}
              onChange={(e) => setScience1(parseInt(e.target.value) || 0)}
            />
          </FormField>
          <FormField label="탐구2">
            <Input
              type="number"
              min="0"
              max="100"
              value={science2 || ''}
              onChange={(e) => setScience2(parseInt(e.target.value) || 0)}
            />
          </FormField>
        </ScoreGrid>
        <TotalScoreDisplay>총점: {totalScore}점</TotalScoreDisplay>
      </Modal>
    </Container>
  );
};

export default MockExamPage;

