import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDeadline } from '../../hooks/useDeadline';
import {
  getCalendarDays,
  WEEKDAY_NAMES,
  addMonths,
  subMonths,
  isSameDay,
  format,
  getDeadlineUrgency,
} from '../../utils/dateUtils';
import { ko } from 'date-fns/locale';
import CalendarDayModal from './CalendarDayModal';
import './Calendar.css';

/**
 * 노션 스타일 캘린더 컴포넌트
 * 월간 뷰를 제공하며 과제 마감일을 날짜 셀에 표시합니다.
 * 날짜 클릭 시 모달로 해당 날짜의 일정을 상세 확인할 수 있습니다.
 */
export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const { deadlines } = useDeadline();

  const days = useMemo(() => getCalendarDays(currentDate), [currentDate]);

  const goToPrev = () => setCurrentDate((d) => subMonths(d, 1));
  const goToNext = () => setCurrentDate((d) => addMonths(d, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventsForDay = (date) => {
    return deadlines.filter((d) => isSameDay(new Date(d.dueDate), date));
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  return (
    <>
      <div className="calendar" id="main-calendar">
        <div className="calendar-header">
          <h2 className="calendar-title">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h2>
          <div className="calendar-nav">
            <button className="calendar-today-btn" onClick={goToToday}>
              오늘
            </button>
            <button className="calendar-nav-btn" onClick={goToPrev} aria-label="이전 달">
              <ChevronLeft size={18} />
            </button>
            <button className="calendar-nav-btn" onClick={goToNext} aria-label="다음 달">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAY_NAMES.map((name) => (
            <div key={name} className="calendar-weekday">
              {name}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {days.map((day, idx) => {
            const events = getEventsForDay(day.date);
            const isSelected = selectedDate && isSameDay(day.date, selectedDate);

            return (
              <div
                key={idx}
                className={`calendar-day${!day.isCurrentMonth ? ' other-month' : ''}${day.isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
                onClick={() => handleDayClick(day.date)}
              >
                <div className="calendar-day-number">
                  {day.date.getDate()}
                </div>
                <div className="calendar-day-events">
                  {events.slice(0, 2).map((event) => {
                    const urgency = getDeadlineUrgency(event.dueDate);
                    return (
                      <div
                        key={event.id}
                        className={`calendar-event-dot ${urgency}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  {events.length > 2 && (
                    <span className="calendar-event-more">
                      +{events.length - 2}개 더
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CalendarDayModal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        date={selectedDate}
        events={selectedDate ? getEventsForDay(selectedDate) : []}
      />
    </>
  );
}
