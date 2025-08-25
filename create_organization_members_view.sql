-- View für organization_members mit Benutzerdaten
-- Diese View verbindet organization_members mit auth.users

CREATE OR REPLACE VIEW organization_members_with_users AS
SELECT 
    om.id,
    om.organization_id,
    om.user_id,
    om.role,
    om.joined_at,
    u.email,
    u.raw_user_meta_data as user_metadata
FROM organization_members om
LEFT JOIN auth.users u ON om.user_id = u.id
WHERE (
    om.organization_id IN (
        SELECT id FROM organizations WHERE created_by = auth.uid()
    ) OR
    om.user_id = auth.uid()
);

-- Testen Sie die View
-- SELECT * FROM organization_members_with_users LIMIT 5;
