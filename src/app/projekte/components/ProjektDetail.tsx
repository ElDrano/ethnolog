"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import JSZip from 'jszip';
import CalendarView from "./CalendarView";
import DocumentationForm from "./DocumentationForm";
import SecureFileDisplay from "./SecureFileDisplay";
import ProjectInfoCard from "./ProjectInfoCard";
import DeleteProjectDialog from "./DeleteProjectDialog";
import DeleteOptionDialog from "./DeleteOptionDialog";
import TabNavigation from "./TabNavigation";
import DocumentationButtons from "./DocumentationButtons";
import DocumentationFilters from "./DocumentationFilters";
import DocumentationList from "./DocumentationList";
import DateRangeFilter from "./DateRangeFilter";
import PhysicalGatheringForm from "./PhysicalGatheringForm";
import PhysicalGatheringList from "./PhysicalGatheringList";


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
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [useDateRange, setUseDateRange] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [documentations, setDocumentations] = useState<any[]>([]);
  const [activeDocumentationFilters, setActiveDocumentationFilters] = useState<string[]>([]);
  const [documentationLoading, setDocumentationLoading] = useState(false);
  const [expandedDocumentations, setExpandedDocumentations] = useState<{[id:string]: boolean}>({});
  const [documentationFilterCheckboxes, setDocumentationFilterCheckboxes] = useState<{[type:string]: boolean}>({});
  const [editingDocumentation, setEditingDocumentation] = useState<any>(null);
  const [downloadingFiles, setDownloadingFiles] = useState(false);
  const [hasFilesInRange, setHasFilesInRange] = useState(false);
  
  // Kalender nach Datumsauswahl minimieren
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  // Datumsbereich Handler
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (date && endDate) {
      setUseDateRange(true);
    }
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    if (startDate && date) {
      setUseDateRange(true);
    }
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setUseDateRange(false);
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
      let query = supabase
        .from('documentation')
        .select('*')
        .eq('projekt_id', projekt.id);

      // Datumsbereich oder einzelnes Datum verwenden
      if (useDateRange && startDate && endDate) {
        query = query
          .gte('datum', startDate)
          .lte('datum', endDate);
      } else {
        query = query.eq('datum', selectedDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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

  // Prüfen, ob Dateien im ausgewählten Zeitraum vorhanden sind
  const checkFilesInRange = async () => {
    if (!startDate || !endDate || !projekt) {
      setHasFilesInRange(false);
      return;
    }

    try {
      const { data: docsInRange, error } = await supabase
        .from('documentation')
        .select('dateien')
        .eq('projekt_id', projekt.id)
        .gte('datum', startDate)
        .lte('datum', endDate);

      if (error) throw error;

      const hasFiles = docsInRange?.some(doc => 
        doc.dateien && Array.isArray(doc.dateien) && doc.dateien.length > 0
      ) || false;

      setHasFilesInRange(hasFiles);
    } catch (error) {
      console.error('Fehler beim Prüfen der Dateien:', error);
      setHasFilesInRange(false);
    }
  };

  useEffect(() => {
    loadDocumentations();
  }, [projekt, selectedDate, startDate, endDate, useDateRange]);

  useEffect(() => {
    checkFilesInRange();
  }, [startDate, endDate, projekt]);

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

  // Download aller Dateien im ausgewählten Zeitraum
  const handleDownloadFiles = async () => {
    if (!startDate || !endDate) return;
    
    setDownloadingFiles(true);
    try {
      // Alle Dokumentationen im Zeitraum laden
      const { data: docsInRange, error } = await supabase
        .from('documentation')
        .select('*')
        .eq('projekt_id', projekt.id)
        .gte('datum', startDate)
        .lte('datum', endDate);

      if (error) throw error;

      // Alle Dateien sammeln
      const allFiles: any[] = [];
      docsInRange?.forEach(doc => {
        if (doc.dateien && Array.isArray(doc.dateien)) {
          doc.dateien.forEach((file: any) => {
            allFiles.push({
              ...file,
              documentationName: doc.name,
              documentationDate: doc.datum
            });
          });
        }
      });

      if (allFiles.length === 0) {
        alert('Keine Dateien im ausgewählten Zeitraum gefunden.');
        return;
      }

      // ZIP-Datei erstellen
      const zip = new JSZip();
      
      // Dateien herunterladen und zum ZIP hinzufügen
      for (const file of allFiles) {
        try {
          // Signed URL für die Datei generieren
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('documentation-files')
            .createSignedUrl(file.fileName, 3600);

          if (signedUrlError) {
            console.error(`Fehler beim Generieren der Signed URL für ${file.name}:`, signedUrlError);
            continue;
          }

          // Datei herunterladen
          const response = await fetch(signedUrlData.signedUrl);
          if (!response.ok) {
            console.error(`Fehler beim Herunterladen von ${file.name}`);
            continue;
          }

          const blob = await response.blob();
          
          // Dateiname mit Dokumentation-Info erstellen
          const docDate = new Date(file.documentationDate).toLocaleDateString('de-DE').replace(/\./g, '-');
          const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const zipFileName = `${docDate}_${file.documentationName}_${safeFileName}`;
          
          // Datei zum ZIP hinzufügen
          zip.file(zipFileName, blob);
        } catch (fileError) {
          console.error(`Fehler bei Datei ${file.name}:`, fileError);
        }
      }

      // ZIP-Datei generieren und herunterladen
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dateien_${startDate}_bis_${endDate}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert(`Erfolgreich ${allFiles.length} Dateien heruntergeladen!`);
    } catch (error) {
      console.error('Fehler beim Herunterladen der Dateien:', error);
      alert('Fehler beim Herunterladen der Dateien. Bitte versuchen Sie es erneut.');
    } finally {
      setDownloadingFiles(false);
    }
  };

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
      <TabNavigation
        optionTabs={optionTabs}
        activeOptionTab={activeOptionTab}
        showCalendar={showCalendar}
        selectedDate={selectedDate}
        onTabChange={setActiveOptionTab}
        onCalendarToggle={() => setShowCalendar(v => !v)}
        onDeleteOption={(opt) => setShowDeleteOptionDialog({opt, open: true})}
      />

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
                <ProjectInfoCard 
          projekt={projekt} 
          canEdit={canEdit}
          onNameUpdate={handleNameSave}
          onDescUpdate={handleDescSave}
          onDelete={() => setShowDeleteProjectDialog(true)}
          loading={loading}
        />



                  {/* Dokumentations-Buttons - immer sichtbar */}
         <DocumentationButtons
           onArchivClick={() => {
             setShowNewDocumentation(true);
             setDocumentationType('archiv');
             setNewDocumentation((prev: any) => ({ ...prev, datum: selectedDate }));
           }}
           onLiveClick={() => {
             setShowNewDocumentation(true);
             setDocumentationType('live');
             setNewDocumentation((prev: any) => ({ ...prev, datum: selectedDate }));
           }}
         />

                 {/* Datumsbereich-Filter und Dokumentations-Filter und Liste */}
                 {activeOptionTab === 'Start' && (
                   <>
                                           <DateRangeFilter
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={handleStartDateChange}
                        onEndDateChange={handleEndDateChange}
                        onClearRange={handleClearDateRange}
                        onDownloadFiles={handleDownloadFiles}
                        hasFiles={hasFilesInRange}
                        downloading={downloadingFiles}
                      />

                     <div style={{ marginBottom: 24 }}>
                       {documentations.length > 0 ? (
                         <>
                           <DocumentationFilters
                             documentations={documentations}
                             activeDocumentationFilters={activeDocumentationFilters}
                             onFilterChange={setActiveDocumentationFilters}
                           />
                           <DocumentationList
                             documentations={documentations}
                             activeDocumentationFilters={activeDocumentationFilters}
                             expandedDocumentations={expandedDocumentations}
                             onToggleExpanded={(docId) => setExpandedDocumentations(prev => ({ ...prev, [docId]: !prev[docId] }))}
                             onEditDocumentation={handleEditDocumentation}
                             onDeleteDocumentation={handleDeleteDocumentation}
                           />
                         </>
                       ) : (
                         <div className="documentation-item" style={{ 
                           padding: '20px', 
                           textAlign: 'center', 
                           color: 'var(--text-muted)',
                           background: 'var(--surface)',
                           border: '1px solid var(--border)',
                           borderRadius: 8,
                           boxShadow: 'var(--shadow)',
                           fontStyle: 'italic'
                         }}>
                           {useDateRange && startDate && endDate ? 
                             `Keine Dokumentationen im Zeitraum ${new Date(startDate).toLocaleDateString('de-DE')} - ${new Date(endDate).toLocaleDateString('de-DE')}` :
                             `Keine Dokumentationen für ${new Date(selectedDate).toLocaleDateString('de-DE')}`
                           }
                         </div>
                       )}
                     </div>
                   </>
                 )}

                     {/* Dialog für Projekt löschen */}
        <DeleteProjectDialog
          open={showDeleteProjectDialog}
          projektName={projekt.name}
          loading={loading}
          onConfirm={() => onDelete(projekt.id)}
          onClose={() => setShowDeleteProjectDialog(false)}
        />

               {/* Dialog für Option löschen */}
        <DeleteOptionDialog
          open={showDeleteOptionDialog.open}
          loading={deleteGatheringsLoading}
          onRemoveOnly={() => handleDeleteOption(showDeleteOptionDialog.opt!, false)}
          onRemoveWithGatherings={() => handleDeleteOption(showDeleteOptionDialog.opt!, true)}
          onClose={() => setShowDeleteOptionDialog({ opt: null, open: false })}
        />

      {/* Tab-Inhalte */}
      {activeOptionTab === 'Start' && (
        <div>
          {/* Projekt-Details werden jetzt über ProjectInfoCard angezeigt */}
        </div>
      )}

               {/* Physical Gatherings Tab */}
        {activeOptionTab === 'Physical Gatherings' && canEdit && (
          <PhysicalGatheringForm
            gatheringForm={gatheringForm}
            setGatheringForm={setGatheringForm}
            gatheringLoading={gatheringLoading}
            gatheringError={gatheringError}
            personenProjekt={personenProjekt}
            selectedDate={selectedDate}
            onAddGathering={handleAddGathering}
          />
        )}

      

             {activeOptionTab === 'Physical Gatherings' && (
         <PhysicalGatheringList
           gatherings={gatherings}
           gatheringLoading={gatheringLoading}
           personenProjekt={personenProjekt}
           canEdit={canEdit}
           onDeleteGathering={handleDeleteGathering}
         />
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