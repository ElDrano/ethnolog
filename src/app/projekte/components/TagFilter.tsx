"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

interface TagFilterProps {
  documentations: any[];
  onFilterChange: (selectedTags: string[]) => void;
  selectedTags: string[];
}

export default function TagFilter({ 
  documentations, 
  onFilterChange, 
  selectedTags 
}: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Lade verfügbare Tags aus der Datenbank und aus den Dokumentationen
  useEffect(() => {
    const loadAvailableTags = async () => {
      try {
        // Lade Tags aus der Datenbank
        const { data: dbTags, error } = await supabase
          .from('available_tags')
          .select('name')
          .order('name');

        if (error) {
          console.error('Fehler beim Laden der Tags aus der Datenbank:', error);
        }

        // Sammle auch Tags aus den Dokumentationen (für Backward-Kompatibilität)
        const docTags = new Set<string>();
        documentations.forEach(doc => {
          if (doc.tags && Array.isArray(doc.tags)) {
            doc.tags.forEach((tag: string) => docTags.add(tag));
          }
        });

        // Kombiniere Tags aus Datenbank und Dokumentationen
        const dbTagNames = dbTags?.map(tag => tag.name) || [];
        const allTags = new Set([...dbTagNames, ...Array.from(docTags)]);
        setAvailableTags(Array.from(allTags).sort());
      } catch (error) {
        console.error('Fehler beim Laden der Tags:', error);
        
        // Fallback: Sammle nur Tags aus den Dokumentationen
        const tags = new Set<string>();
        documentations.forEach(doc => {
          if (doc.tags && Array.isArray(doc.tags)) {
            doc.tags.forEach((tag: string) => tags.add(tag));
          }
        });
        setAvailableTags(Array.from(tags).sort());
      }
    };

    loadAvailableTags();
  }, [documentations]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onFilterChange(selectedTags.filter(t => t !== tag));
    } else {
      onFilterChange([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  // Zeige immer den Filter an, auch wenn noch keine Tags vorhanden sind
  // if (availableTags.length === 0) {
  //   return null;
  // }

  return (
    <div style={{ 
      marginBottom: 24, 
      padding: 16, 
      background: 'var(--surface)', 
      borderRadius: 8, 
      border: '1px solid var(--border)' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12 
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: 16, 
          fontWeight: 600, 
          color: 'var(--text-primary)' 
        }}>
          Nach Tags filtern
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            Alle löschen
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {availableTags.length > 0 ? (
          availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                background: selectedTags.includes(tag) 
                  ? 'var(--primary-blue)' 
                  : 'var(--surface)',
                color: selectedTags.includes(tag) 
                  ? 'white' 
                  : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              #{tag}
            </button>
          ))
        ) : (
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: 14,
            fontStyle: 'italic'
          }}>
            Noch keine Tags vorhanden. Fügen Sie Tags zu Ihren Dokumentationen hinzu, um hier zu filtern.
          </div>
        )}
      </div>
      
      {selectedTags.length > 0 && (
        <div style={{ 
          marginTop: 12, 
          fontSize: 12, 
          color: 'var(--text-secondary)' 
        }}>
          Gefiltert nach: {selectedTags.map(tag => `#${tag}`).join(', ')}
        </div>
      )}
    </div>
  );
}
