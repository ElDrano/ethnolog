-- Vollständiges Setup für E-Mail-Adressen-Abruf
-- Dieses Skript erstellt sowohl die View als auch die RPC-Funktion
-- WICHTIG: Führen Sie dieses Skript im Supabase SQL Editor aus!

-- ============================================
-- 1. VIEW ERSTELLEN
-- ============================================
-- Entferne die View falls sie existiert
DROP VIEW IF EXISTS public.user_emails CASCADE;

-- Erstelle die View neu
-- WICHTIG: Views können nicht direkt auf auth.users zugreifen
-- Daher erstellen wir eine Funktion, die die View verwendet
CREATE OR REPLACE FUNCTION public.get_user_emails_for_view()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  email_lower TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id::UUID as user_id,
    u.email::TEXT as email,
    LOWER(TRIM(u.email))::TEXT as email_lower
  FROM auth.users u;
END;
$$;

-- Erstelle die View, die die Funktion verwendet
CREATE VIEW public.user_emails AS
SELECT * FROM public.get_user_emails_for_view();

-- Setze Sicherheitseinstellungen für die View
ALTER VIEW public.user_emails SET (security_invoker = true);

-- Berechtigungen für die View
GRANT SELECT ON public.user_emails TO authenticated;
GRANT SELECT ON public.user_emails TO anon;

-- Berechtigungen für die Hilfsfunktion
GRANT EXECUTE ON FUNCTION public.get_user_emails_for_view() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_emails_for_view() TO anon;

-- ============================================
-- 2. RPC-FUNKTION ERSTELLEN
-- ============================================
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

-- Berechtigungen für die RPC-Funktion
GRANT EXECUTE ON FUNCTION get_user_emails TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_emails TO anon;

-- ============================================
-- 3. TEST-ABFRAGE (optional, zum Testen)
-- ============================================
-- Diese Zeile können Sie auskommentieren, um zu testen:
-- SELECT * FROM public.user_emails LIMIT 5;

