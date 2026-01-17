import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/Button';
import { Input, Select, Textarea } from '../components/Input';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { createStudent } from '../api/studentApi';
import { StudentCreateResponse } from '../api/types';

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

const SuccessMessage = styled.div`
  padding: 16px;
  background-color: #d1fae5;
  border-radius: 8px;
  margin-bottom: 24px;
  color: #065f46;
`;

const SuccessInfo = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #F5F5F5;
  border-radius: 8px;
`;

const StudentCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    gender: 'Male' as 'Male' | 'Female',
    school: '',
    grade: 'High1' as 'High1' | 'High2' | 'High3' | 'REPEATER',
    parentPhoneNumber: '',
    emergencyContact: '',
    seatNumber: '',
    memo: '',
    registrationDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<StudentCreateResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const requestData = {
        name: formData.name,
        phone: formData.phoneNumber,
        gender: formData.gender,
        school: formData.school,
        grade: formData.grade,
        parentPhone: formData.parentPhoneNumber,
        emergencyContact: formData.emergencyContact,
        seatNumber: parseInt(formData.seatNumber),
        memo: formData.memo,
        registrationDate: formData.registrationDate,
      };
      console.log('전송 데이터:', requestData);
      const data = await createStudent(requestData);
      setSuccessData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '학생 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <Container>
        <Title>학생 등록</Title>
        <Card>
          <SuccessMessage>
            <strong>학생이 등록되었습니다!</strong>
          </SuccessMessage>
          <SuccessInfo>
            <p><strong>이름:</strong> {successData.name}</p>
            <p><strong>전화번호:</strong> {successData.phoneNumber}</p>
            <p><strong>학교:</strong> {successData.school}</p>
            <p><strong>학년:</strong> {successData.grade}</p>
            <p><strong>좌석 번호:</strong> {successData.seatNumber}</p>
            {successData.setupUrl && (
              <p><strong>설정 URL:</strong> {successData.setupUrl}</p>
            )}
          </SuccessInfo>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <Button onClick={() => navigate('/admin/students')}>학생 목록으로</Button>
            <Button $variant="secondary" onClick={() => setSuccessData(null)}>추가 등록</Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Title>학생 등록</Title>
      <Card>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="이름" required>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField label="전화번호" required>
              <Input
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="성별" required>
              <Select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="Male">남성</option>
                <option value="Female">여성</option>
              </Select>
            </FormField>
            <FormField label="학년" required>
              <Select name="grade" value={formData.grade} onChange={handleChange} required>
                <option value="High1">고1</option>
                <option value="High2">고2</option>
                <option value="High3">고3</option>
                <option value="REPEATER">재수</option>
              </Select>
            </FormField>
          </FormRow>

          <FormField label="학교" required>
            <Input
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormRow>
            <FormField label="학부모 전화번호" required>
              <Input
                name="parentPhoneNumber"
                type="tel"
                value={formData.parentPhoneNumber}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField label="비상 연락처" required>
              <Input
                name="emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={handleChange}
                required
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="좌석 번호" required>
              <Input
                name="seatNumber"
                type="number"
                value={formData.seatNumber}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField label="등록일" required>
              <Input
                name="registrationDate"
                type="date"
                value={formData.registrationDate}
                onChange={handleChange}
                required
              />
            </FormField>
          </FormRow>

          <FormField label="메모">
            <Textarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              placeholder="메모를 입력하세요"
            />
          </FormField>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button type="submit" disabled={loading}>
              {loading ? '등록 중...' : '등록'}
            </Button>
            <Button type="button" $variant="secondary" onClick={() => navigate('/admin/students')}>
              취소
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
};

export default StudentCreatePage;

