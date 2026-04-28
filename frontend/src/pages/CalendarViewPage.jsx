import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { getCertStatus, getDaysUntilExpiry, formatDate } from '../utils/certUtils';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiAlarmWarningLine,
} from 'react-icons/ri';
import '../styles/CalendarViewPage.css';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusClassMap = {
  ACTIVE: 'status-active',
  'EXPIRING SOON': 'status-expiring',
  EXPIRED: 'status-expired',
};

const isSameDate = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const CalendarViewPage = () => {
  const { getMyCerts } = useData();
  const certs = getMyCerts();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekIndex = new Date(currentYear, currentMonth, 1).getDay();

  const certsByDate = useMemo(() => {
    const map = new Map();

    certs.forEach((cert) => {
      if (!cert?.expiryDate) return;
      const d = new Date(cert.expiryDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({
        ...cert,
        status: cert.status || getCertStatus(cert.expiryDate),
      });
    });

    return map;
  }, [certs]);

  const selectedKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
  const selectedCerts = certsByDate.get(selectedKey) || [];

  const goPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const dayCells = [];

  for (let i = 0; i < firstDayWeekIndex; i += 1) {
    dayCells.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayDate = new Date(currentYear, currentMonth, day);
    const key = `${currentYear}-${currentMonth}-${day}`;
    const dayCerts = certsByDate.get(key) || [];
    const isToday = isSameDate(dayDate, new Date());
    const isSelected = isSameDate(dayDate, selectedDate);

    dayCells.push(
      <button
        key={key}
        type="button"
        className={`calendar-cell day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => setSelectedDate(dayDate)}
      >
        <div className="day-number">{day}</div>
        <div className="day-markers">
          {dayCerts.slice(0, 3).map((cert) => (
            <span
              key={cert.id || cert.certId}
              className={`marker ${statusClassMap[cert.status] || 'status-active'}`}
              title={`${cert.certName} (${cert.status})`}
            />
          ))}
          {dayCerts.length > 3 && <span className="more-marker">+{dayCerts.length - 3}</span>}
        </div>
      </button>
    );
  }

  return (
    <div className="fade-up calendar-page">
      <div className="page-header">
        <div>
          <h1 className="page-title"><RiCalendarLine /> Expiry Calendar</h1>
          <p className="page-subtitle">Track all certification expiration dates in one place</p>
        </div>
      </div>

      <div className="calendar-grid-layout">
        <section className="calendar-panel glass-panel">
          <div className="calendar-toolbar">
            <button type="button" className="btn-icon btn-nav" onClick={goPrevMonth} aria-label="Previous month">
              <RiArrowLeftSLine />
            </button>
            <h2>{monthNames[currentMonth]} {currentYear}</h2>
            <button type="button" className="btn-icon btn-nav" onClick={goNextMonth} aria-label="Next month">
              <RiArrowRightSLine />
            </button>
          </div>

          <div className="calendar-weekdays">
            {weekDays.map((d) => (
              <div key={d} className="weekday">{d}</div>
            ))}
          </div>

          <div className="calendar-days">
            {dayCells}
          </div>
        </section>

        <aside className="calendar-details glass-panel">
          <div className="details-header">
            <h3>
              <RiAlarmWarningLine />
              {selectedDate.toLocaleDateString('en-IN', {
                weekday: 'long',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </h3>
            <span>{selectedCerts.length} certification{selectedCerts.length !== 1 ? 's' : ''}</span>
          </div>

          {selectedCerts.length === 0 ? (
            <div className="empty-state calendar-empty">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-text">No expirations on this day</div>
              <div className="empty-state-sub">Select another date to inspect reminders</div>
            </div>
          ) : (
            <div className="expiry-list">
              {selectedCerts.map((cert) => {
                const daysLeft = getDaysUntilExpiry(cert.expiryDate);
                const status = cert.status || getCertStatus(cert.expiryDate);

                return (
                  <article key={cert.id || cert.certId} className="expiry-card">
                    <div className="expiry-card-header">
                      <h4>{cert.certName}</h4>
                      <span className={`status-chip ${statusClassMap[status]}`}>{status}</span>
                    </div>
                    <p className="issuer">Issued by {cert.issuedBy}</p>
                    <p className="expiry-date">Expires {formatDate(cert.expiryDate)}</p>
                    <p className={`days-left ${statusClassMap[status]}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                    </p>
                  </article>
                );
              })}
            </div>
          )}

          <div className="legend">
            <div><span className="marker status-active" /> Active</div>
            <div><span className="marker status-expiring" /> Expiring Soon</div>
            <div><span className="marker status-expired" /> Expired</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CalendarViewPage;
