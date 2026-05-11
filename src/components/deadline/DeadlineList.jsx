import { useDeadline } from '../../hooks/useDeadline';
import DeadlineCard from './DeadlineCard';
import { Clock, CheckCircle } from 'lucide-react';
import './Deadline.css';

/**
 * 마감 임박 과제 리스트 컴포넌트
 * 3일 이내 마감 과제를 표시합니다.
 */
export default function DeadlineList() {
  const { upcomingDeadlines } = useDeadline();

  return (
    <div className="deadline-section" id="deadline-list">
      <div className="deadline-header">
        <h2>
          <Clock size={20} className="deadline-header-icon" />
          마감 임박
          {upcomingDeadlines.length > 0 && (
            <span className="deadline-badge">{upcomingDeadlines.length}</span>
          )}
        </h2>
      </div>

      <div className="deadline-list">
        {upcomingDeadlines.length === 0 ? (
          <div className="deadline-empty">
            <div className="deadline-empty-icon"><CheckCircle size={48} /></div>
            <p>3일 내 마감 과제가 없습니다!</p>
          </div>
        ) : (
          upcomingDeadlines.map((deadline, idx) => (
            <DeadlineCard key={deadline.id} deadline={deadline} index={idx} />
          ))
        )}
      </div>
    </div>
  );
}
