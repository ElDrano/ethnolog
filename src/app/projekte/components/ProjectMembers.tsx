"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

interface ProjectMembersProps {
  projekt: any;
  user: any;
  onMembersChange?: () => void;
}

interface ProjectMember {
  id: string;
  user_id: string;
  projekt_id: string;
  role: string;
  user?: {
    email: string;
    user_metadata?: {
      display_name?: string;
    };
  };
}

export default function ProjectMembers({ projekt, user, onMembersChange }: ProjectMembersProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const isOwner = projekt.user_id === user.id;

  // Lade Mitglieder immer, wenn das Projekt verfügbar ist (nicht nur wenn geöffnet)
  useEffect(() => {
    if (projekt?.id) {
      loadMembers();
    }
  }, [projekt?.id]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      
      // Lade alle Mitglieder aus projekt_user
      const { data: projektMembers, error } = await supabase
        .from('projekt_user')
        .select('id, user_id, projekt_id, role')
        .eq('projekt_id', projekt.id);

      if (error) throw error;

      // Sammle alle user_ids (inklusive Projektbesitzer)
      const allUserIds = [
        projekt.user_id, // Projektbesitzer
        ...(projektMembers || []).map((m: any) => m.user_id)
      ].filter((id, index, self) => self.indexOf(id) === index); // Duplikate entfernen

      // Lade E-Mail-Adressen für alle Benutzer
      // Verwende zuerst die View (die sollte immer verfügbar sein, wenn add_project_member_function.sql ausgeführt wurde)
      let userEmailsMap: { [key: string]: string } = {};
      
      if (allUserIds.length > 0) {
        // Versuche zuerst die RPC-Funktion (sollte zuverlässiger sein)
        try {
          const { data: emailsData, error: emailsError } = await supabase.rpc('get_user_emails', {
            p_user_ids: allUserIds
          });

          if (emailsError) {
            // Detaillierte Fehlerausgabe
            console.warn('RPC-Funktion fehlgeschlagen:', {
              code: emailsError.code,
              message: emailsError.message,
              details: emailsError.details,
              hint: emailsError.hint
            });
            
            // Fallback: Versuche View
            console.warn('Versuche View als Fallback...');
            try {
              const { data: viewData, error: viewError } = await supabase
                .from('user_emails')
                .select('user_id, email')
                .in('user_id', allUserIds);
              
              if (viewError) {
                console.error('Auch View-Zugriff fehlgeschlagen:', {
                  code: viewError.code,
                  message: viewError.message,
                  details: viewError.details,
                  hint: viewError.hint
                });
                console.error('WICHTIG: Bitte führen Sie setup_user_emails_complete.sql im Supabase SQL Editor aus!');
              } else if (viewData && Array.isArray(viewData)) {
                console.log('View-Daten erhalten:', viewData);
                viewData.forEach((item: any) => {
                  if (item.user_id && item.email) {
                    userEmailsMap[item.user_id] = item.email;
                  }
                });
                console.log('E-Mail-Adressen über View geladen:', Object.keys(userEmailsMap).length, 'Einträge');
                console.log('E-Mail-Map nach View:', userEmailsMap);
              } else {
                console.warn('View gab keine Daten zurück:', viewData);
              }
            } catch (viewErr: any) {
              console.error('Fehler beim View-Zugriff:', viewErr);
            }
          } else if (emailsData && Array.isArray(emailsData)) {
            // RPC-Funktion erfolgreich
            console.log('RPC-Daten erhalten:', emailsData);
            emailsData.forEach((item: any) => {
              if (item.user_id && item.email) {
                userEmailsMap[item.user_id] = item.email;
              }
            });
            console.log('E-Mail-Adressen über RPC geladen:', Object.keys(userEmailsMap).length, 'Einträge');
            console.log('E-Mail-Map nach RPC:', userEmailsMap);
          } else {
            console.warn('RPC-Funktion gab keine Daten zurück:', emailsData);
          }
        } catch (err: any) {
          console.error('Fehler beim Laden der E-Mail-Adressen:', err);
          console.error('WICHTIG: Bitte führen Sie setup_user_emails_complete.sql im Supabase SQL Editor aus!');
        }
      }

      // Debug: Zeige geladene E-Mail-Adressen
      console.log('Geladene E-Mail-Adressen:', userEmailsMap);
      console.log('Anzahl geladener E-Mails:', Object.keys(userEmailsMap).length);
      console.log('Projektbesitzer user_id:', projekt.user_id);
      console.log('Projektbesitzer E-Mail:', userEmailsMap[projekt.user_id]);

      // Erstelle Mitgliederliste mit E-Mail-Adressen
      const membersList: ProjectMember[] = [];

      // Füge Projektbesitzer IMMER als erstes hinzu (unabhängig vom eingeloggten Benutzer)
      // Der wahre Besitzer ist projekt.user_id, nicht der aktuell eingeloggte Benutzer
      const ownerInList = projektMembers?.find((m: any) => m.user_id === projekt.user_id);
      const ownerEmail = userEmailsMap[projekt.user_id] || '';
      
      if (ownerInList) {
        // Besitzer ist bereits in projekt_user, füge ihn mit Rolle 'owner' hinzu
        membersList.push({
          id: ownerInList.id,
          user_id: projekt.user_id, // WICHTIG: projekt.user_id, nicht user.id!
          projekt_id: projekt.id,
          role: 'owner', // Überschreibe die Rolle zu 'owner' für den Besitzer
          user: {
            email: ownerEmail,
            user_metadata: {}
          }
        });
      } else {
        // Besitzer ist nicht in projekt_user, füge ihn als 'owner' hinzu
        membersList.push({
          id: 'owner-' + projekt.user_id,
          user_id: projekt.user_id, // WICHTIG: projekt.user_id, nicht user.id!
          projekt_id: projekt.id,
          role: 'owner',
          user: {
            email: ownerEmail,
            user_metadata: {}
          }
        });
      }

      // Füge alle anderen Mitglieder hinzu (außer dem Besitzer, der bereits hinzugefügt wurde)
      (projektMembers || []).forEach((item: any) => {
        // Überspringe den Besitzer, da er bereits oben hinzugefügt wurde
        if (item.user_id === projekt.user_id) {
          return;
        }
        
        const memberEmail = userEmailsMap[item.user_id] || '';
        membersList.push({
          id: item.id,
          user_id: item.user_id,
          projekt_id: item.projekt_id,
          role: item.role,
          user: {
            email: memberEmail,
            user_metadata: {}
          }
        });
      });

      setMembers(membersList);
    } catch (err: any) {
      console.error('Fehler beim Laden der Mitglieder:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!newMemberEmail.trim()) {
      setError('Bitte geben Sie eine E-Mail-Adresse ein.');
      return;
    }

    try {
      setAddingMember(true);
      setError('');

      // Benutzer anhand E-Mail finden
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      // Da admin.listUsers() möglicherweise nicht verfügbar ist, verwenden wir einen anderen Ansatz
      // Wir fügen den Benutzer direkt hinzu und prüfen später, ob er existiert
      
      // Versuche, den Benutzer über eine RPC-Funktion oder direkt hinzuzufügen
      // Für jetzt: Einfacher Ansatz - füge direkt hinzu, wenn der Benutzer existiert
      
      // Prüfe, ob der Benutzer bereits Mitglied ist
      const { data: existingMember } = await supabase
        .from('projekt_user')
        .select('id')
        .eq('projekt_id', projekt.id)
        .eq('user_id', newMemberEmail) // Temporär - wir müssen die user_id finden
        .single();

      // Alternative: Verwende eine RPC-Funktion oder finde den Benutzer über auth.users
      // Für eine einfachere Lösung: Wir speichern die E-Mail und finden den Benutzer später
      
      // Versuche, den Benutzer über die E-Mail zu finden
      // Da wir keinen direkten Zugriff auf auth.users haben, müssen wir eine andere Strategie verwenden
      
      // Lösung: Erstelle eine Funktion, die per E-Mail den Benutzer findet
      const { data: memberData, error: addError } = await supabase.rpc('add_user_to_project_by_email', {
        p_projekt_id: projekt.id,
        p_user_email: newMemberEmail.trim().toLowerCase(),
        p_role: 'member'
      });

      if (addError) {
        // Fallback: Versuche es manuell
        // Wir müssen zuerst die user_id finden
        // Da wir keinen direkten Zugriff haben, zeigen wir eine Fehlermeldung
        throw new Error('Benutzer nicht gefunden. Bitte stellen Sie sicher, dass der Benutzer bereits registriert ist.');
      }

      setNewMemberEmail('');
      await loadMembers();
      if (onMembersChange) onMembersChange();
      alert('Mitglied erfolgreich hinzugefügt!');
    } catch (err: any) {
      console.error('Fehler beim Hinzufügen des Mitglieds:', err);
      setError(err.message || 'Fehler beim Hinzufügen des Mitglieds');
    } finally {
      setAddingMember(false);
    }
  };

  const removeMember = async (memberId: string, userId: string) => {
    if (!confirm('Möchten Sie dieses Mitglied wirklich entfernen?')) return;

    try {
      const { error } = await supabase
        .from('projekt_user')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await loadMembers();
      if (onMembersChange) onMembersChange();
      alert('Mitglied erfolgreich entfernt!');
    } catch (err: any) {
      console.error('Fehler beim Entfernen des Mitglieds:', err);
      alert('Fehler beim Entfernen: ' + err.message);
    }
  };

  // Alternative Implementierung: Finde Benutzer direkt über E-Mail
  const addMemberByEmail = async () => {
    if (!newMemberEmail.trim()) {
      setError('Bitte geben Sie eine E-Mail-Adresse ein.');
      return;
    }

    try {
      setAddingMember(true);
      setError('');

      // Versuche, den Benutzer über eine RPC-Funktion zu finden und hinzuzufügen
      // Normalisiere die E-Mail-Adresse (Kleinschreibung, ohne Leerzeichen)
      const normalizedEmail = newMemberEmail.trim().toLowerCase();
      
      const { data, error: addError } = await supabase.rpc('add_user_to_project_by_email', {
        p_projekt_id: projekt.id,
        p_user_email: normalizedEmail,
        p_role: 'read'  // 'read' Rolle für Mitglieder (können Dokumentationen erstellen, aber nicht Projekt bearbeiten)
      });

      if (addError) {
        console.error('RPC Error:', addError);
        
        // Prüfe, ob die Funktion nicht existiert
        if (addError.code === '42883' || addError.message?.includes('function') || addError.message?.includes('does not exist')) {
          setError('Die SQL-Funktion wurde noch nicht erstellt. Bitte führen Sie das Skript "add_project_member_function.sql" im Supabase SQL Editor aus.');
          return;
        }
        
        // Prüfe, ob der Benutzer nicht gefunden wurde
        if (addError.message?.includes('nicht gefunden') || addError.message?.includes('not found')) {
          setError(`Benutzer mit E-Mail "${normalizedEmail}" wurde nicht gefunden. Bitte überprüfen Sie:
- Ist die E-Mail-Adresse korrekt geschrieben?
- Hat der Benutzer sich bereits registriert?
- Versuchen Sie es mit der exakten E-Mail-Adresse, die bei der Registrierung verwendet wurde.`);
          return;
        }
        
        // Prüfe, ob der Benutzer bereits Mitglied ist
        if (addError.message?.includes('bereits Mitglied') || addError.message?.includes('already')) {
          setError('Dieser Benutzer ist bereits Mitglied des Projekts.');
          return;
        }
        
        // Allgemeine Fehlermeldung
        setError(addError.message || 'Fehler beim Hinzufügen des Mitglieds. Bitte versuchen Sie es erneut.');
        return;
      }

      setNewMemberEmail('');
      await loadMembers();
      if (onMembersChange) onMembersChange();
      alert('Mitglied erfolgreich hinzugefügt!');
    } catch (err: any) {
      console.error('Fehler beim Hinzufügen:', err);
      setError(err.message || 'Fehler beim Hinzufügen des Mitglieds. Stellen Sie sicher, dass der Benutzer registriert ist.');
    } finally {
      setAddingMember(false);
    }
  };

  if (!isOwner) {
    // Mitglieder können die Mitgliederliste sehen, aber nicht bearbeiten
    return (
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--text-primary)',
            fontWeight: 600
          }}
        >
          <span>👥 Mitglieder ({members.length})</span>
          <span>{isOpen ? '▼' : '▶'}</span>
        </button>
        
        {isOpen && (
          <div style={{
            marginTop: '0.5rem',
            padding: '1rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 6
          }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Lade Mitglieder...</p>
            ) : members.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Noch keine Mitglieder</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {members.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      padding: '0.5rem',
                      background: 'var(--surface-hover)',
                      borderRadius: 4,
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                      {member.user?.user_metadata?.display_name || member.user?.email || 'Unbekannt'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {member.user?.email || 'E-Mail nicht verfügbar'}
                    </div>
                    <span style={{ 
                      marginTop: '4px',
                      display: 'inline-block',
                      padding: '2px 6px', 
                      background: member.role === 'owner' ? 'var(--warning)' : member.role === 'write' ? 'var(--success)' : 'var(--primary-blue)', 
                      color: 'white', 
                      borderRadius: 3,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {member.role === 'owner' ? 'Besitzer' : member.role === 'read' ? 'Mitglied' : member.role === 'write' ? 'Bearbeiter' : member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-primary)',
          fontWeight: 600
        }}
      >
        <span>👥 Mitglieder ({members.length})</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </button>
      
      {isOpen && (
        <div style={{
          marginTop: '0.5rem',
          padding: '1rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 6
        }}>
          {/* Mitglied hinzufügen */}
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}>
              Neues Mitglied hinzufügen (E-Mail):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => {
                  setNewMemberEmail(e.target.value);
                  setError('');
                }}
                placeholder="benutzer@example.com"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addMemberByEmail();
                  }
                }}
              />
              <button
                onClick={addMemberByEmail}
                disabled={addingMember || !newMemberEmail.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  background: addingMember ? 'var(--text-muted)' : 'var(--primary-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: addingMember ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                {addingMember ? '...' : 'Hinzufügen'}
              </button>
            </div>
            {error && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.75rem',
                background: 'var(--surface-hover)',
                borderRadius: 4,
                border: '1px solid var(--error)'
              }}>
                <p style={{ 
                  color: 'var(--error)', 
                  fontSize: '0.85rem',
                  margin: 0,
                  marginBottom: error.includes('SQL-Funktion') ? '0.5rem' : 0
                }}>
                  {error}
                </p>
                {error.includes('SQL-Funktion') && (
                  <div style={{ 
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: 'var(--surface)',
                    borderRadius: 4,
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong>Anleitung:</strong>
                    <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      <li>Öffnen Sie Ihr Supabase Dashboard</li>
                      <li>Gehen Sie zu "SQL Editor"</li>
                      <li>Öffnen Sie die Datei "add_project_member_function.sql"</li>
                      <li>Kopieren Sie den gesamten Inhalt</li>
                      <li>Führen Sie das Skript im SQL Editor aus</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mitgliederliste */}
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Lade Mitglieder...</p>
          ) : members.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Noch keine Mitglieder</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {members.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'var(--surface-hover)',
                    borderRadius: 4
                  }}
                >
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                      {member.user?.email || member.user?.user_metadata?.display_name || `Benutzer ${member.user_id.substring(0, 8)}...`}
                    </div>
                    {member.user?.email ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>
                        {member.user.email}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', fontStyle: 'italic' }}>
                        E-Mail nicht verfügbar (ID: {member.user_id.substring(0, 8)}...)
                      </div>
                    )}
                    <span style={{ 
                      display: 'inline-block',
                      padding: '2px 6px', 
                      background: member.role === 'owner' ? 'var(--warning)' : member.role === 'write' ? 'var(--success)' : 'var(--primary-blue)', 
                      color: 'white', 
                      borderRadius: 3,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {member.role === 'owner' ? 'Besitzer' : member.role === 'read' ? 'Mitglied' : member.role === 'write' ? 'Bearbeiter' : member.role}
                    </span>
                  </div>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => removeMember(member.id, member.user_id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: 'var(--error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginLeft: '0.5rem'
                      }}
                    >
                      Entfernen
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

