-- Dokumentation Tabelle für alle Dokumentationstypen
CREATE TABLE documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projekt_id UUID REFERENCES projekte(id) ON DELETE CASCADE,
  
  -- Grunddaten (alle Typen)
  name VARCHAR(255) NOT NULL,
  beschreibung TEXT,
  datum DATE NOT NULL,
  startzeit TIME,
  endzeit TIME,
  
  -- Typ-Information
  typ VARCHAR(20) NOT NULL CHECK (typ IN ('archiv', 'live')),
  untertyp VARCHAR(20) CHECK (untertyp IN ('meeting', 'interview', 'fieldnote')),
  
  -- Meeting-spezifische Felder
  meeting_typ VARCHAR(20) CHECK (meeting_typ IN ('online', 'offline', 'hybrid')),
  klient VARCHAR(255),
  
  -- Interview-spezifische Felder  
  interview_typ VARCHAR(20) CHECK (interview_typ IN ('online', 'offline', 'hybrid')),
  
  -- Gemeinsame Felder (als JSON)
  personen JSONB, -- Array von Personen-Objekten
  dialoge JSONB,  -- Array von Dialog-Objekten
  kernfragen JSONB, -- Array von Kernfrage-Objekten (nur für Interviews)
  dateien JSONB,  -- Array von Datei-Objekten
  
  -- Metadaten
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für bessere Performance
CREATE INDEX idx_documentation_projekt_id ON documentation(projekt_id);
CREATE INDEX idx_documentation_typ ON documentation(typ);
CREATE INDEX idx_documentation_datum ON documentation(datum);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documentation_updated_at 
    BEFORE UPDATE ON documentation 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer können nur ihre eigenen Dokumentationen sehen
CREATE POLICY "Users can view their own documentation" ON documentation
    FOR SELECT USING (
        projekt_id IN (
            SELECT id FROM projekte 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Benutzer können nur ihre eigenen Dokumentationen erstellen
CREATE POLICY "Users can create documentation for their projects" ON documentation
    FOR INSERT WITH CHECK (
        projekt_id IN (
            SELECT id FROM projekte 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Benutzer können nur ihre eigenen Dokumentationen bearbeiten
CREATE POLICY "Users can update their own documentation" ON documentation
    FOR UPDATE USING (
        projekt_id IN (
            SELECT id FROM projekte 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Benutzer können nur ihre eigenen Dokumentationen löschen
CREATE POLICY "Users can delete their own documentation" ON documentation
    FOR DELETE USING (
        projekt_id IN (
            SELECT id FROM projekte 
            WHERE user_id = auth.uid()
        )
    );
