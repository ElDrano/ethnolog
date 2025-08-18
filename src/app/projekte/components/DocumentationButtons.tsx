"use client";
import React from 'react';

interface DocumentationButtonsProps {
  onArchivClick: () => void;
  onLiveClick: () => void;
}

export default function DocumentationButtons({
  onArchivClick,
  onLiveClick
}: DocumentationButtonsProps) {
  return (
    <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
      <button
        onClick={onArchivClick}
        style={{
          background: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        <span style={{ fontSize: 16 }}>+</span>
        Archiv-Dokumentation
      </button>
      <button
        onClick={onLiveClick}
        style={{
          background: '#2196F3',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        <span style={{ fontSize: 16 }}>+</span>
        Live-Dokumentation
      </button>
    </div>
  );
}
