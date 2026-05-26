-- Migration 007: Homepage and Skills Dynamic Configuration

-- ===========================================
-- CREATE HOMEPAGE_DATA TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.homepage_data (
    id INT PRIMARY KEY DEFAULT 1,
    avatar_url TEXT,
    email TEXT DEFAULT 'contato@maiainteligencia.com',
    github_url TEXT DEFAULT 'https://github.com/jonhmaia',
    linkedin_url TEXT DEFAULT 'https://www.linkedin.com/in/joaomarcosmaia',
    
    -- Portuguese texts
    name_pt TEXT DEFAULT 'João Marcos',
    location_pt TEXT DEFAULT 'Goiânia, GO, Brasil',
    role_pt TEXT DEFAULT 'DESENVOLVEDOR FULL-STACK',
    about_title_pt TEXT DEFAULT 'SOBRE',
    about_subtitle_pt TEXT DEFAULT 'Conheça um pouco sobre mim',
    bio_pt TEXT,
    
    -- English texts
    name_en TEXT DEFAULT 'João Marcos',
    location_en TEXT DEFAULT 'Goiânia, GO, Brazil',
    role_en TEXT DEFAULT 'FULL-STACK DEVELOPER',
    about_title_en TEXT DEFAULT 'ABOUT',
    about_subtitle_en TEXT DEFAULT 'Get to know me',
    bio_en TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT one_row CHECK (id = 1)
);

-- ===========================================
-- CREATE SKILLS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.skills (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    progress INT NOT NULL CHECK (progress >= 0 AND progress <= 100),
    color TEXT DEFAULT '#3ECF8E' NOT NULL,
    icon_type TEXT NOT NULL CHECK (icon_type IN ('url', 'embed', 'upload')),
    icon_value TEXT,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ===========================================
-- ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.homepage_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- CREATE RLS POLICIES
-- ===========================================

-- Read access is public for both tables
DROP POLICY IF EXISTS "Homepage data is viewable by everyone" ON public.homepage_data;
CREATE POLICY "Homepage data is viewable by everyone"
    ON public.homepage_data FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Skills are viewable by everyone" ON public.skills;
CREATE POLICY "Skills are viewable by everyone"
    ON public.skills FOR SELECT
    USING (true);

-- Write access is restricted to authenticated users
DROP POLICY IF EXISTS "Homepage data is manageable by authenticated users" ON public.homepage_data;
CREATE POLICY "Homepage data is manageable by authenticated users"
    ON public.homepage_data FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Skills are manageable by authenticated users" ON public.skills;
CREATE POLICY "Skills are manageable by authenticated users"
    ON public.skills FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ===========================================
-- ATTACH UPDATED_AT TRIGGERS
-- ===========================================

DROP TRIGGER IF EXISTS update_homepage_data_updated_at ON public.homepage_data;
CREATE TRIGGER update_homepage_data_updated_at
    BEFORE UPDATE ON public.homepage_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_skills_updated_at ON public.skills;
CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SEED INITIAL DATA
-- ===========================================

-- Seed homepage data
INSERT INTO public.homepage_data (
    id, 
    avatar_url, 
    email, 
    github_url, 
    linkedin_url,
    name_pt, location_pt, role_pt, about_title_pt, about_subtitle_pt, bio_pt,
    name_en, location_en, role_en, about_title_en, about_subtitle_en, bio_en
) VALUES (
    1,
    '/foto.jpeg',
    'contato@maiainteligencia.com',
    'https://github.com/jonhmaia',
    'https://www.linkedin.com/in/joaomarcosmaia',
    
    'João Marcos',
    'Goiânia, GO, Brasil',
    'DESENVOLVEDOR FULL-STACK',
    'SOBRE',
    'Conheça um pouco sobre mim',
    'Profissional com sólida atuação em **Engenharia de Software e Produtos Digitais**, combinando a robustez do desenvolvimento Full Stack (Python/Node/C) com a agilidade de estratégias Low-Code (Bubble/n8n). Especialista em transformar tecnologia em vantagem competitiva, atuando estrategicamente na interseção entre Engenharia de Vendas, Desenvolvimento de Produto e Inteligência Artificial.

Coautor de pesquisa científica em **IA Generativa e NLP (WebMedia 2025)**, com competência comprovada em Liderança Técnica (Head of Tech) e execução de projetos de alta complexidade. Histórico de sucesso na arquitetura de plataformas para nichos regulados (Fintech e LegalTech), promovendo alinhamento entre visão de negócio e execução técnica para garantir entregas escaláveis e orientadas a ROI.

Reconhecido pela forte capacidade de implementar **Engenharia de Receita**, orquestrando ecossistemas de automação e integração (n8n) que otimizam funis de vendas e reduziram o tempo de deploy de clientes em 99% (de horas para segundos). Expertise em Fine-Tuning de LLMs, Governança de Dados e Observabilidade, traduzindo demandas complexas em sistemas resilientes.

Possui experiência prática e habilidade para otimizar processos operacionais através de **Hiperautomação e Agentes Autônomos**, implementando melhores práticas de segurança e desenvolvendo métricas de desempenho para monitorar a eficiência operacional.',
    
    'João Marcos',
    'Goiânia, GO, Brazil',
    'FULL-STACK DEVELOPER',
    'ABOUT',
    'Get to know me',
    'Professional with strong experience in **Software Engineering and Digital Products**, combining the robustness of Full Stack development (Python/Node/C) with the agility of Low-Code strategies (Bubble/n8n). Specialized in turning technology into competitive advantage, acting strategically at the intersection of Sales Engineering, Product Development and Artificial Intelligence.

Co-author of scientific research in **Generative AI and NLP (WebMedia 2025)**, with proven capability in Technical Leadership (Head of Tech) and execution of high-complexity projects. Track record in architecting platforms for regulated niches (Fintech and LegalTech), aligning business vision with technical execution to deliver scalable, ROI-driven outcomes.

Recognized for a strong ability to implement **Revenue Engineering**, orchestrating automation and integration ecosystems (n8n) that optimize sales funnels and reduced customer deployment time by 99% (from hours to seconds). Experienced in LLM fine-tuning, Data Governance and Observability, translating complex demands into resilient systems.

Hands-on experience optimizing operational processes through **Hyperautomation and Autonomous Agents**, implementing security best practices and developing performance metrics to monitor operational efficiency.'
) ON CONFLICT (id) DO NOTHING;

-- Seed skills data
INSERT INTO public.skills (name, progress, color, icon_type, icon_value, display_order) VALUES
('Python', 95, '#3776AB', 'url', '/python.png', 1),
('JavaScript', 90, '#F7DF1E', 'url', '/javascript.png', 2),
('Django', 85, '#092E20', 'url', '/django.png', 3),
('Node.js', 88, '#339933', 'url', '/nodejs.png', 4),
('HTML5', 92, '#E34F26', 'url', '/html.png', 5),
('CSS3', 90, '#1572B6', 'url', '/css.png', 6),
('PostgreSQL', 85, '#4169E1', 'url', '/postgres.png', 7),
('Docker', 80, '#2496ED', 'url', '/docker.png', 8),
('N8N', 98, '#FF2A7A', 'url', '/n8n_logo.svg', 9),
('Bubble.io', 90, '#03C2C2', 'url', '/bubbleio.png', 10),
('Supabase', 90, '#3ECF8E', 'embed', '<svg viewBox="0 0 24 24" fill="currentColor" color="#3ECF8E"><path d="M12 2L2 12h8v10l10-10h-8V2z"/></svg>', 11),
('C/C++', 80, '#00599C', 'url', '/c.png', 12),
('SQL', 88, '#00758F', 'embed', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>', 13),
('MCP', 85, '#FF8C00', 'url', '/mcp.png', 14),
('GitHub', 90, '#A0A0A0', 'embed', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>', 15),
('Lovable', 90, '#E01E5A', 'url', '/lovable.png', 16),
('Flutter', 80, '#02569B', 'url', '/flutter.svg', 17),
('Bootstrap', 85, '#7952B3', 'url', '/bootsstrap.png', 18);
