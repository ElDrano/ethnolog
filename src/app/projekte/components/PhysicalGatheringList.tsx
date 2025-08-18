"use client";
import React from 'react';

interface PhysicalGatheringListProps {
  gatherings: any[];
  gatheringLoading: boolean;
  personenProjekt: any[];
  canEdit: boolean;
  onDeleteGathering: (id: string) => void;
}

export default function PhysicalGatheringList({
  gatherings,
  gatheringLoading,
  personenProjekt,
  canEdit,
  onDeleteGathering
}: PhysicalGatheringListProps) {
  return (
    <div style={{ marginTop: 24 }}>
      <h4>Physical Gatherings</h4>
      {gatheringLoading ? (
        <div>Lade...</div>
      ) : gatherings.length === 0 ? (
        <div style={{ color: '#888' }}>[Keine Gatherings]</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {gatherings.map((g: any) => (
            <li key={g.id} style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem', marginBottom: 12, color: '#232b5d', fontWeight: 500 }}>
              <div><b>Datum:</b> {g.datum} <b>Zeit:</b> {g.startzeit}–{g.endzeit}</div>
              <div><b>Beschreibung:</b> {g.beschreibung}</div>
              <div><b>Personen:</b> {Array.isArray(g.personen_ids) ? g.personen_ids.map((id: string) => {
                const p = personenProjekt.find((pp: any) => pp.id === id);
                return p ? `${p.vorname} ${p.nachname}` : id;
              }).join(', ') : ''}</div>
              <div><b>Dialoge:</b>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {Array.isArray(g.dialoge) && g.dialoge.map((d: any, i: any) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      <div style={{ whiteSpace: 'pre-line', marginBottom: 4 }}>{d.text}</div>
                      {d.imageUrl && <img src={d.imageUrl} alt="Dialogbild" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 6 }} />}
                    </li>
                  ))}
                </ul>
              </div>
              {canEdit && (
                <button 
                  onClick={() => onDeleteGathering(g.id)} 
                  style={{ background: '#b00', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}
                >
                  Löschen
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
