import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Card } from '../../components/Card';
import { Input, Textarea } from '../../components/Input';
import { Button } from '../../components/Button';
import { Table, Thead, Th, Td, Tr } from '../../components/Table';
import { SkeletonCard } from '../../components/Skeleton';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { getMonthlyReport, updateMonthlyReportMessage, MonthlyReportResponse } from '../../api/monthlyReport';

console.log('📄 Loaded: MonthlyReportPage');

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ParentMessageBox = styled(Card)`
  margin-bottom: 24px;
  padding: 24px;
  background-color: #fffbf0;
  border: 2px solid #FFC107;
`;

const TabsContainer = styled.div`
  margin-bottom: 24px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #E0E0E0;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $active }) => ($active ? '#FFC107' : '#6B7280')};
  border-bottom: 3px solid ${({ $active }) => ($active ? '#FFC107' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #FFC107;
  }
`;

const CalendarContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-top: 16px;
`;

const CalendarDay = styled.div<{ $status?: string; $clickable?: boolean }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 4px;
  background-color: ${({ $status }) => {
    switch ($status) {
      case '정상출석':
        return '#dcfce7';
      case '무단지각':
        return '#fef3c7';
      case '무단결석':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case '정상출석':
        return '#16a34a';
      case '무단지각':
        return '#facc15';
      case '무단결석':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }};
  font-weight: 600;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  
  &:hover {
    ${({ $clickable }) => $clickable && 'opacity: 0.8;'}
  }
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 12px;
  color: #6B7280;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  padding: 20px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #333333;
`;

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}시간 ${mins}분`;
};

const MonthlyReportPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'attendance' | 'planner' | 'vocabulary' | 'attitude' | 'mockexam'>('attendance');
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [month, setMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [report, setReport] = useState<MonthlyReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parentMessage, setParentMessage] = useState('');
  const [savingMessage, setSavingMessage] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadReport();
    }
  }, [studentId, year, month]);

  const loadReport = async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMonthlyReport(parseInt(studentId), year, month);
      setReport(data);
      setParentMessage(data.summaryMessage);
    } catch (err: any) {
      // Mock fallback이 처리하므로 여기서는 실제 에러만 처리
      if (err.response?.status !== 500 && err.response?.status !== 404) {
        setError(err.response?.data?.message || '보고서를 불러오지 못했습니다.');
        console.error('보고서 로드 실패:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMessage = async () => {
    if (!studentId) return;
    setSavingMessage(true);
    try {
      await updateMonthlyReportMessage(parseInt(studentId), year, month, parentMessage);
      alert('메시지가 저장되었습니다.');
    } catch (err: any) {
      alert(err.response?.data?.message || '메시지 저장에 실패했습니다.');
      console.error('메시지 저장 실패:', err);
    } finally {
      setSavingMessage(false);
    }
  };

  const renderCalendar = () => {
    if (!report) return null;

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const calendarDays: Array<{ day: number; status?: string }> = [];

    // 빈 칸
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push({ day: 0 });
    }

    // 실제 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendance = report.attendanceCalendar.find((a) => a.date === dateStr);
      calendarDays.push({
        day,
        status: attendance?.status,
      });
    }

    return (
      <CalendarContainer>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {weekdays.map((day) => (
            <WeekdayLabel key={day}>{day}</WeekdayLabel>
          ))}
        </div>
        <CalendarGrid>
          {calendarDays.map((item, index) => (
            <CalendarDay key={index} $status={item.status} $clickable={!!item.status}>
              {item.day > 0 ? item.day : ''}
            </CalendarDay>
          ))}
        </CalendarGrid>
        <div style={{ marginTop: '16px', fontSize: '12px', color: '#6B7280', display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#dcfce7', borderRadius: '2px' }}></div>
            <span>정상출석</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#fef3c7', borderRadius: '2px' }}></div>
            <span>무단지각</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#fee2e2', borderRadius: '2px' }}></div>
            <span>무단결석</span>
          </div>
        </div>
      </CalendarContainer>
    );
  };

  const renderPlanner = () => {
    if (!report) return null;
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <strong>제출일 목록:</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {report.planner.length === 0 ? (
            <div style={{ color: '#6B7280', padding: '20px', textAlign: 'center' }}>제출 기록이 없습니다.</div>
          ) : (
            report.planner.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  backgroundColor: item.submitted ? '#f0fdf4' : '#fee2e2',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ color: item.submitted ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                  {item.submitted ? '✓' : '✗'}
                </span>
                <span>{item.date}</span>
                {item.content && <span style={{ color: '#6B7280', fontSize: '14px' }}>- {item.content}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderVocabulary = () => {
    if (!report) return null;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', height: '150px', marginBottom: '16px' }}>
          {report.vocabulary.map((score, index) => {
            const height = (score.score / 50) * 100;
            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '40px',
                    height: `${height}%`,
                    backgroundColor: score.score >= 45 ? '#16a34a' : score.score >= 30 ? '#facc15' : '#ef4444',
                    borderRadius: '4px 4px 0 0',
                    minHeight: '20px',
                  }}
                ></div>
                <div style={{ fontSize: '10px', color: '#6B7280' }}>{score.score}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center' }}>
          {report.vocabulary.map((score, index) => (
            <span key={index} style={{ marginRight: '16px' }}>
              {score.date}: {score.score}점
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderAttitude = () => {
    if (!report) return null;
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {report.attitudes.length === 0 ? (
            <div style={{ color: '#6B7280', padding: '20px', textAlign: 'center' }}>기록이 없습니다.</div>
          ) : (
            report.attitudes.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  borderLeft: '4px solid #FFC107',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{item.type}</span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>{item.date}</span>
                </div>
                <div style={{ color: '#333333' }}>{item.detail}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderMockExam = () => {
    if (!report) return null;
    return (
      <div>
        <Table>
          <Thead>
            <tr>
              <Th>시험명</Th>
              <Th>국어</Th>
              <Th>영어</Th>
              <Th>수학</Th>
              <Th>탐구1</Th>
              <Th>탐구2</Th>
              <Th>총점</Th>
            </tr>
          </Thead>
          <tbody>
            {report.mockExams.length === 0 ? (
              <tr>
                <Td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                  기록이 없습니다.
                </Td>
              </tr>
            ) : (
              report.mockExams.map((exam, index) => (
                <Tr key={index}>
                  <Td>{exam.examName}</Td>
                  <Td>{exam.korean}</Td>
                  <Td>{exam.english}</Td>
                  <Td>{exam.math}</Td>
                  <Td>{exam.science1}</Td>
                  <Td>{exam.science2}</Td>
                  <Td style={{ fontWeight: 700, color: '#FFC107' }}>{exam.totalScore}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    );
  };

  if (loading) {
    return (
      <Container>
        <Title>월별 보고서</Title>
        <SkeletonCard />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>월별 보고서</Title>
        <ErrorDisplay message={error} onRetry={loadReport} />
      </Container>
    );
  }

  if (!report) {
    return (
      <Container>
        <Title>월별 보고서</Title>
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
          보고서를 불러올 수 없습니다.
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderRow>
        <Title>월별 보고서</Title>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{ width: '100px' }}
            min="2020"
            max="2099"
          />
          <span>년</span>
          <Input
            type="number"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            style={{ width: '80px' }}
            min="1"
            max="12"
          />
          <span>월</span>
          <Button $variant="secondary" onClick={() => navigate('/admin/monthly-report')}>
            목록으로
          </Button>
        </div>
      </HeaderRow>

      <ParentMessageBox>
        <div style={{ marginBottom: '12px', fontWeight: 600, color: '#333333' }}>
          📌 학부모님께 드리는 글
        </div>
        <Textarea
          value={parentMessage}
          onChange={(e) => setParentMessage(e.target.value)}
          style={{ minHeight: '100px', width: '100%', marginBottom: '12px' }}
          placeholder="학부모님께 전달할 메시지를 입력하세요..."
        />
        <Button onClick={handleSaveMessage} disabled={savingMessage}>
          {savingMessage ? '저장 중...' : '메시지 저장'}
        </Button>
      </ParentMessageBox>

      <StatsGrid>
        <StatCard>
          <StatLabel>이번달 총 출석일수</StatLabel>
          <StatValue>{report.attendanceCount}일</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>이번달 무단지각 횟수</StatLabel>
          <StatValue style={{ color: '#facc15' }}>{report.lateCount}회</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>이번달 무단결석 횟수</StatLabel>
          <StatValue style={{ color: '#ef4444' }}>{report.absentCount}회</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>이번달 총 공부시간</StatLabel>
          <StatValue style={{ color: '#16a34a' }}>{formatTime(report.totalStudyMinutes)}</StatValue>
        </StatCard>
      </StatsGrid>

      <TabsContainer>
        <Tabs>
          <Tab $active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>
            출결
          </Tab>
          <Tab $active={activeTab === 'planner'} onClick={() => setActiveTab('planner')}>
            플래너
          </Tab>
          <Tab $active={activeTab === 'vocabulary'} onClick={() => setActiveTab('vocabulary')}>
            영단어
          </Tab>
          <Tab $active={activeTab === 'attitude'} onClick={() => setActiveTab('attitude')}>
            학습태도
          </Tab>
          <Tab $active={activeTab === 'mockexam'} onClick={() => setActiveTab('mockexam')}>
            모의고사 성적
          </Tab>
        </Tabs>

        <Card>
          {activeTab === 'attendance' && renderCalendar()}
          {activeTab === 'planner' && renderPlanner()}
          {activeTab === 'vocabulary' && renderVocabulary()}
          {activeTab === 'attitude' && renderAttitude()}
          {activeTab === 'mockexam' && renderMockExam()}
        </Card>
      </TabsContainer>
    </Container>
  );
};

export default MonthlyReportPage;

