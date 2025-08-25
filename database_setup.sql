-- Erstelle die available_tags Tabelle
CREATE TABLE IF NOT EXISTS available_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle einen Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_available_tags_name ON available_tags(name);

-- Füge die vordefinierten Tags hinzu (nur wenn sie noch nicht existieren)
INSERT INTO available_tags (name) VALUES 
    ('formell'),
    ('informell'),
    ('extern')
ON CONFLICT (name) DO NOTHING;

-- Erstelle eine Funktion zum automatischen Aktualisieren des updated_at Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Erstelle einen Trigger für die available_tags Tabelle
CREATE TRIGGER update_available_tags_updated_at 
    BEFORE UPDATE ON available_tags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Erstelle RLS (Row Level Security) Policies
ALTER TABLE available_tags ENABLE ROW LEVEL SECURITY;

-- Erlaube allen authentifizierten Benutzern das Lesen von Tags
CREATE POLICY "Allow authenticated users to read available_tags" ON available_tags
    FOR SELECT USING (auth.role() = 'authenticated');

-- Erlaube allen authentifizierten Benutzern das Erstellen neuer Tags
CREATE POLICY "Allow authenticated users to insert available_tags" ON available_tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Erlaube allen authentifizierten Benutzern das Aktualisieren von Tags
CREATE POLICY "Allow authenticated users to update available_tags" ON available_tags
    FOR UPDATE USING (auth.role() = 'authenticated');
