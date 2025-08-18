"use client";
import React, { useMemo } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface CalendarViewProps {
  gatherings: any[];
  selectedDate: string; // YYYY-MM-DD
  onChangeSelectedDate: (date: string) => void;
}

function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarView({ gatherings, selectedDate, onChangeSelectedDate }: CalendarViewProps) {
  const eventsByDate = useMemo(() => {
    const map = new Set<string>();
    (gatherings || []).forEach(g => {
      if (g?.datum) map.add(g.datum);
    });
    return map;
  }, [gatherings]);

  const selectedDateObj = selectedDate ? new Date(selectedDate) : new Date();

  const tileContent = ({ date }: { date: Date }) => {
    const dateKey = formatDateToYYYYMMDD(date);
    const hasEvents = eventsByDate.has(dateKey);
    
    if (hasEvents) {
      return (
        <div style={{
          position: 'absolute',
          bottom: 2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#1aaf5d',
          fontSize: 0
        }} />
      );
    }
    return null;
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateKey = formatDateToYYYYMMDD(date);
    const hasEvents = eventsByDate.has(dateKey);
    
    if (hasEvents) {
      return 'has-events';
    }
    return '';
  };

  return (
    <div style={{ 
      maxWidth: 280, 
      fontSize: '0.9rem',
      '--calendar-border': 'var(--border)',
      '--calendar-selected': 'var(--primary-blue)',
      '--calendar-hover': 'var(--surface-hover)',
      '--calendar-background': 'var(--surface)',
      '--calendar-text': 'var(--text-primary)',
      '--calendar-text-secondary': 'var(--text-secondary)',
      '--calendar-text-muted': 'var(--text-muted)'
    } as React.CSSProperties}>
      <Calendar
        value={selectedDateObj}
        onChange={(value) => {
          if (value instanceof Date) {
            onChangeSelectedDate(formatDateToYYYYMMDD(value));
          }
        }}
        tileContent={tileContent}
        tileClassName={tileClassName}
        formatShortWeekday={(locale, date) => {
          const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
          return days[date.getDay()];
        }}
        maxDetail="month"
        minDetail="month"
        showNeighboringMonth={false}

      />
      
      <style jsx>{`
        :global(.react-calendar) {
          font-family: inherit;
          line-height: 1.125em;
          width: 100%;
          border: 1px solid var(--calendar-border);
          border-radius: 8px;
          padding: 8px;
          background: var(--calendar-background);
        }
        
        :global(.react-calendar__tile) {
          position: relative;
          padding: 8px 4px;
          background: none;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--calendar-text);
          cursor: pointer;
          transition: all 0.15s;
        }
        
        :global(.react-calendar__tile:hover) {
          background: var(--calendar-hover);
        }
        
        :global(.react-calendar__tile--active) {
          background: var(--calendar-selected) !important;
          color: #fff !important;
        }
        
        :global(.react-calendar__tile--now) {
          background: var(--surface-hover);
          color: var(--calendar-text);
          border: 1px solid var(--primary-blue);
        }
        
        :global(.react-calendar__tile--now:hover) {
          background: var(--primary-blue);
          color: #fff;
        }
        
        :global(.react-calendar__navigation) {
          margin-bottom: 8px;
        }
        
        :global(.react-calendar__navigation button) {
          background: none;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.9rem;
          cursor: pointer;
          color: var(--calendar-text);
          transition: background 0.15s;
        }
        
        :global(.react-calendar__navigation button:hover) {
          background: var(--calendar-hover);
        }
        
        :global(.react-calendar__navigation__label) {
          font-weight: 600;
          font-size: 1rem;
          color: var(--calendar-text);
        }
        
        :global(.react-calendar__month-view__weekdays) {
          font-weight: 600;
          font-size: 0.8rem;
          color: var(--calendar-text-secondary);
          margin-bottom: 4px;
        }
        
        :global(.react-calendar__month-view__weekdays__weekday) {
          padding: 4px;
          text-align: center;
        }
        
        :global(.react-calendar__month-view__days__day--neighboringMonth) {
          color: var(--calendar-text-muted);
        }
      `}</style>
    </div>
  );
}