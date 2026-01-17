import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getStudent, deleteStudent } from '../api/studentApi';
import { Student } from '../api/types';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 24px;
  color: #333333;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 16px;
  color: #333333;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const Label = styled.div`
  font-weight: 600;
  color: #6B7280;
`;

const Value = styled.div`
  color: #333333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const PhoneLink = styled.a`
  color: #FFC107;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const gradeLabels: Record<string, string> = {
  High1: '고1',
  High2: '고2',
  High3: '고3',
  REPEATER: '재수',
};

const StudentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadStudent();
    }
  }, [id]);

  const loadStudent = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getStudent(parseInt(id));
      setStudent(data);
    } catch (err) {
      console.error('학생 정보 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('정말 탈퇴 처리하시겠습니까?')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteStudent(parseInt(id));
      alert('탈퇴 처리되었습니다.');
      navigate('/admin/students');
    } catch (err: any) {
      alert(err.response?.data?.message || '탈퇴 처리에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px' }}>학생 정보를 찾을 수 없습니다.</div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>학생 상세 정보</Title>
      <Card>
        <Section>
          <SectionTitle>기본 정보</SectionTitle>
          <InfoGrid>
            <Label>이름</Label>
            <Value>{student.name}</Value>
            <Label>전화번호</Label>
            <Value>{student.phone}</Value>
            <Label>성별</Label>
            <Value>{student.gender === 'Male' ? '남성' : '여성'}</Value>
          </InfoGrid>
        </Section>

        <Section>
          <SectionTitle>학교 정보</SectionTitle>
          <InfoGrid>
            <Label>학교</Label>
            <Value>{student.school}</Value>
            <Label>학년</Label>
            <Value>{gradeLabels[student.grade] || student.grade}</Value>
          </InfoGrid>
        </Section>

        <Section>
          <SectionTitle>좌석 정보</SectionTitle>
          <InfoGrid>
            <Label>좌석 번호</Label>
            <Value>{student.seatNumber}번</Value>
          </InfoGrid>
        </Section>

        <Section>
          <SectionTitle>학부모 정보</SectionTitle>
          <InfoGrid>
            <Label>학부모 전화번호</Label>
            <Value>
              <PhoneLink href={`tel:${student.parentPhone}`}>
                {student.parentPhone}
              </PhoneLink>
            </Value>
            <Label>비상 연락처</Label>
            <Value>
              <PhoneLink href={`tel:${student.emergencyContact}`}>
                {student.emergencyContact}
              </PhoneLink>
            </Value>
          </InfoGrid>
        </Section>

        {student.memo && (
          <Section>
            <SectionTitle>메모</SectionTitle>
            <div style={{ padding: '12px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
              {student.memo}
            </div>
          </Section>
        )}

        <ButtonGroup>
          <Button onClick={() => navigate(`/admin/students/${id}/edit`)}>수정</Button>
          <Button $variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? '처리 중...' : '탈퇴 처리'}
          </Button>
          <Button $variant="secondary" onClick={() => navigate('/admin/students')}>
            목록으로
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
};

export default StudentDetailPage;

