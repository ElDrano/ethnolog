"use client";
import React, { useState, useEffect } from 'react';

interface DocumentationFiltersProps {
  documentations: any[];
  activeDocumentationFilters: string[];
  onFilterChange: (filters: string[], showAll: boolean) => void;
  statusFilter: 'alle' | 'fertig' | 'unfertig';
  onStatusFilterChange: (status: 'alle' | 'fertig' | 'unfertig') => void;
  onExportWord?: () => void;
  onExportPDF?: () => void;
  exportingWord?: boolean;
  exportingPDF?: boolean;
}

export default function DocumentationFilters({
  documentations,
  activeDocumentationFilters,
  onFilterChange,
  statusFilter,
  onStatusFilterChange,
  onExportWord,
  onExportPDF,
  exportingWord = false,
  exportingPDF = false
}: DocumentationFiltersProps) {
  const [showAll, setShowAll] = useState(activeDocumentationFilters.length === 0);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Click outside handler für das Export Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showExportDropdown && !target.closest('[data-export-dropdown]')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  const handleFilterToggle = (filterType: string) => {
    setShowAll(false); // Wenn ein spezifischer Filter gewählt wird, "Alle" deaktivieren
    if (activeDocumentationFilters.includes(filterType)) {
      onFilterChange(activeDocumentationFilters.filter(f => f !== filterType), false);
    } else {
      onFilterChange([...activeDocumentationFilters, filterType], false);
    }
  };

  const handleShowAll = () => {
    const newShowAll = !showAll;
    setShowAll(newShowAll);
    onFilterChange([], newShowAll);
  };

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Alle Filter */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={showAll}
          onChange={handleShowAll}
          style={{ transform: 'scale(1.2)' }}
        />
        <span style={{ 
          padding: '6px 12px',
          borderRadius: 6,
          border: showAll ? '2px solid var(--primary-orange)' : '1px solid var(--border)',
          background: showAll ? 'var(--primary-orange)' : 'var(--surface)',
          color: showAll ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: 600,
          fontSize: 12
        }}>
          Alle ({documentations.length})
        </span>
      </label>
      
      {/* Archiv Filter */}
      {documentations.some(d => d.typ === 'archiv') && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={activeDocumentationFilters.includes('archiv')}
            onChange={() => handleFilterToggle('archiv')}
            style={{ transform: 'scale(1.2)' }}
          />
          <span style={{ 
            padding: '6px 12px',
            borderRadius: 6,
            border: activeDocumentationFilters.includes('archiv') ? '2px solid var(--primary-green)' : '1px solid var(--border)',
            background: activeDocumentationFilters.includes('archiv') ? 'var(--primary-green)' : 'var(--surface)',
            color: activeDocumentationFilters.includes('archiv') ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: 12
          }}>
            Archiv ({documentations.filter(d => d.typ === 'archiv').length})
          </span>
        </label>
      )}
      
      {/* Meeting Filter */}
      {documentations.some(d => d.untertyp === 'meeting') && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={activeDocumentationFilters.includes('meeting')}
            onChange={() => handleFilterToggle('meeting')}
            style={{ transform: 'scale(1.2)' }}
          />
          <span style={{ 
            padding: '6px 12px',
            borderRadius: 6,
            border: activeDocumentationFilters.includes('meeting') ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
            background: activeDocumentationFilters.includes('meeting') ? 'var(--primary-blue)' : 'var(--surface)',
            color: activeDocumentationFilters.includes('meeting') ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: 12
          }}>
            📅 Meeting ({documentations.filter(d => d.untertyp === 'meeting').length})
          </span>
        </label>
      )}
      
      {/* Interview Filter */}
      {documentations.some(d => d.untertyp === 'interview') && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={activeDocumentationFilters.includes('interview')}
            onChange={() => handleFilterToggle('interview')}
            style={{ transform: 'scale(1.2)' }}
          />
          <span style={{ 
            padding: '6px 12px',
            borderRadius: 6,
            border: activeDocumentationFilters.includes('interview') ? '2px solid var(--primary-purple)' : '1px solid var(--border)',
            background: activeDocumentationFilters.includes('interview') ? 'var(--primary-purple)' : 'var(--surface)',
            color: activeDocumentationFilters.includes('interview') ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: 12
          }}>
            🎤 Interview ({documentations.filter(d => d.untertyp === 'interview').length})
          </span>
        </label>
      )}
      
      {/* Feldnotiz Filter */}
      {documentations.some(d => d.untertyp === 'fieldnote') && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={activeDocumentationFilters.includes('fieldnote')}
            onChange={() => handleFilterToggle('fieldnote')}
            style={{ transform: 'scale(1.2)' }}
          />
          <span style={{ 
            padding: '6px 12px',
            borderRadius: 6,
            border: activeDocumentationFilters.includes('fieldnote') ? '2px solid var(--primary-orange)' : '1px solid var(--border)',
            background: activeDocumentationFilters.includes('fieldnote') ? 'var(--primary-orange)' : 'var(--surface)',
            color: activeDocumentationFilters.includes('fieldnote') ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: 12
          }}>
            📝 Feldnotiz ({documentations.filter(d => d.untertyp === 'fieldnote').length})
          </span>
        </label>
      )}

      {/* Status Filter Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ 
          fontSize: 12, 
          fontWeight: 600, 
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap'
        }}>
          Status:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as 'alle' | 'fertig' | 'unfertig')}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <option value="alle">Alle ({documentations.length})</option>
          <option value="unfertig">Unfertig ({documentations.filter(d => d.status === 'unfertig' || !d.status).length})</option>
          <option value="fertig">Fertig ({documentations.filter(d => d.status === 'fertig').length})</option>
        </select>
      </div>

      {/* Export Button */}
      {(onExportWord || onExportPDF) && (
        <div style={{ position: 'relative', display: 'inline-block' }} data-export-dropdown>
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            disabled={exportingWord || exportingPDF}
            style={{
              background: (exportingWord || exportingPDF) ? 'var(--text-muted)' : 'var(--button)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: (exportingWord || exportingPDF) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ fontSize: 14 }}>📤</span>
            Exportieren
            <span style={{ fontSize: 10, marginLeft: 2 }}>
              {showExportDropdown ? '▲' : '▼'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showExportDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              marginTop: 4,
              minWidth: 180
            }}>
              {onExportWord && (
                <button
                  onClick={() => {
                    onExportWord();
                    setShowExportDropdown(false);
                  }}
                  disabled={exportingWord}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: exportingWord ? 'not-allowed' : 'pointer',
                    color: exportingWord ? 'var(--text-muted)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!exportingWord) {
                      e.currentTarget.style.background = 'var(--surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {exportingWord ? (
                    <>
                      <span style={{ fontSize: 14 }}>⏳</span>
                      Exportiere Word...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 14 }}>📄</span>
                      Word exportieren
                    </>
                  )}
                </button>
              )}

              {onExportPDF && (
                <button
                  onClick={() => {
                    onExportPDF();
                    setShowExportDropdown(false);
                  }}
                  disabled={exportingPDF}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: exportingPDF ? 'not-allowed' : 'pointer',
                    color: exportingPDF ? 'var(--text-muted)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!exportingPDF) {
                      e.currentTarget.style.background = 'var(--surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {exportingPDF ? (
                    <>
                      <span style={{ fontSize: 14 }}>⏳</span>
                      Exportiere PDF...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 14 }}>📄</span>
                      PDF exportieren
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
