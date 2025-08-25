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
          background: 'var(--button)',
          color: 'var(--text-primary)',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ fontSize: 16 }}>+</span>
        Archiv-Dokumentation
      </button>
      <button
        onClick={onLiveClick}
        style={{
          background: 'var(--button)',
          color: 'var(--text-primary)',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ fontSize: 16 }}>+</span>
        Live-Dokumentation
      </button>
    </div>
  );
}
