---
name: portfolio-project-analyzer
description: Analyzes Git repositories and generates portfolio presentation text in PT-BR as Markdown (title, subtitle, descriptions, SEO) for the devjoaomarcos.com CMS. Use when the user wants to add a project to their portfolio, analyze a repo, or generate project copy for /admin/projects.
---

# Portfolio Project Analyzer

Analyzes a repository and produces **presentation text in PT-BR** ready to paste into the portfolio admin (`/admin/projects/new`), aba **Textos**.

The deliverable principal é o texto — não imagens, galeria, arquivos para download nem traduções.

## When to Use

- User shares a repo URL and wants portfolio copy
- User asks to "cadastrar projeto no portfólio" or "gerar texto de apresentação"

## Quick Workflow

```
Task Progress:
- [ ] 1. Read the repository (README, deps, structure)
- [ ] 2. Identify purpose, stack and differentiators
- [ ] 3. Write PT-BR presentation text
- [ ] 4. Suggest slug, technologies and tags (optional)
```

## Step 1 — Repository Analysis

Read enough to understand the project — adapt depth to repo size:

1. `README.md` and dependency files (`package.json`, `pyproject.toml`, etc.)
2. Main source folders and entry points
3. Integrations, deploy target, repo/demo URLs if documented

Extract: **what it does**, **for whom**, **main technologies**, **notable engineering choices**.

Do not invent metrics, clients or URLs not found in the repo.

## Step 2 — Generate Presentation Text (PT-BR)

### Voice

Clear, technical, objective. Describe what was built and why — not marketing hype.

### Fields to produce

| Field | Limit | Purpose |
|---|---|---|
| `title` | 200 | Project name |
| `subtitle` | 200 | One-line summary |
| `short_description` | 300 | Card preview on listing page |
| `full_description` | — | Main presentation (Markdown) |
| `meta_description` | 160 | SEO |

### `full_description` — the core deliverable

This is where architecture, flows and decisions live. **Explain everything in Markdown** — prose, lists, tables and code blocks. Do not depend on external images or a separate diagrams tab.

Suggested structure (adapt sections to the project):

- **Contexto** — problem it solves and for whom
- **O que foi construído** — main features and scope
- **Stack e decisões técnicas** — technologies and rationale (list or table)
- **Como funciona** — architecture and data flow explained in prose and numbered steps; add a simple `mermaid` code block only if it clarifies the text
- **Destaques** — what makes the project technically interesting

**Markdown tools to elucidate the text:**
- Headings (`###`) to organize sections
- Bullet/numbered lists for features and flows
- Tables for stack comparison or layer breakdown
- Inline code for tech names (`Next.js`, `PostgreSQL`)
- Fenced code blocks for config snippets when relevant
- ` ```mermaid ` blocks **inside** `full_description` when a visual helps — keep them simple (5–10 nodes max), only to clarify what the text already explains

Do **not** generate separate diagram entries, screenshot lists, download assets or EN translations unless the user explicitly asks.

## Step 3 — Metadata (secondary)

Only when useful:

- **slug:** kebab-case from title (`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
- **repo_url / deploy_url:** only if found in README or user provided
- **technologies / tags:** suggest names matching existing taxonomy (query MCP `user-supabasePortifolio` if available)

## Output Format

Entregar **somente Markdown legível** — pronto para copiar e colar no admin. **Nunca JSON.**

```
**Slug sugerido:** nome-do-projeto
**Repositório:** https://github.com/... (se encontrado)
**Deploy:** https://... (se encontrado)

**Título:** ...
**Subtítulo:** ...
**Descrição curta:** ...
**Meta descrição:** ...

**Descrição completa:**

### Contexto
...

**Tecnologias sugeridas:** Next.js, Supabase, ...
**Tags sugeridas:** SaaS, Backend, ...
```

Cada campo de texto curto em uma linha com label. A descrição completa vem logo abaixo, em Markdown livre com seções `###`.

## Admin Checklist

```markdown
## Próximos passos
1. `/admin/projects/new` → aba **Textos** (PT-BR)
2. Colar os campos gerados
3. Ajustar slug e URLs na aba **Geral**
4. Selecionar tecnologias/tags na aba **Tecnologias**
5. Usar "Traduzir com IA" no admin se quiser a versão EN
6. Ativar **Publicado** após revisão
```

Mídia (capa, galeria) fica a cargo do usuário — não gerar nem sugerir screenshots.

## MCP (optional)

Use `user-supabasePortifolio` → `execute_sql` to list existing technologies/tags and avoid duplicate slugs. Do not insert into DB unless user asks.

## Anti-patterns

- Do not output JSON — always plain Markdown
- Do not generate EN translations — admin has built-in AI translation
- Do not prioritize diagrams over text
- Do not suggest images, screenshots or downloadable files by default
- Do not exceed character limits
- Do not fabricate deploy URLs or results
- Do not use generic placeholder copy — reflect the actual repo

## Reference

Field limits, CMS schema and optional asset types: [schema-reference.md](schema-reference.md)
Examples: [examples.md](examples.md)
