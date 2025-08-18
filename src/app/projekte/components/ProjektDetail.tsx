"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import CalendarView from "./CalendarView";
import DocumentationForm from "./DocumentationForm";
import SecureFileDisplay from "./SecureFileDisplay";

interface ProjektDetailProps {
  projekt: any;
  user: any;
  onBack: () => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function ProjektDetail({
  projekt,
  user,
  onBack,
  onDelete,
  loading
}: ProjektDetailProps) {
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
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);
  const [personenProjekt, setPersonenProjekt] = useState<any[]>([]);
  const [showNewDocumentation, setShowNewDocumentation] = useState(false);
  const [documentationType, setDocumentationType] = useState<'archiv' | 'live' | null>(null);
  const [liveDocumentationType, setLiveDocumentationType] = useState<'meeting' | 'interview' | 'fieldnote' | null>(null);
  const [newDocumentation, setNewDocumentation] = useState<any>({
    name: '',
    beschreibung: '',
    startzeit: '',
    endzeit: '',
    datum: '',
    typ: '',
    untertyp: '',
    personen: [],
    klient: '',
    dialoge: [{ text: '' }],
    kernfragen: [{ frage: '', antwort: '' }],
    dateien: []
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [documentations, setDocumentations] = useState<any[]>([]);
  const [activeDocumentationFilters, setActiveDocumentationFilters] = useState<string[]>([]);
  const [documentationLoading, setDocumentationLoading] = useState(false);
  const [expandedDocumentations, setExpandedDocumentations] = useState<{[id:string]: boolean}>({});
  const [documentationFilterCheckboxes, setDocumentationFilterCheckboxes] = useState<{[type:string]: boolean}>({});
  const [editingDocumentation, setEditingDocumentation] = useState<any>(null);
  
  // Kalender nach Datumsauswahl minimieren
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const isOwner = projekt.user_id === user.id;
  const sharedEntry = projektUsers[projekt.id]?.find(u => u.user_id === user.id);
  const canEdit = isOwner || (sharedEntry && sharedEntry.role === 'write');

  // Tabs: Start + alle Optionen (Kalender ist separat umschaltbar)
  const optionTabs = ['Start', ...(Array.isArray(projekt.optionen) ? projekt.optionen : [])];

  useEffect(() => {
    if (projekt) {
      setActiveOptionTab('Start');
    }
  }, [projekt]);

  // Dokumentationen laden
  const loadDocumentations = async () => {
    if (!projekt) return;
    
    setDocumentationLoading(true);
    try {
      const { data, error } = await supabase
        .from('documentation')
        .select('*')
        .eq('projekt_id', projekt.id)
        .eq('datum', selectedDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentations(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Dokumentationen:', error);
    } finally {
      setDocumentationLoading(false);
    }
  };

  // Dokumentation bearbeiten
  const handleEditDocumentation = (doc: any) => {
    setEditingDocumentation(doc);
    setShowNewDocumentation(true);
    setDocumentationType(doc.typ);
    setLiveDocumentationType(doc.untertyp);
    // newDocumentation wird nicht mehr benötigt, da die DocumentationForm ihre eigenen Daten lädt
  };

  // Dokumentation löschen
  const handleDeleteDocumentation = async (docId: string) => {
    if (!confirm('Möchten Sie diese Dokumentation wirklich löschen?')) return;
    
    try {
      const { error } = await supabase
        .from('documentation')
        .delete()
        .eq('id', docId);

      if (error) throw error;
      
      alert('Dokumentation erfolgreich gelöscht!');
      await loadDocumentations();
    } catch (error) {
      console.error('Fehler beim Löschen der Dokumentation:', error);
      alert('Fehler beim Löschen der Dokumentation');
    }
  };

  useEffect(() => {
    loadDocumentations();
  }, [projekt, selectedDate]);

  useEffect(() => {
    if (!projekt) return;
    supabase
      .from('personen')
      .select('*')
      .eq('projekt_id', projekt.id)
      .then(({ data, error }) => {
        setPersonenProjekt(data || []);
      });
  }, [projekt]);

  // Gatherings laden (unabhängig vom aktiven Tab)
  useEffect(() => {
    if (!projekt) return;
    setGatheringLoading(true);
    supabase
      .from('gatherings')
      .select('*')
      .eq('projekt_id', projekt.id)
      .order('datum', { ascending: false })
      .then(({ data }) => {
        setGatherings(data || []);
        setGatheringLoading(false);
      });
  }, [projekt]);

  async function handleNameSave(id: string) {
    const newName = editNames[id];
    const { error } = await supabase.from("projekte").update({ name: newName }).eq("id", id);
    if (!error) {
      setEditStates({ ...editStates, [id]: false });
    }
  }

  async function handleDescSave(id: string) {
    const newDesc = editDescs[id];
    const { error } = await supabase.from("projekte").update({ beschreibung: newDesc }).eq("id", id);
  }

  async function handleAddGathering() {
    setGatheringError('');
    setGatheringLoading(true);
    
    // Verwende das ausgewählte Kalenderdatum, falls das Form-Datum leer ist
    const datumToUse = gatheringForm.datum || selectedDate;
    
    if (!datumToUse) {
      setGatheringError('Bitte wähle ein Datum aus dem Kalender oder gib ein Datum ein.');
      setGatheringLoading(false);
      return;
    }
    
    const { startzeit, endzeit, beschreibung, personen_ids, dialoge } = gatheringForm;
    const { error, data } = await supabase.from('gatherings').insert({
      projekt_id: projekt.id,
      datum: datumToUse,
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
    let neueOptionen = Array.isArray(projekt.optionen) ? projekt.optionen.filter((o: string) => o !== opt) : [];
    // Option aus Projekt entfernen
    await supabase.from('projekte').update({ optionen: neueOptionen }).eq('id', projekt.id);
    // Gatherings ggf. löschen
    if (opt === 'Physical Gatherings' && deleteGatherings) {
      await supabase.from('gatherings').delete().eq('projekt_id', projekt.id);
      setGatherings([]);
    }
    setShowDeleteOptionDialog({opt: null, open: false});
    setDeleteGatheringsLoading(false);
  }

  async function handleSaveDocumentation(documentation: any) {
    try {
      // Daten für die Datenbank vorbereiten
      const dbData = {
        projekt_id: projekt.id,
        name: documentation.name,
        beschreibung: documentation.beschreibung,
        datum: documentation.datum,
        startzeit: documentation.startzeit,
        endzeit: documentation.endzeit,
        typ: documentation.typ,
        untertyp: documentation.untertyp,
        
        // Meeting-spezifische Felder
        meeting_typ: documentation.meetingTyp || null,
        klient: documentation.klient || null,
        
        // Interview-spezifische Felder
        interview_typ: documentation.interviewTyp || null,
        
        // JSON-Felder (sicherstellen, dass Arrays sind)
        personen: documentation.personen || [],
        dialoge: documentation.dialoge || [],
        kernfragen: documentation.kernfragen || [],
        dateien: documentation.dateien || []
      };

      let error;
      
      if (editingDocumentation) {
        // Update bestehende Dokumentation
        const { error: updateError } = await supabase
          .from('documentation')
          .update(dbData)
          .eq('id', editingDocumentation.id);
        error = updateError;
      } else {
        // Neue Dokumentation erstellen
        const { error: insertError } = await supabase
          .from('documentation')
          .insert(dbData);
        error = insertError;
      }

      if (error) {
        console.error('Fehler beim Speichern der Dokumentation:', error);
        alert('Fehler beim Speichern: ' + error.message);
      } else {
        setShowNewDocumentation(false);
        setDocumentationType(null);
        setLiveDocumentationType(null);
        setEditingDocumentation(null);
        setNewDocumentation({});
        alert(editingDocumentation ? 'Dokumentation erfolgreich aktualisiert!' : 'Dokumentation erfolgreich gespeichert!');
        // Dokumentationen neu laden
        await loadDocumentations();
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Dokumentation:', error);
      alert('Fehler beim Speichern der Dokumentation');
    }
  }

  return (
    <div style={{ width: '100%', padding: '2rem 3vw' }}>
      <button
        onClick={onBack}
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

      {/* Tabs-Leiste + Kalender-Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
                 <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
           <button
             onClick={() => setShowCalendar(v => !v)}
             style={{
               padding: '8px 12px',
               borderRadius: 8,
               border: showCalendar ? '2px solid #3a4a8c' : '1.5px solid #bbb',
               background: showCalendar ? '#3a4a8c' : '#f5f5f5',
               color: showCalendar ? '#fff' : '#232b5d',
               fontWeight: 600,
               fontSize: 14,
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               gap: 6,
             }}
             title="Kalender ein-/ausblenden"
           >
             <span style={{ fontSize: 16 }}>📅</span>
             <span style={{ fontSize: 12, opacity: 0.8 }}>
               {selectedDate ? new Date(selectedDate).toLocaleDateString('de-DE') : 'Heute'}
             </span>
             <span style={{ fontSize: 11, opacity: 0.6 }}>
               {showCalendar ? '▼' : '▶'}
             </span>
           </button>
         </div>
       </div>

       {showCalendar && (
         <div className="calendar-container" style={{
           marginBottom: 16,
           display: 'flex',
           gap: 16,
           alignItems: 'flex-start'
         }}>
           <div style={{ flexShrink: 0 }}>
             <CalendarView
               gatherings={gatherings}
               selectedDate={selectedDate}
               onChangeSelectedDate={handleDateSelect}
             />
           </div>
           <div style={{ flex: 1, minWidth: 0 }}>
             <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.95rem' }} className="text-primary">Einträge am {selectedDate}</div>
             {gatheringLoading ? (
               <div className="text-secondary">Lade...</div>
             ) : (
               (() => {
                 const daily = gatherings.filter((g: any) => g.datum === selectedDate);
                 if (daily.length === 0) return <div style={{ fontSize: '0.9rem' }} className="text-muted">[Keine Einträge]</div>;
                 return (
                   <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                     {daily.map((g: any) => (
                       <li key={g.id} className="calendar-gathering-item">
                         <div><b>Zeit:</b> {g.startzeit || '-'}{g.endzeit ? `–${g.endzeit}` : ''}</div>
                         <div><b>Beschreibung:</b> {g.beschreibung || '-'}</div>
                         <div><b>Personen:</b> {Array.isArray(g.personen_ids) ? g.personen_ids.map((id: string) => {
                           const p = personenProjekt.find((pp: any) => pp.id === id);
                           return p ? `${p.vorname} ${p.nachname}` : id;
                         }).join(', ') : ''}</div>
                         {canEdit && (
                           <button onClick={() => handleDeleteGathering(g.id)} style={{ background: 'var(--error)', border: 'none', borderRadius: 4, padding: '3px 8px', fontWeight: 600, fontSize: 12, cursor: 'pointer', marginTop: 6 }}>Löschen</button>
                         )}
                       </li>
                     ))}
                   </ul>
                 );
               })()
             )}
           </div>
         </div>
       )}

               {/* Projekt-Header - immer oben */}
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
            <span><strong>Erstellt:</strong> {projekt.created_at ? new Date(projekt.created_at).toLocaleDateString('de-DE') : "-"}</span>
            {projekt.updated_at && projekt.updated_at !== projekt.created_at && (
              <span><strong>Zuletzt bearbeitet:</strong> {new Date(projekt.updated_at).toLocaleDateString('de-DE')}</span>
            )}
          </div>
        </div>

        {/* Dokumentations-Buttons - immer sichtbar */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setShowNewDocumentation(true);
              setDocumentationType('archiv');
              setNewDocumentation((prev: any) => ({ ...prev, datum: selectedDate }));
            }}
            style={{
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ fontSize: 16 }}>+</span>
            Archiv-Dokumentation
          </button>
          <button
            onClick={() => {
              setShowNewDocumentation(true);
              setDocumentationType('live');
              setNewDocumentation((prev: any) => ({ ...prev, datum: selectedDate }));
            }}
            style={{
              background: '#2196F3',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ fontSize: 16 }}>+</span>
            Live-Dokumentation
          </button>
        </div>

        {/* Dokumentations-Filter */}
        {documentations.length > 0 && (
          <div style={{ marginBottom: 24 }}>
                         <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
               {/* Alle Filter */}
               <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                 <input
                   type="checkbox"
                   checked={activeDocumentationFilters.length === 0}
                   onChange={() => setActiveDocumentationFilters([])}
                   style={{ transform: 'scale(1.2)' }}
                 />
                 <span style={{ 
                   padding: '6px 12px',
                   borderRadius: 6,
                   border: activeDocumentationFilters.length === 0 ? '2px solid #ff9800' : '1px solid #ddd',
                   background: activeDocumentationFilters.length === 0 ? '#ff9800' : '#fff',
                   color: activeDocumentationFilters.length === 0 ? '#fff' : '#666',
                   fontWeight: 600,
                   fontSize: 12
                 }}>
                   Alle ({documentations.length})
                 </span>
               </label>
               
               {/* Archiv Filter */}
               {documentations.some(d => d.typ === 'archiv') && (
                 <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                   <input
                     type="checkbox"
                     checked={activeDocumentationFilters.includes('archiv')}
                     onChange={() => {
                       if (activeDocumentationFilters.includes('archiv')) {
                         setActiveDocumentationFilters(prev => prev.filter(f => f !== 'archiv'));
                       } else {
                         setActiveDocumentationFilters(prev => [...prev, 'archiv']);
                       }
                     }}
                     style={{ transform: 'scale(1.2)' }}
                   />
                   <span style={{ 
                     padding: '6px 12px',
                     borderRadius: 6,
                     border: activeDocumentationFilters.includes('archiv') ? '2px solid #4CAF50' : '1px solid #ddd',
                     background: activeDocumentationFilters.includes('archiv') ? '#4CAF50' : '#fff',
                     color: activeDocumentationFilters.includes('archiv') ? '#fff' : '#666',
                     fontWeight: 600,
                     fontSize: 12
                   }}>
                     Archiv ({documentations.filter(d => d.typ === 'archiv').length})
                   </span>
                 </label>
               )}
               
               {/* Meeting Filter */}
               {documentations.some(d => d.untertyp === 'meeting') && (
                 <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                   <input
                     type="checkbox"
                     checked={activeDocumentationFilters.includes('meeting')}
                     onChange={() => {
                       if (activeDocumentationFilters.includes('meeting')) {
                         setActiveDocumentationFilters(prev => prev.filter(f => f !== 'meeting'));
                       } else {
                         setActiveDocumentationFilters(prev => [...prev, 'meeting']);
                       }
                     }}
                     style={{ transform: 'scale(1.2)' }}
                   />
                   <span style={{ 
                     padding: '6px 12px',
                     borderRadius: 6,
                     border: activeDocumentationFilters.includes('meeting') ? '2px solid #2196F3' : '1px solid #ddd',
                     background: activeDocumentationFilters.includes('meeting') ? '#2196F3' : '#fff',
                     color: activeDocumentationFilters.includes('meeting') ? '#fff' : '#666',
                     fontWeight: 600,
                     fontSize: 12
                   }}>
                     📅 Meeting ({documentations.filter(d => d.untertyp === 'meeting').length})
                   </span>
                 </label>
               )}
               
               {/* Interview Filter */}
               {documentations.some(d => d.untertyp === 'interview') && (
                 <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                   <input
                     type="checkbox"
                     checked={activeDocumentationFilters.includes('interview')}
                     onChange={() => {
                       if (activeDocumentationFilters.includes('interview')) {
                         setActiveDocumentationFilters(prev => prev.filter(f => f !== 'interview'));
                       } else {
                         setActiveDocumentationFilters(prev => [...prev, 'interview']);
                       }
                     }}
                     style={{ transform: 'scale(1.2)' }}
                   />
                   <span style={{ 
                     padding: '6px 12px',
                     borderRadius: 6,
                     border: activeDocumentationFilters.includes('interview') ? '2px solid #9C27B0' : '1px solid #ddd',
                     background: activeDocumentationFilters.includes('interview') ? '#9C27B0' : '#fff',
                     color: activeDocumentationFilters.includes('interview') ? '#fff' : '#666',
                     fontWeight: 600,
                     fontSize: 12
                   }}>
                     🎤 Interview ({documentations.filter(d => d.untertyp === 'interview').length})
                   </span>
                 </label>
               )}
               
               {/* Feldnotiz Filter */}
               {documentations.some(d => d.untertyp === 'fieldnote') && (
                 <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                   <input
                     type="checkbox"
                     checked={activeDocumentationFilters.includes('fieldnote')}
                     onChange={() => {
                       if (activeDocumentationFilters.includes('fieldnote')) {
                         setActiveDocumentationFilters(prev => prev.filter(f => f !== 'fieldnote'));
                       } else {
                         setActiveDocumentationFilters(prev => [...prev, 'fieldnote']);
                       }
                     }}
                     style={{ transform: 'scale(1.2)' }}
                   />
                   <span style={{ 
                     padding: '6px 12px',
                     borderRadius: 6,
                     border: activeDocumentationFilters.includes('fieldnote') ? '2px solid #FF9800' : '1px solid #ddd',
                     background: activeDocumentationFilters.includes('fieldnote') ? '#FF9800' : '#fff',
                     color: activeDocumentationFilters.includes('fieldnote') ? '#fff' : '#666',
                     fontWeight: 600,
                     fontSize: 12
                   }}>
                     📝 Feldnotiz ({documentations.filter(d => d.untertyp === 'fieldnote').length})
                   </span>
                 </label>
               )}
             </div>

            {/* Dokumentations-Liste */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                             {documentations
                 .filter(doc => {
                   if (activeDocumentationFilters.length === 0) return true;
                   if (activeDocumentationFilters.includes('archiv')) return doc.typ === 'archiv';
                   return activeDocumentationFilters.includes(doc.untertyp);
                 })
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="documentation-item"
                  >
                                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                       <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpandedDocumentations(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                           <span style={{ fontSize: 14, color: '#666' }}>
                             {expandedDocumentations[doc.id] ? '▼' : '▶'}
                           </span>
                           <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }} className="text-primary">
                             {doc.name}
                           </h4>
                         </div>
                         <div style={{ display: 'flex', gap: 12, fontSize: 12, marginTop: 4 }} className="text-secondary">
                           <span>
                             {doc.typ === 'archiv' ? '📁 Archiv' : 
                              doc.untertyp === 'meeting' ? '📅 Meeting' :
                              doc.untertyp === 'interview' ? '🎤 Interview' :
                              doc.untertyp === 'fieldnote' ? '📝 Feldnotiz' : '📄 Dokumentation'}
                           </span>
                           {doc.startzeit && doc.endzeit && (
                             <span>{doc.startzeit} - {doc.endzeit}</span>
                           )}
                           <span>{new Date(doc.created_at).toLocaleDateString('de-DE')}</span>
                         </div>
                       </div>
                       <div style={{ display: 'flex', gap: 4 }}>
                         <button
                           onClick={() => handleEditDocumentation(doc)}
                           style={{
                             background: 'var(--primary-blue)',
                             border: 'none',
                             borderRadius: 4,
                             padding: '4px 8px',
                             cursor: 'pointer',
                             fontSize: 12,
                             fontWeight: 600
                           }}
                         >
                           Bearbeiten
                         </button>
                         <button
                           onClick={() => handleDeleteDocumentation(doc.id)}
                           style={{
                             background: 'var(--error)',
                             border: 'none',
                             borderRadius: 4,
                             padding: '4px 8px',
                             cursor: 'pointer',
                             fontSize: 12,
                             fontWeight: 600
                           }}
                         >
                           Löschen
                         </button>
                       </div>
                     </div>
                    
                    {doc.beschreibung && (
                      <p style={{ margin: '8px 0', fontSize: 14, lineHeight: 1.4 }} className="text-primary">
                        {doc.beschreibung}
                      </p>
                    )}
                    
                    {/* Spezifische Details je nach Typ */}
                    {doc.untertyp === 'meeting' && doc.meeting_typ && (
                      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                        <strong>Typ:</strong> {doc.meeting_typ === 'online' ? 'Online' : 
                                             doc.meeting_typ === 'offline' ? 'Offline' : 'Hybrid'}
                        {doc.klient && <span style={{ marginLeft: 12 }}><strong>Klient:</strong> {doc.klient}</span>}
                      </div>
                    )}
                    
                    {doc.untertyp === 'interview' && doc.interview_typ && (
                      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                        <strong>Typ:</strong> {doc.interview_typ === 'online' ? 'Online' : 
                                              doc.interview_typ === 'offline' ? 'Offline' : 'Hybrid'}
                      </div>
                    )}
                    
                    {/* Personen anzeigen */}
                    {doc.personen && doc.personen.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 }}>
                          {doc.untertyp === 'meeting' ? 'Teilnehmer:' : 'Personen:'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {doc.personen.map((person: any, index: number) => (
                            <span
                              key={index}
                              className="documentation-person-tag"
                            >
                              {person.vorname} {person.nachname}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                                         {/* Dateien anzeigen */}
                     {doc.dateien && doc.dateien.length > 0 && (
                       <div style={{ marginTop: 12 }}>
                         <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 }}>
                           Dateien:
                         </div>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                           {doc.dateien.map((file: any, index: number) => (
                             <a
                               key={index}
                               href={file.url}
                               target="_blank"
                               rel="noopener noreferrer"
                               style={{
                                 background: '#e3f2fd',
                                 padding: '2px 6px',
                                 borderRadius: 4,
                                 fontSize: 11,
                                 color: '#1976d2',
                                 textDecoration: 'none'
                               }}
                             >
                               📎 {file.name}
                             </a>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Ausklappbare Details */}
                     {expandedDocumentations[doc.id] && (
                       <div style={{ marginTop: 16, padding: 16, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
                         {/* Dialoge anzeigen */}
                         {doc.dialoge && doc.dialoge.length > 0 && doc.dialoge.some((d: any) => d.text?.trim()) && (
                           <div style={{ marginBottom: 16 }}>
                             <h5 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#232b5d' }}>
                               Dialoge:
                             </h5>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                               {doc.dialoge.map((dialog: any, index: number) => (
                                 dialog.text?.trim() && (
                                   <div key={index} style={{ 
                                     padding: 8, 
                                     background: '#fff', 
                                     borderRadius: 4, 
                                     border: '1px solid #dee2e6',
                                     fontSize: 13,
                                     lineHeight: 1.4
                                   }}>
                                     <strong>Dialog {index + 1}:</strong><br />
                                     {dialog.text}
                                   </div>
                                 )
                               ))}
                             </div>
                           </div>
                         )}

                         {/* Kernfragen anzeigen (nur für Interviews) */}
                         {doc.untertyp === 'interview' && doc.kernfragen && doc.kernfragen.length > 0 && doc.kernfragen.some((k: any) => k.frage?.trim() || k.antwort?.trim()) && (
                           <div style={{ marginBottom: 16 }}>
                             <h5 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#232b5d' }}>
                               Kernfragen & Antworten:
                             </h5>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                               {doc.kernfragen.map((kernfrage: any, index: number) => (
                                 (kernfrage.frage?.trim() || kernfrage.antwort?.trim()) && (
                                   <div key={index} style={{ 
                                     padding: 8, 
                                     background: '#fff', 
                                     borderRadius: 4, 
                                     border: '1px solid #dee2e6',
                                     fontSize: 13,
                                     lineHeight: 1.4
                                   }}>
                                     <strong>Kernfrage {index + 1}:</strong><br />
                                     <strong>Frage:</strong> {kernfrage.frage}<br />
                                     <strong>Antwort:</strong> {kernfrage.antwort}
                                   </div>
                                 )
                               ))}
                             </div>
                           </div>
                         )}

                         {/* Vollständige Personen-Liste */}
                         {doc.personen && doc.personen.length > 0 && (
                           <div style={{ marginBottom: 16 }}>
                             <h5 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#232b5d' }}>
                               {doc.untertyp === 'meeting' ? 'Teilnehmer Details:' : 'Personen Details:'}
                             </h5>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                               {doc.personen.map((person: any, index: number) => (
                                 <div key={index} style={{ 
                                   padding: 8, 
                                   background: '#fff', 
                                   borderRadius: 4, 
                                   border: '1px solid #dee2e6',
                                   fontSize: 13
                                 }}>
                                   <strong>{person.vorname} {person.nachname}</strong><br />
                                   {person.position && <span><strong>Position:</strong> {person.position}<br /></span>}
                                   {person.email && <span><strong>E-Mail:</strong> {person.email}</span>}
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}

                         {/* Metadaten */}
                         <div style={{ fontSize: 12, color: '#666', borderTop: '1px solid #dee2e6', paddingTop: 8 }}>
                           <strong>Erstellt:</strong> {new Date(doc.created_at).toLocaleString('de-DE')}<br />
                           {doc.updated_at && doc.updated_at !== doc.created_at && (
                             <span><strong>Zuletzt bearbeitet:</strong> {new Date(doc.updated_at).toLocaleString('de-DE')}</span>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                 ))}
            </div>
          </div>
        )}

             {/* Dialog für Projekt löschen */}
       {showDeleteProjectDialog && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ background: '#fff', borderRadius: 10, padding: '2rem 2.5rem', minWidth: 320, boxShadow: '0 2px 16px #0003', color: '#232b5d' }}>
             <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>Projekt wirklich löschen?</div>
             <div style={{ marginBottom: 18 }}>
               Möchtest du das Projekt "{projekt.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
             </div>
             <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
               <button onClick={() => onDelete(projekt.id)} disabled={loading} style={{ background: '#b00', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Projekt löschen</button>
               <button onClick={() => setShowDeleteProjectDialog(false)} style={{ background: '#bbb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Abbrechen</button>
             </div>
           </div>
         </div>
       )}

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
                    onClick={() => handleNameSave(projekt.id)} 
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
                    onClick={() => setEditStates({ ...editStates, [projekt.id]: false })} 
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
                    onClick={() => setEditStates({ ...editStates, [projekt.id]: true })} 
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
                     onClick={() => setShowDeleteProjectDialog(true)}
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
                onClick={() => setOpenDesc({ ...openDesc, [projekt.id]: !openDesc[projekt.id] })}
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
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                   <textarea
                     placeholder="Beschreibung..."
                     value={editDescs[projekt.id] ?? projekt.beschreibung ?? ""}
                     onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescs({ ...editDescs, [projekt.id]: e.target.value })}
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
                   <div style={{ display: 'flex', gap: 8 }}>
                     <button 
                       onClick={() => handleDescSave(projekt.id)} 
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
                       onClick={() => {
                         setEditDescs({ ...editDescs, [projekt.id]: projekt.beschreibung ?? "" });
                         setOpenDesc({ ...openDesc, [projekt.id]: false });
                       }} 
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
                 </div>
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
        </div>
      )}

       {/* Physical Gatherings Tab */}
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
             <input 
               type="date" 
               value={gatheringForm.datum || selectedDate} 
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGatheringForm((f: any) => ({ ...f, datum: e.target.value }))} 
               style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb' }} 
             />
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
          <button onClick={handleAddGathering} disabled={gatheringLoading} style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>Speichern</button>
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
                    {canEdit && <button onClick={() => handleDeleteGathering(g.id)} style={{ background: '#b00', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>Löschen</button>}
                  </li>
                ))}
              </ul>
            )
          )}
                 </div>
       )}

                {/* Dokumentations-Formular */}
         {showNewDocumentation && (
           <DocumentationForm
             projekt={projekt}
             selectedDate={selectedDate}
             documentationType={documentationType}
             onClose={() => {
               setShowNewDocumentation(false);
               setDocumentationType(null);
               setLiveDocumentationType(null);
               setEditingDocumentation(null);
             }}
             onSave={handleSaveDocumentation}
             editingDocumentation={editingDocumentation}
           />
         )}
     </div>
   );
 } 