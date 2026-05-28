-- Migration: Add project assets (diagrams and downloads) to project_translations
ALTER TABLE project_translations 
ADD COLUMN IF NOT EXISTS diagrams jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS downloads jsonb DEFAULT '[]'::jsonb;
