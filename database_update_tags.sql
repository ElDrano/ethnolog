-- Tag-System für Dokumentationen hinzufügen
-- Füge tags Feld zur documentation Tabelle hinzu
ALTER TABLE documentation ADD COLUMN tags JSONB DEFAULT '[]';

-- Index für bessere Performance bei Tag-Suchen
CREATE INDEX idx_documentation_tags ON documentation USING GIN (tags);

-- Kommentar hinzufügen
COMMENT ON COLUMN documentation.tags IS 'Array von Tag-Strings für die Dokumentation';
