import { useState } from 'react';
import styled from 'styled-components';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Textarea } from '../components/Input';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const StudyCard = styled(Card)`
  padding: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
`;

const StudentStudyPage = () => {
  const [plannerContent, setPlannerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlannerSubmit = () => {
    if (!plannerContent.trim()) {
      return;
    }

    setIsSubmitting(true);
    // TODO: API 연동
    setTimeout(() => {
      setIsSubmitting(false);
      alert('플래너가 제출되었습니다.');
      setPlannerContent('');
    }, 500);
  };

  return (
    <Container>
      <GridContainer>
        <StudyCard>
          <Title>영단어 테스트</Title>
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            영단어 테스트 기능은 준비 중입니다.
          </div>
        </StudyCard>
        
        <StudyCard>
          <Title>플래너</Title>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              오늘의 공부 계획
            </label>
            <Textarea
              value={plannerContent}
              onChange={(e) => setPlannerContent(e.target.value)}
              placeholder="오늘의 공부 계획을 입력하세요..."
              style={{ minHeight: '200px' }}
            />
          </div>
          <Button onClick={handlePlannerSubmit} disabled={isSubmitting} $fullWidth>
            {isSubmitting ? '제출 중...' : '제출하기'}
          </Button>
        </StudyCard>
      </GridContainer>
    </Container>
  );
};

export default StudentStudyPage;
