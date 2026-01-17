import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { linkParentChild } from '../api/parentApi';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 24px;
  color: #333333;
`;

const SearchSection = styled.div`
  margin-bottom: 24px;
`;

const SearchResult = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: #F5F5F5;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #E0E0E0;
  }
`;

const SelectedInfo = styled.div`
  padding: 12px;
  background-color: #fff7e6;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid #FFC107;
`;

const LinkParentChildPage = () => {
  const navigate = useNavigate();
  const [parentId, setParentId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [parentSearch, setParentSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 실제로는 API를 통해 검색해야 하지만, 여기서는 간단한 예시로 구현
  const handleParentSearch = () => {
    // TODO: API 호출로 학부모 검색
    // 임시로 parentId 설정
    if (parentSearch) {
      setParentId(1); // 실제로는 검색 결과에서 선택
    }
  };

  const handleStudentSearch = () => {
    // TODO: API 호출로 학생 검색
    // 임시로 studentId 설정
    if (studentSearch) {
      setStudentId(1); // 실제로는 검색 결과에서 선택
    }
  };

  const handleLink = async () => {
    if (!parentId || !studentId) {
      setError('학부모와 학생을 모두 선택해주세요.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await linkParentChild({ parentId, studentId });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/students');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || '연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container>
        <Title>학부모-자녀 연결</Title>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: '#065f46' }}>
            연결이 완료되었습니다!
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Title>학부모-자녀 연결</Title>
      <Card>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <SearchSection>
          <FormField label="학부모 검색">
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                type="text"
                placeholder="학부모 이름 또는 전화번호"
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
              />
              <Button type="button" onClick={handleParentSearch}>검색</Button>
            </div>
            {parentId && (
              <SelectedInfo>
                선택된 학부모 ID: {parentId}
              </SelectedInfo>
            )}
          </FormField>
        </SearchSection>

        <SearchSection>
          <FormField label="학생 검색">
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                type="text"
                placeholder="학생 이름 또는 전화번호"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              <Button type="button" onClick={handleStudentSearch}>검색</Button>
            </div>
            {studentId && (
              <SelectedInfo>
                선택된 학생 ID: {studentId}
              </SelectedInfo>
            )}
          </FormField>
        </SearchSection>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button onClick={handleLink} disabled={loading || !parentId || !studentId}>
            {loading ? '연결 중...' : '연결'}
          </Button>
          <Button $variant="secondary" onClick={() => navigate('/admin/students')}>
            취소
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default LinkParentChildPage;











