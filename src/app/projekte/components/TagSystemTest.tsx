"use client";
import React, { useState } from 'react';
import TagInput from './TagInput';

export default function TagSystemTest() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2>Tag-System Test</h2>
      <p>Testen Sie das neue Tag-System mit Dropdown-Vorschlägen und der Möglichkeit, neue Tags zu erstellen.</p>
      
      <div style={{ marginBottom: 20 }}>
        <h3>Verfügbare Tags:</h3>
        <p>Die folgenden Tags sind standardmäßig verfügbar:</p>
        <ul>
          <li><strong>formell</strong> - Für formelle Dokumentationen</li>
          <li><strong>informell</strong> - Für informelle Dokumentationen</li>
          <li><strong>extern</strong> - Für externe Dokumentationen</li>
        </ul>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>Tag-Eingabe:</h3>
        <TagInput
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          placeholder="Tippen Sie, um Tags zu suchen oder neue zu erstellen..."
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>Ausgewählte Tags:</h3>
        {selectedTags.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Noch keine Tags ausgewählt</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedTags.map((tag, index) => (
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
        )}
      </div>

      <div style={{ 
        padding: 16, 
        background: 'var(--surface-hover)', 
        borderRadius: 8, 
        border: '1px solid var(--border)' 
      }}>
        <h3>Anleitung:</h3>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Tippen Sie in das Eingabefeld, um verfügbare Tags zu sehen</li>
          <li>Wählen Sie aus den Vorschlägen oder erstellen Sie einen neuen Tag</li>
          <li>Drücken Sie Enter oder klicken Sie auf "+" um Tags hinzuzufügen</li>
          <li>Klicken Sie auf "×" um Tags zu entfernen</li>
        </ol>
      </div>
    </div>
  );
}
