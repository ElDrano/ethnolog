-- Storage Bucket auf privat setzen
UPDATE storage.buckets 
SET public = false 
WHERE id = 'documentation-files';

-- Alte öffentliche Policies entfernen
DROP POLICY IF EXISTS "Authenticated users can view documentation files" ON storage.objects;

-- Neue Policies für private Dateien mit Signed URLs
CREATE POLICY "Authenticated users can upload documentation files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documentation-files' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can generate signed URLs for documentation files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documentation-files' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update their own documentation files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documentation-files' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete their own documentation files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documentation-files' AND 
    auth.role() = 'authenticated'
  );
