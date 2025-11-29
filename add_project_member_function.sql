-- Funktion zum Hinzufügen eines Benutzers zu einem Projekt per E-Mail
-- Diese Funktion findet den Benutzer anhand der E-Mail-Adresse und fügt ihn zum Projekt hinzu
-- 
-- WICHTIG: Diese Funktion muss im Supabase SQL Editor ausgeführt werden!
-- 1. Öffnen Sie Ihr Supabase Dashboard
-- 2. Gehen Sie zu "SQL Editor"
-- 3. Kopieren Sie dieses gesamte Skript
-- 4. Führen Sie es aus

-- Zuerst erstellen wir eine View, die E-Mail-Adressen verfügbar macht
-- Dies ist notwendig, da auth.users nicht direkt abgefragt werden kann
-- Falls die View bereits existiert, wird sie ersetzt
DROP VIEW IF EXISTS public.user_emails;

CREATE VIEW public.user_emails AS
SELECT 
  id as user_id,
  email,
  LOWER(TRIM(email)) as email_lower
FROM auth.users;

-- RLS für die View (optional, aber empfohlen)
ALTER VIEW public.user_emails SET (security_invoker = true);

-- Jetzt die Funktion, die die View verwendet
CREATE OR REPLACE FUNCTION add_user_to_project_by_email(
  p_projekt_id UUID,
  p_user_email TEXT,
  p_role TEXT DEFAULT 'read'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_member_id UUID;
  v_email_normalized TEXT;
BEGIN
  -- Normalisiere die E-Mail-Adresse
  v_email_normalized := LOWER(TRIM(p_user_email));
  
  -- Finde die user_id anhand der E-Mail-Adresse über die View
  SELECT user_id INTO v_user_id
  FROM public.user_emails
  WHERE email_lower = v_email_normalized
  LIMIT 1;
  
  -- Falls nicht gefunden, versuche direkten Zugriff auf auth.users
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE LOWER(TRIM(email)) = v_email_normalized
    LIMIT 1;
  END IF;
  
  -- Prüfe, ob der Benutzer gefunden wurde
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Benutzer mit E-Mail % nicht gefunden. Bitte stellen Sie sicher, dass der Benutzer registriert ist.', p_user_email;
  END IF;
  
  -- Prüfe, ob das Projekt existiert
  IF NOT EXISTS (SELECT 1 FROM public.projekte WHERE id = p_projekt_id) THEN
    RAISE EXCEPTION 'Projekt nicht gefunden';
  END IF;
  
  -- Prüfe, ob der Benutzer bereits Mitglied ist
  SELECT id INTO v_member_id
  FROM public.projekt_user
  WHERE projekt_id = p_projekt_id
    AND user_id = v_user_id;
  
  IF v_member_id IS NOT NULL THEN
    RAISE EXCEPTION 'Benutzer ist bereits Mitglied dieses Projekts';
  END IF;
  
  -- Validiere die Rolle gegen das CHECK-Constraint
  -- Typische Rollen: 'read', 'write' (nicht 'member')
  IF p_role NOT IN ('read', 'write') THEN
    -- Falls 'member' übergeben wurde, verwende 'read' als Standard
    p_role := 'read';
  END IF;
  
  -- Füge den Benutzer zum Projekt hinzu
  INSERT INTO public.projekt_user (projekt_id, user_id, role)
  VALUES (p_projekt_id, v_user_id, p_role)
  RETURNING id INTO v_member_id;
  
  RETURN v_member_id;
END;
$$;

-- Kommentar hinzufügen
COMMENT ON FUNCTION add_user_to_project_by_email IS 'Fügt einen Benutzer anhand seiner E-Mail-Adresse zu einem Projekt hinzu';

-- Berechtigungen setzen
GRANT EXECUTE ON FUNCTION add_user_to_project_by_email TO authenticated;
GRANT SELECT ON public.user_emails TO authenticated;

