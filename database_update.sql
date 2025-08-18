-- Dokumentation-Tabelle aktualisieren um NULL Zeiten zu erlauben
ALTER TABLE documentation 
ALTER COLUMN startzeit TYPE time USING 
  CASE 
    WHEN startzeit = '' THEN NULL 
    ELSE startzeit::time 
  END;

ALTER TABLE documentation 
ALTER COLUMN endzeit TYPE time USING 
  CASE 
    WHEN endzeit = '' THEN NULL 
    ELSE endzeit::time 
  END;

-- Kommentar hinzufügen
COMMENT ON COLUMN documentation.startzeit IS 'Startzeit der Dokumentation (optional)';
COMMENT ON COLUMN documentation.endzeit IS 'Endzeit der Dokumentation (optional)';
