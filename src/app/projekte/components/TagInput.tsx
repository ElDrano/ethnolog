"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

interface TagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ selectedTags, onTagsChange, placeholder = "Tag eingeben..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lade verfügbare Tags aus der Datenbank
  useEffect(() => {
    loadAvailableTags();
  }, []);

  // Initialisiere vordefinierte Tags beim ersten Laden
  useEffect(() => {
    initializeDefaultTags();
  }, []);

  const loadAvailableTags = async () => {
    try {
      const { data, error } = await supabase
        .from('available_tags')
        .select('name')
        .order('name');

      if (error) {
        console.error('Fehler beim Laden der Tags:', error);
        return;
      }

      const tags = data?.map(tag => tag.name) || [];
      setAvailableTags(tags);
    } catch (error) {
      console.error('Fehler beim Laden der Tags:', error);
    }
  };

  const initializeDefaultTags = async () => {
    const defaultTags = ['formell', 'informell', 'extern'];
    
    try {
      // Prüfe, ob die Tags bereits existieren
      const { data: existingTags } = await supabase
        .from('available_tags')
        .select('name')
        .in('name', defaultTags);

      const existingTagNames = existingTags?.map(tag => tag.name) || [];
      const missingTags = defaultTags.filter(tag => !existingTagNames.includes(tag));

      // Füge fehlende Tags hinzu
      if (missingTags.length > 0) {
        const { error } = await supabase
          .from('available_tags')
          .insert(missingTags.map(name => ({ name })));

        if (error) {
          console.error('Fehler beim Hinzufügen der Standard-Tags:', error);
        } else {
          // Lade Tags neu
          loadAvailableTags();
        }
      }
    } catch (error) {
      console.error('Fehler beim Initialisieren der Standard-Tags:', error);
    }
  };

  const addTagToDatabase = async (tagName: string) => {
    try {
      const { error } = await supabase
        .from('available_tags')
        .insert({ name: tagName });

      if (error) {
        console.error('Fehler beim Hinzufügen des Tags zur Datenbank:', error);
        return false;
      }

      // Aktualisiere die lokale Liste
      setAvailableTags(prev => [...prev, tagName].sort());
      return true;
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Tags:', error);
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      const filtered = availableTags.filter(tag =>
        tag.toLowerCase().includes(value.toLowerCase()) &&
        !selectedTags.includes(tag)
      );
      setFilteredTags(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  const handleAddTag = async () => {
    const tag = inputValue.trim();
    if (!tag || selectedTags.includes(tag)) {
      setInputValue('');
      setShowDropdown(false);
      return;
    }

    // Prüfe, ob der Tag bereits in der Datenbank existiert
    if (!availableTags.includes(tag)) {
      const success = await addTagToDatabase(tag);
      if (!success) {
        alert('Fehler beim Hinzufügen des neuen Tags. Bitte versuchen Sie es erneut.');
        return;
      }
    }

    onTagsChange([...selectedTags, tag]);
    setInputValue('');
    setShowDropdown(false);
  };

  const handleSelectTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Hier könnte man durch die Dropdown-Optionen navigieren
    }
  };

  // Schließe Dropdown beim Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.trim()) {
                const filtered = availableTags.filter(tag =>
                  tag.toLowerCase().includes(inputValue.toLowerCase()) &&
                  !selectedTags.includes(tag)
                );
                setFilteredTags(filtered);
                setShowDropdown(filtered.length > 0);
              }
            }}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #ddd',
              fontSize: 14,
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
            placeholder={placeholder}
          />
          
          {/* Dropdown für Tag-Vorschläge */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                maxHeight: 200,
                overflowY: 'auto'
              }}
            >
              {filteredTags.map((tag, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectTag(tag)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border)',
                    ':hover': {
                      background: 'var(--surface-hover)'
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface)';
                  }}
                >
                  #{tag}
                </div>
              ))}
              {inputValue.trim() && !availableTags.includes(inputValue.trim()) && (
                <div
                  onClick={() => handleAddTag()}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: 'var(--primary-blue)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--surface-hover)'
                  }}
                >
                  + Neuen Tag "{inputValue.trim()}" erstellen
                </div>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={handleAddTag}
          disabled={!inputValue.trim()}
          style={{
            padding: '8px 12px',
            borderRadius: 4,
            background: 'var(--primary-blue)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          +
        </button>
      </div>
      
      {/* Angezeigte Tags */}
      {selectedTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {selectedTags.map((tag, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                background: 'var(--primary-blue)',
                color: 'white',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600
              }}
            >
              <span>#{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 'bold',
                  padding: 0,
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
