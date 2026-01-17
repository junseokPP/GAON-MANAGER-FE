import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { parentSetupPassword } from '../api/authApi';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #F5F5F5;
`;

const SetupCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 32px;
  color: #333333;
  font-size: 28px;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fee2e2;
  border-radius: 8px;
`;

const SuccessMessage = styled.div`
  color: #065f46;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #d1fae5;
  border-radius: 8px;
`;

const ParentSetupPage = () => {
  const [searchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phoneNumber') || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      await parentSetupPassword({
        phoneNumber,
        verificationCode,
        newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '비밀번호 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container>
        <SetupCard>
          <Title>비밀번호 설정</Title>
          <SuccessMessage>
            비밀번호가 성공적으로 설정되었습니다!
          </SuccessMessage>
        </SetupCard>
      </Container>
    );
  }

  return (
    <Container>
      <SetupCard>
        <Title>학부모 비밀번호 설정</Title>
        <form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <FormField label="전화번호" required>
            <Input
              type="tel"
              placeholder="전화번호를 입력하세요"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </FormField>
          <FormField label="인증번호" required>
            <Input
              type="text"
              placeholder="인증번호를 입력하세요"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </FormField>
          <FormField label="새 비밀번호" required>
            <Input
              type="password"
              placeholder="새 비밀번호를 입력하세요 (최소 6자)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </FormField>
          <FormField label="비밀번호 확인" required>
            <Input
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </FormField>
          <Button type="submit" $fullWidth disabled={loading}>
            {loading ? '설정 중...' : '비밀번호 설정'}
          </Button>
        </form>
      </SetupCard>
    </Container>
  );
};

export default ParentSetupPage;











