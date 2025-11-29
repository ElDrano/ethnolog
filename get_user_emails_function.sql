-- Funktion zum Abrufen von E-Mail-Adressen für eine Liste von user_ids
-- Diese Funktion ermöglicht es, E-Mail-Adressen für Mitglieder abzurufen

CREATE OR REPLACE FUNCTION get_user_emails(p_user_ids UUID[])
RETURNS TABLE (
  user_id UUID,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id::UUID as user_id,
    u.email::TEXT as email
  FROM auth.users u
  WHERE u.id = ANY(p_user_ids);
END;
$$;

-- Kommentar hinzufügen
COMMENT ON FUNCTION get_user_emails IS 'Gibt E-Mail-Adressen für eine Liste von user_ids zurück';

-- Berechtigungen setzen
GRANT EXECUTE ON FUNCTION get_user_emails TO authenticated;

