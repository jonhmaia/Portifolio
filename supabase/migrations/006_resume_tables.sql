-- ===========================================
-- RESUME TABLES
-- Sistema de currículo dinâmico bilingue PT-BR/EN
-- ===========================================

CREATE TABLE IF NOT EXISTS public.resume_data (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    language content_language NOT NULL UNIQUE,
    role TEXT NOT NULL,
    summary TEXT NOT NULL, -- resumo profissional em HTML/Markdown
    experiences JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de experiências [{ company, role, period, items: [] }]
    featured_projects JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de projetos [{ title, subtitle, description, techs: [] }]
    education JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de educação [{ institution, degree, period, description }]
    skills JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de habilidades [{ title, tags: [] }]
    languages JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de idiomas [{ name, level }]
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.resume_data ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Resume data is viewable by everyone" ON public.resume_data;
CREATE POLICY "Resume data is viewable by everyone"
    ON public.resume_data FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Resume data is manageable by authenticated users" ON public.resume_data;
CREATE POLICY "Resume data is manageable by authenticated users"
    ON public.resume_data FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_resume_data_updated_at ON public.resume_data;
CREATE TRIGGER update_resume_data_updated_at
    BEFORE UPDATE ON public.resume_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
