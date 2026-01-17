import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { login } from '../api/authApi';
import logo from '../assets/gaon-logo.png';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #F5F5F5;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  text-align: center;
  margin: 0;
  color: #333333;
  font-size: 24px;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fee2e2;
  border-radius: 8px;
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 이미 로그인되어 있으면 role에 따라 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      if (role === 'ADMIN' || role === 'DIRECTOR') {
        navigate('/admin/schedules', { replace: true });
      } else if (role === 'STUDENT') {
        navigate('/student/schedules', { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ phone: phoneNumber, password });
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      if (response.role) {
        localStorage.setItem('role', response.role);
      }

      // Role에 따라 리다이렉트
      const role = response.role || localStorage.getItem('role');
      if (role === 'ADMIN' || role === 'DIRECTOR') {
        navigate('/admin/schedules');
      } else if (role === 'STUDENT') {
        navigate('/student/schedules');
      } else {
        navigate('/admin/students'); // 기본값
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <LogoContainer>
          <Logo src={logo} alt="가온독서실 로고" />
          <Title>가온독서실</Title>
        </LogoContainer>
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
          <FormField label="비밀번호" required>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>
          <Button type="submit" $fullWidth disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </LoginCard>
    </Container>
  );
};

export default LoginPage;

