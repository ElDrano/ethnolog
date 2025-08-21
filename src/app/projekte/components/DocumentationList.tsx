"use client";
import React from 'react';
import SecureFileDisplay from './SecureFileDisplay';

interface DocumentationListProps {
  documentations: any[];
  activeDocumentationFilters: string[];
  expandedDocumentations: {[id:string]: boolean};
  onToggleExpanded: (docId: string) => void;
  onEditDocumentation: (doc: any) => void;
  onDeleteDocumentation: (docId: string) => void;
}

export default function DocumentationList({
  documentations,
  activeDocumentationFilters,
  expandedDocumentations,
  onToggleExpanded,
  onEditDocumentation,
  onDeleteDocumentation
}: DocumentationListProps) {
  const filteredDocumentations = documentations.filter(doc => {
    if (activeDocumentationFilters.length === 0) return true;
    if (activeDocumentationFilters.includes('archiv')) return doc.typ === 'archiv';
    return activeDocumentationFilters.includes(doc.untertyp);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {filteredDocumentations.map((doc) => (
        <div
          key={doc.id}
          className="documentation-item"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onToggleExpanded(doc.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#666' }}>
                  {expandedDocumentations[doc.id] ? '▼' : '▶'}
                </span>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }} className="text-primary">
                  {doc.name}
                </h4>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, marginTop: 4 }} className="text-secondary">
                <span>
                  {doc.typ === 'archiv' ? '📁 Archiv' : 
                   doc.untertyp === 'meeting' ? '📅 Meeting' :
                   doc.untertyp === 'interview' ? '🎤 Interview' :
                   doc.untertyp === 'fieldnote' ? '📝 Feldnotiz' : '📄 Dokumentation'}
                </span>
                {doc.startzeit && doc.endzeit && (
                  <span>{doc.startzeit} - {doc.endzeit}</span>
                )}
                <span>{new Date(doc.created_at).toLocaleDateString('de-DE')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => onEditDocumentation(doc)}
                style={{
                  background: 'var(--primary-blue)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                Bearbeiten
              </button>
              <button
                onClick={() => onDeleteDocumentation(doc.id)}
                style={{
                  background: 'var(--error)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                Löschen
              </button>
            </div>
          </div>
          
          {doc.beschreibung && (
            <p style={{ margin: '8px 0', fontSize: 14, lineHeight: 1.4 }} className="text-primary">
              {doc.beschreibung}
            </p>
          )}
          
          {/* Spezifische Details je nach Typ */}
          {doc.untertyp === 'meeting' && doc.meeting_typ && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              <strong>Typ:</strong> {doc.meeting_typ === 'online' ? 'Online' : 
                                   doc.meeting_typ === 'offline' ? 'Offline' : 'Hybrid'}
              {doc.klient && <span style={{ marginLeft: 12 }}><strong>Klient:</strong> {doc.klient}</span>}
            </div>
          )}
          
          {doc.untertyp === 'interview' && doc.interview_typ && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              <strong>Typ:</strong> {doc.interview_typ === 'online' ? 'Online' : 
                                     doc.interview_typ === 'offline' ? 'Offline' : 'Hybrid'}
            </div>
          )}
          
          {/* Personen anzeigen */}
          {doc.personen && doc.personen.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 }}>
                {doc.untertyp === 'meeting' ? 'Teilnehmer:' : 'Personen:'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {doc.personen.map((person: any, index: number) => (
                  <span
                    key={index}
                    className="documentation-person-tag"
                  >
                    {person.vorname} {person.nachname}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Dateien anzeigen - kompakt wenn nicht ausgeklappt */}
          {doc.dateien && doc.dateien.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 }}>
                Dateien ({doc.dateien.length}):
              </div>
              {expandedDocumentations[doc.id] ? (
                // Vollständige Datei-Vorschau wenn ausgeklappt
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {doc.dateien.map((file: any, index: number) => (
                    <SecureFileDisplay
                      key={index}
                      file={file}
                    />
                  ))}
                </div>
              ) : (
                // Kompakte Datei-Liste wenn nicht ausgeklappt
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {doc.dateien.map((file: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {file.type.startsWith('image/') ? '🖼️' : 
                       file.type.startsWith('video/') ? '🎥' : 
                       file.type.startsWith('audio/') ? '🎵' : '📄'}
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ausklappbare Details */}
          {expandedDocumentations[doc.id] && (
            <div style={{ marginTop: 16, padding: 16, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
              {/* Dialoge anzeigen */}
              {doc.dialoge && doc.dialoge.length > 0 && doc.dialoge.some((d: any) => d.text?.trim()) && (
                <div style={{ marginBottom: 16 }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#232b5d' }}>
                    Dialoge:
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {doc.dialoge.map((dialog: any, index: number) => (
                      dialog.text?.trim() && (
                        <div key={index} style={{ 
                          padding: 8, 
                          background: '#fff', 
                          borderRadius: 4, 
                          border: '1px solid #dee2e6',
                          fontSize: 13,
                          lineHeight: 1.4
                        }}>
                          <strong>Dialog {index + 1}:</strong><br />
                          {dialog.text}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Kernfragen anzeigen (nur für Interviews) */}
              {doc.untertyp === 'interview' && doc.kernfragen && doc.kernfragen.length > 0 && doc.kernfragen.some((k: any) => k.frage?.trim() || k.antwort?.trim()) && (
                <div style={{ marginBottom: 16 }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#232b5d' }}>
                    Kernfragen & Antworten:
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {doc.kernfragen.map((kernfrage: any, index: number) => (
                      (kernfrage.frage?.trim() || kernfrage.antwort?.trim()) && (
                        <div key={index} style={{ 
                          padding: 8, 
                          background: '#fff', 
                          borderRadius: 4, 
                          border: '1px solid #dee2e6',
                          fontSize: 13,
                          lineHeight: 1.4
                        }}>
                          <strong>Kernfrage {index + 1}:</strong><br />
                          <strong>Frage:</strong> {kernfrage.frage}<br />
                          <strong>Antwort:</strong> {kernfrage.antwort}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Vollständige Personen-Liste */}
              {doc.personen && doc.personen.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#232b5d' }}>
                    {doc.untertyp === 'meeting' ? 'Teilnehmer Details:' : 'Personen Details:'}
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {doc.personen.map((person: any, index: number) => (
                      <div key={index} style={{ 
                        padding: 8, 
                        background: '#fff', 
                        borderRadius: 4, 
                        border: '1px solid #dee2e6',
                        fontSize: 13
                      }}>
                        <strong>{person.vorname} {person.nachname}</strong><br />
                        {person.position && <span><strong>Position:</strong> {person.position}<br /></span>}
                        {person.email && <span><strong>E-Mail:</strong> {person.email}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadaten */}
              <div style={{ fontSize: 12, color: '#666', borderTop: '1px solid #dee2e6', paddingTop: 8 }}>
                <strong>Erstellt:</strong> {new Date(doc.created_at).toLocaleString('de-DE')}<br />
                {doc.updated_at && doc.updated_at !== doc.created_at && (
                  <span><strong>Zuletzt bearbeitet:</strong> {new Date(doc.updated_at).toLocaleString('de-DE')}</span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
