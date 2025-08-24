-- RLS-Policies für organizations Tabelle korrigieren
-- Führen Sie dieses Skript aus, wenn Organisationen nicht geladen werden können

-- 1. Überprüfen Sie die aktuellen Policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'organizations';

-- 2. Entfernen Sie alle bestehenden Policies für organizations
DROP POLICY IF EXISTS "Organizations viewable by members" ON organizations;
DROP POLICY IF EXISTS "Organizations insertable by authenticated" ON organizations;
DROP POLICY IF EXISTS "Organizations updatable by owner" ON organizations;
DROP POLICY IF EXISTS "Organizations deletable by owner" ON organizations;

-- 3. Erstellen Sie neue, verbesserte Policies

-- Policy für SELECT (Anzeigen von Organisationen)
CREATE POLICY "Organizations viewable by members" ON organizations
    FOR SELECT USING (
        created_by = auth.uid()
    );

-- Policy für INSERT (Erstellen von Organisationen)
CREATE POLICY "Organizations insertable by authenticated" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy für UPDATE (Bearbeiten von Organisationen)
CREATE POLICY "Organizations updatable by owner" ON organizations
    FOR UPDATE USING (
        created_by = auth.uid()
    );

-- Policy für DELETE (Löschen von Organisationen)
CREATE POLICY "Organizations deletable by owner" ON organizations
    FOR DELETE USING (
        created_by = auth.uid()
    );

-- 4. Überprüfen Sie die neuen Policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'organizations';

-- 5. Testen Sie die Policies mit einem Beispiel
-- (Ersetzen Sie 'your-user-id' mit einer echten User-ID)
-- SELECT * FROM organizations WHERE created_by = 'your-user-id';
