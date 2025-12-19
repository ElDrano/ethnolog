"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import JSZip from 'jszip';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, ExternalHyperlink } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import DocumentationForm from "./DocumentationForm";
import SecureFileDisplay from "./SecureFileDisplay";
import ProjectInfoCard from "./ProjectInfoCard";
import DeleteProjectDialog from "./DeleteProjectDialog";
import DeleteOptionDialog from "./DeleteOptionDialog";
import ProjectMembers from "./ProjectMembers";
import ProjectLinks from "./ProjectLinks";

import DocumentationButtons from "./DocumentationButtons";
import DocumentationFilters from "./DocumentationFilters";
import DocumentationList from "./DocumentationList";
import DateRangeFilter from "./DateRangeFilter";

import TagFilter from "./TagFilter";


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

  const [showDeleteOptionDialog, setShowDeleteOptionDialog] = useState<{opt: string | null, open: boolean}>({opt: null, open: false});
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

  const [documentations, setDocumentations] = useState<any[]>([]);
  const [activeDocumentationFilters, setActiveDocumentationFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'alle' | 'fertig' | 'unfertig'>('alle');
  const [showAll, setShowAll] = useState(true); // Initial "Alle" aktiviert
  const [documentationLoading, setDocumentationLoading] = useState(false);
  const [expandedDocumentations, setExpandedDocumentations] = useState<{[id:string]: boolean}>({});
  const [documentationFilterCheckboxes, setDocumentationFilterCheckboxes] = useState<{[type:string]: boolean}>({});
  const [editingDocumentation, setEditingDocumentation] = useState<any>(null);
  const [downloadingFiles, setDownloadingFiles] = useState(false);
  const [hasFilesInRange, setHasFilesInRange] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [selectedDocumentations, setSelectedDocumentations] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Kalender nach Datumsauswahl minimieren
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    
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

  // Spezielle Funktion für "Gesamter Zeitraum" - setzt beide Daten gleichzeitig
  const handleFullProjectRange = (start: string, end: string) => {
    // Alle State-Updates in einem Batch durchführen
    setStartDate(start);
    setEndDate(end);
    setUseDateRange(true);
    // Dokumentationen werden automatisch durch useEffect geladen, 
    // da startDate, endDate und useDateRange in den Dependencies sind
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setUseDateRange(false);
  };

  const isOwner = projekt.user_id === user.id;
  const sharedEntry = projektUsers[projekt.id]?.find(u => u.user_id === user.id);
  const isMember = sharedEntry && sharedEntry.role === 'read';
  // Nur Besitzer oder Benutzer mit 'write'-Rolle können Projekt bearbeiten
  // Mitglieder (role='read') können nur Dokumentationen erstellen
  const canEdit = isOwner || (sharedEntry && sharedEntry.role === 'write');
  // Mitglieder (read) können Dokumentationen erstellen, aber nicht Projekt bearbeiten
  const canCreateDocumentation = isOwner || sharedEntry;
  // Alle Mitglieder (read und write) können Links bearbeiten
  const canEditLinks = isOwner || sharedEntry;



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
      alert('Fehler beim Löschen: ' + (error as any).message);
    }
  };

  // Filter-Handler für Dokumentationen
  const handleFilterChange = (filters: string[], showAll: boolean) => {
    setActiveDocumentationFilters(filters);
    setShowAll(showAll);
  };

  // Handler für Dokumentationsauswahl
  const handleToggleDocumentationSelection = (docId: string) => {
    setSelectedDocumentations(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAllDocumentations = (selectAll: boolean) => {
    if (selectAll) {
      // Alle gefilterten Dokumentationen auswählen
      const filteredDocIds = documentations.filter(doc => {
        if (showAll) return true;
        if (activeDocumentationFilters.length === 0) return false;
        
        // Prüfe Status-Filter
        const docStatus = doc.status || 'unfertig';
        if (statusFilter !== 'alle' && docStatus !== statusFilter) {
          return false;
        }
        
        const isArchivSelected = activeDocumentationFilters.includes('archiv');
        const isArchivDoc = doc.typ === 'archiv';
        const isLiveTypeSelected = activeDocumentationFilters.some(filter => 
          filter === 'meeting' || filter === 'interview' || filter === 'fieldnote'
        );
        const isLiveDoc = doc.typ === 'live' && activeDocumentationFilters.includes(doc.untertyp);
        
        const hasTypeFilters = isArchivSelected || isLiveTypeSelected;
        if (!hasTypeFilters) {
          return true;
        }
        
        return (isArchivSelected && isArchivDoc) || (isLiveTypeSelected && isLiveDoc);
      }).map(doc => doc.id);
      
      setSelectedDocumentations(prev => [...new Set([...prev, ...filteredDocIds])]);
    } else {
      // Alle gefilterten Dokumentationen abwählen
      const filteredDocIds = documentations.filter(doc => {
        if (showAll) return true;
        if (activeDocumentationFilters.length === 0) return false;
        
        // Prüfe Status-Filter
        const docStatus = doc.status || 'unfertig';
        if (statusFilter !== 'alle' && docStatus !== statusFilter) {
          return false;
        }
        
        const isArchivSelected = activeDocumentationFilters.includes('archiv');
        const isArchivDoc = doc.typ === 'archiv';
        const isLiveTypeSelected = activeDocumentationFilters.some(filter => 
          filter === 'meeting' || filter === 'interview' || filter === 'fieldnote'
        );
        const isLiveDoc = doc.typ === 'live' && activeDocumentationFilters.includes(doc.untertyp);
        
        const hasTypeFilters = isArchivSelected || isLiveTypeSelected;
        if (!hasTypeFilters) {
          return true;
        }
        
        return (isArchivSelected && isArchivDoc) || (isLiveTypeSelected && isLiveDoc);
      }).map(doc => doc.id);
      
      setSelectedDocumentations(prev => prev.filter(id => !filteredDocIds.includes(id)));
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

  // Zusätzlicher useEffect für sofortiges Laden bei Datumsänderungen
  useEffect(() => {
    if (startDate && endDate) {
      loadDocumentations();
    }
  }, [startDate, endDate]);

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

  // Lade Projekt-Mitglieder
  const loadProjektUsers = async () => {
    if (!projekt) return;
    
    try {
      const { data, error } = await supabase
        .from('projekt_user')
        .select('*')
        .eq('projekt_id', projekt.id);

      if (error) throw error;

      setProjektUsers({
        [projekt.id]: data || []
      });
    } catch (error) {
      console.error('Fehler beim Laden der Projekt-Mitglieder:', error);
    }
  };

  useEffect(() => {
    if (projekt) {
      loadProjektUsers();
    }
  }, [projekt]);



  async function handleNameSave(id: string, newName: string) {
    try {
      const { error } = await supabase.from("projekte").update({ name: newName }).eq("id", id);
      if (error) {
        console.error('Fehler beim Speichern des Namens:', error);
        alert('Fehler beim Speichern des Namens: ' + error.message);
        return;
      }
      
      // Projekt-Objekt aktualisieren
      projekt.name = newName;
      
      alert('Projektname erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern des Namens:', error);
      alert('Fehler beim Speichern des Namens');
    }
  }

  async function handleDescSave(id: string, newDesc: string) {
    try {
      const { error } = await supabase.from("projekte").update({ beschreibung: newDesc }).eq("id", id);
      if (error) {
        console.error('Fehler beim Speichern der Beschreibung:', error);
        alert('Fehler beim Speichern der Beschreibung: ' + error.message);
        return;
      }
      
      // Projekt-Objekt aktualisieren
      projekt.beschreibung = newDesc;
      
      alert('Projektbeschreibung erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern der Beschreibung:', error);
      alert('Fehler beim Speichern der Beschreibung');
    }
  }



  async function handleDeleteOption(opt: string) {
    let neueOptionen = Array.isArray(projekt.optionen) ? projekt.optionen.filter((o: string) => o !== opt) : [];
    // Option aus Projekt entfernen
    await supabase.from('projekte').update({ optionen: neueOptionen }).eq('id', projekt.id);
    setShowDeleteOptionDialog({opt: null, open: false});
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

      if (!docsInRange || docsInRange.length === 0) {
        alert('Keine Dokumentationen im ausgewählten Zeitraum gefunden.');
        return;
      }

      // Dokumentationen nach aktuellen Filtern filtern
      let filteredDocs = docsInRange.filter(doc => {
        if (showAll) return true; // Wenn "Alle" explizit aktiviert ist
        if (activeDocumentationFilters.length === 0) return false; // Wenn keine Filter aktiv sind, nichts anzeigen
        
        // Prüfe Status-Filter
        const docStatus = doc.status || 'unfertig';
        if (statusFilter !== 'alle' && docStatus !== statusFilter) {
          return false;
        }
        
        // Prüfen ob Archiv ausgewählt ist
        const isArchivSelected = activeDocumentationFilters.includes('archiv');
        const isArchivDoc = doc.typ === 'archiv';
        
        // Prüfen ob Live-Dokumentationstypen ausgewählt sind
        const isLiveTypeSelected = activeDocumentationFilters.some(filter => 
          filter === 'meeting' || filter === 'interview' || filter === 'fieldnote'
        );
        const isLiveDoc = doc.typ === 'live' && activeDocumentationFilters.includes(doc.untertyp);
        
        // Wenn keine Typ-Filter aktiv sind, zeige alle passenden Dokumentationen (Status-Filter wurde bereits geprüft)
        const hasTypeFilters = isArchivSelected || isLiveTypeSelected;
        if (!hasTypeFilters) {
          return true;
        }
        
        // Dokumentation anzeigen wenn:
        // - Archiv ausgewählt UND es ist eine Archiv-Dokumentation
        // - Live-Typ ausgewählt UND es ist eine passende Live-Dokumentation
        return (isArchivSelected && isArchivDoc) || (isLiveTypeSelected && isLiveDoc);
      });

      // Wenn spezifische Dokumentationen ausgewählt sind, nur diese verwenden
      if (selectedDocumentations.length > 0) {
        filteredDocs = filteredDocs.filter(doc => selectedDocumentations.includes(doc.id));
      }

      if (filteredDocs.length === 0) {
        alert('Keine Dokumentationen mit den aktuellen Filtern im ausgewählten Zeitraum gefunden.');
        return;
      }

      // Alle Dateien der gefilterten Dokumentationen sammeln
      const allFiles: any[] = [];
      filteredDocs.forEach(doc => {
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
           const safeDocName = file.documentationName.replace(/[^a-zA-Z0-9.-]/g, '_');
           const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
           const zipFileName = `${safeDocName}-${safeFileName}-${docDate}`;
          
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

  // Word-Export der Dokumentationen
  const handleExportWord = async () => {
    if (!startDate || !endDate) return;
    
    setExportingWord(true);
    try {
      // Alle Dokumentationen im Zeitraum laden
      const { data: docsInRange, error } = await supabase
        .from('documentation')
        .select('*')
        .eq('projekt_id', projekt.id)
        .gte('datum', startDate)
        .lte('datum', endDate)
        .order('datum', { ascending: true });

      if (error) throw error;

      if (!docsInRange || docsInRange.length === 0) {
        alert('Keine Dokumentationen im ausgewählten Zeitraum gefunden.');
        return;
      }

             // Dokumentationen nach aktuellen Filtern filtern
       let filteredDocs = docsInRange.filter(doc => {
         if (showAll) return true; // Wenn "Alle" explizit aktiviert ist
         if (activeDocumentationFilters.length === 0) return false; // Wenn keine Filter aktiv sind, nichts anzeigen
         
         // Prüfe Status-Filter
         const statusFertigSelected = activeDocumentationFilters.includes('status_fertig');
         const statusUnfertigSelected = activeDocumentationFilters.includes('status_unfertig');
         const docStatus = doc.status || 'unfertig';
         
         let passesStatusFilter = true;
         if (statusFertigSelected || statusUnfertigSelected) {
           passesStatusFilter = (statusFertigSelected && docStatus === 'fertig') || 
                               (statusUnfertigSelected && docStatus === 'unfertig');
           if (!passesStatusFilter) return false;
         }
         
         // Prüfen ob Archiv ausgewählt ist
         const isArchivSelected = activeDocumentationFilters.includes('archiv');
         const isArchivDoc = doc.typ === 'archiv';
         
         // Prüfen ob Live-Dokumentationstypen ausgewählt sind
         const isLiveTypeSelected = activeDocumentationFilters.some(filter => 
           filter === 'meeting' || filter === 'interview' || filter === 'fieldnote'
         );
         const isLiveDoc = doc.typ === 'live' && activeDocumentationFilters.includes(doc.untertyp);
         
         // Wenn nur Status-Filter aktiv sind, zeige alle passenden Dokumentationen
         const hasTypeFilters = isArchivSelected || isLiveTypeSelected;
         if (!hasTypeFilters) {
           return passesStatusFilter;
         }
         
         // Dokumentation anzeigen wenn:
         // - Archiv ausgewählt UND es ist eine Archiv-Dokumentation
         // - Live-Typ ausgewählt UND es ist eine passende Live-Dokumentation
         return ((isArchivSelected && isArchivDoc) || (isLiveTypeSelected && isLiveDoc)) && passesStatusFilter;
       });

       // Wenn spezifische Dokumentationen ausgewählt sind, nur diese verwenden
       if (selectedDocumentations.length > 0) {
         filteredDocs = filteredDocs.filter(doc => selectedDocumentations.includes(doc.id));
       }

      if (filteredDocs.length === 0) {
        alert('Keine Dokumentationen mit den aktuellen Filtern im ausgewählten Zeitraum gefunden.');
        return;
      }

      // Hilfsfunktion zum Herunterladen von Bildern
      const downloadImage = async (file: any): Promise<Buffer | null> => {
        try {
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('documentation-files')
            .createSignedUrl(file.fileName, 3600);

          if (signedUrlError) {
            console.error(`Fehler beim Generieren der Signed URL für ${file.name}:`, signedUrlError);
            return null;
          }

          const response = await fetch(signedUrlData.signedUrl);
          if (!response.ok) {
            console.error(`Fehler beim Herunterladen von ${file.name}`);
            return null;
          }

          const arrayBuffer = await response.arrayBuffer();
          return Buffer.from(arrayBuffer);
        } catch (error) {
          console.error(`Fehler bei Bild ${file.name}:`, error);
          return null;
        }
      };

      // Dokumentationen mit Bildern und Videos verarbeiten
      const processedDocs = await Promise.all(
        filteredDocs.map(async (doc) => {
          const processedFiles: any[] = [];
          
          if (doc.dateien && Array.isArray(doc.dateien)) {
            for (const file of doc.dateien) {
              if (file.type.startsWith('image/')) {
                const imageBuffer = await downloadImage(file);
                if (imageBuffer) {
                  processedFiles.push({
                    ...file,
                    buffer: imageBuffer,
                    isImage: true
                  });
                }
              } else {
                processedFiles.push({
                  ...file,
                  isImage: false
                });
              }
            }
          }
          
          return {
            ...doc,
            processedFiles
          };
        })
      );

      // Word-Dokument erstellen
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Titel
            new Paragraph({
              text: `Dokumentationen für Projekt: ${projekt.name}`,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            
            // Metadaten
            new Paragraph({
              children: [
                new TextRun({
                  text: `Zeitraum: ${new Date(startDate).toLocaleDateString('de-DE')} - ${new Date(endDate).toLocaleDateString('de-DE')}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Exportiert am: ${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString('de-DE')}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({ text: "" }), // Leerzeile

            // Dokumentationen
            ...processedDocs.flatMap((doc, index) => [
              new Paragraph({
                text: `DOKUMENTATION ${index + 1}`,
                heading: HeadingLevel.HEADING_2,
              }),
              
              // Grunddaten
              new Paragraph({
                children: [
                  new TextRun({ text: "Name: ", bold: true }),
                  new TextRun({ text: doc.name }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Typ: ", bold: true }),
                  new TextRun({ 
                    text: doc.typ === 'archiv' ? 'Archiv' : 
                          doc.untertyp === 'meeting' ? 'Meeting' :
                          doc.untertyp === 'interview' ? 'Interview' :
                          doc.untertyp === 'fieldnote' ? 'Feldnotiz' : 'Dokumentation'
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Datum: ", bold: true }),
                  new TextRun({ text: new Date(doc.datum).toLocaleDateString('de-DE') }),
                ],
              }),
              ...(doc.startzeit && doc.endzeit ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Zeit: ", bold: true }),
                    new TextRun({ text: `${doc.startzeit} - ${doc.endzeit}` }),
                  ],
                })
              ] : []),
              ...(doc.beschreibung ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Beschreibung: ", bold: true }),
                    new TextRun({ text: doc.beschreibung }),
                  ],
                })
              ] : []),

              // Meeting-spezifische Informationen
              ...(doc.untertyp === 'meeting' && doc.meeting_typ ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Meeting-Typ: ", bold: true }),
                    new TextRun({ 
                      text: doc.meeting_typ === 'online' ? 'Online' : 
                            doc.meeting_typ === 'offline' ? 'Offline' : 'Hybrid'
                    }),
                  ],
                })
              ] : []),
              ...(doc.untertyp === 'meeting' && doc.klient ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Klient: ", bold: true }),
                    new TextRun({ text: doc.klient }),
                  ],
                })
              ] : []),

              // Interview-spezifische Informationen
              ...(doc.untertyp === 'interview' && doc.interview_typ ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Interview-Typ: ", bold: true }),
                    new TextRun({ 
                      text: doc.interview_typ === 'online' ? 'Online' : 
                            doc.interview_typ === 'offline' ? 'Offline' : 'Hybrid'
                    }),
                  ],
                })
              ] : []),

              // Personen
              ...(doc.personen && Array.isArray(doc.personen) && doc.personen.length > 0 ? [
                new Paragraph({
                  children: [new TextRun({ text: "Personen:", bold: true })],
                }),
                ...doc.personen.map((person: any) => 
                  new Paragraph({
                    children: [
                      new TextRun({ text: "• " }),
                      new TextRun({ 
                        text: person.name || person.vorname + ' ' + person.nachname 
                      }),
                    ],
                  })
                )
              ] : []),

              // Dialoge
              ...(doc.dialoge && Array.isArray(doc.dialoge) && doc.dialoge.length > 0 ? [
                new Paragraph({
                  children: [new TextRun({ text: "Dialoge:", bold: true })],
                }),
                ...doc.dialoge
                  .filter((dialog: any) => dialog.text)
                  .map((dialog: any, dialogIndex: number) => 
                    new Paragraph({
                      children: [
                        new TextRun({ text: `${dialogIndex + 1}. `, bold: true }),
                        new TextRun({ text: dialog.text }),
                      ],
                    })
                  )
              ] : []),

              // Kernfragen (nur für Interviews)
              ...(doc.untertyp === 'interview' && doc.kernfragen && Array.isArray(doc.kernfragen) && doc.kernfragen.length > 0 ? [
                new Paragraph({
                  children: [new TextRun({ text: "Kernfragen:", bold: true })],
                }),
                ...doc.kernfragen
                  .filter((kernfrage: any) => kernfrage.frage)
                  .map((kernfrage: any, frageIndex: number) => [
                    new Paragraph({
                      children: [
                        new TextRun({ text: `${frageIndex + 1}. Frage: `, bold: true }),
                        new TextRun({ text: kernfrage.frage }),
                      ],
                    }),
                    ...(kernfrage.antwort ? [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "   Antwort: ", bold: true }),
                          new TextRun({ text: kernfrage.antwort }),
                        ],
                      })
                    ] : [])
                  ]).flat()
              ] : []),

              // Dateien mit Bildern und Video-Verweisen
              ...(doc.processedFiles && doc.processedFiles.length > 0 ? [
                new Paragraph({
                  children: [new TextRun({ text: "Angehängte Dateien:", bold: true })],
                }),
                ...doc.processedFiles.flatMap((file: any) => {
                  const paragraphs = [];
                  
                  // Dateiname und Typ
                  paragraphs.push(new Paragraph({
                    children: [
                      new TextRun({ text: "• " }),
                      new TextRun({ text: file.name, bold: true }),
                      new TextRun({ text: ` (${file.type})` }),
                    ],
                  }));

                  // Bilder einbetten
                  if (file.isImage && file.buffer) {
                    try {
                      const imageRun = new ImageRun({
                        data: file.buffer,
                        transformation: {
                          width: 400,
                          height: 300,
                        },
                      });
                      paragraphs.push(new Paragraph({
                        children: [imageRun],
                        alignment: AlignmentType.CENTER,
                      }));
                    } catch (error) {
                      console.error(`Fehler beim Einbetten von Bild ${file.name}:`, error);
                      paragraphs.push(new Paragraph({
                        children: [
                          new TextRun({ text: "[Bild konnte nicht eingebettet werden]", color: "FF0000" }),
                        ],
                      }));
                    }
                  }

                  // Video-Verweise
                  if (file.type.startsWith('video/')) {
                    paragraphs.push(new Paragraph({
                      children: [
                        new TextRun({ text: "🎥 Video-Datei: ", bold: true }),
                        new TextRun({ text: "Diese Datei ist als Video verfügbar und kann nicht direkt angezeigt werden." }),
                      ],
                    }));
                  }

                  // Audio-Verweise
                  if (file.type.startsWith('audio/')) {
                    paragraphs.push(new Paragraph({
                      children: [
                        new TextRun({ text: "🎵 Audio-Datei: ", bold: true }),
                        new TextRun({ text: "Diese Datei ist als Audio verfügbar und kann nicht direkt angezeigt werden." }),
                      ],
                    }));
                  }

                  return paragraphs;
                })
              ] : []),

              new Paragraph({ text: "" }), // Leerzeile
              new Paragraph({ text: "=".repeat(50) }), // Trennlinie
              new Paragraph({ text: "" }), // Leerzeile
            ]),
          ],
        }],
      });

      // Word-Dokument generieren und herunterladen
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dokumentationen_${startDate}_bis_${endDate}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

             alert(`Erfolgreich ${filteredDocs.length} Dokumentationen als Word-Dokument exportiert!`);
    } catch (error) {
      console.error('Fehler beim Exportieren der Dokumentationen:', error);
      alert('Fehler beim Exportieren der Dokumentationen. Bitte versuchen Sie es erneut.');
    } finally {
      setExportingWord(false);
    }
  };

         // PDF-Export der Dokumentationen
   const handleExportPDF = async () => {
     if (!startDate || !endDate) return;
     
     setExportingPDF(true);
     try {
       // Alle Dokumentationen im Zeitraum laden
       const { data: docsInRange, error } = await supabase
         .from('documentation')
         .select('*')
         .eq('projekt_id', projekt.id)
         .gte('datum', startDate)
         .lte('datum', endDate)
         .order('datum', { ascending: true });

       if (error) throw error;

       if (!docsInRange || docsInRange.length === 0) {
         alert('Keine Dokumentationen im ausgewählten Zeitraum gefunden.');
         return;
       }

       // Dokumentationen nach aktuellen Filtern filtern
       let filteredDocs = docsInRange.filter(doc => {
         if (showAll) return true; // Wenn "Alle" explizit aktiviert ist
         if (activeDocumentationFilters.length === 0) return false; // Wenn keine Filter aktiv sind, nichts anzeigen
         
         // Prüfe Status-Filter
         const statusFertigSelected = activeDocumentationFilters.includes('status_fertig');
         const statusUnfertigSelected = activeDocumentationFilters.includes('status_unfertig');
         const docStatus = doc.status || 'unfertig';
         
         let passesStatusFilter = true;
         if (statusFertigSelected || statusUnfertigSelected) {
           passesStatusFilter = (statusFertigSelected && docStatus === 'fertig') || 
                               (statusUnfertigSelected && docStatus === 'unfertig');
           if (!passesStatusFilter) return false;
         }
         
         // Prüfen ob Archiv ausgewählt ist
         const isArchivSelected = activeDocumentationFilters.includes('archiv');
         const isArchivDoc = doc.typ === 'archiv';
         
         // Prüfen ob Live-Dokumentationstypen ausgewählt sind
         const isLiveTypeSelected = activeDocumentationFilters.some(filter => 
           filter === 'meeting' || filter === 'interview' || filter === 'fieldnote'
         );
         const isLiveDoc = doc.typ === 'live' && activeDocumentationFilters.includes(doc.untertyp);
         
         // Wenn nur Status-Filter aktiv sind, zeige alle passenden Dokumentationen
         const hasTypeFilters = isArchivSelected || isLiveTypeSelected;
         if (!hasTypeFilters) {
           return passesStatusFilter;
         }
         
         // Dokumentation anzeigen wenn:
         // - Archiv ausgewählt UND es ist eine Archiv-Dokumentation
         // - Live-Typ ausgewählt UND es ist eine passende Live-Dokumentation
         return ((isArchivSelected && isArchivDoc) || (isLiveTypeSelected && isLiveDoc)) && passesStatusFilter;
       });

       // Wenn spezifische Dokumentationen ausgewählt sind, nur diese verwenden
       if (selectedDocumentations.length > 0) {
         filteredDocs = filteredDocs.filter(doc => selectedDocumentations.includes(doc.id));
       }

       if (filteredDocs.length === 0) {
         alert('Keine Dokumentationen mit den aktuellen Filtern im ausgewählten Zeitraum gefunden.');
         return;
       }

               // Hilfsfunktion zum Herunterladen von Bildern
        const downloadImage = async (file: any): Promise<ArrayBuffer | null> => {
          try {
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('documentation-files')
              .createSignedUrl(file.fileName, 3600);

            if (signedUrlError) {
              console.error(`Fehler beim Generieren der Signed URL für ${file.name}:`, signedUrlError);
              return null;
            }

            const response = await fetch(signedUrlData.signedUrl);
            if (!response.ok) {
              console.error(`Fehler beim Herunterladen von ${file.name}`);
              return null;
            }

            return await response.arrayBuffer();
          } catch (error) {
            console.error(`Fehler bei Bild ${file.name}:`, error);
            return null;
          }
        };

        // Hilfsfunktion zum Konvertieren von Bildern zu Base64 für PDF
        const convertImageToBase64 = async (file: any): Promise<string | null> => {
          try {
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('documentation-files')
              .createSignedUrl(file.fileName, 3600);

            if (signedUrlError) {
              console.error(`Fehler beim Generieren der Signed URL für ${file.name}:`, signedUrlError);
              return null;
            }

            // Bild als Blob laden
            const response = await fetch(signedUrlData.signedUrl);
            if (!response.ok) {
              console.error(`Fehler beim Herunterladen von ${file.name}`);
              return null;
            }

            const blob = await response.blob();
            
            // Blob zu Base64 konvertieren
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result as string;
                // Data URL Format entfernen (z.B. "data:image/jpeg;base64,")
                const base64Data = base64.split(',')[1];
                resolve(base64Data);
              };
              reader.readAsDataURL(blob);
            });
          } catch (error) {
            console.error(`Fehler bei Bild ${file.name}:`, error);
            return null;
          }
        };

       // Dokumentationen mit Bildern verarbeiten
       const processedDocs = await Promise.all(
         filteredDocs.map(async (doc) => {
           const processedFiles: any[] = [];
           
           if (doc.dateien && Array.isArray(doc.dateien)) {
             for (const file of doc.dateien) {
               if (file.type.startsWith('image/')) {
                 const base64Data = await convertImageToBase64(file);
                 if (base64Data) {
                   processedFiles.push({
                     ...file,
                     base64: base64Data,
                     isImage: true
                   });
                 }
               } else {
                 processedFiles.push({
                   ...file,
                   isImage: false
                 });
               }
             }
           }
           
           return {
             ...doc,
             processedFiles
           };
         })
       );

       // PDF erstellen
       const pdf = new jsPDF();
       let y = 20;
       const pageHeight = 280;
       const lineHeight = 7;

      // Titel
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const title = `Dokumentationen für Projekt: ${projekt.name}`;
      const titleWidth = pdf.getTextWidth(title);
      pdf.text(title, (210 - titleWidth) / 2, y);
      y += 15;

      // Metadaten
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Zeitraum: ${new Date(startDate).toLocaleDateString('de-DE')} - ${new Date(endDate).toLocaleDateString('de-DE')}`, 20, y);
      y += lineHeight;
      pdf.text(`Exportiert am: ${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString('de-DE')}`, 20, y);
      y += 15;

             // Dokumentationen
       processedDocs.forEach((doc, index) => {
        // Prüfen ob neue Seite nötig
        if (y > pageHeight) {
          pdf.addPage();
          y = 20;
        }

        // Dokumentationstitel
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`DOKUMENTATION ${index + 1}`, 20, y);
        y += lineHeight;

        // Grunddaten
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Name: ${doc.name}`, 20, y);
        y += lineHeight;
        
        const docType = doc.typ === 'archiv' ? 'Archiv' : 
                       doc.untertyp === 'meeting' ? 'Meeting' :
                       doc.untertyp === 'interview' ? 'Interview' :
                       doc.untertyp === 'fieldnote' ? 'Feldnotiz' : 'Dokumentation';
        pdf.text(`Typ: ${docType}`, 20, y);
        y += lineHeight;
        
        pdf.text(`Datum: ${new Date(doc.datum).toLocaleDateString('de-DE')}`, 20, y);
        y += lineHeight;

        if (doc.startzeit && doc.endzeit) {
          pdf.text(`Zeit: ${doc.startzeit} - ${doc.endzeit}`, 20, y);
          y += lineHeight;
        }

        if (doc.beschreibung) {
          // Beschreibung kann lang sein, daher Zeilenumbruch
          const descLines = pdf.splitTextToSize(`Beschreibung: ${doc.beschreibung}`, 170);
          pdf.text(descLines, 20, y);
          y += lineHeight * descLines.length;
        }

        // Meeting-spezifische Informationen
        if (doc.untertyp === 'meeting') {
          if (doc.meeting_typ) {
            const meetingType = doc.meeting_typ === 'online' ? 'Online' : 
                               doc.meeting_typ === 'offline' ? 'Offline' : 'Hybrid';
            pdf.text(`Meeting-Typ: ${meetingType}`, 20, y);
            y += lineHeight;
          }
          if (doc.klient) {
            pdf.text(`Klient: ${doc.klient}`, 20, y);
            y += lineHeight;
          }
        }

        // Interview-spezifische Informationen
        if (doc.untertyp === 'interview' && doc.interview_typ) {
          const interviewType = doc.interview_typ === 'online' ? 'Online' : 
                               doc.interview_typ === 'offline' ? 'Offline' : 'Hybrid';
          pdf.text(`Interview-Typ: ${interviewType}`, 20, y);
          y += lineHeight;
        }

        // Personen
        if (doc.personen && Array.isArray(doc.personen) && doc.personen.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Personen:', 20, y);
          y += lineHeight;
          pdf.setFont('helvetica', 'normal');
          doc.personen.forEach((person: any) => {
            if (y > pageHeight) {
              pdf.addPage();
              y = 20;
            }
            pdf.text(`• ${person.name || person.vorname + ' ' + person.nachname}`, 25, y);
            y += lineHeight;
          });
        }

        // Dialoge
        if (doc.dialoge && Array.isArray(doc.dialoge) && doc.dialoge.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Dialoge:', 20, y);
          y += lineHeight;
          pdf.setFont('helvetica', 'normal');
          doc.dialoge
            .filter((dialog: any) => dialog.text)
            .forEach((dialog: any, dialogIndex: number) => {
              if (y > pageHeight) {
                pdf.addPage();
                y = 20;
              }
              const dialogLines = pdf.splitTextToSize(`${dialogIndex + 1}. ${dialog.text}`, 165);
              pdf.text(dialogLines, 25, y);
              y += lineHeight * dialogLines.length;
            });
        }

        // Kernfragen (nur für Interviews)
        if (doc.untertyp === 'interview' && doc.kernfragen && Array.isArray(doc.kernfragen) && doc.kernfragen.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Kernfragen:', 20, y);
          y += lineHeight;
          pdf.setFont('helvetica', 'normal');
          doc.kernfragen
            .filter((kernfrage: any) => kernfrage.frage)
            .forEach((kernfrage: any, frageIndex: number) => {
              if (y > pageHeight) {
                pdf.addPage();
                y = 20;
              }
              pdf.text(`${frageIndex + 1}. Frage: ${kernfrage.frage}`, 25, y);
              y += lineHeight;
              if (kernfrage.antwort) {
                if (y > pageHeight) {
                  pdf.addPage();
                  y = 20;
                }
                const antwortLines = pdf.splitTextToSize(`   Antwort: ${kernfrage.antwort}`, 160);
                pdf.text(antwortLines, 25, y);
                y += lineHeight * antwortLines.length;
              }
            });
        }

                 // Dateien mit Bildern und Video-Verweisen
         if (doc.processedFiles && doc.processedFiles.length > 0) {
           pdf.setFont('helvetica', 'bold');
           pdf.text('Angehängte Dateien:', 20, y);
           y += lineHeight;
           pdf.setFont('helvetica', 'normal');
           
           for (const file of doc.processedFiles) {
             if (y > pageHeight) {
               pdf.addPage();
               y = 20;
             }
             
             // Dateiname und Typ
             pdf.text(`• ${file.name} (${file.type})`, 25, y);
             y += lineHeight;
             
                           // Bilder einbetten
              if (file.isImage && file.base64) {
                try {
                  // Prüfen ob genug Platz für das Bild
                  if (y > pageHeight - 80) {
                    pdf.addPage();
                    y = 20;
                  }
                  
                  // Bildformat bestimmen
                  let imageFormat = 'JPEG';
                  if (file.type === 'image/png') {
                    imageFormat = 'PNG';
                  } else if (file.type === 'image/gif') {
                    imageFormat = 'GIF';
                  } else if (file.type === 'image/webp') {
                    imageFormat = 'WEBP';
                  }
                  
                  // Bild einbetten (maximale Größe: 150x100)
                  pdf.addImage(file.base64, imageFormat, 25, y, 150, 100);
                  y += 110; // Platz für Bild + Abstand
                } catch (error) {
                  console.error(`Fehler beim Einbetten von Bild ${file.name}:`, error);
                  if (y > pageHeight) {
                    pdf.addPage();
                    y = 20;
                  }
                  pdf.setFont('helvetica', 'italic');
                  pdf.text('[Bild konnte nicht eingebettet werden]', 25, y);
                  pdf.setFont('helvetica', 'normal');
                  y += lineHeight;
                }
              }
             
             // Video-Verweise
             if (file.type.startsWith('video/')) {
               if (y > pageHeight) {
                 pdf.addPage();
                 y = 20;
               }
               pdf.setFont('helvetica', 'bold');
               pdf.text('🎥 Video-Datei: Diese Datei ist als Video verfügbar', 25, y);
               y += lineHeight;
               pdf.setFont('helvetica', 'normal');
             }
             
             // Audio-Verweise
             if (file.type.startsWith('audio/')) {
               if (y > pageHeight) {
                 pdf.addPage();
                 y = 20;
               }
               pdf.setFont('helvetica', 'bold');
               pdf.text('🎵 Audio-Datei: Diese Datei ist als Audio verfügbar', 25, y);
               y += lineHeight;
               pdf.setFont('helvetica', 'normal');
             }
           }
         }

        // Trennlinie
        y += 5;
        if (y > pageHeight) {
          pdf.addPage();
          y = 20;
        }
        pdf.line(20, y, 190, y);
        y += 10;
      });

      // PDF speichern
      pdf.save(`dokumentationen_${startDate}_bis_${endDate}.pdf`);

             alert(`Erfolgreich ${filteredDocs.length} Dokumentationen als PDF exportiert!`);
    } catch (error) {
      console.error('Fehler beim PDF-Export:', error);
      alert('Fehler beim PDF-Export. Bitte versuchen Sie es erneut.');
    } finally {
      setExportingPDF(false);
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
        status: documentation.status || 'unfertig',
        
        // Meeting-spezifische Felder
        meeting_typ: documentation.meetingTyp || null,
        klient: documentation.klient || null,
        
        // Interview-spezifische Felder
        interview_typ: documentation.interviewTyp || null,
        
        // JSON-Felder (sicherstellen, dass Arrays sind)
        personen: documentation.personen || [],
        dialoge: documentation.dialoge || [],
        kernfragen: documentation.kernfragen || [],
        dateien: documentation.dateien || [],
        tags: documentation.tags || []
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
          background: 'var(--button)',
          color: 'var(--text-primary)',
          borderRadius: 8,
          padding: '8px 16px',
          marginBottom: 24,
          cursor: 'pointer',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        ←
      </button>

      {/* Projekt-Header - immer oben */}
                <ProjectInfoCard 
          projekt={projekt} 
          canEdit={canEdit}
          onNameUpdate={handleNameSave}
          onDescUpdate={handleDescSave}
          onDelete={() => setShowDeleteProjectDialog(true)}
          loading={loading}
        />

        {/* Mitglieder-Verwaltung */}
        <ProjectMembers 
          projekt={projekt}
          user={user}
          onMembersChange={() => {
            // Lade projektUsers neu, wenn sich Mitglieder ändern
            loadProjektUsers();
          }}
        />

        {/* Interaktions- und Arbeitsräume */}
        <ProjectLinks 
          projekt={projekt}
          user={user}
          canEdit={canEditLinks}
        />

                  {/* Dokumentations-Buttons - nur sichtbar wenn Berechtigung vorhanden */}
         {canCreateDocumentation && (
         <DocumentationButtons
           onLiveClick={() => {
             setShowNewDocumentation(true);
             setDocumentationType('live');
             setNewDocumentation((prev: any) => ({ ...prev, datum: selectedDate }));
           }}
         />
         )}

                 {/* Datumsbereich-Filter und Dokumentations-Filter und Liste */}
                                                                                          <DateRangeFilter
                          startDate={startDate}
                          endDate={endDate}
                          onStartDateChange={handleStartDateChange}
                          onEndDateChange={handleEndDateChange}
                          onClearRange={handleClearDateRange}
                          onFullRangeSet={handleFullProjectRange}
                          onDownloadFiles={handleDownloadFiles}
                          hasFiles={hasFilesInRange}
                          downloading={downloadingFiles}
                          projektCreatedAt={projekt.created_at}
                        />

                     <div style={{ marginBottom: 24 }}>
                       {documentations.length > 0 ? (
                         <>
                           <DocumentationFilters
                             documentations={documentations}
                             activeDocumentationFilters={activeDocumentationFilters}
                             statusFilter={statusFilter}
                             onStatusFilterChange={setStatusFilter}
                             onFilterChange={handleFilterChange}
                             onExportWord={handleExportWord}
                             onExportPDF={handleExportPDF}
                             exportingWord={exportingWord}
                             exportingPDF={exportingPDF}
                           />
                           
                           <TagFilter
                             documentations={documentations}
                             onFilterChange={setSelectedTags}
                             selectedTags={selectedTags}
                           />
                           
                           <DocumentationList
                              documentations={documentations}
                              activeDocumentationFilters={activeDocumentationFilters}
                              showAll={showAll}
                              statusFilter={statusFilter}
                              expandedDocumentations={expandedDocumentations}
                              onToggleExpanded={(docId) => setExpandedDocumentations(prev => ({ ...prev, [docId]: !prev[docId] }))}
                              onEditDocumentation={handleEditDocumentation}
                              onDeleteDocumentation={handleDeleteDocumentation}
                              selectedDocumentations={selectedDocumentations}
                              onToggleDocumentationSelection={handleToggleDocumentationSelection}
                              onSelectAllDocumentations={handleSelectAllDocumentations}
                              selectedTags={selectedTags}
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
          loading={false}
          onRemoveOnly={() => handleDeleteOption(showDeleteOptionDialog.opt!)}
          onClose={() => setShowDeleteOptionDialog({ opt: null, open: false })}
        />

             {/* Tab-Inhalte */}
        <div>
          {/* Projekt-Details werden jetzt über ProjectInfoCard angezeigt */}
        </div>

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