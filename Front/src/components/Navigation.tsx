import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from './Button';

const NavContainer = styled.nav`
  background-color: #FFFFFF;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  border-radius: 8px;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
`;

const NavItem = styled.li<{ $active?: boolean }>`
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  color: #333333;
  transition: background-color 0.2s;

  &:hover {
    background-color: #F5F5F5;
  }

  ${({ $active }) =>
    $active &&
    `
    background-color: #FFC107;
    color: #333333;
  `}
`;

const LogoutButton = styled(Button)`
  margin-left: auto;
`;

interface NavigationProps {
  role?: 'ADMIN' | 'DIRECTOR' | 'STUDENT' | 'PARENT';
}

export const Navigation = ({ role }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const isAdminOrDirector = role === 'ADMIN' || role === 'DIRECTOR';

  return (
    <NavContainer>
      <NavList>
        {isAdminOrDirector ? (
          <>
            <NavItem
              $active={location.pathname.includes('/admin/schedules')}
              onClick={() => navigate('/admin/schedules')}
            >
              전체 스케줄 보기
            </NavItem>
            <NavItem
              $active={location.pathname.includes('/admin/attendance')}
              onClick={() => navigate('/admin/attendance')}
            >
              출결 현황 보기
            </NavItem>
            <NavItem
              $active={location.pathname.includes('/admin/students')}
              onClick={() => navigate('/admin/students')}
            >
              학생 관리
            </NavItem>
            <NavItem
              $active={location.pathname.includes('/admin/planner')}
              onClick={() => navigate('/admin/planner')}
            >
              플래너
            </NavItem>
            <NavItem
              $active={location.pathname.includes('/admin/vocabulary')}
              onClick={() => navigate('/admin/vocabulary')}
            >
              영단어 학습
            </NavItem>
            <NavItem
              $active={location.pathname.includes('/admin/attitude')}
              onClick={() => navigate('/admin/attitude')}
            >
              학습 태도
            </NavItem>
            <NavItem
              $active={location.pathname.includes('/admin/mock-exam')}
              onClick={() => navigate('/admin/mock-exam')}
            >
              모의고사
            </NavItem>
            <NavItem
              $active={location.pathname.includes('/admin/monthly-report')}
              onClick={() => navigate('/admin/monthly-report')}
            >
              월별 보고서
            </NavItem>
          </>
        ) : (
          <>
            <NavItem
              $active={location.pathname.includes('/student/schedules')}
              onClick={() => navigate('/student/schedules')}
            >
              내 스케줄
            </NavItem>
            <NavItem
              $active={location.pathname.includes('/student/study')}
              onClick={() => navigate('/student/study')}
            >
              학습 관리
            </NavItem>
          </>
        )}
        <LogoutButton $variant="secondary" onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      </NavList>
    </NavContainer>
  );
};


