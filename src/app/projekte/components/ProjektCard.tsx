import React, { useState } from 'react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Verhindere Ausklappen wenn auf den Namen oder Löschen-Button geklickt wird
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Verhindere das Ausklappen der Karte
    onSelect(projekt);
  };

  return (
    <li 
      className="projekt-card" 
      style={{ 
        cursor: 'pointer',
        padding: '16px',
        marginBottom: '12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow)',
        transition: 'all 0.2s ease'
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <button
            onClick={handleNameClick}
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
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Verhindere das Ausklappen der Karte
                onDelete(projekt.id);
              }}
              style={{ 
                padding: '4px 10px', 
                borderRadius: 5, 
                background: 'var(--error)', 
                border: 'none', 
                fontWeight: 600, 
                cursor: 'pointer',
                color: 'white'
              }}
              disabled={loading}
            >
              Löschen
            </button>
          )}
        </div>
      </div>

      {/* Beschreibung - immer sichtbar */}
      {projekt.beschreibung && (
        <div style={{ 
          fontSize: '0.95rem', 
          marginTop: 8, 
          marginBottom: 8,
          color: 'var(--text-secondary)',
          lineHeight: '1.4'
        }}>
          {projekt.beschreibung}
        </div>
      )}

      {/* Ausklappbare Details */}
      {isExpanded && (
        <div style={{ 
          fontSize: '0.9rem', 
          marginTop: 12, 
          paddingTop: 12, 
          borderTop: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          lineHeight: '1.5'
        }}>
          <div style={{ marginBottom: 4 }}>
            <strong>Erstellt:</strong> {projekt.created_at ? new Date(projekt.created_at).toLocaleString('de-DE') : "-"}
          </div>
          {projekt.updated_at && (
            <div style={{ marginBottom: 4 }}>
              <strong>Letzte Änderung:</strong> {new Date(projekt.updated_at).toLocaleString('de-DE')}
            </div>
          )}
          {projekt.arbeitsweise && (
            <div style={{ marginBottom: 4 }}>
              <strong>Arbeitsweise:</strong> {projekt.arbeitsweise === 'vor_ort' ? 'Vor Ort' : projekt.arbeitsweise === 'hybrid' ? 'Hybrid' : 'Nur remote'}
            </div>
          )}
          {projekt.optionen && Array.isArray(projekt.optionen) && projekt.optionen.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <strong>Optionen:</strong> {projekt.optionen.join(', ')}
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Klicken Sie auf den Projektnamen, um zur Detailansicht zu gelangen
          </div>
        </div>
      )}

      {/* Kompakte Info wenn nicht ausgeklappt */}
      {!isExpanded && (
        <div style={{ 
          fontSize: '0.85rem', 
          marginTop: 8, 
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            Erstellt: {projekt.created_at ? new Date(projekt.created_at).toLocaleDateString('de-DE') : "-"}
          </span>
          <span style={{ fontSize: '0.8rem' }}>
            Klicken zum Ausklappen
          </span>
        </div>
      )}
    </li>
  );
} 