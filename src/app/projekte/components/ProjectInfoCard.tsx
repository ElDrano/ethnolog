"use client";
import React from 'react';

interface ProjectInfoCardProps {
  projekt: any;
}

export default function ProjectInfoCard({ projekt }: ProjectInfoCardProps) {
  return (
    <div style={{ marginBottom: 24, padding: 20, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
      <h2 style={{ margin: '0 0 12px 0', fontSize: 24, fontWeight: 700, color: '#232b5d' }}>
        {projekt.name}
      </h2>
      {projekt.beschreibung && (
        <p style={{ margin: '0 0 12px 0', fontSize: 16, color: '#666', lineHeight: 1.5 }}>
          {projekt.beschreibung}
        </p>
      )}
      <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#666' }}>
        <span><strong>Arbeitsweise:</strong> {projekt.arbeitsweise === 'vor_ort' ? 'Vor Ort' : projekt.arbeitsweise === 'hybrid' ? 'Hybrid' : 'Nur remote'}</span>
        <span><strong>Erstellt:</strong> {projekt.created_at ? new Date(projekt.created_at).toLocaleDateString('de-DE') : '-'}</span>
        {projekt.updated_at && projekt.updated_at !== projekt.created_at && (
          <span><strong>Zuletzt bearbeitet:</strong> {new Date(projekt.updated_at).toLocaleDateString('de-DE')}</span>
        )}
      </div>
    </div>
  );
}


