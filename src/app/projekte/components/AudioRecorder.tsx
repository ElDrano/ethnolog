"use client";
import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, fileName: string) => void;
  onFinish: () => void;
}

export default function AudioRecorder({ onAudioReady, onFinish }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup bei Unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Versuche verschiedene MIME-Types, um das beste unterstützte Format zu finden
      // Bevorzuge echte Audio-Formate (MP3, OGG) vor Container-Formaten
      const mimeTypes = [
        'audio/mpeg',          // MP3 - universell, kleine Dateigröße
        'audio/ogg; codecs=opus', // OGG - gute Qualität, Open Source
        'audio/mp4',           // M4A/AAC - gute Qualität, aber Container-Format
        'audio/webm; codecs=opus', // WebM - gut für Web, aber weniger kompatibel
        'audio/wav'            // WAV - unkomprimiert, große Dateien
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('Using MIME type:', mimeType);
          break;
        }
      }

      if (!selectedMimeType) {
        // Fallback: Nutze Standard ohne spezifischen MIME-Type
        selectedMimeType = '';
        console.log('Using default MIME type');
      }

      const mediaRecorder = selectedMimeType 
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/mpeg';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecording(true);
        
        // Generiere Dateinamen mit Timestamp und passender Endung
        const extension = getFileExtension(mimeType);
        const fileName = `interview-audio-${Date.now()}.${extension}`;
        onAudioReady(audioBlob, fileName);

        // Stream aufräumen
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      // Timer starten
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Fehler beim Zugriff auf Mikrofon:', err);
      setError('Fehler beim Zugriff auf das Mikrofon. Bitte stellen Sie sicher, dass Sie die Berechtigung erteilt haben.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const handleFinish = () => {
    if (hasRecording) {
      onFinish();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileExtension = (mimeType: string): string => {
    const mimeMap: { [key: string]: string } = {
      'audio/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'audio/ogg': 'ogg',
      'audio/webm': 'webm',
      'audio/wav': 'wav',
      'audio/x-m4a': 'm4a'
    };
    
    // Extrahiere den Basis-MIME-Type ohne Codecs
    const baseMimeType = mimeType.split(';')[0].trim();
    return mimeMap[baseMimeType] || 'mp3';
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setHasRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  return (
    <div style={{
      padding: '20px',
      background: 'var(--surface)',
      border: '2px solid var(--border)',
      borderRadius: 12,
      marginBottom: 20
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16,
        flexWrap: 'wrap'
      }}>
        {/* Mikrofon/Stop Button */}
        <button
          onClick={() => {
            if (!isRecording) {
              startRecording();
            } else if (isPaused) {
              resumeRecording();
            } else {
              pauseRecording();
            }
          }}
          disabled={hasRecording}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: 'none',
            background: !isRecording 
              ? 'var(--primary-blue)' 
              : isPaused 
                ? 'var(--primary-green)' 
                : 'var(--primary-orange)',
            color: 'white',
            fontSize: 28,
            cursor: hasRecording ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
            transition: 'all 0.3s ease',
            opacity: hasRecording ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!hasRecording) {
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={
            !isRecording 
              ? 'Aufnahme starten' 
              : isPaused 
                ? 'Aufnahme fortsetzen' 
                : 'Aufnahme pausieren'
          }
        >
          {!isRecording ? '🎤' : isPaused ? '▶️' : '⏸️'}
        </button>

        {/* Stop/Fertigstellen Button */}
        {isRecording && (
          <button
            onClick={stopRecording}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: 'none',
              background: 'var(--error)',
              color: 'white',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-lg)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Aufnahme beenden"
          >
            ⏹️
          </button>
        )}

        {/* Timer */}
        {(isRecording || hasRecording) && (
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            fontFamily: 'monospace',
            color: isRecording && !isPaused ? 'var(--error)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            {isRecording && !isPaused && (
              <span style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'var(--error)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            )}
            {formatTime(recordingTime)}
          </div>
        )}

        {/* Status Text */}
        <div style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          fontWeight: 500
        }}>
          {!isRecording && !hasRecording && 'Klicken Sie auf das Mikrofon, um die Aufnahme zu starten'}
          {isRecording && !isPaused && '🔴 Aufnahme läuft...'}
          {isRecording && isPaused && '⏸️ Aufnahme pausiert'}
          {hasRecording && '✅ Aufnahme abgeschlossen'}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: 'var(--error)',
          color: 'white',
          borderRadius: 8,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && hasRecording && (
        <div style={{
          marginTop: 20,
          padding: 16,
          background: 'var(--background)',
          borderRadius: 8,
          border: '1px solid var(--border)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            marginBottom: 12 
          }}>
            <span style={{ 
              fontSize: 14, 
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}>
              🎵 Aufnahme-Vorschau:
            </span>
          </div>
          <audio 
            controls 
            src={audioUrl}
            style={{ 
              width: '100%',
              marginBottom: 12
            }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={deleteRecording}
              style={{
                padding: '8px 16px',
                background: 'var(--error)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              🗑️ Aufnahme löschen
            </button>
            <button
              onClick={handleFinish}
              style={{
                padding: '8px 16px',
                background: 'var(--primary-green)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              ✓ Aufnahme verwenden
            </button>
          </div>
        </div>
      )}

      {/* CSS Animation für Pulse-Effekt */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}

