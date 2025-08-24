-- Organisations- und Profilsystem für Supabase
-- Hinweis: Profilinformationen werden in auth.users.user_metadata gespeichert
-- (display_name, bio, profile_image_url)

-- Erstelle organizations Tabelle
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle organization_members Tabelle
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Erweitere projekte Tabelle um organization_id
ALTER TABLE projekte ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Erstelle Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projekte_organization_id ON projekte(organization_id);

-- RLS Policies für organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Organisationsmitglieder können ihre Organisationen sehen
CREATE POLICY "Organizations viewable by members" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organizations.id 
            AND user_id = auth.uid()
        )
    );

-- Authentifizierte Benutzer können Organisationen erstellen
CREATE POLICY "Organizations insertable by authenticated" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Organisationsbesitzer und Admins können ihre Organisationen bearbeiten
CREATE POLICY "Organizations updatable by owner and admins" ON organizations
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organizations.id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Nur Organisationsbesitzer können ihre Organisationen löschen
CREATE POLICY "Organizations deletable by owner" ON organizations
    FOR DELETE USING (created_by = auth.uid());

-- RLS Policies für organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Organisationsmitglieder können Mitglieder ihrer Organisationen sehen
CREATE POLICY "Organization members viewable by org members" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om2
            WHERE om2.organization_id = organization_members.organization_id 
            AND om2.user_id = auth.uid()
        )
    );

-- Organisationsbesitzer und Admins können Mitglieder hinzufügen
CREATE POLICY "Organization members insertable by org admins" ON organization_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organization_members.organization_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Organisationsbesitzer und Admins können Mitglieder bearbeiten
CREATE POLICY "Organization members updatable by org admins" ON organization_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organization_members.organization_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Organisationsbesitzer und Admins können Mitglieder entfernen
CREATE POLICY "Organization members deletable by org admins" ON organization_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organization_members.organization_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- RLS Policy für projekte erweitern (Organisationsprojekte)
-- Bestehende Policies beibehalten und neue hinzufügen

-- Organisationsmitglieder können Projekte ihrer Organisationen sehen
CREATE POLICY "Projects viewable by organization members" ON projekte
    FOR SELECT USING (
        organization_id IS NULL OR
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = projekte.organization_id 
            AND user_id = auth.uid()
        )
    );

-- Organisationsmitglieder können Projekte in ihrer Organisation bearbeiten
CREATE POLICY "Projects updatable by organization members" ON projekte
    FOR UPDATE USING (
        organization_id IS NULL OR
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = projekte.organization_id 
            AND user_id = auth.uid()
        )
    );

-- Organisationsmitglieder können Projekte in ihrer Organisation löschen
CREATE POLICY "Projects deletable by organization members" ON projekte
    FOR DELETE USING (
        organization_id IS NULL OR
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = projekte.organization_id 
            AND user_id = auth.uid()
        )
    );

-- Funktion zum Hinzufügen eines Benutzers zu einer Organisation
CREATE OR REPLACE FUNCTION add_user_to_organization(
    p_organization_id UUID,
    p_user_email TEXT,
    p_role TEXT DEFAULT 'member'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_result TEXT;
BEGIN
    -- Finde User-ID basierend auf E-Mail
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = p_user_email;
    
    IF v_user_id IS NULL THEN
        RETURN 'Benutzer mit dieser E-Mail-Adresse nicht gefunden';
    END IF;
    
    -- Prüfe ob Benutzer bereits Mitglied ist
    IF EXISTS (
        SELECT 1 FROM organization_members 
        WHERE organization_id = p_organization_id 
        AND user_id = v_user_id
    ) THEN
        RETURN 'Benutzer ist bereits Mitglied dieser Organisation';
    END IF;
    
    -- Füge Benutzer zur Organisation hinzu
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (p_organization_id, v_user_id, p_role);
    
    RETURN 'Benutzer erfolgreich zur Organisation hinzugefügt';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Fehler beim Hinzufügen des Benutzers: ' || SQLERRM;
END;
$$;

-- Funktion zum Entfernen eines Benutzers aus einer Organisation
CREATE OR REPLACE FUNCTION remove_user_from_organization(
    p_organization_id UUID,
    p_user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result TEXT;
BEGIN
    -- Prüfe ob Benutzer Mitglied ist
    IF NOT EXISTS (
        SELECT 1 FROM organization_members 
        WHERE organization_id = p_organization_id 
        AND user_id = p_user_id
    ) THEN
        RETURN 'Benutzer ist kein Mitglied dieser Organisation';
    END IF;
    
    -- Entferne Benutzer aus der Organisation
    DELETE FROM organization_members 
    WHERE organization_id = p_organization_id 
    AND user_id = p_user_id;
    
    RETURN 'Benutzer erfolgreich aus der Organisation entfernt';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Fehler beim Entfernen des Benutzers: ' || SQLERRM;
END;
$$;

-- Trigger-Funktion für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für organizations
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Zusätzliche Policy für bessere Organisationen-Sichtbarkeit
-- Benutzer können Organisationen sehen, die sie erstellt haben oder Mitglied sind
DROP POLICY IF EXISTS "Organizations viewable by members" ON organizations;
CREATE POLICY "Organizations viewable by members" ON organizations
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organizations.id 
            AND user_id = auth.uid()
        )
    );

-- 9. Beispiel-Daten für Tests (optional)
-- INSERT INTO organizations (name, description, created_by) 
-- VALUES ('Test Organisation', 'Eine Test-Organisation', 'USER_ID_HERE');
