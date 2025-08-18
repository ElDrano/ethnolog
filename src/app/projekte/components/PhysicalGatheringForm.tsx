"use client";
import React from 'react';
import { supabase } from '../../supabaseClient';

interface PhysicalGatheringFormProps {
  gatheringForm: any;
  setGatheringForm: (form: any) => void;
  gatheringLoading: boolean;
  gatheringError: string;
  personenProjekt: any[];
  selectedDate: string;
  onAddGathering: () => void;
}

export default function PhysicalGatheringForm({
  gatheringForm,
  setGatheringForm,
  gatheringLoading,
  gatheringError,
  personenProjekt,
  selectedDate,
  onAddGathering
}: PhysicalGatheringFormProps) {
  return (
    <div style={{
      marginTop: 16,
      background: '#fffbe8',
      border: '1.5px solid #ff9800',
      borderRadius: 10,
      padding: '1.2rem 1.5rem',
      boxShadow: '0 2px 8px #ff980033',
      minHeight: 60,
      color: '#232b5d',
      fontWeight: 500,
      fontSize: 16,
    }}>
      <h4>Neues Physical Gathering anlegen</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <input 
          type="date" 
          value={gatheringForm.datum || selectedDate} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGatheringForm((f: any) => ({ ...f, datum: e.target.value }))} 
          style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb' }} 
        />
        <input 
          type="time" 
          value={gatheringForm.startzeit} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGatheringForm((f: any) => ({ ...f, startzeit: e.target.value }))} 
          style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb' }} 
        />
        <input 
          type="time" 
          value={gatheringForm.endzeit} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGatheringForm((f: any) => ({ ...f, endzeit: e.target.value }))} 
          style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb' }} 
        />
        <input 
          type="text" 
          placeholder="Beschreibung" 
          value={gatheringForm.beschreibung} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGatheringForm((f: any) => ({ ...f, beschreibung: e.target.value }))} 
          style={{ flex: 1, minWidth: 120, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} 
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Personen:</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {personenProjekt.map((p: any) => {
            const checked = gatheringForm.personen_ids.includes(p.id);
            return (
              <label key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: checked ? '#ff9800' : '#eee',
                color: checked ? '#fff' : '#232b5d',
                borderRadius: 6,
                padding: '4px 10px',
                cursor: 'pointer',
                fontWeight: 500,
                border: checked ? '2px solid #ff9800' : '1.5px solid #bbb',
                userSelect: 'none',
              }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setGatheringForm((f: any) => ({
                      ...f,
                      personen_ids: checked
                        ? f.personen_ids.filter((id: string) => id !== p.id)
                        : [...f.personen_ids, p.id]
                    }));
                  }}
                  style={{ accentColor: '#ff9800' }}
                />
                {p.vorname} {p.nachname}
              </label>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Dialoge:</label>
        {gatheringForm.dialoge.map((dialog: any, i: any) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, background: '#f5f5f5', borderRadius: 8, padding: 12 }}>
            <textarea
              value={dialog.text}
              onChange={e => setGatheringForm((f: any) => ({
                ...f,
                dialoge: f.dialoge.map((v: any, idx: any) => idx === i ? { ...v, text: e.target.value } : v)
              }))}
              placeholder="Dialogtext..."
              rows={4}
              style={{ width: '100%', borderRadius: 6, border: '1px solid #bbb', padding: 8, fontSize: 15, resize: 'vertical', minHeight: 80 }}
            />
            {/* Bild-Upload */}
            <input
              type="file"
              accept="image/*"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                // Upload zu Supabase Storage
                const fileName = `gathering-dialog-${Date.now()}-${file.name}`;
                const { data, error } = await supabase.storage.from('gathering-dialog-images').upload(fileName, file, { upsert: true });
                if (!error) {
                  const url = supabase.storage.from('gathering-dialog-images').getPublicUrl(fileName).data.publicUrl;
                  setGatheringForm((f: any) => ({
                    ...f,
                    dialoge: f.dialoge.map((v: any, idx: any) => idx === i ? { ...v, imageUrl: url } : v)
                  }));
                } else {
                  alert('Bild-Upload fehlgeschlagen: ' + error.message);
                }
              }}
              style={{ marginTop: 4 }}
            />
            {dialog.imageUrl && (
              <img src={dialog.imageUrl} alt="Dialogbild" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 6 }} />
            )}
            <button 
              type="button" 
              onClick={() => setGatheringForm((f: any) => ({ ...f, dialoge: f.dialoge.filter((_: any, idx: any) => idx !== i) }))} 
              style={{ background: '#b00', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 700, fontSize: 18, cursor: 'pointer', alignSelf: 'flex-end' }}
            >
              –
            </button>
          </div>
        ))}
        <button 
          type="button" 
          onClick={() => setGatheringForm((f: any) => ({ ...f, dialoge: [...f.dialoge, { text: '', imageUrl: '' }] }))} 
          style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 4 }}
        >
          + Dialog
        </button>
      </div>
      <button 
        onClick={onAddGathering} 
        disabled={gatheringLoading} 
        style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 8 }}
      >
        Speichern
      </button>
      {gatheringError && <div style={{ color: '#b00', marginTop: 8 }}>{gatheringError}</div>}
    </div>
  );
}
