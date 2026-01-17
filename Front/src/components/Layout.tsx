import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

const Container = styled.div`
  min-height: 100vh;
  background-color: #F5F5F5;
  padding: 24px;
`;

const Layout = () => {
  const role = localStorage.getItem('role') as 'ADMIN' | 'DIRECTOR' | 'STUDENT' | 'PARENT' | null;

  return (
    <Container>
      <Navigation role={role || undefined} />
      <Outlet />
    </Container>
  );
};

export default Layout;


