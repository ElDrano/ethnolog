"use client";
import React from 'react';

interface TabNavigationProps {
  optionTabs: string[];
  activeOptionTab: string | null;
  showCalendar: boolean;
  selectedDate: string;
  onTabChange: (tab: string) => void;
  onCalendarToggle: () => void;
  onDeleteOption: (opt: string) => void;
}

export default function TabNavigation({
  optionTabs,
  activeOptionTab,
  showCalendar,
  selectedDate,
  onTabChange,
  onCalendarToggle,
  onDeleteOption
}: TabNavigationProps) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {optionTabs.map((opt: string) => {
        const isActive = activeOptionTab === opt;
        return (
          <div key={opt} style={{ position: 'relative' }}>
            <button
              onClick={() => onTabChange(opt)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: isActive ? '2px solid #ff9800' : '1.5px solid #bbb',
                background: isActive ? '#ff9800' : '#f5f5f5',
                color: isActive ? '#fff' : '#232b5d',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px #ff980033' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {opt}
            </button>
            {/* Löschen-Button für Option-Tabs außer Start */}
            {isActive && opt !== 'Start' && (
              <button
                onClick={() => onDeleteOption(opt)}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: -32,
                  background: '#fff',
                  color: '#b00',
                  border: '1.5px solid #b00',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  marginLeft: 8
                }}
                title="Option löschen"
              >
                🗑
              </button>
            )}
          </div>
        );
      })}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onCalendarToggle}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: showCalendar ? '2px solid #3a4a8c' : '1.5px solid #bbb',
            background: showCalendar ? '#3a4a8c' : '#f5f5f5',
            color: showCalendar ? '#fff' : '#232b5d',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          title="Kalender ein-/ausblenden"
        >
          <span style={{ fontSize: 16 }}>📅</span>
          <span style={{ fontSize: 12, opacity: 0.8 }}>
            {selectedDate ? new Date(selectedDate).toLocaleDateString('de-DE') : 'Heute'}
          </span>
          <span style={{ fontSize: 11, opacity: 0.6 }}>
            {showCalendar ? '▼' : '▶'}
          </span>
        </button>
      </div>
    </div>
  );
}
