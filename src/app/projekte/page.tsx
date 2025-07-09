"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SidebarLogin from "../sidebarLogin";

export default function Projekte() {
  const [user, setUser] = useState<any>(null);
  const [projekte, setProjekte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editStates, setEditStates] = useState<{[id:string]: boolean}>({});
  const [editNames, setEditNames] = useState<{[id:string]: string}>({});
  const [editDescs, setEditDescs] = useState<{[id:string]: string}>({});
  const [openDesc, setOpenDesc] = useState<{[id:string]: boolean}>({});
  const [shareEmail, setShareEmail] = useState<{[id:string]: string}>({});
  const [shareRole, setShareRole] = useState<{[id:string]: string}>({});
  const [sharing, setSharing] = useState<{[id:string]: boolean}>({});
  const [shareError, setShareError] = useState<{[id:string]: string}>({});
  const [shareSuccess, setShareSuccess] = useState<{[id:string]: string}>({});
  const [projektUsers, setProjektUsers] = useState<{[id:string]: any[]}>({});
  const [emailSuggestions, setEmailSuggestions] = useState<{[id:string]: any[]}>({});
  const [showSuggestions, setShowSuggestions] = useState<{[id:string]: boolean}>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      // Eigene Projekte
      supabase
        .from("projekte")
        .select("id, name, beschreibung, created_at, updated_at, user_id")
        .eq("user_id", user.id),
      // Geteilte Projekte
      supabase
        .from("projekt_user")
        .select("projekt_id, role, projekte:projekt_id(id, name, beschreibung, created_at, updated_at, user_id)")
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

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: '4rem auto', padding: '2rem', background: '#232b5d', borderRadius: 12, boxShadow: '0 2px 16px #0002' }}>
        <h2 style={{ color: '#fff', marginBottom: 24, textAlign: 'center' }}>Bitte einloggen oder registrieren</h2>
        <SidebarLogin />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Projekte</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        Hier werden alle deine Projekte angezeigt. Du kannst sie bearbeiten oder löschen.
      </p>
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
                  <button
                    onClick={() => setOpenDesc({ ...openDesc, [projekt.id]: !openDesc[projekt.id] })}
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginRight: 8 }}
                    aria-label={openDesc[projekt.id] ? 'Einklappen' : 'Ausklappen'}
                  >
                    {openDesc[projekt.id] ? '▼' : '▶'}
                  </button>
                  {canEdit ? (
                    editStates[projekt.id] ? (
                      <>
                        <input
                          type="text"
                          value={editNames[projekt.id] ?? projekt.name}
                          onChange={e => setEditNames({ ...editNames, [projekt.id]: e.target.value })}
                          style={{ padding: 6, borderRadius: 6, border: '1px solid #fff', minWidth: 120, fontWeight: 500 }}
                        />
                        <button onClick={() => handleNameSave(projekt.id)} style={{ marginLeft: 8, background: '#fff', color: '#ff9800', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Speichern</button>
                        <button onClick={() => setEditStates({ ...editStates, [projekt.id]: false })} style={{ marginLeft: 4, background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Abbrechen</button>
                      </>
                    ) : (
                      <>
                        <span>{projekt.name}</span>
                        <div style={{ fontSize: '0.95rem', opacity: 0.85, marginTop: 4, marginBottom: 4 }}>
                          Erstellt: {projekt.created_at ? new Date(projekt.created_at).toLocaleString() : "-"}
                          {projekt.updated_at && (
                            <>
                              <br />Letzte Änderung: {new Date(projekt.updated_at).toLocaleString()}
                            </>
                          )}
                        </div>
                        <button onClick={() => setEditStates({ ...editStates, [projekt.id]: true })} style={{ marginLeft: 8, background: '#fff', color: '#ff9800', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Bearbeiten</button>
                        <button
                          onClick={() => handleDelete(projekt.id)}
                          style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, background: '#b00', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                          disabled={loading}
                        >
                          Löschen
                        </button>
                      </>
                    )
                  ) : (
                    <>
                      <span>{projekt.name}</span>
                      <div style={{ fontSize: '0.95rem', opacity: 0.85, marginTop: 4, marginBottom: 4 }}>
                        Erstellt: {projekt.created_at ? new Date(projekt.created_at).toLocaleString() : "-"}
                        {projekt.updated_at && (
                          <>
                            <br />Letzte Änderung: {new Date(projekt.updated_at).toLocaleString()}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {openDesc[projekt.id] && (
                  <div style={{ marginTop: 16 }}>
                    {canEdit ? (
                      <textarea
                        placeholder="Beschreibung..."
                        value={editDescs[projekt.id] ?? projekt.beschreibung ?? ""}
                        onChange={e => setEditDescs({ ...editDescs, [projekt.id]: e.target.value })}
                        onBlur={() => handleDescSave(projekt.id)}
                        style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1px solid #fff', padding: 8, color: '#ff9800', fontWeight: 500 }}
                      />
                    ) : (
                      <div style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1px solid #fff', padding: 8, color: '#fff', fontWeight: 500, background: 'rgba(255,255,255,0.08)' }}>
                        {projekt.beschreibung || <span style={{ opacity: 0.6 }}>[Keine Beschreibung]</span>}
                      </div>
                    )}
                    {canEdit && (
                      <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 16 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Projekt teilen:</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type="email"
                              placeholder="E-Mail des Nutzers"
                              value={shareEmail[projekt.id] || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEmailInput(projekt.id, e.target.value)}
                              style={{ padding: 6, borderRadius: 6, border: '1px solid #fff', minWidth: 180, width: '100%' }}
                              autoComplete="off"
                              onFocus={() => setShowSuggestions(prev => ({ ...prev, [projekt.id]: true }))}
                              onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, [projekt.id]: false })), 150)}
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
                                maxHeight: 180,
                                overflowY: 'auto',
                                boxShadow: '0 2px 8px #0002',
                              }}>
                                {emailSuggestions[projekt.id].map((s: any) => (
                                  <li
                                    key={s.id}
                                    onMouseDown={() => handleSuggestionClick(projekt.id, s.email)}
                                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                  >
                                    {s.email}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <select
                            value={shareRole[projekt.id] || "read"}
                            onChange={e => setShareRole(prev => ({ ...prev, [projekt.id]: e.target.value }))}
                            style={{ padding: 6, borderRadius: 6, border: '1px solid #fff' }}
                          >
                            <option value="read">Lesen</option>
                            <option value="write">Schreiben</option>
                          </select>
                          <button
                            onClick={() => handleShare(projekt.id)}
                            disabled={sharing[projekt.id]}
                            style={{ padding: '6px 16px', borderRadius: 6, background: '#fff', color: '#ff9800', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Hinzufügen
                          </button>
                        </div>
                        {shareError[projekt.id] && <div style={{ color: '#b00', marginBottom: 8 }}>{shareError[projekt.id]}</div>}
                        {shareSuccess[projekt.id] && <div style={{ color: '#1aaf5d', marginBottom: 8 }}>{shareSuccess[projekt.id]}</div>}
                        <button
                          onClick={() => loadProjektUsers(projekt.id)}
                          style={{ marginBottom: 8, background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 6, padding: '4px 12px', fontWeight: 500, cursor: 'pointer' }}
                        >
                          Nutzer anzeigen
                        </button>
                      </div>
                    )}
                    <div style={{ marginTop: canEdit ? 0 : 24, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 16 }}>
                      {projektUsers[projekt.id] && projektUsers[projekt.id].length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {projektUsers[projekt.id].map((pu) => (
                            <li key={pu.id || pu.user_id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ color: '#fff', fontWeight: 500 }}>{pu.email}</span>
                              <span style={{ color: '#fff', fontSize: 13, opacity: 0.8 }}>
                                ({pu.role === 'owner' ? 'Owner' : pu.role === 'write' ? 'Schreiben' : 'Lesen'})
                              </span>
                              {canEdit && pu.role !== 'owner' && (
                                <>
                                  <select
                                    value={pu.role}
                                    onChange={e => handleRoleChange(pu.id, e.target.value, projekt.id)}
                                    style={{ padding: 4, borderRadius: 6, border: '1px solid #fff', background: '#fff', color: '#ff9800', fontWeight: 600, fontSize: 13 }}
                                  >
                                    <option value="read">Lesen</option>
                                    <option value="write">Schreiben</option>
                                  </select>
                                  <button
                                    onClick={() => handleRemoveUser(projekt.id, pu.id)}
                                    style={{ background: '#b00', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                                  >
                                    Entfernen
                                  </button>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div style={{ color: '#fff', opacity: 0.8, marginTop: 8 }}>
                          {projektUsers[projekt.id] && projektUsers[projekt.id].length === 0
                            ? 'Keine berechtigten Nutzer gefunden.'
                            : 'Nutzer werden geladen oder es ist ein Fehler aufgetreten.'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
} 