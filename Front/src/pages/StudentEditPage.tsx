import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/Button';
import { Input, Select, Textarea } from '../components/Input';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { getStudent, updateStudent } from '../api/studentApi';
import { Student } from '../api/types';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 24px;
  color: #333333;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StudentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    grade: 'High1' as 'High1' | 'High2' | 'High3' | 'REPEATER',
    seatNumber: '',
    emergencyContact: '',
    memo: '',
  });

  useEffect(() => {
    if (id) {
      loadStudent();
    }
  }, [id]);

  const loadStudent = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const student = await getStudent(parseInt(id));
      setFormData({
        name: student.name,
        school: student.school,
        grade: student.grade,
        seatNumber: student.seatNumber.toString(),
        emergencyContact: student.emergencyContact,
        memo: student.memo || '',
      });
    } catch (err) {
      setError('학생 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError('');
    setSaving(true);

    try {
      await updateStudent(parseInt(id), {
        ...formData,
        seatNumber: parseInt(formData.seatNumber),
      });
      alert('수정되었습니다.');
      navigate(`/admin/students/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>학생 정보 수정</Title>
      <Card>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormField label="이름" required>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="학교" required>
            <Input
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormRow>
            <FormField label="학년" required>
              <Select name="grade" value={formData.grade} onChange={handleChange} required>
                <option value="High1">고1</option>
                <option value="High2">고2</option>
                <option value="High3">고3</option>
                <option value="REPEATER">재수</option>
              </Select>
            </FormField>
            <FormField label="좌석 번호" required>
              <Input
                name="seatNumber"
                type="number"
                value={formData.seatNumber}
                onChange={handleChange}
                required
              />
            </FormField>
          </FormRow>

          <FormField label="비상 연락처" required>
            <Input
              name="emergencyContact"
              type="tel"
              value={formData.emergencyContact}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="메모">
            <Textarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              placeholder="메모를 입력하세요"
            />
          </FormField>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button type="submit" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
            <Button type="button" $variant="secondary" onClick={() => navigate(`/admin/students/${id}`)}>
              취소
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
};

export default StudentEditPage;











