import React from 'react';

interface DeleteDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function DeleteDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Löschen",
  cancelText = "Abbrechen",
  loading = false
}: DeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: '#0008', 
      zIndex: 1000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: 10, 
        padding: '2rem 2.5rem', 
        minWidth: 320, 
        boxShadow: '0 2px 16px #0003', 
        color: '#232b5d' 
      }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>{title}</div>
        <div style={{ marginBottom: 18 }}>{message}</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            style={{ 
              background: '#b00', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: '8px 18px', 
              fontWeight: 600, 
              fontSize: 16, 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {confirmText}
          </button>
          <button 
            onClick={onCancel} 
            disabled={loading}
            style={{ 
              background: '#bbb', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: '8px 18px', 
              fontWeight: 600, 
              fontSize: 16, 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {cancelText}
          </button>
        </div>
        <button 
          onClick={onCancel} 
          disabled={loading}
          style={{ 
            background: 'transparent', 
            color: '#232b5d', 
            border: 'none', 
            fontWeight: 600, 
            fontSize: 15, 
            cursor: loading ? 'not-allowed' : 'pointer', 
            marginTop: 8 
          }}
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
} 