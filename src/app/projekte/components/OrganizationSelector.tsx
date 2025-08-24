"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

interface Organization {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationSelectorProps {
  selectedOrganizationId: string | null;
  onOrganizationChange: (organizationId: string | null) => void;
  user: any;
}

export default function OrganizationSelector({
  selectedOrganizationId,
  onOrganizationChange,
  user
}: OrganizationSelectorProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserOrganizations();
  }, [user]);

  const loadUserOrganizations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Organisationen laden, in denen der Benutzer Mitglied ist
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Organisationen:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Organisation:
        </label>
        <div style={{ 
          padding: '0.75rem', 
          borderRadius: '6px', 
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-secondary)'
        }}>
          Lade Organisationen...
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Organisation (optional):
      </label>
      
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <select
          value={selectedOrganizationId || ''}
          onChange={(e) => onOrganizationChange(e.target.value || null)}
          style={{
            flex: '1',
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <option value="">Keine Organisation (Privates Projekt)</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        
        {selectedOrganizationId && (
          <button
            onClick={() => onOrganizationChange(null)}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Organisation entfernen"
          >
            ✕
          </button>
        )}
      </div>
      
      {selectedOrganizationId && (
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.5rem', 
          background: 'var(--surface-hover)', 
          borderRadius: '4px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <strong>Hinweis:</strong> Alle Mitglieder dieser Organisation können an diesem Projekt arbeiten.
        </div>
      )}
      
      {organizations.length === 0 && (
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.5rem', 
          background: 'var(--surface-hover)', 
          borderRadius: '4px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          Sie sind noch keiner Organisation beigetreten. 
          <a 
            href="/profile" 
            style={{ 
              color: 'var(--button)', 
              textDecoration: 'none', 
              marginLeft: '0.5rem',
              fontWeight: '600'
            }}
          >
            Organisation erstellen →
          </a>
        </div>
      )}
    </div>
  );
}
