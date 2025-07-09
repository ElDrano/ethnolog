"use client";
import { useState, useEffect } from "react";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.toggle("light-mode", !darkMode);
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode((d) => !d)}
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 100,
        background: darkMode ? '#fff' : '#232b5d',
        color: darkMode ? '#232b5d' : '#fff',
        border: 'none',
        borderRadius: 24,
        padding: '8px 20px',
        fontWeight: 600,
        fontSize: 16,
        boxShadow: '0 2px 8px #0002',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
} 