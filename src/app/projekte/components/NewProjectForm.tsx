"use client";
import React, { useState } from 'react';
import OrganizationSelector from './OrganizationSelector';

interface NewProjectFormProps {
  user: any;
  isLightMode: boolean;
  onCreateProject: (projectData: any) => Promise<void>;
  onCancel: () => void;
  createError: string;
  creatingProject: boolean;
}

export default function NewProjectForm({
  user,
  isLightMode,
  onCreateProject,
  onCancel,
  createError,
  creatingProject
}: NewProjectFormProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectMode, setNewProjectMode] = useState("");
  const [editDescs, setEditDescs] = useState<{[id:string]: string}>({ new: '' });
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;
    
    const projectData = {
      name: newProjectName,
      beschreibung: editDescs['new'] ?? '',
      arbeitsweise: newProjectMode,
      optionen: [],
      personen: [],
      organization_id: selectedOrganizationId
    };

    await onCreateProject(projectData);
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', maxWidth: 600 }}>
      {/* Projektname */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
        <input
          type="text"
          placeholder="Projektname"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          style={{ 
            padding: 12, 
            borderRadius: 8, 
            border: '1px solid #bbb', 
            flex: 1,
            fontSize: 16,
            fontWeight: 500
          }}
          autoFocus
        />
        <button
          onClick={handleCreateProject}
          disabled={creatingProject || !newProjectName.trim()}
          style={{ 
            padding: '12px 24px', 
            borderRadius: 8, 
            background: '#ff9800', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 600, 
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          Anlegen
        </button>
        <button
          onClick={onCancel}
          style={{ 
            padding: '12px 24px', 
            borderRadius: 8, 
            background: '#bbb', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 600, 
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          Abbrechen
        </button>
      </div>

      {/* Beschreibung - immer sichtbar */}
      <div style={{ width: '100%' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 16 }}>
          Projektbeschreibung:
        </label>
        <textarea
          placeholder="Beschreibe dein Projekt..."
          value={editDescs['new'] ?? ""}
          onChange={(e) => setEditDescs(descs => ({ ...descs, ['new']: e.target.value }))}
          style={{ 
            width: '100%', 
            minHeight: 100, 
            borderRadius: 8, 
            border: '1px solid #bbb', 
            padding: 12, 
            color: 'var(--foreground)', 
            fontWeight: 500,
            fontSize: 15,
            resize: 'vertical'
          }}
        />
      </div>

      {/* Arbeitsweise */}
      <div style={{ width: '100%' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 16 }}>
          Arbeitsweise der Organisation:
        </label>
        <select
          value={newProjectMode}
          onChange={(e) => { 
            setNewProjectMode(e.target.value); 
          }}
          style={{ 
            padding: 12, 
            borderRadius: 8, 
            border: '1px solid #bbb', 
            width: '100%',
            fontSize: 16,
            background: '#fff'
          }}
        >
          <option value="" disabled={!!newProjectMode}>Bitte wählen ...</option>
          <option value="vor_ort">🏢 Vor Ort</option>
          <option value="hybrid">🔀 Hybrid</option>
          <option value="remote">🏠 Nur remote</option>
        </select>
      </div>

      {/* Organisation */}
      <OrganizationSelector
        selectedOrganizationId={selectedOrganizationId}
        onOrganizationChange={setSelectedOrganizationId}
        user={user}
      />

      {createError && (
        <div style={{ 
          color: '#b00', 
          background: '#ffebee', 
          border: '1px solid #f44336', 
          borderRadius: 8, 
          padding: 12,
          width: '100%'
        }}>
          {createError}
        </div>
      )}
    </div>
  );
} 