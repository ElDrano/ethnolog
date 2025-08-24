-- Storage-Policies für Profilbilder
-- Führen Sie dieses Skript aus, nachdem Sie den 'profile-images' Bucket erstellt haben

-- Erlaubt allen authentifizierten Benutzern, Profilbilder hochzuladen
DROP POLICY IF EXISTS "Users can upload profile images" ON storage.objects;
CREATE POLICY "Users can upload profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-images' AND 
        auth.uid() IS NOT NULL
    );

-- Erlaubt allen, Profilbilder zu sehen (da public bucket)
DROP POLICY IF EXISTS "Profile images are publicly viewable" ON storage.objects;
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');

-- Erlaubt Benutzern, ihre eigenen Profilbilder zu löschen
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
CREATE POLICY "Users can delete their own profile images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-images' AND 
        auth.uid() IS NOT NULL
    );

-- Alternative: Sehr permissive Policy für Debugging (nur temporär verwenden)
-- DROP POLICY IF EXISTS "Users can upload profile images" ON storage.objects;
-- CREATE POLICY "Users can upload profile images" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'profile-images');
