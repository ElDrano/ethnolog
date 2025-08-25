"use client";
import React, { useState } from 'react';

interface ProjectInfoCardProps {
  projekt: any;
  canEdit?: boolean;
  onNameUpdate?: (projektId: string, newName: string) => Promise<void>;
  onDescUpdate?: (projektId: string, newDesc: string) => Promise<void>;
  onDelete?: (projektId: string) => void;
  loading?: boolean;
}

export default function ProjectInfoCard({ projekt, canEdit = false, onNameUpdate, onDescUpdate, onDelete, loading = false }: ProjectInfoCardProps) {
  // eigener State für das Öffnen/Schließen der Beschreibung
  const [openDesc, setOpenDesc] = useState<{ [key: string]: boolean }>({});
  
  // States für die Bearbeitung
  const [editStates, setEditStates] = useState<{ [key: string]: boolean }>({});
  const [editNames, setEditNames] = useState<{ [key: string]: string }>({});
  const [editDescs, setEditDescs] = useState<{ [key: string]: string }>({});
  const [localLoading, setLocalLoading] = useState(false);

  // Handler für das Speichern des Namens
  const handleNameSave = async (projektId: string) => {
    if (!onNameUpdate) return;
    
    const newName = editNames[projektId] || '';
    if (!newName.trim()) {
      alert('Bitte geben Sie einen Namen ein.');
      return;
    }
    
    setLocalLoading(true);
    try {
      await onNameUpdate(projektId, newName);
      setEditStates({ ...editStates, [projektId]: false });
    } catch (error) {
      console.error('Fehler beim Speichern des Namens:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Handler für das Speichern der Beschreibung
  const handleDescSave = async (projektId: string) => {
    if (!onDescUpdate) return;
    
    const newDesc = editDescs[projektId] || '';
    
    setLocalLoading(true);
    try {
      await onDescUpdate(projektId, newDesc);
      setOpenDesc({ ...openDesc, [projektId]: false });
    } catch (error) {
      console.error('Fehler beim Speichern der Beschreibung:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="documentation-item" style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      transition: 'all 0.2s ease',
      boxShadow: 'var(--shadow)',
      color: 'var(--text-primary)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.3rem', 
          fontWeight: 700, 
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          {canEdit ? (
            editStates[projekt.id] ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="text"
                  value={editNames[projekt.id] ?? projekt.name ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditNames({ ...editNames, [projekt.id]: e.target.value })}
                  style={{ 
                    padding: 8, 
                    borderRadius: 6, 
                    border: '1px solid var(--border)', 
                    minWidth: 200, 
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button 
                  onClick={() => handleNameSave(projekt.id)} 
                  style={{ 
                    background: 'var(--button)', 
                    color: 'var(--text-primary)', 
                    border: 'none', 
                    borderRadius: 6, 
                    padding: '6px 12px', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    fontSize: 14,
                    transition: 'all 0.2s ease'
                  }}
                  disabled={loading || localLoading}
                >
                  Speichern
                </button>
                <button 
                  onClick={() => setEditStates({ ...editStates, [projekt.id]: false })} 
                  style={{ 
                    background: 'var(--surface)', 
                    color: 'var(--text-primary)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 6, 
                    padding: '6px 12px', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                  disabled={loading || localLoading}
                >
                  Abbrechen
                </button>
              </div>
            ) 
            : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>{projekt.name}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => setEditStates({ ...editStates, [projekt.id]: true })} 
                    style={{ 
                      background: 'transparent', 
                      color: 'var(--primary-blue)', 
                      border: 'none', 
                      borderRadius: 6, 
                      padding: '8px', 
                      cursor: 'pointer',
                      fontSize: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36
                    }}
                    title="Bearbeiten"
                  >
                    ✏️
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(projekt.id)}
                      style={{ 
                        background: 'transparent', 
                        color: 'var(--error)', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '8px', 
                        cursor: 'pointer',
                        fontSize: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36
                      }}
                      disabled={loading || localLoading}
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            projekt.name
          )}
        </h2>
      </div>
      
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Beschreibung:</h3>
          {canEdit && (
            <button
              onClick={() => setOpenDesc({ ...openDesc, [projekt.id]: !openDesc[projekt.id] })}
              style={{ 
                background: 'transparent', 
                border: '1px solid var(--border)', 
                color: 'var(--text-primary)', 
                borderRadius: 4, 
                padding: '2px 8px', 
                fontSize: 12, 
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {openDesc[projekt.id] ? '▼' : '▶'}
            </button>
          )}
        </div>
        
        {openDesc[projekt.id] ? (
          canEdit ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea
                placeholder="Beschreibung..."
                value={editDescs[projekt.id] ?? projekt.beschreibung ?? ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescs({ ...editDescs, [projekt.id]: e.target.value })}
                style={{ 
                  width: '100%', 
                  minHeight: 80, 
                  borderRadius: 6, 
                  border: '1px solid var(--border)', 
                  padding: 8, 
                  color: 'var(--text-primary)', 
                  fontWeight: 500,
                  background: 'var(--surface)',
                  fontSize: '0.9rem'
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => handleDescSave(projekt.id)} 
                  style={{ 
                    background: 'var(--primary-blue)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 6, 
                    padding: '6px 12px', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                  disabled={loading || localLoading}
                >
                  Speichern
                </button>
                <button 
                  onClick={() => {
                    setEditDescs({ ...editDescs, [projekt.id]: projekt.beschreibung ?? "" });
                    setOpenDesc({ ...openDesc, [projekt.id]: false });
                  }} 
                  style={{ 
                    background: 'var(--surface)', 
                    color: 'var(--text-primary)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 6, 
                    padding: '6px 12px', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                  disabled={loading || localLoading}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              minHeight: 80, 
              borderRadius: 6, 
              border: '1px solid var(--border)', 
              padding: 8, 
              color: 'var(--text-primary)', 
              fontWeight: 500, 
              background: 'var(--surface)',
              fontSize: '0.9rem'
            }}>
              {projekt.beschreibung || <span style={{ opacity: 0.6 }}>[Keine Beschreibung]</span>}
            </div>
          )
        ) : (
          <div style={{ 
            fontSize: '0.9rem', 
            opacity: 0.9, 
            fontStyle: 'italic',
            padding: '8px 0',
            lineHeight: 1.4,
            color: 'var(--text-primary)'
          }}>
            {projekt.beschreibung ? 
              (projekt.beschreibung.length > 200 ? projekt.beschreibung.substring(0, 200) + '...' : projekt.beschreibung) : 
              '[Keine Beschreibung]'
            }
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
        <span>Erstellt: {projekt.created_at ? new Date(projekt.created_at).toLocaleDateString() : "-"}</span>
        {projekt.updated_at && <span>Letzte Änderung: {new Date(projekt.updated_at).toLocaleDateString()}</span>}
        {projekt.arbeitsweise && <span>Arbeitsweise: {projekt.arbeitsweise === 'vor_ort' ? 'Vor Ort' : projekt.arbeitsweise === 'hybrid' ? 'Hybrid' : 'Nur remote'}</span>}
      </div>
    </div>
  );
}
