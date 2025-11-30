-- Debug-Skript: Prüft, ob ein Benutzer mit einer bestimmten E-Mail existiert
-- Verwenden Sie dies, um zu testen, ob die E-Mail-Adresse korrekt ist

-- Beispiel: Ersetzen Sie 'test@example.com' mit der E-Mail-Adresse, die Sie suchen
SELECT 
  id,
  email,
  LOWER(TRIM(email)) as email_normalized,
  created_at
FROM auth.users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('test@example.com'));

-- Alternative: Zeigen Sie alle Benutzer an (für Debugging)
-- SELECT id, email, LOWER(TRIM(email)) as email_normalized FROM auth.users ORDER BY created_at DESC;

