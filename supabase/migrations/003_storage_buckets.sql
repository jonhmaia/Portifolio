-- Portfolio & Blog Storage Buckets
-- Migration 003: Storage Configuration

-- ===========================================
-- CREATE STORAGE BUCKETS
-- ===========================================

-- Projects bucket for project images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'projects',
    'projects',
    true,
    NULL, -- No limit (free/livre)
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Blog bucket for article images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'blog',
    'blog',
    true,
    NULL, -- No limit (free/livre)
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- STORAGE POLICIES - PROJECTS BUCKET
-- ===========================================

-- Public can view project images
CREATE POLICY "Public can view project images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'projects');

-- Authenticated users can upload project images
CREATE POLICY "Authenticated users can upload project images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'projects');

-- Authenticated users can update project images
CREATE POLICY "Authenticated users can update project images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'projects')
    WITH CHECK (bucket_id = 'projects');

-- Authenticated users can delete project images
CREATE POLICY "Authenticated users can delete project images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'projects');

-- ===========================================
-- STORAGE POLICIES - BLOG BUCKET
-- ===========================================

-- Public can view blog images
CREATE POLICY "Public can view blog images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'blog');

-- Authenticated users can upload blog images
CREATE POLICY "Authenticated users can upload blog images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'blog');

-- Authenticated users can update blog images
CREATE POLICY "Authenticated users can update blog images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'blog')
    WITH CHECK (bucket_id = 'blog');

-- Authenticated users can delete blog images
CREATE POLICY "Authenticated users can delete blog images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'blog');

-- ===========================================
-- STORAGE POLICIES - AVATARS BUCKET
-- ===========================================

-- Public can view avatars
CREATE POLICY "Public can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
