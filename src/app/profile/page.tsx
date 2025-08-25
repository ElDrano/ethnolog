"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  bio?: string;
  profile_image_url?: string;
}

interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user: {
    email: string;
    user_metadata?: {
      display_name?: string;
    };
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');

  useEffect(() => {
    loadUserProfile();
    loadOrganizations();
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
          bio: user.user_metadata?.bio || '',
          profile_image_url: user.user_metadata?.profile_image_url || ''
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

  const loadOrganizations = async () => {
    try {
      console.log('Loading organizations...');
      
      // Zuerst prüfen wir, ob der Benutzer authentifiziert ist
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('Current user:', currentUser?.id);
      
      // Lade Organisationen, die der Benutzer erstellt hat
      const { data: createdOrgs, error: createdError } = await supabase
        .from('organizations')
        .select('*')
        .eq('created_by', currentUser?.id)
        .order('created_at', { ascending: false });

      if (createdError) {
        console.error('Error loading created organizations:', createdError);
        throw createdError;
      }

      // Lade Organisationen, bei denen der Benutzer Mitglied ist
      const { data: memberOrgs, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          organization:organizations(*)
        `)
        .eq('user_id', currentUser?.id);

      if (memberError) {
        console.error('Error loading member organizations:', memberError);
        throw memberError;
      }

      // Kombiniere die Ergebnisse und entferne Duplikate
      const createdOrganizations = createdOrgs || [];
      const memberOrganizations = (memberOrgs || []).map((item: any) => item.organization).filter(Boolean);
      
      // Entferne Duplikate basierend auf organization.id
      const allOrganizations = [...createdOrganizations];
      memberOrganizations.forEach((memberOrg: any) => {
        if (!allOrganizations.find((org: any) => org.id === memberOrg.id)) {
          allOrganizations.push(memberOrg);
        }
      });
      
      console.log('All organizations:', allOrganizations);
      setOrganizations(allOrganizations);
    } catch (error) {
      console.error('Fehler beim Laden der Organisationen:', error);
      // Zeige detailliertere Fehlerinformationen
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImage || !user) return;

    try {
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Entferne den Unterordner für einfachere Struktur

      console.log('Uploading file:', fileName, 'to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, profileImage);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { profile_image_url: publicUrl }
      });

      if (updateError) {
        console.error('Update user error:', updateError);
        throw updateError;
      }

      setUserProfile(prev => prev ? { ...prev, profile_image_url: publicUrl } : null);
      setProfileImage(null);
      alert('Profilbild erfolgreich hochgeladen!');
    } catch (error) {
      console.error('Fehler beim Hochladen des Profilbilds:', error);
      
      // Detailliertere Fehlermeldung
      if (error instanceof Error) {
        alert(`Fehler beim Hochladen des Profilbilds: ${error.message}`);
      } else {
        alert('Fehler beim Hochladen des Profilbilds');
      }
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

  const createOrganization = async () => {
    if (!newOrgName.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName,
          description: newOrgDescription,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: data.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      setOrganizations(prev => [data, ...prev]);
      setNewOrgName('');
      setNewOrgDescription('');
      alert('Organisation erfolgreich erstellt!');
    } catch (error) {
      console.error('Fehler beim Erstellen der Organisation:', error);
      alert('Fehler beim Erstellen der Organisation');
    }
  };

  const loadOrganizationMembers = async (orgId: string) => {
    try {
      // Verwende die neue View für organization_members mit Benutzerdaten
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members_with_users')
        .select('*')
        .eq('organization_id', orgId);

      if (membersError) {
        console.error('Error loading members with users:', membersError);
        // Fallback: Verwende die einfache Abfrage
        const { data: simpleMembersData, error: simpleError } = await supabase
          .from('organization_members')
          .select('*')
          .eq('organization_id', orgId);

        if (simpleError) throw simpleError;

        const membersWithBasicData = (simpleMembersData || []).map((member: any) => ({
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at,
          user: {
            email: `Benutzer ${member.user_id.slice(0, 8)}...`,
            user_metadata: {}
          }
        }));
        
        setMembers(membersWithBasicData);
        return;
      }

      // Verwende die Daten aus der View
      const membersWithUserData = (membersData || []).map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        user: {
          email: member.email || `Benutzer ${member.user_id.slice(0, 8)}...`,
          user_metadata: member.user_metadata || {}
        }
      }));
      
      setMembers(membersWithUserData);
    } catch (error) {
      console.error('Fehler beim Laden der Mitglieder:', error);
    }
  };

  const addMemberToOrganization = async () => {
    if (!selectedOrganization || !newMemberEmail.trim()) return;

    try {
      const { data, error } = await supabase.rpc('add_user_to_organization', {
        p_organization_id: selectedOrganization.id,
        p_user_email: newMemberEmail,
        p_role: newMemberRole
      });

      if (error) throw error;

      alert(data);
      setNewMemberEmail('');
      setNewMemberRole('member');
      loadOrganizationMembers(selectedOrganization.id);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Mitglieds:', error);
      alert('Fehler beim Hinzufügen des Mitglieds');
    }
  };

  const removeMemberFromOrganization = async (memberId: string, userId: string) => {
    if (!selectedOrganization) return;

    try {
      const { data, error } = await supabase.rpc('remove_user_from_organization', {
        p_organization_id: selectedOrganization.id,
        p_user_id: userId
      });

      if (error) throw error;

      alert(data);
      loadOrganizationMembers(selectedOrganization.id);
    } catch (error) {
      console.error('Fehler beim Entfernen des Mitglieds:', error);
      alert('Fehler beim Entfernen des Mitglieds');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Lade...</div>;
  }

  if (!user) {
    return <div className="container mx-auto p-4">Bitte melden Sie sich an.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Profil & Organisationen</h1>

      {/* Profil-Bereich */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">Mein Profil</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profilbild */}
          <div className="md:col-span-1">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {userProfile?.profile_image_url ? (
                  <img 
                    src={userProfile.profile_image_url} 
                    alt="Profilbild" 
                    className="w-full h-full object-cover"
                  />
                                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-500">
                     <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                     </svg>
                   </div>
                 )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {profileImage && (
                <button
                  onClick={uploadProfileImage}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Hochladen
                </button>
              )}
            </div>
          </div>

          {/* Profilinformationen */}
          <div className="md:col-span-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={userProfile?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Anzeigename
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ihr Anzeigename"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Über mich
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Kurze Beschreibung über sich..."
                />
              </div>

              <button
                onClick={saveProfile}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Profil speichern
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Organisationen-Bereich */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Organisationen</h2>

        {/* Neue Organisation erstellen */}
        <div className="mb-8 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Neue Organisation erstellen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Organisationsname"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Beschreibung
              </label>
              <input
                type="text"
                value={newOrgDescription}
                onChange={(e) => setNewOrgDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Kurze Beschreibung"
              />
            </div>
          </div>
          <button
            onClick={createOrganization}
            disabled={!newOrgName.trim()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Organisation erstellen
          </button>
        </div>

        {/* Meine Organisationen */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Meine Organisationen</h3>
          {organizations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Sie sind noch kein Mitglied einer Organisation.</p>
          ) : (
            <div className="space-y-4">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedOrganization?.id === org.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => {
                    setSelectedOrganization(org);
                    loadOrganizationMembers(org.id);
                  }}
                >
                  <h4 className="font-medium">{org.name}</h4>
                  {org.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{org.description}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Erstellt am {new Date(org.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mitgliederverwaltung */}
        {selectedOrganization && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">
              Mitglieder von "{selectedOrganization.name}"
            </h3>

            {/* Neues Mitglied hinzufügen */}
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="font-medium mb-3">Neues Mitglied hinzufügen</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="benutzer@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rolle
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="member">Mitglied</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Besitzer</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addMemberToOrganization}
                    disabled={!newMemberEmail.trim()}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Hinzufügen
                  </button>
                </div>
              </div>
            </div>

            {/* Mitgliederliste */}
            <div>
              <h4 className="font-medium mb-3">Aktuelle Mitglieder</h4>
              {members.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">Keine Mitglieder gefunden.</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {member.user.user_metadata?.display_name || member.user.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.user.email} • {member.role}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMemberFromOrganization(member.id, member.user_id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
