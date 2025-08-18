"use client";
import React from 'react';

interface DeleteProjectDialogProps {
  open: boolean;
  projektName: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteProjectDialog({ open, projektName, loading, onConfirm, onClose }: DeleteProjectDialogProps) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: '2rem 2.5rem', minWidth: 320, boxShadow: '0 2px 16px #0003', color: '#232b5d' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>Projekt wirklich löschen?</div>
        <div style={{ marginBottom: 18 }}>
          Möchtest du das Projekt "{projektName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <button onClick={onConfirm} disabled={loading} style={{ background: '#b00', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Projekt löschen</button>
          <button onClick={onClose} style={{ background: '#bbb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}


