"use client";
import React, { useState } from 'react';

interface DocumentationFiltersProps {
  documentations: any[];
  activeDocumentationFilters: string[];
  onFilterChange: (filters: string[], showAll: boolean) => void;
}

export default function DocumentationFilters({
  documentations,
  activeDocumentationFilters,
  onFilterChange
}: DocumentationFiltersProps) {
  const [showAll, setShowAll] = useState(activeDocumentationFilters.length === 0);

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
          border: showAll ? '2px solid #ff9800' : '1px solid #ddd',
          background: showAll ? '#ff9800' : '#fff',
          color: showAll ? '#fff' : '#666',
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
            border: activeDocumentationFilters.includes('archiv') ? '2px solid #4CAF50' : '1px solid #ddd',
            background: activeDocumentationFilters.includes('archiv') ? '#4CAF50' : '#fff',
            color: activeDocumentationFilters.includes('archiv') ? '#fff' : '#666',
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
            border: activeDocumentationFilters.includes('meeting') ? '2px solid #2196F3' : '1px solid #ddd',
            background: activeDocumentationFilters.includes('meeting') ? '#2196F3' : '#fff',
            color: activeDocumentationFilters.includes('meeting') ? '#fff' : '#666',
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
            border: activeDocumentationFilters.includes('interview') ? '2px solid #9C27B0' : '1px solid #ddd',
            background: activeDocumentationFilters.includes('interview') ? '#9C27B0' : '#fff',
            color: activeDocumentationFilters.includes('interview') ? '#fff' : '#666',
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
            border: activeDocumentationFilters.includes('fieldnote') ? '2px solid #FF9800' : '1px solid #ddd',
            background: activeDocumentationFilters.includes('fieldnote') ? '#FF9800' : '#fff',
            color: activeDocumentationFilters.includes('fieldnote') ? '#fff' : '#666',
            fontWeight: 600,
            fontSize: 12
          }}>
            📝 Feldnotiz ({documentations.filter(d => d.untertyp === 'fieldnote').length})
          </span>
        </label>
      )}
    </div>
  );
}
