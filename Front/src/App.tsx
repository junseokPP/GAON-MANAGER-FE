import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyle } from './styles/GlobalStyle';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AdminSchedulePage from './pages/AdminSchedulePage';
import StudentSchedulePage from './pages/StudentSchedulePage';
import StudentListPage from './pages/StudentListPage';
import StudentCreatePage from './pages/StudentCreatePage';
import StudentDetailPage from './pages/StudentDetailPage';
import StudentEditPage from './pages/StudentEditPage';
import ParentSetupPage from './pages/ParentSetupPage';
import LinkParentChildPage from './pages/LinkParentChildPage';
import AttendanceDashboardPage from './pages/AttendanceDashboardPage';
import StudentStudyPage from './pages/StudentStudyPage';
import PlannerPage from './pages/admin/PlannerPage';
import VocabularyPage from './pages/admin/VocabularyPage';
import AttitudePage from './pages/admin/AttitudePage';
import MockExamPage from './pages/admin/MockExamPage';
import MonthlyReportListPage from './pages/admin/MonthlyReportListPage';
import MonthlyReportPage from './pages/admin/MonthlyReportPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const RoleBasedRedirect = () => {
  // 루트 경로는 항상 로그인 화면으로
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/parent/setup-password" element={<ParentSetupPage />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="schedules" element={<AdminSchedulePage />} />
            <Route path="attendance" element={<AttendanceDashboardPage />} />
            <Route path="students" element={<StudentListPage />} />
            <Route path="students/create" element={<StudentCreatePage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
            <Route path="students/:id/edit" element={<StudentEditPage />} />
            <Route path="link-parent-child" element={<LinkParentChildPage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="vocabulary" element={<VocabularyPage />} />
            <Route path="attitude" element={<AttitudePage />} />
            <Route path="mock-exam" element={<MockExamPage />} />
            <Route path="monthly-report" element={<MonthlyReportListPage />} />
            <Route path="monthly-report/:studentId" element={<MonthlyReportPage />} />
          </Route>
          <Route
            path="/student"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="schedules" element={<StudentSchedulePage />} />
            <Route path="study" element={<StudentStudyPage />} />
          </Route>
          <Route path="/" element={<RoleBasedRedirect />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

