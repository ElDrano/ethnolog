"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

interface ProjectLinksProps {
  projekt: any;
  user: any;
  canEdit: boolean;
}

interface ProjectLink {
  id: string;
  projekt_id: string;
  name: string;
  url: string;
  created_at?: string;
  updated_at?: string;
}

export default function ProjectLinks({ projekt, user, canEdit }: ProjectLinksProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLink, setEditingLink] = useState<ProjectLink | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (projekt?.id) {
      loadLinks();
    }
  }, [projekt?.id]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('projekt_links')
        .select('*')
        .eq('projekt_id', projekt.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLinks(data || []);
    } catch (err: any) {
      console.error('Fehler beim Laden der Links:', err);
      setError('Fehler beim Laden der Links');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    setEditingLink(null);
    setFormData({ name: '', url: '' });
    setError('');
    setShowAddForm(true);
  };

  const handleEditLink = (link: ProjectLink) => {
    setEditingLink(link);
    setFormData({ name: link.name, url: link.url });
    setError('');
    setShowAddForm(true);
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Möchten Sie diesen Link wirklich löschen?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('projekt_links')
        .delete()
        .eq('id', linkId);

      if (deleteError) throw deleteError;
      await loadLinks();
    } catch (err: any) {
      console.error('Fehler beim Löschen des Links:', err);
      alert('Fehler beim Löschen: ' + err.message);
    }
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validierung
    if (!formData.name.trim()) {
      setError('Bitte geben Sie einen Namen ein');
      return;
    }

    if (!formData.url.trim()) {
      setError('Bitte geben Sie eine URL ein');
      return;
    }

    // URL-Validierung (einfach)
    let url = formData.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      if (editingLink) {
        // Update bestehender Link
        const { error: updateError } = await supabase
          .from('projekt_links')
          .update({
            name: formData.name.trim(),
            url: url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLink.id);

        if (updateError) throw updateError;
      } else {
        // Neuer Link
        const { error: insertError } = await supabase
          .from('projekt_links')
          .insert({
            projekt_id: projekt.id,
            name: formData.name.trim(),
            url: url,
            created_by: user?.id
          });

        if (insertError) throw insertError;
      }

      setShowAddForm(false);
      setFormData({ name: '', url: '' });
      setEditingLink(null);
      await loadLinks();
    } catch (err: any) {
      console.error('Fehler beim Speichern des Links:', err);
      setError('Fehler beim Speichern: ' + err.message);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({ name: '', url: '' });
    setEditingLink(null);
    setError('');
  };

  return (
    <div style={{
      marginBottom: '1.5rem',
      background: 'var(--surface)',
      borderRadius: 8,
      border: '1px solid var(--border)',
      overflow: 'hidden'
    }}>
      {/* Header - ausklappbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--surface-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <span>Interaktions- und Arbeitsräume</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </button>

      {/* Ausklappbarer Inhalt */}
      {isOpen && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Lade Links...</p>
          ) : (
            <>
              {/* Links-Liste */}
              {links.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Noch keine Links vorhanden
                </p>
              ) : (
                <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {links.map((link) => (
                    <div
                      key={link.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'var(--surface-hover)',
                        borderRadius: 6,
                        gap: '1rem'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                          {link.name}
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--primary-blue)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            wordBreak: 'break-all'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = 'none';
                          }}
                        >
                          {link.url}
                        </a>
                      </div>
                      {canEdit && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEditLink(link)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'var(--primary-blue)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 600
                            }}
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'var(--error)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 600
                            }}
                          >
                            Löschen
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Hinzufügen/Bearbeiten Formular */}
              {canEdit && (
                <>
                  {!showAddForm ? (
                    <button
                      onClick={handleAddLink}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--primary-blue)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      + Link hinzufügen
                    </button>
                  ) : (
                    <form onSubmit={handleSaveLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Name (z.B. GitHub, Slack, etc.)
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="z.B. GitHub"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            fontSize: '1rem',
                            background: 'var(--background)',
                            color: 'var(--text-primary)'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          URL
                        </label>
                        <input
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          placeholder="https://github.com/..."
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            fontSize: '1rem',
                            background: 'var(--background)',
                            color: 'var(--text-primary)'
                          }}
                          required
                        />
                      </div>
                      {error && (
                        <div style={{ color: 'var(--error)', fontSize: '0.9rem' }}>
                          {error}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="submit"
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--primary-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}
                        >
                          {editingLink ? 'Speichern' : 'Hinzufügen'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--surface-hover)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}
                        >
                          Abbrechen
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

