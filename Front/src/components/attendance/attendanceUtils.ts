import { AttendanceStatus, AttendanceRecord, AdminSchedule } from '../../api/types';

/**
 * 출결 상태를 계산하는 유틸 함수
 * @param schedule - 학생의 스케줄 정보
 * @param attendanceData - 출결 기록 데이터 (없을 수 있음)
 * @param currentTime - 현재 시간 (Date 객체, 기본값: new Date())
 * @returns 계산된 출결 상태
 */
export const calculateAttendanceStatus = (
  schedule: AdminSchedule,
  attendanceData: AttendanceRecord | null,
  currentTime: Date = new Date()
): AttendanceStatus => {
  const now = currentTime;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // 통보지각/통보결석이 이미 설정되어 있으면 그대로 반환
  if (attendanceData) {
    if (attendanceData.status === 'NOTIFY_LATE' || attendanceData.status === 'NOTIFY_ABSENT') {
      return attendanceData.status;
    }
  }

  // 실제 등원 기록이 있는 경우
  if (attendanceData?.attendTime) {
    // 하원했으면 하원 상태
    if (attendanceData.leaveTime) {
      return 'LEAVE';
    }

    // 외출 중인지 확인 (outingLogs 또는 outings 사용 - 호환성)
    const outingLogs = (attendanceData as any).outingLogs || attendanceData.outings || [];
    if (outingLogs.length > 0) {
      const hasActiveOuting = outingLogs.some(
        (outing: { startTime: string; endTime: string }) => outing.startTime && !outing.endTime
      );
      if (hasActiveOuting) {
        return 'OUTING';
      }
    }

    // 등원했고 하원 안했고 외출도 안했으면 출석
    return attendanceData.status || 'PRESENT';
  }

  // 등원 기록이 없는 경우 - 자동 판정
  if (!attendanceData || !attendanceData.attendTime) {
    // 스케줄 등원시간 파싱
    const scheduleAttendTime = schedule.attendTime;
    const [scheduleHour, scheduleMin] = scheduleAttendTime.split(':').map(Number);
    const scheduleTimeMinutes = scheduleHour * 60 + scheduleMin;

    // 23시가 지났고 등원 기록이 없으면 무단결석
    if (currentHour >= 23) {
      return 'UNNOTIFIED_ABSENT';
    }

    // 등원시간 + 30분이 지났고 등원 기록이 없으면 무단지각
    const lateThreshold = scheduleTimeMinutes + 30;
    if (currentTimeMinutes >= lateThreshold) {
      return 'UNNOTIFIED_LATE';
    }
  }

  // 기본값: 출석 (등원 전 상태)
  return 'PRESENT';
};

/**
 * 시간 문자열을 분 단위로 변환
 */
export const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

/**
 * 분을 시간 문자열로 변환 (HH:mm)
 */
export const minutesToTime = (minutes: number): string => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

/**
 * 총 공부시간 계산
 */
export const calculateTotalStudyTime = (record: AttendanceRecord): string => {
  if (!record.attendTime || !record.leaveTime) {
    return '-';
  }

  const attendMinutes = timeToMinutes(record.attendTime);
  const leaveMinutes = timeToMinutes(record.leaveTime);
  let totalMinutes = leaveMinutes - attendMinutes;

  // 외출 시간 차감 (outingLogs 또는 outings 사용 - 호환성)
  const outingLogs = (record as any).outingLogs || record.outings || [];
  if (outingLogs.length > 0) {
    outingLogs.forEach((outing: { startTime: string; endTime: string }) => {
      if (outing.startTime && outing.endTime) {
        const outingStart = timeToMinutes(outing.startTime);
        const outingEnd = timeToMinutes(outing.endTime);
        totalMinutes -= (outingEnd - outingStart);
      }
    });
  }

  if (totalMinutes < 0) {
    return '-';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}시간 ${minutes}분`;
};

