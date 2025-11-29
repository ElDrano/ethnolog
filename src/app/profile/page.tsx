"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  bio?: string;
}


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setUserProfile({
          id: user.id,
          email: user.email || '',
          display_name: user.user_metadata?.display_name || '',
          bio: user.user_metadata?.bio || ''
        });
        setDisplayName(user.user_metadata?.display_name || '');
        setBio(user.user_metadata?.bio || '');
      }
    } catch (error) {
      console.error('Fehler beim Laden des Benutzerprofils:', error);
    } finally {
      setLoading(false);
    }
  };


  const saveProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          bio: bio
        }
      });

      if (error) throw error;

      setUserProfile(prev => prev ? {
        ...prev,
        display_name: displayName,
        bio: bio
      } : null);

      alert('Profil erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern des Profils:', error);
      alert('Fehler beim Speichern des Profils');
    }
  };


  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Lade...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Bitte melden Sie sich an.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 700, 
        marginBottom: '2rem',
        color: 'var(--text-primary)'
      }}>
        Mein Profil
      </h1>

      {/* Profil-Bereich */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 12,
        padding: '2rem',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          marginBottom: '1.5rem',
          color: 'var(--text-primary)'
        }}>
          Profilinformationen
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)'
            }}>
              E-Mail
            </label>
            <input
              type="email"
              value={userProfile?.email || ''}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface-hover)',
                color: 'var(--text-muted)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)'
            }}>
              Anzeigename
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem'
              }}
              placeholder="Ihr Anzeigename"
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)'
            }}>
              Über mich
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              placeholder="Kurze Beschreibung über sich..."
            />
          </div>

          <button
            onClick={saveProfile}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--success)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'background 0.2s ease',
              alignSelf: 'flex-start'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--success-hover, #059669)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--success)';
            }}
          >
            Profil speichern
          </button>
        </div>
      </div>
    </div>
  );
}
