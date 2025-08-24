-- RLS-Policies für organization_members Tabelle
-- Führen Sie dieses Skript nach fix_organizations_rls.sql aus

-- 1. Überprüfen Sie die aktuellen Policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'organization_members';

-- 2. Entfernen Sie alle bestehenden Policies für organization_members
DROP POLICY IF EXISTS "Organization members viewable by org members" ON organization_members;
DROP POLICY IF EXISTS "Organization members insertable by org admins" ON organization_members;
DROP POLICY IF EXISTS "Organization members updatable by org admins" ON organization_members;
DROP POLICY IF EXISTS "Organization members deletable by org admins" ON organization_members;

-- 3. Erstellen Sie neue Policies für organization_members

-- Policy für SELECT (Anzeigen von Mitgliedern)
CREATE POLICY "Organization members viewable by org members" ON organization_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        organization_id IN (
            SELECT id FROM organizations WHERE created_by = auth.uid()
        )
    );

-- Policy für INSERT (Hinzufügen von Mitgliedern)
CREATE POLICY "Organization members insertable by org admins" ON organization_members
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT id FROM organizations WHERE created_by = auth.uid()
        )
    );

-- Policy für UPDATE (Bearbeiten von Mitgliedern)
CREATE POLICY "Organization members updatable by org admins" ON organization_members
    FOR UPDATE USING (
        organization_id IN (
            SELECT id FROM organizations WHERE created_by = auth.uid()
        )
    );

-- Policy für DELETE (Entfernen von Mitgliedern)
CREATE POLICY "Organization members deletable by org admins" ON organization_members
    FOR DELETE USING (
        organization_id IN (
            SELECT id FROM organizations WHERE created_by = auth.uid()
        )
    );

-- 4. Überprüfen Sie die neuen Policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'organization_members';
