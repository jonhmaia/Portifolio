-- Migration 008: Add PDF URL to Resume
-- Adiciona coluna de link do PDF no curriculo dinâmico e cria o bucket de storage para os PDFs

-- 1. Adicionar coluna pdf_url na tabela resume_data se não existir
ALTER TABLE public.resume_data ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- 2. Criar bucket de storage para os currículos em PDF
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    true,
    5242880, -- 5MB
    ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- 3. Habilitar políticas de acesso ao bucket 'resumes'
-- O público pode visualizar/baixar os currículos em PDF
CREATE POLICY "Public can view resumes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resumes');

-- Usuários autenticados podem gerenciar (inserir/atualizar/deletar) os currículos em PDF
CREATE POLICY "Authenticated users can upload resumes"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Authenticated users can update resumes"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'resumes')
    WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Authenticated users can delete resumes"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'resumes');
