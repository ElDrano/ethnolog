"use client";
import { useState, useEffect } from "react";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.toggle("light-mode", !darkMode);
    }
  }, [darkMode]);

  // Light Mode erkennen
  const isLight = typeof window !== "undefined" && document.body.classList.contains("light-mode");

  return (
    <button
      onClick={() => setDarkMode((d) => !d)}
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 100,
        background: isLight ? 'var(--primary-blue)' : 'var(--surface)',
        color: isLight ? 'white' : 'var(--text-primary)',
        border: isLight ? 'none' : '1px solid var(--border)',
        borderRadius: 12,
        padding: '12px 20px',
        fontWeight: 500,
        fontSize: 14,
        boxShadow: 'var(--shadow)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      <span style={{ fontSize: '16px' }}>
        {darkMode ? '☀️' : '🌙'}
      </span>
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
} 