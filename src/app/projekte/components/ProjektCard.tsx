import React from 'react';

interface ProjektCardProps {
  projekt: any;
  isOwner: boolean;
  canEdit: boolean;
  onSelect: (projekt: any) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function ProjektCard({ 
  projekt, 
  isOwner, 
  canEdit, 
  onSelect, 
  onDelete, 
  loading 
}: ProjektCardProps) {
  return (
    <li className="projekt-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <button
            onClick={() => onSelect(projekt)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--primary-blue)', 
              fontSize: '1.2rem', 
              fontWeight: 600, 
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: '2px'
            }}
          >
            {projekt.name}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {canEdit && (
            <button
              onClick={() => onDelete(projekt.id)}
              style={{ padding: '4px 10px', borderRadius: 5, background: 'var(--error)', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              disabled={loading}
            >
              Löschen
            </button>
          )}
        </div>
      </div>
      <div style={{ fontSize: '0.95rem', marginTop: 8, marginBottom: 8 }} className="text-secondary">
        Erstellt: {projekt.created_at ? new Date(projekt.created_at).toLocaleString() : "-"}
        {projekt.updated_at && (
          <>
            <br />Letzte Änderung: {new Date(projekt.updated_at).toLocaleString()}
          </>
        )}
        {projekt.arbeitsweise && (
          <>
            <br />Arbeitsweise: {projekt.arbeitsweise === 'vor_ort' ? 'Vor Ort' : projekt.arbeitsweise === 'hybrid' ? 'Hybrid' : 'Nur remote'}
          </>
        )}
      </div>
    </li>
  );
} 