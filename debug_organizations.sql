-- TEMPORÄRE DEBUGGING-POLICY für organizations
-- WARNUNG: Nur für Debugging verwenden, nicht für Produktion!

-- Entfernen Sie alle bestehenden Policies
DROP POLICY IF EXISTS "Organizations viewable by members" ON organizations;
DROP POLICY IF EXISTS "Organizations insertable by authenticated" ON organizations;
DROP POLICY IF EXISTS "Organizations updatable by owner" ON organizations;
DROP POLICY IF EXISTS "Organizations deletable by owner" ON organizations;

-- Erstellen Sie eine sehr permissive Policy (NUR FÜR DEBUGGING!)
CREATE POLICY "Debug: Allow all operations" ON organizations
    FOR ALL USING (true);

-- Überprüfen Sie die Policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'organizations';

-- Testen Sie, ob Sie jetzt Organisationen sehen können
SELECT COUNT(*) FROM organizations;
