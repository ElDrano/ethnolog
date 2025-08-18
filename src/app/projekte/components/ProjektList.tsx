import React from 'react';
import ProjektCard from './ProjektCard';

interface ProjektListProps {
  projekte: any[];
  user: any;
  projektUsers: {[id: string]: any[]};
  loading: boolean;
  error: string;
  onSelectProjekt: (projekt: any) => void;
  onDeleteProjekt: (id: string) => void;
}

export default function ProjektList({
  projekte,
  user,
  projektUsers,
  loading,
  error,
  onSelectProjekt,
  onDeleteProjekt
}: ProjektListProps) {
  if (loading) {
    return <div>Lade Projekte...</div>;
  }

  if (error) {
    return <div style={{ color: '#b00' }}>{error}</div>;
  }

  if (projekte.length === 0) {
    return <div style={{ color: '#888' }}>[Keine Projekte gefunden]</div>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {projekte.map((projekt) => {
        const isOwner = projekt.user_id === user.id;
        const sharedEntry = projektUsers[projekt.id]?.find(u => u.user_id === user.id);
        const canEdit = isOwner || (sharedEntry && sharedEntry.role === 'write');

        return (
          <ProjektCard
            key={projekt.id}
            projekt={projekt}
            isOwner={isOwner}
            canEdit={canEdit}
            onSelect={onSelectProjekt}
            onDelete={onDeleteProjekt}
            loading={loading}
          />
        );
      })}
    </ul>
  );
} 