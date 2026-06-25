# Portfolio CMS — Schema Reference

> **Prioridade do skill:** campos de texto em `project_translations`. Mídia, diagramas separados e downloads são opcionais — o usuário adiciona manualmente se quiser.

## How Projects Are Registered

### Data flow

```
Admin UI (/admin/projects/new)
  → POST /api/projects
  → Supabase tables: projects + project_translations + junctions + images
  → Public page: /projetos/[slug] (pt-BR) | /projects/[slug] (en)
```

### Database tables

| Table | Purpose |
|---|---|
| `projects` | Core record: slug, URLs, status, cover, legacy PT fields |
| `project_translations` | Bilingual content per `language` (`pt-BR`, `en`) |
| `project_technologies` | M:N with `technologies` |
| `project_tags` | M:N with `tags` |
| `project_images` | Gallery images with caption and order |

### `projects` columns

| Column | Type | Required | Notes |
|---|---|---|---|
| `slug` | text | yes | Unique, kebab-case |
| `title` | text | yes | Legacy; synced from PT translation |
| `cover_image_url` | text | no | Supabase public URL |
| `repo_url` | text | no | GitHub/GitLab |
| `deploy_url` | text | no | Live demo |
| `is_featured` | boolean | no | Home highlight |
| `display_order` | int | no | Sort ascending |
| `status` | enum | no | `dev`, `concluido`, `pausado`, `arquivado` |
| `is_active` | boolean | no | Published flag |
| `meta_keywords` | text[] | no | SEO keywords array |

### `project_translations` columns

| Column | Type | Notes |
|---|---|---|
| `language` | enum | `pt-BR` or `en` |
| `title` | text | Required |
| `subtitle` | text | Optional tagline |
| `short_description` | text | Card preview (≤300) |
| `full_description` | text | **Markdown body — deliverable principal.** Suporta headings, listas, tabelas, code blocks e blocos ` ```mermaid ` inline |
| `meta_description` | text | SEO (≤160) |
| `diagrams` | jsonb | Opcional — aba separada no admin. Preferir Mermaid inline dentro de `full_description` |
| `downloads` | jsonb | Opcional — arquivos anexos |

### `project_images` columns

| Column | Type | Notes |
|---|---|---|
| `image_url` | text | Public URL |
| `caption` | text | Optional alt/caption |
| `display_order` | int | Carousel order |

---

## Content Types You Can Insert

### 1. Text content (bilingual)

| Field | Where shown | Format |
|---|---|---|
| Title | Page H1, cards, SEO title | Plain text |
| Subtitle | Below title | Plain text |
| Short description | Project grid cards | Plain text |
| Full description | Details tab | **Markdown** (headings, lists, code blocks, links) |
| Meta description | `<meta>` / OpenGraph | Plain text |

### 2. Diagrams (Mermaid)

Stored in `project_translations.diagrams[]`:

```json
{
  "title": "Diagrama de Arquitetura",
  "code": "graph TB\n  A[Frontend] --> B[API]"
}
```

Rendered by `MermaidRenderer` on the Diagrams tab. Supported diagram types: `graph`, `flowchart`, `sequenceDiagram`, `classDiagram`, `stateDiagram`, `erDiagram`.

### 3. Downloads

Stored in `project_translations.downloads[]`:

```json
{
  "label": "Baixar Fluxo n8n (JSON)",
  "file_url": "https://...supabase.co/storage/v1/object/public/projects/downloads/...",
  "description": "Workflow completo com todos os nós."
}
```

Upload via admin → `POST /api/upload` with `bucket=projects`, `folder=downloads`.

### 4. Cover image

Single image URL in `projects.cover_image_url`.

- Bucket: `projects`
- Folder: `covers`
- Allowed MIME: JPEG, PNG, GIF, WebP, SVG
- Aspect ratio in admin: 16:9 (video)

### 5. Gallery images

Multiple records in `project_images`.

- Bucket: `projects`
- Folder: `gallery`
- Same image MIME types as cover
- Drag-and-drop reorder in admin

### 6. Technologies

Linked via `project_technologies`. Categories:

| Category | Examples |
|---|---|
| `language` | TypeScript, Python |
| `framework` | Next.js, React, Django |
| `lib` | LangChain, Framer Motion |
| `db` | PostgreSQL, Supabase |
| `tool` | Docker, Git, Vercel |
| `other` | Misc |

Each has: `name`, `slug`, `color_hex`, `icon_class`.

### 7. Tags

Linked via `project_tags`. Subject/topic labels (e.g. "Automação", "Fintech", "DevOps"). Bilingual via `tag_translations`.

### 8. Links

| Field | Purpose |
|---|---|
| `repo_url` | Source code button |
| `deploy_url` | Live demo button |

---

## Storage Buckets

| Bucket | Folders | Allowed types (DB policy) | API upload types (broader) |
|---|---|---|---|
| `projects` | `covers/`, `gallery/`, `downloads/` | Images only (JPEG, PNG, GIF, WebP, SVG) | Images + PDF, JSON, ZIP, RAR, TXT, MD, JS, HTML, CSS, Office docs, octet-stream |
| `blog` | article images | Images | Same as projects |
| `avatars` | `{user_id}/` | JPEG, PNG, WebP (2MB) | — |
| `resumes` | PDF CVs | — | PDF |

**Note:** The `projects` bucket DB policy restricts to images, but `/api/upload` accepts additional MIME types for the `downloads/` folder. Downloads of JSON, PDF, ZIP work through the API route.

### Upload API

```
POST /api/upload
FormData: file, bucket, folder
Response: { data: { path, url } }
```

Requires authenticated admin session.

---

## API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/projects?include_translations=true` | no | List with all translations |
| POST | `/api/projects` | yes | Create project |
| PUT | `/api/projects/[id]` | yes | Update project |
| POST | `/api/admin/ai` | yes | Translate, SEO, suggest tags |

### POST /api/projects body shape

```typescript
{
  slug: string
  cover_image_url?: string | null
  repo_url?: string | null
  deploy_url?: string | null
  is_featured: boolean
  display_order: number
  status: 'dev' | 'concluido' | 'pausado' | 'arquivado'
  is_active: boolean
  technology_ids?: number[]
  tag_ids?: number[]
  images?: { id?: number; image_url: string; caption?: string; display_order: number }[]
  translations: {
    pt: ProjectTranslationInput  // required
    en?: ProjectTranslationInput // optional
  }
}
```

---

## Public Page Layout

Route: `/[locale]/projetos/[slug]`

| Section | Source |
|---|---|
| Sidebar: cover, actions, status, date, views | `projects` |
| Sidebar: technologies, tags | Relations |
| Main: title, subtitle | Current locale translation |
| Tab: Details | `full_description` (Markdown) |
| Tab: Diagrams | `diagrams[]` (if any) |
| Tab: Downloads | `downloads[]` (if any) |
| Tab: Gallery | `project_images[]` (if any) |

---

## Current Portfolio Stats (reference)

- 5 active projects registered
- 47 technologies, 36 tags in taxonomy
- Admin: `https://www.devjoaomarcos.com/admin/projects`
