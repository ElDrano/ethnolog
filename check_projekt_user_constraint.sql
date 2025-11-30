-- Prüft das CHECK-Constraint auf der projekt_user Tabelle
-- Zeigt, welche Rollen erlaubt sind

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'projekt_user'::regclass
  AND contype = 'c';

-- Alternative: Zeigt die Tabellendefinition
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'projekt_user'
  AND column_name = 'role';

