"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import SidebarLogin from "../sidebarLogin";

export default function Projekte() {
  const [user, setUser] = useState<any>(null);
  const [projekte, setProjekte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editStates, setEditStates] = useState<{[id:string]: boolean}>({});
  const [editNames, setEditNames] = useState<{[id:string]: string}>({});
  const [editDescs, setEditDescs] = useState<{[id:string]: string}>({ new: '' });
  const [openDesc, setOpenDesc] = useState<{[id:string]: boolean}>({});
  const [shareEmail, setShareEmail] = useState<{[id:string]: string}>({});
  const [shareRole, setShareRole] = useState<{[id:string]: string}>({});
  const [sharing, setSharing] = useState<{[id:string]: boolean}>({});
  const [shareError, setShareError] = useState<{[id:string]: string}>({});
  const [shareSuccess, setShareSuccess] = useState<{[id:string]: string}>({});
  const [projektUsers, setProjektUsers] = useState<{[id:string]: any[]}>({});
  const [emailSuggestions, setEmailSuggestions] = useState<{[id:string]: any[]}>({});
  const [showSuggestions, setShowSuggestions] = useState<{[id:string]: boolean}>({});
  const [selectedProjekt, setSelectedProjekt] = useState<any>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newProjectMode, setNewProjectMode] = useState("");
  const [isLightMode, setIsLightMode] = useState(false);
  const [showOptionsBox, setShowOptionsBox] = useState(false);
  const [personen, setPersonen] = useState<any[]>([]);
  const [personForm, setPersonForm] = useState({ vorname: '', nachname: '', position: '', emailName: '', emailDomain: '', telefon: '' });
  const [personenProjekt, setPersonenProjekt] = useState<any[]>([]);
  const [showPersonenProjekt, setShowPersonenProjekt] = useState(false);
  const [expandedPersonIdx, setExpandedPersonIdx] = useState<number | null>(null);
  const [showDescField, setShowDescField] = useState(false);
  const optionLabels = [
    'Physical Gatherings',
    'Working from home',
    'Co-Working Spaces',
    'Pitch Competitions',
    'Client Meetings',
    'Online Team Meetings',
    'Communication Platform',
    'Private Channels',
    'Github Pushes',
    'Interviews',
    'Conversations with the team',
    'Conversations with the leadership team',
    'Technical Documentation',
    'Other Documents',
    'KPIs',
  ];
  const [newProjectOptions, setNewProjectOptions] = useState<boolean[]>(Array(optionLabels.length).fill(false));
  const domainInputRef = useRef<HTMLInputElement>(null);
  const [activeOptionTab, setActiveOptionTab] = useState<string | null>(null);
  const [gatherings, setGatherings] = useState<any[]>([]);
  const [gatheringForm, setGatheringForm] = useState<any>({
    datum: '',
    startzeit: '',
    endzeit: '',
    beschreibung: '',
    personen_ids: [],
    dialoge: [{ text: '', imageUrl: '' }],
  });
  const [gatheringLoading, setGatheringLoading] = useState(false);
  const [gatheringError, setGatheringError] = useState('');
  const [showDeleteOptionDialog, setShowDeleteOptionDialog] = useState<{opt: string | null, open: boolean}>({opt: null, open: false});
  const [deleteGatheringsLoading, setDeleteGatheringsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLightMode(document.body.classList.contains('light-mode'));
      const observer = new MutationObserver(() => {
        setIsLightMode(document.body.classList.contains('light-mode'));
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      // Eigene Projekte
      supabase
        .from("projekte")
        .select("id, name, beschreibung, created_at, updated_at, user_id, optionen, arbeitsweise")
        .eq("user_id", user.id),
      // Geteilte Projekte
      supabase
        .from("projekt_user")
        .select("projekt_id, role, projekte:projekt_id(id, name, beschreibung, created_at, updated_at, user_id, optionen, arbeitsweise)")
        .eq("user_id", user.id)
    ]).then(([ownRes, sharedRes]) => {
      let own = ownRes.data || [];
      let shared = (sharedRes.data || []).map((pu: any) => pu.projekte).filter(Boolean);
      // Duplikate entfernen (falls man Owner und geteilter Nutzer ist)
      const all = [...own, ...shared].filter((p, i, arr) => p && arr.findIndex(x => x.id === p.id) === i);
      setProjekte(all);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedProjekt) return;
    supabase
      .from('personen')
      .select('*')
      .eq('projekt_id', selectedProjekt.id)
      .then(({ data, error }) => {
        setPersonenProjekt(data || []);
      });
  }, [selectedProjekt]);

  async function handleDelete(id: string) {
    setLoading(true);
    setError("");
    const { error } = await supabase.from("projekte").delete().eq("id", id);
    if (error) setError(error.message);
    setProjekte(projekte.filter((p) => p.id !== id));
    setLoading(false);
  }

  async function handleNameSave(id: string) {
    const newName = editNames[id];
    const { error } = await supabase.from("projekte").update({ name: newName }).eq("id", id);
    if (!error) {
      setProjekte(projekte.map(p => p.id === id ? { ...p, name: newName } : p));
      setEditStates({ ...editStates, [id]: false });
    }
  }

  async function handleDescSave(id: string) {
    const newDesc = editDescs[id];
    const { error } = await supabase.from("projekte").update({ beschreibung: newDesc }).eq("id", id);
    if (!error) {
      setProjekte(projekte.map(p => p.id === id ? { ...p, beschreibung: newDesc } : p));
    }
  }

  // Nutzer für ein Projekt laden (Owner + geteilte Nutzer)
  async function loadProjektUsers(projektId: string) {
    // Owner laden
    const { data: projektData } = await supabase
      .from("projekte")
      .select("user_id")
      .eq("id", projektId)
      .single();
    let owner = null;
    if (projektData?.user_id) {
      const { data: ownerData } = await supabase
        .rpc('get_user_id_by_email', { email_input: null }) // Dummy, um Typ zu bekommen
        .then(() => supabase.from('auth.users').select('id, email').eq('id', projektData.user_id).single());
      if (ownerData?.email) {
        owner = { id: projektData.user_id, email: ownerData.email, role: 'owner' };
      }
    }
    // Geteilte Nutzer laden
    const { data: shared, error } = await supabase
      .from("projekt_user")
      .select("id, user_id, role, auth_users: user_id (email)")
      .eq("projekt_id", projektId);
    let users: any[] = [];
    if (!error && shared) {
      users = shared.map((pu: any) => ({
        id: pu.id,
        user_id: pu.user_id,
        email: pu.auth_users?.email || pu.user_id,
        role: pu.role
      }));
    }
    // Owner an den Anfang stellen
    const allUsers = owner ? [owner, ...users] : users;
    setProjektUsers(prev => ({ ...prev, [projektId]: allUsers }));

    for (const user of users) {
      if (!user.email || user.email === user.user_id) {
        const { data: email } = await supabase.rpc('get_user_email_by_id', { user_id_input: user.user_id });
        if (email) user.email = email;
      }
    }
  }

  // Nutzer hinzufügen
  async function handleShare(projektId: string) {
    setSharing(prev => ({ ...prev, [projektId]: true }));
    setShareError(prev => ({ ...prev, [projektId]: "" }));
    setShareSuccess(prev => ({ ...prev, [projektId]: "" }));
    // user_id über Supabase-Function holen
    const { data: userId, error: userIdError } = await supabase.rpc('get_user_id_by_email', { email_input: shareEmail[projektId] });
    if (userIdError || !userId) {
      setShareError(prev => ({ ...prev, [projektId]: "Nutzer nicht gefunden." }));
      setSharing(prev => ({ ...prev, [projektId]: false }));
      return;
    }
    // Eintrag in projekt_user anlegen
    const { error } = await supabase.from("projekt_user").insert({
      projekt_id: projektId,
      user_id: userId,
      role: shareRole[projektId] || "read",
    });
    if (error) {
      setShareError(prev => ({ ...prev, [projektId]: error.message }));
      setShareSuccess(prev => ({ ...prev, [projektId]: "" }));
    } else {
      setShareEmail(prev => ({ ...prev, [projektId]: "" }));
      setShareSuccess(prev => ({ ...prev, [projektId]: "Nutzer erfolgreich hinzugefügt!" }));
      loadProjektUsers(projektId);
    }
    setSharing(prev => ({ ...prev, [projektId]: false }));
  }

  // Nutzer entfernen
  async function handleRemoveUser(projektId: string, projektUserId: string) {
    await supabase.from("projekt_user").delete().eq("id", projektUserId);
    loadProjektUsers(projektId);
  }

  // Funktion zum Ändern der Rolle eines Nutzers
  async function handleRoleChange(projektUserId: string, newRole: string, projektId: string) {
    await supabase.from("projekt_user").update({ role: newRole }).eq("id", projektUserId);
    loadProjektUsers(projektId);
  }

  // Autocomplete für E-Mail
  async function handleEmailInput(projektId: string, value: string) {
    setShareEmail(prev => ({ ...prev, [projektId]: value }));
    if (value.length < 2) {
      setEmailSuggestions(prev => ({ ...prev, [projektId]: [] }));
      setShowSuggestions(prev => ({ ...prev, [projektId]: false }));
      return;
    }
    const { data, error } = await supabase.rpc('search_users_by_email', { search: value });
    if (!error && data) {
      setEmailSuggestions(prev => ({ ...prev, [projektId]: data }));
      setShowSuggestions(prev => ({ ...prev, [projektId]: true }));
    }
  }

  function handleSuggestionClick(projektId: string, email: string) {
    setShareEmail(prev => ({ ...prev, [projektId]: email }));
    setShowSuggestions(prev => ({ ...prev, [projektId]: false }));
  }

  function isValidEmail(emailName: string, emailDomain: string) {
    const email = emailName + emailDomain;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;
    setCreatingProject(true);
    setCreateError("");
    // Array der aktiven Optionen bestimmen
    const aktiveOptionen = optionLabels.filter((_, i) => newProjectOptions[i]);
    // 1. Projekt anlegen (mit optionen-Array)
    const { data: projekt, error } = await supabase
      .from("projekte")
      .insert({
        name: newProjectName,
        beschreibung: editDescs['new'] ?? '',
        user_id: user.id,
        arbeitsweise: newProjectMode,
        optionen: aktiveOptionen
      })
      .select()
      .single();
    setCreatingProject(false);
    if (error) {
      setCreateError(error.message);
      return;
    }

    // 2. Personen mit projekt_id anlegen
    if (personen.length > 0) {
      const personenToInsert = personen.map(p => ({
        ...p,
        projekt_id: projekt.id
      }));
      const { error: personenError } = await supabase
        .from("personen")
        .insert(personenToInsert);
      if (personenError) {
        setCreateError("Projekt wurde angelegt, aber Personen konnten nicht gespeichert werden: " + personenError.message);
      }
    }

    setShowNewProject(false);
    setNewProjectName("");
    setShowDescField(false);
    setEditDescs(descs => ({ ...descs, ['new']: '' }));
    setNewProjectMode("");
    setNewProjectOptions(Array(optionLabels.length).fill(false));
    setShowOptionsBox(false);
    setPersonen([]);
    setPersonForm({ vorname: '', nachname: '', position: '', emailName: '', emailDomain: '', telefon: '' });
    setProjekte([projekt, ...projekte]);
    setSelectedProjekt(projekt);
  }

  function handleAddPerson() {
    if (!personForm.emailName && !personForm.emailDomain) {
      if (!window.confirm('Möchtest du die Person wirklich ohne E-Mailadresse anlegen?')) return;
    }
    setPersonen(p => [...p, {
      vorname: personForm.vorname,
      nachname: personForm.nachname,
      position: personForm.position,
      email: personForm.emailName ? (personForm.emailName + personForm.emailDomain) : '',
      telefon: personForm.telefon
    }]);
    setPersonForm(f => ({ vorname: '', nachname: '', position: '', emailName: '', emailDomain: f.emailDomain, telefon: '' }));
  }

  function handlePersonFormKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && personForm.nachname.trim() && (personForm.emailName ? isValidEmail(personForm.emailName, personForm.emailDomain) : true)) {
      e.preventDefault();
      handleAddPerson();
    }
  }

  // Hilfsfunktion zum Hinzufügen einer Option zu einem bestehenden Projekt
  async function handleAddOptionToProject(option: string) {
    if (!selectedProjekt) return;
    const neueOptionen = Array.isArray(selectedProjekt.optionen)
      ? [...selectedProjekt.optionen, option]
      : [option];
    const { error } = await supabase
      .from('projekte')
      .update({ optionen: neueOptionen })
      .eq('id', selectedProjekt.id);
    if (!error) {
      setSelectedProjekt({ ...selectedProjekt, optionen: neueOptionen });
      setProjekte(projekte.map(p => p.id === selectedProjekt.id ? { ...p, optionen: neueOptionen } : p));
      // Automatisch den neuen Tab aktivieren
      setActiveOptionTab(option);
    }
  }

  // Gatherings laden, wenn Tab aktiv und Projekt ausgewählt
  useEffect(() => {
    if (activeOptionTab === 'Physical Gatherings' && selectedProjekt) {
      setGatheringLoading(true);
      supabase
        .from('gatherings')
        .select('*')
        .eq('projekt_id', selectedProjekt.id)
        .order('datum', { ascending: false })
        .then(({ data, error }) => {
          setGatherings(data || []);
          setGatheringLoading(false);
        });
    }
  }, [activeOptionTab, selectedProjekt]);

  async function handleAddGathering() {
    setGatheringError('');
    setGatheringLoading(true);
    const { datum, startzeit, endzeit, beschreibung, personen_ids, dialoge } = gatheringForm;
    const { error, data } = await supabase.from('gatherings').insert({
      projekt_id: selectedProjekt.id,
      datum,
      startzeit,
      endzeit,
      beschreibung,
      personen_ids,
      dialoge,
    }).select();
    if (error) {
      setGatheringError(error.message);
    } else {
      setGatherings(g => [data[0], ...g]);
      setGatheringForm({ datum: '', startzeit: '', endzeit: '', beschreibung: '', personen_ids: [], dialoge: [{ text: '', imageUrl: '' }] });
    }
    setGatheringLoading(false);
  }

  async function handleDeleteGathering(id: string) {
    setGatheringLoading(true);
    await supabase.from('gatherings').delete().eq('id', id);
    setGatherings(g => g.filter(ga => ga.id !== id));
    setGatheringLoading(false);
  }

  async function handleDeleteOption(opt: string, deleteGatherings: boolean) {
    setDeleteGatheringsLoading(true);
    let neueOptionen = Array.isArray(selectedProjekt.optionen) ? selectedProjekt.optionen.filter((o: string) => o !== opt) : [];
    // Option aus Projekt entfernen
    await supabase.from('projekte').update({ optionen: neueOptionen }).eq('id', selectedProjekt.id);
    setSelectedProjekt({ ...selectedProjekt, optionen: neueOptionen });
    setProjekte(projekte.map(p => p.id === selectedProjekt.id ? { ...p, optionen: neueOptionen } : p));
    // Gatherings ggf. löschen
    if (opt === 'Physical Gatherings' && deleteGatherings) {
      await supabase.from('gatherings').delete().eq('projekt_id', selectedProjekt.id);
      setGatherings([]);
    }
    setShowDeleteOptionDialog({opt: null, open: false});
    setDeleteGatheringsLoading(false);
  }

  // Wenn das ausgewählte Projekt wechselt, Tab auf 'Start' setzen
  useEffect(() => {
    if (selectedProjekt) {
      setActiveOptionTab('Start');
    }
  }, [selectedProjekt]);

  if (!user) {
    return (
      <div
        style={{
          maxWidth: 400,
          margin: '4rem auto',
          padding: '2rem',
          background: isLightMode
            ? 'linear-gradient(135deg, #e0f0ff 0%, #b3d8ff 100%)'
            : '#232b5d',
          borderRadius: 12,
          boxShadow: '0 2px 16px #0002',
        }}
      >
        <h2 style={{ color: 'var(--foreground)', marginBottom: 24, textAlign: 'center' }}>Bitte einloggen oder registrieren</h2>
        <SidebarLogin />
      </div>
    );
  }

  // Einzelansicht für ein Projekt
  if (selectedProjekt) {
    const projekt = selectedProjekt;
    const isOwner = projekt.user_id === user.id;
    const sharedEntry = projektUsers[projekt.id]?.find(u => u.user_id === user.id);
    const canEdit = isOwner || (sharedEntry && sharedEntry.role === 'write');

    // Tabs: Start + alle Optionen
    const optionTabs = ['Start', ...(Array.isArray(projekt.optionen) ? projekt.optionen : [])];

    return (
      <div style={{ width: '100%', padding: '2rem 3vw' }}>
        <button
          onClick={() => setSelectedProjekt(null)}
          style={{
            background: 'transparent',
            border: '1px solid #ff9800',
            color: '#ff9800',
            borderRadius: 8,
            padding: '8px 16px',
            marginBottom: 24,
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          ← Zurück zur Übersicht
        </button>

        {/* Tabs-Leiste */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, marginTop: 8 }}>
          {optionTabs.map((opt: string) => {
            const isActive = activeOptionTab === opt;
            return (
              <div key={opt} style={{ position: 'relative' }}>
                <button
                  onClick={() => setActiveOptionTab(opt)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: isActive ? '2px solid #ff9800' : '1.5px solid #bbb',
                    background: isActive ? '#ff9800' : '#f5f5f5',
                    color: isActive ? '#fff' : '#232b5d',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px #ff980033' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt}
                </button>
                {/* Löschen-Button für Option-Tabs außer Start */}
                {isActive && opt !== 'Start' && (
                  <button
                    onClick={() => setShowDeleteOptionDialog({opt, open: true})}
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: -32,
                      background: '#fff',
                      color: '#b00',
                      border: '1.5px solid #b00',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                    title="Option löschen"
                  >
                    🗑
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {/* Dialog für Option löschen */}
        {showDeleteOptionDialog.open && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '2rem 2.5rem', minWidth: 320, boxShadow: '0 2px 16px #0003', color: '#232b5d' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>Option wirklich löschen?</div>
              <div style={{ marginBottom: 18 }}>
                Möchtest du auch alle zugehörigen Gatherings löschen (nur relevant bei "Physical Gatherings") oder nur die Option entfernen?
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <button onClick={() => handleDeleteOption(showDeleteOptionDialog.opt!, false)} disabled={deleteGatheringsLoading} style={{ background: '#bbb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Nur Option entfernen</button>
                <button onClick={() => handleDeleteOption(showDeleteOptionDialog.opt!, true)} disabled={deleteGatheringsLoading} style={{ background: '#b00', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Option + Gatherings löschen</button>
              </div>
              <button onClick={() => setShowDeleteOptionDialog({opt: null, open: false})} style={{ background: 'transparent', color: '#232b5d', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>Abbrechen</button>
            </div>
          </div>
        )}

        {/* Tab-Inhalte */}
        {activeOptionTab === 'Start' && (
          <div style={{
            background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
            borderRadius: 12,
            padding: '0.5rem 1.2rem',
            color: '#fff',
            boxShadow: '0 4px 16px #ff980033',
            marginBottom: 24
          }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 12, minHeight: 36 }}>
              {canEdit ? (
                editStates[projekt.id] ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="text"
                      value={editNames[projekt.id] ?? projekt.name ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditNames({ ...editNames, [projekt.id]: e.target.value })}
                      style={{ 
                        padding: 6, 
                        borderRadius: 5, 
                        border: '1px solid #fff', 
                        minWidth: 160, 
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'var(--foreground)'
                      }}
                    />
                    <button 
                      onClick={(f: any) => handleNameSave(projekt.id)} 
                      style={{ 
                        background: '#fff', 
                        color: '#ff9800', 
                        border: 'none', 
                        borderRadius: 5, 
                        padding: '4px 10px', 
                        fontWeight: 600, 
                        cursor: 'pointer' 
                      }}
                    >
                      Speichern
                    </button>
                    <button 
                      onClick={(f: any) => setEditStates({ ...editStates, [projekt.id]: false })} 
                      style={{ 
                        background: 'transparent', 
                        color: '#fff', 
                        border: '1px solid #fff', 
                        borderRadius: 5, 
                        padding: '4px 10px', 
                        fontWeight: 600, 
                        cursor: 'pointer' 
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span>{projekt.name}</span>
                    <button 
                      onClick={(f: any) => setEditStates({ ...editStates, [projekt.id]: true })} 
                      style={{ 
                        background: '#fff', 
                        color: '#ff9800', 
                        border: 'none', 
                        borderRadius: 5, 
                        padding: '4px 10px', 
                        fontWeight: 600, 
                        cursor: 'pointer' 
                      }}
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={(f: any) => handleDelete(projekt.id)}
                      style={{ padding: '4px 10px', borderRadius: 5, background: '#b00', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                      disabled={loading}
                    >
                      Löschen
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 16, fontSize: 12, color: '#fff', opacity: 0.85, fontWeight: 400 }}>
                      <span>Erstellt: {projekt.created_at ? new Date(projekt.created_at).toLocaleDateString() : "-"}</span>
                      {projekt.updated_at && <span>Letzte Änderung: {new Date(projekt.updated_at).toLocaleDateString()}</span>}
                      {projekt.arbeitsweise && <span>Arbeitsweise: {projekt.arbeitsweise === 'vor_ort' ? 'Vor Ort' : projekt.arbeitsweise === 'hybrid' ? 'Hybrid' : 'Nur remote'}</span>}
                    </div>
                  </div>
                )
              ) : (
                projekt.name
              )}
            </h1>
            <div style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Beschreibung:</h3>
                <button
                  onClick={(f: any) => setOpenDesc({ ...openDesc, [projekt.id]: !openDesc[projekt.id] })}
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid #fff', 
                    color: '#fff', 
                    borderRadius: 4, 
                    padding: '2px 8px', 
                    fontSize: 12, 
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {openDesc[projekt.id] ? '▼' : '▶'}
                </button>
              </div>
              {openDesc[projekt.id] ? (
                canEdit ? (
                  <textarea
                    placeholder="Beschreibung..."
                    value={editDescs[projekt.id] ?? projekt.beschreibung ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescs({ ...editDescs, [projekt.id]: e.target.value })}
                    onBlur={(f: any) => handleDescSave(projekt.id)}
                    style={{ 
                      width: '100%', 
                      minHeight: 80, 
                      borderRadius: 6, 
                      border: '1px solid #fff', 
                      padding: 8, 
                      color: 'var(--foreground)', 
                      fontWeight: 500,
                      background: 'rgba(255,255,255,0.1)',
                      fontSize: '0.9rem'
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    minHeight: 80, 
                    borderRadius: 6, 
                    border: '1px solid #fff', 
                    padding: 8, 
                    color: 'var(--foreground)', 
                    fontWeight: 500, 
                    background: 'rgba(255,255,255,0.08)',
                    fontSize: '0.9rem'
                  }}>
                    {projekt.beschreibung || <span style={{ opacity: 0.6 }}>[Keine Beschreibung]</span>}
                  </div>
                )
              ) : (
                <div style={{ 
                  fontSize: '0.9rem', 
                  opacity: 0.8, 
                  fontStyle: 'italic',
                  padding: '4px 0'
                }}>
                  {projekt.beschreibung ? 
                    (projekt.beschreibung.length > 100 ? projekt.beschreibung.substring(0, 100) + '...' : projekt.beschreibung) : 
                    '[Keine Beschreibung]'
                  }
                </div>
              )}
            </div>
            {/* Projekt teilen Box */}
            {canEdit && (
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'rgba(255,255,255,0.95)',
                border: '1.5px solid #b3d8ff',
                borderRadius: 8,
                padding: '10px 14px',
                boxShadow: '0 2px 8px #b3d8ff22',
                maxWidth: 260,
                fontSize: 13,
                zIndex: 20
              }}>
                <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14, color: '#232b5d' }}>Projekt teilen</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="email"
                      placeholder="E-Mail des Nutzers"
                      value={shareEmail[projekt.id] ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEmailInput(projekt.id, e.target.value)}
                      style={{
                        padding: 5,
                        borderRadius: 6,
                        border: '1px solid #b3d8ff',
                        width: '100%',
                        fontSize: 13
                      }}
                      autoComplete="off"
                      onFocus={(f: any) => setShowSuggestions({ ...showSuggestions, [projekt.id]: true })}
                      onBlur={(f: any) => setTimeout(() => setShowSuggestions({ ...showSuggestions, [projekt.id]: false }), 150)}
                    />
                    {showSuggestions[projekt.id] && emailSuggestions[projekt.id] && emailSuggestions[projekt.id].length > 0 && (
                      <ul style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        color: '#222',
                        border: '1px solid #eee',
                        borderRadius: 6,
                        zIndex: 10,
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        maxHeight: 120,
                        overflowY: 'auto',
                        boxShadow: '0 2px 8px #0002',
                        fontSize: 13
                      }}>
                        {emailSuggestions[projekt.id].map((s: any) => (
                          <li
                            key={s.id}
                            onMouseDown={(f: any) => handleSuggestionClick(projekt.id, s.email)}
                            style={{ padding: '6px 10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                          >
                            {s.email}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <select
                    value={shareRole[projekt.id] || "read"}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setShareRole({ ...shareRole, [projekt.id]: e.target.value })}
                    style={{
                      padding: 5,
                      borderRadius: 6,
                      border: '1px solid #b3d8ff',
                      fontSize: 13
                    }}
                  >
                    <option value="read">Lesen</option>
                    <option value="write">Schreiben</option>
                  </select>
                  <button
                    onClick={(f: any) => handleShare(projekt.id)}
                    disabled={sharing[projekt.id]}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: '#b3d8ff',
                      color: '#232b5d',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    Hinzufügen
                  </button>
                </div>
                {shareError[projekt.id] && <div style={{ color: '#b00', marginBottom: 4, fontSize: 12 }}>{shareError[projekt.id]}</div>}
                {shareSuccess[projekt.id] && <div style={{ color: '#1aaf5d', marginBottom: 4, fontSize: 12 }}>{shareSuccess[projekt.id]}</div>}
              </div>
            )}
          </div>
        )}

        {/* Weitere Tab-Inhalte */}
        {activeOptionTab === 'Physical Gatherings' && canEdit && (
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
              <input type="date" value={gatheringForm.datum} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGatheringForm((f: any) => ({ ...f, datum: e.target.value }))} style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
              <input type="time" value={gatheringForm.startzeit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGatheringForm((f: any) => ({ ...f, startzeit: e.target.value }))} style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
              <input type="time" value={gatheringForm.endzeit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGatheringForm((f: any) => ({ ...f, endzeit: e.target.value }))} style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
              <input type="text" placeholder="Beschreibung" value={gatheringForm.beschreibung} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGatheringForm((f: any) => ({ ...f, beschreibung: e.target.value }))} style={{ flex: 1, minWidth: 120, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
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
                  <button type="button" onClick={() => setGatheringForm((f: any) => ({ ...f, dialoge: f.dialoge.filter((_: any, idx: any) => idx !== i) }))} style={{ background: '#b00', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 700, fontSize: 18, cursor: 'pointer', alignSelf: 'flex-end' }}>–</button>
                </div>
              ))}
              <button type="button" onClick={() => setGatheringForm((f: any) => ({ ...f, dialoge: [...f.dialoge, { text: '', imageUrl: '' }] }))} style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>+ Dialog</button>
            </div>
            <button onClick={(f: any) => handleAddGathering()} disabled={gatheringLoading} style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>Speichern</button>
            {gatheringError && <div style={{ color: '#b00', marginTop: 8 }}>{gatheringError}</div>}
          </div>
        )}
        {activeOptionTab === 'Physical Gatherings' && (
          <div style={{ marginTop: 24 }}>
            <h4>Physical Gatherings</h4>
            {gatheringLoading ? <div>Lade...</div> : (
              gatherings.length === 0 ? <div style={{ color: '#888' }}>[Keine Gatherings]</div> : (
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
                      {canEdit && <button onClick={(f: any) => handleDeleteGathering(g.id)} style={{ background: '#b00', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>Löschen</button>}
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  // Listenansicht für alle Projekte
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Projekte</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        Hier werden alle deine Projekte angezeigt. Klicke auf ein Projekt, um es zu öffnen.
      </p>
      <div style={{ marginBottom: 24 }}>
        {showNewProject ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Projektname"
                value={newProjectName ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewProjectName(e.target.value);
                  if (e.target.value && !showDescField) setShowDescField(true);
                }}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 180 }}
                autoFocus
              />
              <button
                onClick={(f: any) => handleCreateProject()}
                disabled={creatingProject || !newProjectName.trim()}
                style={{ padding: '8px 16px', borderRadius: 6, background: '#ff9800', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Anlegen
              </button>
              <button
                onClick={(f: any) => { setShowNewProject(false); setNewProjectName(""); setNewProjectMode(""); setCreateError(""); }}
                style={{ padding: '8px 16px', borderRadius: 6, background: '#bbb', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Abbrechen
              </button>
              {createError && <span style={{ color: '#b00', marginLeft: 12 }}>{createError}</span>}
            </div>
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={(f: any) => setShowDescField(v => !v)}
                style={{
                  background: '#b3d8ff',
                  color: '#232b5d',
                  border: 'none',
                  borderRadius: 8,
                  padding: '4px 14px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  marginBottom: 4
                }}
              >
                {showDescField ? 'Beschreibung ausblenden' : 'Beschreibung anzeigen'}
              </button>
              {showDescField && (
                <textarea
                  placeholder="Projektbeschreibung (optional)"
                  value={editDescs['new'] ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescs(descs => ({ ...descs, ['new']: e.target.value }))}
                  style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1px solid #bbb', padding: 8, color: 'var(--foreground)', fontWeight: 500, marginTop: 4 }}
                />
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontWeight: 500, marginRight: 8 }}>Arbeitsweise der Organisation:</label>
              <select
                value={newProjectMode ?? ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setNewProjectMode(e.target.value); setShowOptionsBox(false); setNewProjectOptions(Array(optionLabels.length).fill(true)); }}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 140 }}
              >
                <option value="" disabled={!!newProjectMode}>Bitte wählen ...</option>
                <option value="vor_ort">🏢 Vor Ort</option>
                <option value="hybrid">🔀 Hybrid</option>
                <option value="remote">🏠 Nur remote</option>
              </select>
            </div>
            {newProjectMode && (
              <>
                <button
                  type="button"
                  onClick={(f: any) => setShowOptionsBox(v => !v)}
                  style={{
                    marginTop: 16,
                    marginBottom: showOptionsBox ? 0 : 16,
                    background: '#b3d8ff',
                    color: '#232b5d',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #b3d8ff22',
                  }}
                >
                  {showOptionsBox ? 'Optionen ausblenden' : 'Optionen anzeigen'}
                </button>
                {showOptionsBox && (
                  <div style={{
                    marginTop: 8,
                    marginBottom: 8,
                    background: 'rgba(179,216,255,0.18)',
                    border: '1.5px solid #b3d8ff',
                    borderRadius: 10,
                    padding: '1.2rem 1.5rem',
                    boxShadow: '0 2px 8px #b3d8ff22',
                    maxWidth: 350
                  }}>
                    <div style={{ fontWeight: 500, marginBottom: 10 }}>Optionen:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {optionLabels.map((label, i) => (
                        <label
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 400,
                            background: isLightMode ? '#e0f0ff' : '#232b5d',
                            border: isLightMode ? '1.5px solid #b3d8ff' : '1.5px solid #3a4a8c',
                            borderRadius: 7,
                            padding: '10px 14px',
                            boxShadow: isLightMode ? '0 1px 4px #b3d8ff22' : '0 1px 4px #232b5d44',
                            marginBottom: 2
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={newProjectOptions[i] ?? false}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const opts = [...newProjectOptions];
                              opts[i] = e.target.checked;
                              setNewProjectOptions(opts);
                            }}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <div style={{
              marginTop: 24,
              marginBottom: 8,
              background: isLightMode ? '#e0f0ff' : '#232b5d',
              border: isLightMode ? '1.5px solid #b3d8ff' : '1.5px solid #3a4a8c',
              borderRadius: 10,
              padding: '1.2rem 1.5rem',
              boxShadow: isLightMode ? '0 2px 8px #b3d8ff22' : '0 2px 8px #232b5d44',
              maxWidth: 400
            }}>
              <div style={{ fontWeight: 500, marginBottom: 10 }}>Personen hinzufügen:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Vorname"
                    value={personForm.vorname ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPersonForm(f => ({ ...f, vorname: e.target.value }))}
                    style={{ flex: 1, minWidth: 90, padding: 8, borderRadius: 6, border: '1px solid #bbb' }}
                    onKeyDown={handlePersonFormKeyDown}
                  />
                  <input
                    type="text"
                    placeholder="Nachname *"
                    value={personForm.nachname ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPersonForm(f => ({ ...f, nachname: e.target.value }))}
                    style={{ flex: 1, minWidth: 90, padding: 8, borderRadius: 6, border: '1px solid #bbb' }}
                    required
                    onKeyDown={handlePersonFormKeyDown}
                  />
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Position"
                    value={personForm.position ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPersonForm(f => ({ ...f, position: e.target.value }))}
                    style={{ flex: 1, minWidth: 90, padding: 8, borderRadius: 6, border: '1px solid #bbb' }}
                  />
                  <div style={{ display: 'flex', gap: 0 }}>
                    <input
                      type="text"
                      placeholder="E-Mailname *"
                      value={personForm.emailName ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPersonForm(f => ({ ...f, emailName: e.target.value.replace(/@.*/, '') }))}
                      style={{ width: 110, padding: 8, borderRadius: '6px 0 0 6px', border: '1px solid #bbb', borderRight: 'none' }}
                      required
                      onKeyDown={e => {
                        if (e.key === '@') {
                          e.preventDefault();
                          if (!personForm.emailDomain.startsWith('@')) {
                            setPersonForm(f => ({ ...f, emailDomain: '@' }));
                            setTimeout(() => {
                              domainInputRef.current?.focus();
                              domainInputRef.current?.setSelectionRange(1, 1);
                            }, 0);
                          } else {
                            setTimeout(() => {
                              domainInputRef.current?.focus();
                              domainInputRef.current?.setSelectionRange(personForm.emailDomain.length, personForm.emailDomain.length);
                            }, 0);
                          }
                        } else {
                          handlePersonFormKeyDown(e);
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="@domain *"
                      value={personForm.emailDomain ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPersonForm(f => ({ ...f, emailDomain: e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value }))}
                      style={{ width: 110, padding: 8, borderRadius: '0 6px 6px 0', border: '1px solid #bbb', borderLeft: 'none' }}
                      required
                      ref={domainInputRef}
                      onKeyDown={handlePersonFormKeyDown}
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Telefonnummer"
                  value={personForm.telefon ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPersonForm(f => ({ ...f, telefon: e.target.value }))}
                  style={{ flex: 1, minWidth: 90, padding: 8, borderRadius: 6, border: '1px solid #bbb', marginTop: 4 }}
                  onKeyDown={handlePersonFormKeyDown}
                />
                <button
                  type="button"
                  onClick={(f: any) => handleAddPerson()}
                  disabled={!personForm.nachname.trim() || (personForm.emailName ? !isValidEmail(personForm.emailName, personForm.emailDomain) : false)}
                  style={{
                    marginTop: 6,
                    background: '#ff9800',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: !personForm.nachname.trim() || (personForm.emailName ? !isValidEmail(personForm.emailName, personForm.emailDomain) : false) ? 'not-allowed' : 'pointer',
                    opacity: !personForm.nachname.trim() || (personForm.emailName ? !isValidEmail(personForm.emailName, personForm.emailDomain) : false) ? 0.6 : 1
                  }}
                >
                  Hinzufügen
                </button>
              </div>
              {personen.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>Hinzugefügte Personen:</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {personen.map((p, idx) => (
                      <li key={idx} style={{ marginBottom: 4, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ flex: 1 }}>
                          {p.vorname && <>{p.vorname} </>}{p.nachname} – {p.position && <>{p.position}, </>}{p.email}{p.telefon && <> ({p.telefon})</>}
                        </span>
                        <button
                          type="button"
                          onClick={(f: any) => setPersonen(personen.filter((_, i) => i !== idx))}
                          style={{
                            background: '#b00',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '2px 10px',
                            fontWeight: 700,
                            fontSize: 18,
                            cursor: 'pointer',
                            lineHeight: 1
                          }}
                          title="Entfernen"
                        >
                          –
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={(f: any) => setShowNewProject(true)}
            style={{ padding: '10px 22px', borderRadius: 8, background: '#ff9800', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #ff980033' }}
          >
            + Neues Projekt anlegen
          </button>
        )}
      </div>
      {loading ? (
        <div>Lade Projekte...</div>
      ) : error ? (
        <div style={{ color: '#b00' }}>{error}</div>
      ) : projekte.length === 0 ? (
        <div style={{ color: '#888' }}>[Keine Projekte gefunden]</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {projekte.map((projekt) => {
            const isOwner = projekt.user_id === user.id;
            const sharedEntry = projektUsers[projekt.id]?.find(u => u.user_id === user.id);
            const canEdit = isOwner || (sharedEntry && sharedEntry.role === 'write');

            return (
              <li key={projekt.id} style={{
                background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
                borderRadius: 8,
                padding: '1rem 1.5rem',
                marginBottom: 16,
                color: '#fff',
                fontWeight: 500,
                boxShadow: '0 2px 8px #ff980033',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <button
                      onClick={(f: any) => setSelectedProjekt(projekt)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#fff', 
                        fontSize: '1.2rem', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: 0,
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px'
                      }}
                    >
                      {projekt.name}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {canEdit && (
                      <button
                        onClick={(f: any) => handleDelete(projekt.id)}
                        style={{ padding: '4px 10px', borderRadius: 5, background: '#b00', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                        disabled={loading}
                      >
                        Löschen
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '0.95rem', opacity: 0.85, marginTop: 8, marginBottom: 8 }}>
                  Erstellt: {projekt.created_at ? new Date(projekt.created_at).toLocaleString() : "-"}
                  {projekt.updated_at && (
                    <>
                      <br />Letzte Änderung: {new Date(projekt.updated_at).toLocaleString()}
                    </>
                  )}
                  {projekt.arbeitsweise && (
                    <>
                      <br />Arbeitsweise: {projekt.arbeitsweise === 'vor_ort' ? 'Vor Ort' : projekt.arbeitsweise === 'hybrid' ? 'Hybrid' : 'Nur remote'}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
} 