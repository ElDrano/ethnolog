"use client";
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import SecureFileDisplay from './SecureFileDisplay';
import TagInput from './TagInput';
import AudioRecorder from './AudioRecorder';

interface DocumentationFormProps {
  projekt: any;
  selectedDate: string;
  documentationType: 'archiv' | 'live' | null;
  onClose: () => void;
  onSave: (documentation: any) => Promise<void>;
  editingDocumentation?: any;
}

export default function DocumentationForm({
  projekt,
  selectedDate,
  documentationType,
  onClose,
  onSave,
  editingDocumentation
}: DocumentationFormProps) {
  const [liveDocumentationType, setLiveDocumentationType] = useState<'meeting' | 'interview' | 'fieldnote' | 'archiv' | null>(
    editingDocumentation?.untertyp || (editingDocumentation?.typ === 'archiv' ? 'archiv' : null)
  );
  const [formData, setFormData] = useState<any>(() => {
         if (editingDocumentation) {
       return {
         name: editingDocumentation.name || '',
         beschreibung: editingDocumentation.beschreibung || '',
         startzeit: editingDocumentation.startzeit || null,
         endzeit: editingDocumentation.endzeit || null,
         datum: editingDocumentation.datum || selectedDate,
         typ: editingDocumentation.typ || documentationType,
         untertyp: editingDocumentation.untertyp || '',
         personen: editingDocumentation.personen || [],
         klient: editingDocumentation.klient || '',
         dialoge: editingDocumentation.dialoge && editingDocumentation.dialoge.length > 0 ? editingDocumentation.dialoge : [{ text: '' }],
         kernfragen: editingDocumentation.kernfragen && editingDocumentation.kernfragen.length > 0 ? editingDocumentation.kernfragen : [{ frage: '', antwort: '' }],
         dateien: editingDocumentation.dateien || [],
         meetingTyp: editingDocumentation.meeting_typ || '',
         interviewTyp: editingDocumentation.interview_typ || '',
         tags: editingDocumentation.tags || [],
         status: editingDocumentation.status || 'unfertig'
       };
     }
     return {
       name: '',
       beschreibung: '',
       startzeit: null,
       endzeit: null,
       datum: selectedDate,
       typ: documentationType,
       untertyp: '',
       personen: [],
       klient: '',
       dialoge: [{ text: '' }],
       kernfragen: [{ frage: '', antwort: '' }],
       dateien: [],
       tags: [],
       status: 'unfertig'
     };
  });
  const [newPerson, setNewPerson] = useState({ vorname: '', nachname: '', email: '', position: '' });
  const [uploading, setUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  const handleAddPerson = () => {
    if (!newPerson.nachname.trim()) return;
    setFormData((prev: any) => ({
      ...prev,
      personen: [...prev.personen, { ...newPerson, id: Date.now() }]
    }));
    setNewPerson({ vorname: '', nachname: '', email: '', position: '' });
  };

  const handleRemovePerson = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      personen: prev.personen.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleAddDialog = () => {
    setFormData((prev: any) => ({
      ...prev,
      dialoge: [...prev.dialoge, { text: '' }]
    }));
  };

  const handleRemoveDialog = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      dialoge: prev.dialoge.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleAddKernfrage = () => {
    setFormData((prev: any) => ({
      ...prev,
      kernfragen: [...prev.kernfragen, { frage: '', antwort: '' }]
    }));
  };

  const handleRemoveKernfrage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      kernfragen: prev.kernfragen.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: tags
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedFiles: any[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `documentation-${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        console.log('Uploading file:', fileName, file.type, file.size);
        
        const { data, error } = await supabase.storage
          .from('documentation-files')
          .upload(fileName, file, { 
            upsert: true,
            cacheControl: '3600'
          });

        if (error) {
          console.error('Upload error for file:', fileName, error);
          alert(`Fehler beim Upload von ${file.name}: ${error.message}`);
          continue;
        }

        console.log('Upload successful for file:', fileName);
        
        // Speichere nur den Dateinamen, nicht die URL
        uploadedFiles.push({
          name: file.name,
          fileName: fileName, // Speichere den internen Dateinamen
          type: file.type,
          size: file.size
        });
        console.log('File uploaded:', fileName);
      }

      setFormData((prev: any) => ({
        ...prev,
        dateien: [...prev.dateien, ...uploadedFiles]
      }));
      
      if (uploadedFiles.length > 0) {
        alert(`${uploadedFiles.length} Datei(en) erfolgreich hochgeladen!`);
      }
    } catch (error) {
      console.error('General upload error:', error);
      alert('Fehler beim Datei-Upload: ' + error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      dateien: prev.dateien.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleAudioReady = (blob: Blob, fileName: string) => {
    setAudioBlob(blob);
    setAudioFileName(fileName);
  };

  const handleAudioFinish = () => {
    setShowAudioRecorder(false);
  };

  const uploadAudioFile = async () => {
    if (!audioBlob || !audioFileName) return null;

    try {
      setUploading(true);
      const sanitizedFileName = `audio-${Date.now()}-${audioFileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      console.log('Uploading audio file:', sanitizedFileName, audioBlob.type, audioBlob.size);
      
      // Upload ohne contentType Parameter - wie bei normalem File-Upload
      const { data, error } = await supabase.storage
        .from('documentation-files')
        .upload(sanitizedFileName, audioBlob, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (error) {
        console.error('Audio upload error:', error);
        alert(`Fehler beim Upload der Audiodatei: ${error.message}`);
        return null;
      }

      console.log('Audio upload successful:', sanitizedFileName);
      
      return {
        name: audioFileName,
        fileName: sanitizedFileName,
        type: audioBlob.type || 'audio/mpeg',
        size: audioBlob.size
      };
    } catch (error) {
      console.error('General audio upload error:', error);
      alert('Fehler beim Audio-Upload: ' + error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    let audioFile: { name: string; fileName: string; type: string; size: number } | null = null;
    
    // Audio-Datei hochladen, falls vorhanden
    if (audioBlob && audioFileName) {
      audioFile = await uploadAudioFile();
      if (audioFile) {
        // Audio-Datei zu den Dateien hinzufügen
        setFormData((prev: any) => ({
          ...prev,
          dateien: [...prev.dateien, audioFile]
        }));
      }
    }

    const finalData = {
      ...formData,
      projekt_id: projekt.id,
      typ: liveDocumentationType === 'archiv' ? 'archiv' : (documentationType || 'live'),
      untertyp: liveDocumentationType === 'archiv' ? null : liveDocumentationType,
      tags: formData.tags || [],
      dateien: audioFile ? [...formData.dateien, audioFile] : formData.dateien
    };
    await onSave(finalData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 12,
        padding: '2rem',
        maxWidth: '95vw',
        width: 'min(1200px, 95vw)',
        maxHeight: '90vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)'
      }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
           <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
             {editingDocumentation ? 
               `${liveDocumentationType === 'meeting' ? 'Meeting' :
                  liveDocumentationType === 'interview' ? 'Interview' :
                  liveDocumentationType === 'fieldnote' ? 'Feldnotiz' :
                  liveDocumentationType === 'archiv' ? 'Archiv-Dokumentation' :
                  'Dokumentation'} bearbeiten` :
               `${liveDocumentationType === 'meeting' ? 'Meeting' :
                  liveDocumentationType === 'interview' ? 'Interview' :
                  liveDocumentationType === 'fieldnote' ? 'Feldnotiz' :
                  liveDocumentationType === 'archiv' ? 'Archiv-Dokumentation' :
                  'Dokumentation'} erstellen`
             }
           </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            ×
          </button>
        </div>

        {/* Live-Dokumentation Typ-Auswahl */}
        {documentationType === 'live' && !liveDocumentationType && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, fontSize: 16, color: 'var(--text-primary)' }}>
              Typ der Dokumentation:
            </label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setLiveDocumentationType('meeting')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: '2px solid var(--primary-blue)',
                  background: 'var(--surface)',
                  color: 'var(--primary-blue)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                📅 Meeting
              </button>
              <button
                onClick={() => setLiveDocumentationType('interview')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: '2px solid var(--primary-blue)',
                  background: 'var(--surface)',
                  color: 'var(--primary-blue)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                🎤 Interview
              </button>
              <button
                onClick={() => setLiveDocumentationType('fieldnote')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: '2px solid var(--primary-blue)',
                  background: 'var(--surface)',
                  color: 'var(--primary-blue)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                📝 Feldnotiz
              </button>
              <button
                onClick={() => setLiveDocumentationType('archiv')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: '2px solid var(--primary-blue)',
                  background: 'var(--surface)',
                  color: 'var(--primary-blue)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                📦 Archiv-Dokumentation
              </button>
            </div>
          </div>
        )}

        {(documentationType === 'archiv' || liveDocumentationType) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Grunddaten */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14, color: 'var(--text-primary)' }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    fontSize: 14,
                    background: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Name der Dokumentation"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  Datum
                </label>
                <input
                  type="date"
                  value={formData.datum}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, datum: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    fontSize: 14,
                    background: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                {liveDocumentationType === 'fieldnote' ? 'Notizen' : 'Beschreibung'}
              </label>
              <textarea
                value={formData.beschreibung}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, beschreibung: e.target.value }))}
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  resize: 'vertical'
                }}
                placeholder={liveDocumentationType === 'fieldnote' ? 'Notizen zur Feldnotiz...' : 'Beschreibung der Dokumentation...'}
              />
            </div>

            {/* Tags */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14, color: 'var(--text-primary)' }}>
                Tags
              </label>
              <TagInput
                selectedTags={formData.tags || []}
                onTagsChange={handleTagsChange}
                placeholder="Tag eingeben oder aus Vorschlägen wählen..."
              />
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14, color: 'var(--text-primary)' }}>
                Status
              </label>
              <select
                value={formData.status || 'unfertig'}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value }))}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  background: 'var(--background)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="unfertig">Unfertig</option>
                <option value="fertig">Fertig</option>
              </select>
            </div>

                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
               <div>
                 <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                   Startzeit (optional)
                 </label>
                 <input
                   type="time"
                   value={formData.startzeit || ''}
                   onChange={(e) => setFormData((prev: any) => ({ ...prev, startzeit: e.target.value || null }))}
                   style={{
                     width: '100%',
                     padding: 10,
                     borderRadius: 6,
                     border: '1px solid #ddd',
                     fontSize: 14
                   }}
                 />
               </div>
               <div>
                 <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                   Endzeit (optional)
                 </label>
                 <input
                   type="time"
                   value={formData.endzeit || ''}
                   onChange={(e) => setFormData((prev: any) => ({ ...prev, endzeit: e.target.value || null }))}
                   style={{
                     width: '100%',
                     padding: 10,
                     borderRadius: 6,
                     border: '1px solid #ddd',
                     fontSize: 14
                   }}
                 />
               </div>
             </div>

            {/* Meeting-spezifische Felder */}
            {liveDocumentationType === 'meeting' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                      Meeting-Typ
                    </label>
                    <select
                      value={formData.meetingTyp || ''}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, meetingTyp: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid #ddd',
                        fontSize: 14
                      }}
                    >
                      <option value="">Bitte wählen...</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                      Klient
                    </label>
                    <input
                      type="text"
                      value={formData.klient}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, klient: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid #ddd',
                        fontSize: 14
                      }}
                      placeholder="Klientname oder 'Ohne Klient'"
                    />
                  </div>
                </div>

                {/* Personen für Meeting */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
                    Teilnehmer hinzufügen
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end', marginBottom: 12 }}>
                    <input
                      type="text"
                      placeholder="Vorname"
                      value={newPerson.vorname}
                      onChange={(e) => setNewPerson(prev => ({ ...prev, vorname: e.target.value }))}
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
                    />
                    <input
                      type="text"
                      placeholder="Nachname *"
                      value={newPerson.nachname}
                      onChange={(e) => setNewPerson(prev => ({ ...prev, nachname: e.target.value }))}
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
                    />
                    <input
                      type="email"
                      placeholder="E-Mail"
                      value={newPerson.email}
                      onChange={(e) => setNewPerson(prev => ({ ...prev, email: e.target.value }))}
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
                    />
                    <input
                      type="text"
                      placeholder="Position"
                      value={newPerson.position}
                      onChange={(e) => setNewPerson(prev => ({ ...prev, position: e.target.value }))}
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
                    />
                    <button
                      onClick={handleAddPerson}
                      disabled={!newPerson.nachname.trim()}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 4,
                        background: 'var(--success)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      +
                    </button>
                  </div>
                  
                  {formData.personen.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Teilnehmer:</div>
                      {formData.personen.map((person: any, index: number) => (
                        <div key={person.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: 8,
                          background: 'var(--surface-hover)',
                          borderRadius: 4,
                          marginBottom: 4
                        }}>
                          <span style={{ fontSize: 12 }}>
                            {person.vorname} {person.nachname} - {person.position} - {person.email}
                          </span>
                          <button
                            onClick={() => handleRemovePerson(index)}
                            style={{
                              background: 'var(--error)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              padding: '2px 8px',
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Interview-spezifische Felder */}
            {liveDocumentationType === 'interview' && (
              <>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14, color: 'var(--text-primary)' }}>
                    Interview-Typ
                  </label>
                  <select
                    value={formData.interviewTyp || ''}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, interviewTyp: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 6,
                      border: '1px solid #ddd',
                      fontSize: 14
                    }}
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Kernfragen für Interview */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <label style={{ fontWeight: 600, fontSize: 14 }}>Kernfragen & Antworten</label>
                    <button
                      onClick={handleAddKernfrage}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 4,
                        background: '#2196F3',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      + Kernfrage
                    </button>
                  </div>
                  {formData.kernfragen.map((kernfrage: any, index: number) => (
                    <div key={index} style={{ 
                      border: '1px solid #ddd', 
                      borderRadius: 6, 
                      padding: 12, 
                      marginBottom: 8 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 12 }}>Kernfrage {index + 1}</span>
                        <button
                          onClick={() => handleRemoveKernfrage(index)}
                          style={{
                            background: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '2px 8px',
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Frage"
                        value={kernfrage.frage}
                        onChange={(e) => {
                          const newKernfragen = [...formData.kernfragen];
                          newKernfragen[index].frage = e.target.value;
                          setFormData((prev: any) => ({ ...prev, kernfragen: newKernfragen }));
                        }}
                        style={{
                          width: '100%',
                          padding: 8,
                          borderRadius: 4,
                          border: '1px solid #ddd',
                          fontSize: 12,
                          marginBottom: 8
                        }}
                      />
                      <textarea
                        placeholder="Antwort"
                        value={kernfrage.antwort}
                        onChange={(e) => {
                          const newKernfragen = [...formData.kernfragen];
                          newKernfragen[index].antwort = e.target.value;
                          setFormData((prev: any) => ({ ...prev, kernfragen: newKernfragen }));
                        }}
                        style={{
                          width: '100%',
                          minHeight: 60,
                          padding: 8,
                          borderRadius: 4,
                          border: '1px solid #ddd',
                          fontSize: 12,
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Dialoge für Meeting und Interview */}
            {(liveDocumentationType === 'meeting' || liveDocumentationType === 'interview') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ fontWeight: 600, fontSize: 14 }}>Dialoge</label>
                  <button
                    onClick={handleAddDialog}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 4,
                      background: '#2196F3',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    + Dialog
                  </button>
                </div>
                {formData.dialoge.map((dialog: any, index: number) => (
                  <div key={index} style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: 6, 
                    padding: 12, 
                    marginBottom: 8 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 12 }}>Dialog {index + 1}</span>
                      <button
                        onClick={() => handleRemoveDialog(index)}
                        style={{
                          background: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '2px 8px',
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <textarea
                      placeholder="Dialogtext..."
                      value={dialog.text}
                      onChange={(e) => {
                        const newDialoge = [...formData.dialoge];
                        newDialoge[index].text = e.target.value;
                        setFormData((prev: any) => ({ ...prev, dialoge: newDialoge }));
                      }}
                      style={{
                        width: '100%',
                        minHeight: 80,
                        padding: 8,
                        borderRadius: 4,
                        border: '1px solid #ddd',
                        fontSize: 12,
                        resize: 'vertical'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Audio-Aufnahme für Interviews */}
            {liveDocumentationType === 'interview' && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 12 
                }}>
                  <label style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                    🎤 Audio-Aufnahme
                  </label>
                  {!showAudioRecorder && !audioBlob && (
                    <button
                      onClick={() => setShowAudioRecorder(true)}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--primary-blue)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      🎙️ Aufnahme starten
                    </button>
                  )}
                </div>
                
                {showAudioRecorder && (
                  <AudioRecorder 
                    onAudioReady={handleAudioReady}
                    onFinish={handleAudioFinish}
                  />
                )}
                
                {!showAudioRecorder && audioBlob && (
                  <div style={{
                    padding: 16,
                    background: 'var(--surface)',
                    border: '2px solid var(--primary-green)',
                    borderRadius: 8,
                    marginBottom: 12
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      color: 'var(--primary-green)',
                      fontWeight: 600
                    }}>
                      ✓ Audio-Aufnahme bereit ({audioFileName})
                    </div>
                    <button
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioFileName(null);
                      }}
                      style={{
                        marginTop: 8,
                        padding: '6px 12px',
                        background: 'var(--error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      🗑️ Aufnahme entfernen
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Datei-Upload */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14, color: 'var(--text-primary)' }}>
                Dateien hochladen (Fotos, Audio, Video)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,audio/*,video/*"
                onChange={handleFileUpload}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  fontSize: 14
                }}
              />
              {uploading && <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>Upload läuft...</div>}
              
                             {formData.dateien.length > 0 && (
                 <div style={{ marginTop: 12 }}>
                   <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Hochgeladene Dateien:</div>
                   {formData.dateien.map((file: any, index: number) => (
                     <SecureFileDisplay
                       key={index}
                       file={file}
                       onRemove={() => handleRemoveFile(index)}
                     />
                   ))}
                 </div>
               )}
            </div>

            {/* Speichern-Button */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                style={{
                  padding: '12px 24px',
                  borderRadius: 6,
                  background: 'var(--success)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
