-- Storage Bucket für Dokumentations-Dateien erstellen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentation-files',
  'documentation-files',
  true,
  52428800, -- 50MB Limit
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage Policies für den Bucket
CREATE POLICY "Authenticated users can upload documentation files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documentation-files' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view documentation files" ON storage.objects
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
