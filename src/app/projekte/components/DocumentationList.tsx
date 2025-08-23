"use client";
import React from 'react';
import SecureFileDisplay from './SecureFileDisplay';

interface DocumentationListProps {
  documentations: any[];
  activeDocumentationFilters: string[];
  showAll: boolean;
  expandedDocumentations: {[id:string]: boolean};
  onToggleExpanded: (docId: string) => void;
  onEditDocumentation: (doc: any) => void;
  onDeleteDocumentation: (docId: string) => void;
  selectedDocumentations: string[];
  onToggleDocumentationSelection: (docId: string) => void;
  onSelectAllDocumentations: (selectAll: boolean) => void;
  selectedTags: string[];
}

export default function DocumentationList({
  documentations,
  activeDocumentationFilters,
  showAll,
  expandedDocumentations,
  onToggleExpanded,
  onEditDocumentation,
  onDeleteDocumentation,
  selectedDocumentations,
  onToggleDocumentationSelection,
  onSelectAllDocumentations,
  selectedTags
}: DocumentationListProps) {
  const filteredDocumentations = documentations.filter(doc => {
    if (showAll) {
      // Wenn "Alle" aktiviert ist, nur Tag-Filter anwenden
      if (selectedTags.length === 0) return true;
      
      // Tag-Filter anwenden
      if (!doc.tags || !Array.isArray(doc.tags)) return false;
      return selectedTags.every(tag => doc.tags.includes(tag));
    }
    
    if (activeDocumentationFilters.length === 0) return false; // Wenn keine Filter aktiv sind, nichts anzeigen
    
    // Prüfen ob Archiv ausgewählt ist
    const isArchivSelected = activeDocumentationFilters.includes('archiv');
    const isArchivDoc = doc.typ === 'archiv';
    
    // Prüfen ob Live-Dokumentationstypen ausgewählt sind
    const isLiveTypeSelected = activeDocumentationFilters.some(filter => 
      filter === 'meeting' || filter === 'interview' || filter === 'fieldnote'
    );
    const isLiveDoc = doc.typ === 'live' && activeDocumentationFilters.includes(doc.untertyp);
    
    // Typ-Filter prüfen
    const passesTypeFilter = (isArchivSelected && isArchivDoc) || (isLiveTypeSelected && isLiveDoc);
    
    // Tag-Filter prüfen
    if (selectedTags.length === 0) {
      return passesTypeFilter;
    }
    
    if (!doc.tags || !Array.isArray(doc.tags)) return false;
    const passesTagFilter = selectedTags.every(tag => doc.tags.includes(tag));
    
    // Beide Filter müssen passen
    return passesTypeFilter && passesTagFilter;
  });

  const allFilteredSelected = filteredDocumentations.length > 0 && 
    filteredDocumentations.every(doc => selectedDocumentations.includes(doc.id));
  const someFilteredSelected = filteredDocumentations.some(doc => selectedDocumentations.includes(doc.id));

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      // Alle abwählen
      const docIdsToRemove = filteredDocumentations.map(doc => doc.id);
      const newSelected = selectedDocumentations.filter(id => !docIdsToRemove.includes(id));
      onSelectAllDocumentations(false);
    } else {
      // Alle auswählen
      const docIdsToAdd = filteredDocumentations.map(doc => doc.id);
      const newSelected = [...new Set([...selectedDocumentations, ...docIdsToAdd])];
      onSelectAllDocumentations(true);
    }
  };

  return (
    <div>
      {/* Auswahl-Header */}
      {filteredDocumentations.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <input
            type="checkbox"
            checked={allFilteredSelected}
            ref={(input) => {
              if (input) input.indeterminate = someFilteredSelected && !allFilteredSelected;
            }}
            onChange={handleSelectAll}
            style={{ cursor: 'pointer' }}
          />
          <span>
            {allFilteredSelected ? 'Alle abwählen' : 'Alle auswählen'} 
            ({selectedDocumentations.length} von {filteredDocumentations.length} ausgewählt)
          </span>
        </div>
      )}

      {/* Dokumentationsliste */}
      {filteredDocumentations.map((doc) => (
        <div key={doc.id} className="documentation-item" style={{
          padding: '16px',
          marginBottom: 8,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: selectedDocumentations.includes(doc.id) ? '0 0 8px 8px' : 8,
          boxShadow: 'var(--shadow)',
          position: 'relative'
        }}>
          {/* Auswahl-Checkbox */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1
          }}>
            <input
              type="checkbox"
              checked={selectedDocumentations.includes(doc.id)}
              onChange={() => onToggleDocumentationSelection(doc.id)}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* Dokumentationsinhalt mit Padding für Checkbox */}
          <div style={{ paddingLeft: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {doc.name}
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  {doc.typ === 'archiv' ? 'Archiv' : 
                   doc.untertyp === 'meeting' ? 'Meeting' :
                   doc.untertyp === 'interview' ? 'Interview' :
                   doc.untertyp === 'fieldnote' ? 'Feldnotiz' : 'Dokumentation'} • {new Date(doc.datum).toLocaleDateString('de-DE')}
                  {doc.startzeit && doc.endzeit && ` • ${doc.startzeit} - ${doc.endzeit}`}
                </div>
                
                {doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {doc.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        style={{
                          padding: '2px 6px',
                          background: 'var(--primary-blue)',
                          color: 'white',
                          borderRadius: 8,
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => onToggleExpanded(doc.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {expandedDocumentations[doc.id] ? 'Weniger' : 'Mehr'}
                </button>
                
                <button
                  onClick={() => onEditDocumentation(doc)}
                  style={{
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: 'white'
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
                    fontSize: '0.8rem',
                    color: 'white'
                  }}
                >
                  Löschen
                </button>
              </div>
            </div>

            {expandedDocumentations[doc.id] && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                {doc.beschreibung && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Beschreibung:</strong> {doc.beschreibung}
                  </div>
                )}

                {doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Tags:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {doc.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          style={{
                            padding: '4px 8px',
                            background: 'var(--primary-blue)',
                            color: 'white',
                            borderRadius: 12,
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {doc.personen && Array.isArray(doc.personen) && doc.personen.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Personen:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                      {doc.personen.map((person: any, index: number) => (
                        <li key={index}>
                          {person.name || `${person.vorname} ${person.nachname}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {doc.dialoge && Array.isArray(doc.dialoge) && doc.dialoge.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Dialoge:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                      {doc.dialoge
                        .filter((dialog: any) => dialog.text)
                        .map((dialog: any, index: number) => (
                          <li key={index}>{dialog.text}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {doc.kernfragen && Array.isArray(doc.kernfragen) && doc.kernfragen.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Kernfragen:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                      {doc.kernfragen
                        .filter((kernfrage: any) => kernfrage.frage)
                        .map((kernfrage: any, index: number) => (
                          <li key={index}>
                            <strong>Frage:</strong> {kernfrage.frage}
                            {kernfrage.antwort && (
                              <div style={{ marginLeft: 16, marginTop: 4 }}>
                                <strong>Antwort:</strong> {kernfrage.antwort}
                              </div>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                                 {doc.dateien && Array.isArray(doc.dateien) && doc.dateien.length > 0 && (
                   <div>
                     <strong>Angehängte Dateien:</strong>
                     <div style={{ marginTop: 8 }}>
                       {doc.dateien.map((file: any, index: number) => (
                         <SecureFileDisplay key={index} file={file} />
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      ))}

      {filteredDocumentations.length === 0 && (
        <div className="documentation-item" style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: 'var(--text-muted)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: 'var(--shadow)',
          fontStyle: 'italic'
        }}>
          Keine Dokumentationen mit den aktuellen Filtern gefunden.
        </div>
      )}
    </div>
  );
}
