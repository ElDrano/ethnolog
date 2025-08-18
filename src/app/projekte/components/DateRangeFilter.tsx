"use client";
import React, { useState } from 'react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearRange: () => void;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearRange
}: DateRangeFilterProps) {
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Dark Mode CSS Variables
  const isDarkMode = typeof window !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  const containerStyle = {
    display: 'flex' as const,
    gap: 12,
    marginBottom: 16,
    alignItems: 'center' as const,
    padding: '12px 16px',
    backgroundColor: isDarkMode ? '#2d3748' : '#f8f9fa',
    borderRadius: 8,
    border: `1px solid ${isDarkMode ? '#4a5568' : '#e9ecef'}`
  };

  const labelStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: isDarkMode ? '#e2e8f0' : '#495057'
  };

  const subLabelStyle = {
    fontSize: 12,
    color: isDarkMode ? '#a0aec0' : '#6c757d'
  };

  const inputStyle = {
    padding: '6px 10px',
    border: `1px solid ${isDarkMode ? '#4a5568' : '#ced4da'}`,
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: isDarkMode ? '#1a202c' : '#fff',
    color: isDarkMode ? '#e2e8f0' : '#495057',
    cursor: 'pointer'
  };

  const buttonStyle = {
    padding: '6px 12px',
    border: '1px solid #dc3545',
    borderRadius: 4,
    backgroundColor: isDarkMode ? '#2d3748' : '#fff',
    color: '#dc3545',
    cursor: 'pointer' as const,
    fontSize: 12,
    fontWeight: 600
  };

  const infoStyle = {
    fontSize: 12,
    color: isDarkMode ? '#a0aec0' : '#6c757d',
    marginLeft: 'auto' as const,
    fontStyle: 'italic' as const
  };

  const calendarButtonStyle = {
    padding: '4px 8px',
    border: `1px solid ${isDarkMode ? '#4a5568' : '#ced4da'}`,
    borderRadius: 4,
    backgroundColor: isDarkMode ? '#1a202c' : '#fff',
    color: isDarkMode ? '#e2e8f0' : '#495057',
    cursor: 'pointer' as const,
    fontSize: 12,
    marginLeft: 4
  };

  // Einfache Kalender-Komponente
  const SimpleCalendar = ({ 
    selectedDate, 
    onDateSelect, 
    onClose, 
    isVisible 
  }: {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    onClose: () => void;
    isVisible: boolean;
  }) => {
    if (!isVisible) return null;

         const today = new Date();
     const currentMonth = selectedDate ? new Date(selectedDate) : today;
     const [displayMonth, setDisplayMonth] = useState(currentMonth);

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDay = firstDay.getDay();
      
      const days = [];
      // Leere Tage am Anfang
      for (let i = 0; i < startingDay; i++) {
        days.push(null);
      }
      // Tage des Monats
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }
      return days;
    };

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const days = getDaysInMonth(displayMonth);
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

         return (
       <div style={{
         position: 'absolute' as const,
         top: '100%',
         left: 0,
         zIndex: 1000,
         backgroundColor: isDarkMode ? '#2d3748' : '#fff',
         border: `1px solid ${isDarkMode ? '#4a5568' : '#ced4da'}`,
         borderRadius: 8,
         padding: 12,
         boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
         minWidth: 280
       }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12
        }}>
                     <button
             onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1))}
             style={{
               background: 'none',
               border: 'none',
               color: isDarkMode ? '#e2e8f0' : '#495057',
               cursor: 'pointer',
               fontSize: 16,
               padding: '4px 8px',
               borderRadius: 4
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.backgroundColor = isDarkMode ? '#4a5568' : '#f8f9fa';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.backgroundColor = 'transparent';
             }}
           >
             ‹
           </button>
           <span style={{
             fontWeight: 600,
             color: isDarkMode ? '#e2e8f0' : '#495057'
           }}>
             {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
           </span>
           <button
             onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1))}
             style={{
               background: 'none',
               border: 'none',
               color: isDarkMode ? '#e2e8f0' : '#495057',
               cursor: 'pointer',
               fontSize: 16,
               padding: '4px 8px',
               borderRadius: 4
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.backgroundColor = isDarkMode ? '#4a5568' : '#f8f9fa';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.backgroundColor = 'transparent';
             }}
           >
             ›
           </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          marginBottom: 8
        }}>
          {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
            <div key={day} style={{
              textAlign: 'center' as const,
              fontSize: 12,
              fontWeight: 600,
              color: isDarkMode ? '#a0aec0' : '#6c757d',
              padding: '4px'
            }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4
        }}>
                     {days.map((day, index) => (
             <button
               key={index}
               onClick={() => {
                 if (day) {
                   onDateSelect(formatDate(day));
                   onClose();
                 }
               }}
               disabled={!day}
               style={{
                 background: day ? (formatDate(day) === selectedDate ? '#ff9800' : 'transparent') : 'transparent',
                 border: 'none',
                 borderRadius: 4,
                 padding: '8px 4px',
                 cursor: day ? 'pointer' : 'default',
                 color: day ? (formatDate(day) === selectedDate ? '#fff' : (isDarkMode ? '#e2e8f0' : '#495057')) : 'transparent',
                 fontSize: 14,
                 fontWeight: day && formatDate(day) === selectedDate ? 600 : 400
               }}
               onMouseEnter={(e) => {
                 if (day && formatDate(day) !== selectedDate) {
                   e.currentTarget.style.backgroundColor = isDarkMode ? '#4a5568' : '#f8f9fa';
                 }
               }}
               onMouseLeave={(e) => {
                 if (day && formatDate(day) !== selectedDate) {
                   e.currentTarget.style.backgroundColor = 'transparent';
                 }
               }}
             >
               {day ? day.getDate() : ''}
             </button>
           ))}
        </div>

                 <div style={{
           display: 'flex',
           justifyContent: 'space-between',
           marginTop: 12,
           paddingTop: 8,
           borderTop: `1px solid ${isDarkMode ? '#4a5568' : '#e9ecef'}`
         }}>
           <button
             onClick={() => {
               onDateSelect(formatDate(today));
               onClose();
             }}
             style={{
               background: 'none',
               border: 'none',
               color: '#ff9800',
               cursor: 'pointer',
               fontSize: 12,
               fontWeight: 600,
               padding: '4px 8px',
               borderRadius: 4
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.backgroundColor = isDarkMode ? '#4a5568' : '#f8f9fa';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.backgroundColor = 'transparent';
             }}
           >
             Heute
           </button>
           <button
             onClick={onClose}
             style={{
               background: 'none',
               border: 'none',
               color: isDarkMode ? '#a0aec0' : '#6c757d',
               cursor: 'pointer',
               fontSize: 12,
               padding: '4px 8px',
               borderRadius: 4
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.backgroundColor = isDarkMode ? '#4a5568' : '#f8f9fa';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.backgroundColor = 'transparent';
             }}
           >
             Schließen
           </button>
         </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={labelStyle}>
          📅 Datumsbereich:
        </label>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' as const }}>
        <label style={subLabelStyle}>Von:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          style={inputStyle}
          readOnly
        />
        <button
          onClick={() => setShowStartCalendar(!showStartCalendar)}
          style={calendarButtonStyle}
          title="Kalender öffnen"
        >
          📅
        </button>
        <SimpleCalendar
          selectedDate={startDate}
          onDateSelect={onStartDateChange}
          onClose={() => setShowStartCalendar(false)}
          isVisible={showStartCalendar}
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' as const }}>
        <label style={subLabelStyle}>Bis:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          style={inputStyle}
          readOnly
        />
        <button
          onClick={() => setShowEndCalendar(!showEndCalendar)}
          style={calendarButtonStyle}
          title="Kalender öffnen"
        >
          📅
        </button>
        <SimpleCalendar
          selectedDate={endDate}
          onDateSelect={onEndDateChange}
          onClose={() => setShowEndCalendar(false)}
          isVisible={showEndCalendar}
        />
      </div>
      
      <button
        onClick={onClearRange}
        style={buttonStyle}
        title="Datumsbereich zurücksetzen"
      >
        Zurücksetzen
      </button>
      
      <div style={infoStyle}>
        {startDate && endDate ? 
          `${new Date(startDate).toLocaleDateString('de-DE')} - ${new Date(endDate).toLocaleDateString('de-DE')}` : 
          'Alle Dokumentationen anzeigen'
        }
      </div>
    </div>
  );
}
