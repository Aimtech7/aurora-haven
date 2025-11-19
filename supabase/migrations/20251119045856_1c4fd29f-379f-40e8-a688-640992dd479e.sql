-- Create storage bucket for evidence uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false);

-- Create storage policies for anonymous uploads
CREATE POLICY "Anyone can upload evidence"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'evidence');

-- Policy to prevent reading evidence (privacy protection)
CREATE POLICY "No one can read evidence"
ON storage.objects FOR SELECT
TO anon
USING (false);