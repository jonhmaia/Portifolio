'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Loader2, 
  ArrowLeft, 
  Save, 
  Eye, 
  Globe, 
  Sparkles, 
  Search, 
  Check, 
  Image as ImageIcon,
  Settings,
  Link2,
  Bookmark,
  Code2,
  Database,
  Cpu,
  Layers,
  Wrench
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import { Github, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils/slugify'
import { ImageUploader } from './image-uploader'
import { GalleryManager, type GalleryImage } from './gallery-manager'
import type { Project, Technology, Tag, ProjectTranslation, ProjectImage } from '@/lib/types/database'

// Schema de tradução
const translationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional(),
  short_description: z.string().optional(),
  full_description: z.string().optional(),
  meta_description: z.string().optional(),
})

// Schema do formulário
const formSchema = z.object({
  slug: z.string().min(1, 'Slug é obrigatório'),
  repo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  deploy_url: z.string().url('URL inválida').optional().or(z.literal('')),
  is_featured: z.boolean(),
  display_order: z.number().int().min(0),
  status: z.enum(['dev', 'concluido', 'pausado', 'arquivado']),
  is_active: z.boolean(),
  translations: z.object({
    pt: translationSchema,
    en: translationSchema.partial().optional(),
  }),
})

type FormData = z.infer<typeof formSchema>

interface ProjectFormProps {
  project?: Project & {
    technology_ids?: number[]
    tag_ids?: number[]
    images?: ProjectImage[]
    translations?: {
      pt?: ProjectTranslation
      en?: ProjectTranslation
    }
  }
  technologies: Technology[]
  tags: Tag[]
}

export function ProjectForm({ project, technologies, tags }: ProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // IA States
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({})
  const [isTranslatingAll, setIsTranslatingAll] = useState(false)
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false)
  const [isSuggestingTags, setIsSuggestingTags] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Estados locais para tecnologias e tags
  const [availableTechnologies, setAvailableTechnologies] = useState<Technology[]>(technologies)
  const [availableTags, setAvailableTags] = useState<Tag[]>(tags)

  // Seletores
  const [selectedTechnologies, setSelectedTechnologies] = useState<number[]>(
    project?.technology_ids || []
  )
  const [selectedTags, setSelectedTags] = useState<number[]>(project?.tag_ids || [])
  const [techSearch, setTechSearch] = useState('')
  const [tagSearch, setTagSearch] = useState('')
  
  const [activeTab, setActiveTab] = useState<'pt' | 'en'>('pt')
  
  // Estados para imagens
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    project?.cover_image_url || null
  )
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(
    project?.images?.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      caption: img.caption,
      display_order: img.display_order,
    })) || []
  )

  const isEditing = !!project

  // Extrair traduções existentes ou usar dados legados
  const existingPtTranslation: any = project?.translations?.pt ? {
    title: project.translations.pt.title,
    subtitle: project.translations.pt.subtitle ?? undefined,
    short_description: project.translations.pt.short_description ?? undefined,
    full_description: project.translations.pt.full_description ?? undefined,
    meta_description: project.translations.pt.meta_description ?? undefined,
  } : {
    title: project?.title || '',
    subtitle: project?.subtitle ?? undefined,
    short_description: project?.short_description ?? undefined,
    full_description: project?.full_description ?? undefined,
    meta_description: project?.meta_description ?? undefined,
  }

  const existingEnTranslation: any = project?.translations?.en ? {
    title: project.translations.en.title,
    subtitle: project.translations.en.subtitle ?? undefined,
    short_description: project.translations.en.short_description ?? undefined,
    full_description: project.translations.en.full_description ?? undefined,
    meta_description: project.translations.en.meta_description ?? undefined,
  } : {
    title: '',
    subtitle: undefined,
    short_description: undefined,
    full_description: undefined,
    meta_description: undefined,
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: project?.slug || '',
      repo_url: project?.repo_url || '',
      deploy_url: project?.deploy_url || '',
      is_featured: project?.is_featured || false,
      display_order: project?.display_order || 0,
      status: project?.status || 'dev',
      is_active: project?.is_active ?? true,
      translations: {
        pt: existingPtTranslation,
        en: existingEnTranslation,
      },
    },
  })

  const handleTitleChange = (lang: 'pt' | 'en', value: string) => {
    form.setValue(`translations.${lang}.title`, value)
    // Gerar slug automaticamente baseado no título em PT
    if (lang === 'pt' && (!isEditing || !project?.slug)) {
      form.setValue('slug', slugify(value))
    }
  }

  const toggleTechnology = (id: number) => {
    setSelectedTechnologies((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  // Ações de Inteligência Artificial
  const handleTranslateField = async (field: 'title' | 'subtitle' | 'short_description' | 'full_description' | 'meta_description') => {
    const sourceText = form.getValues(`translations.pt.${field}`)
    if (!sourceText) {
      toast.error('Escreva o texto correspondente em Português primeiro para traduzir.')
      return
    }

    setIsTranslating(prev => ({ ...prev, [field]: true }))
    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate', text: sourceText, targetLanguage: 'en' })
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro na tradução')

      form.setValue(`translations.en.${field}`, json.data)
      toast.success('Campo traduzido pela IA com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao traduzir com IA')
    } finally {
      setIsTranslating(prev => ({ ...prev, [field]: false }))
    }
  }

  const handleTranslateAll = async () => {
    const fields: Array<'title' | 'subtitle' | 'short_description' | 'full_description' | 'meta_description'> = 
      ['title', 'subtitle', 'short_description', 'full_description', 'meta_description']

    let hasSource = false
    fields.forEach(field => {
      if (form.getValues(`translations.pt.${field}`)) hasSource = true
    })

    if (!hasSource) {
      toast.error('Nenhum texto preenchido na aba de Português para traduzir.')
      return
    }

    setIsTranslatingAll(true)
    let successCount = 0
    try {
      for (const field of fields) {
        const sourceText = form.getValues(`translations.pt.${field}`)
        if (sourceText) {
          setIsTranslating(prev => ({ ...prev, [field]: true }))
          const res = await fetch('/api/admin/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'translate', text: sourceText, targetLanguage: 'en' })
          })
          const json = await res.json()
          if (res.ok && json.data) {
            form.setValue(`translations.en.${field}`, json.data)
            successCount++
          }
          setIsTranslating(prev => ({ ...prev, [field]: false }))
        }
      }
      toast.success(`Tradução completa! ${successCount} campos traduzidos.`);
    } catch (error) {
      toast.error('Ocorreu um erro durante a tradução em lote.')
    } finally {
      setIsTranslatingAll(false)
    }
  }

  const handleGenerateSeo = async () => {
    const title = form.getValues('translations.pt.title')
    const description = form.getValues('translations.pt.full_description') || form.getValues('translations.pt.short_description')

    if (!title) {
      toast.error('Preencha pelo menos o título em Português para gerar o SEO.')
      return
    }

    setIsGeneratingSeo(true)
    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_seo', title, description: description || title })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao gerar SEO')

      const seo = json.data
      if (seo.short_description) {
        form.setValue('translations.pt.short_description', seo.short_description)
      }
      if (seo.meta_description) {
        form.setValue('translations.pt.meta_description', seo.meta_description)
      }
      toast.success('Descrição Curta e Meta Descrição geradas com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar SEO com IA')
    } finally {
      setIsGeneratingSeo(false)
    }
  }

  const handleSuggestTags = async () => {
    const title = form.getValues('translations.pt.title')
    const description = form.getValues('translations.pt.full_description') || form.getValues('translations.pt.short_description')

    if (!title) {
      toast.error('Preencha pelo menos o título em Português para sugerir correspondências.')
      return
    }

    setIsSuggestingTags(true)
    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest_tags', title, description: description || title })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro nas sugestões')

      const { technology_ids, tag_ids, new_technologies, new_tags } = json.data

      // Adiciona novas tecnologias à lista disponível
      if (Array.isArray(new_technologies) && new_technologies.length > 0) {
        setAvailableTechnologies((prev) => {
          const filteredNew = new_technologies.filter((nt) => !prev.some((p) => p.id === nt.id))
          return [...prev, ...filteredNew]
        })
        const names = new_technologies.map((t) => t.name).join(', ')
        toast.info(`Novas tecnologias criadas pela IA: ${names}`)
      }

      // Adiciona novas tags à lista disponível
      if (Array.isArray(new_tags) && new_tags.length > 0) {
        setAvailableTags((prev) => {
          const filteredNew = new_tags.filter((nt) => !prev.some((p) => p.id === nt.id))
          return [...prev, ...filteredNew]
        })
        const names = new_tags.map((t) => t.name).join(', ')
        toast.info(`Novas tags criadas pela IA: ${names}`)
      }

      if (Array.isArray(technology_ids)) {
        setSelectedTechnologies(technology_ids)
      }
      if (Array.isArray(tag_ids)) {
        setSelectedTags(tag_ids)
      }
      toast.success('Tecnologias e Tags sugeridas pela IA foram selecionadas!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao obter sugestões da IA')
    } finally {
      setIsSuggestingTags(false)
    }
  }

  const onSubmit = async (data: FormData): Promise<void> => {
    setIsSubmitting(true)

    try {
      const payload = {
        slug: data.slug,
        cover_image_url: coverImageUrl,
        repo_url: data.repo_url || null,
        deploy_url: data.deploy_url || null,
        is_featured: data.is_featured,
        display_order: data.display_order,
        status: data.status,
        is_active: data.is_active,
        technology_ids: selectedTechnologies,
        tag_ids: selectedTags,
        images: galleryImages.map((img, index) => ({
          id: img.id,
          image_url: img.image_url,
          caption: img.caption,
          display_order: index,
        })),
        translations: {
          pt: {
            title: data.translations.pt.title,
            subtitle: data.translations.pt.subtitle || null,
            short_description: data.translations.pt.short_description || null,
            full_description: data.translations.pt.full_description || null,
            meta_description: data.translations.pt.meta_description || null,
          },
          en: data.translations.en?.title ? {
            title: data.translations.en.title,
            subtitle: data.translations.en.subtitle || null,
            short_description: data.translations.en.short_description || null,
            full_description: data.translations.en.full_description || null,
            meta_description: data.translations.en.meta_description || null,
          } : null,
        },
      }

      const url = isEditing ? `/api/projects/${project.id}` : '/api/projects'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao salvar projeto')
      }

      toast.success(isEditing ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!')
      router.push('/admin/projects')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar projeto')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Componente para campos de tradução
  const TranslationFields = ({ lang }: { lang: 'pt' | 'en' }) => {
    const isRequired = lang === 'pt'
    const prefix = `translations.${lang}` as const

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${lang}-title`}>
              Título {isRequired && '*'}
            </Label>
            {lang === 'en' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 hover:text-primary"
                onClick={() => handleTranslateField('title')}
                disabled={isTranslating['title']}
              >
                {isTranslating['title'] ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Traduzir com IA
              </Button>
            )}
          </div>
          <Input
            id={`${lang}-title`}
            {...form.register(`${prefix}.title`)}
            onChange={(e) => handleTitleChange(lang, e.target.value)}
            placeholder={lang === 'pt' ? 'Nome do projeto' : 'Project name'}
          />
          {form.formState.errors.translations?.[lang]?.title && (
            <p className="text-sm text-destructive">
              {form.formState.errors.translations[lang]?.title?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${lang}-subtitle`}>
              Subtítulo
            </Label>
            {lang === 'en' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 hover:text-primary"
                onClick={() => handleTranslateField('subtitle')}
                disabled={isTranslating['subtitle']}
              >
                {isTranslating['subtitle'] ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Traduzir com IA
              </Button>
            )}
          </div>
          <Input
            id={`${lang}-subtitle`}
            {...form.register(`${prefix}.subtitle`)}
            placeholder={lang === 'pt' ? 'Uma breve linha sobre o projeto' : 'A brief line about the project'}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${lang}-short_description`}>
              Descrição Curta
            </Label>
            {lang === 'en' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 hover:text-primary"
                onClick={() => handleTranslateField('short_description')}
                disabled={isTranslating['short_description']}
              >
                {isTranslating['short_description'] ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Traduzir com IA
              </Button>
            )}
          </div>
          <Textarea
            id={`${lang}-short_description`}
            {...form.register(`${prefix}.short_description`)}
            placeholder={lang === 'pt' ? 'Descrição resumida que aparece nos cards de listagem' : 'Summary shown on list cards'}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${lang}-full_description`}>
              Descrição Completa (Markdown)
            </Label>
            {lang === 'en' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 hover:text-primary"
                onClick={() => handleTranslateField('full_description')}
                disabled={isTranslating['full_description']}
              >
                {isTranslating['full_description'] ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Traduzir com IA
              </Button>
            )}
          </div>
          <Textarea
            id={`${lang}-full_description`}
            {...form.register(`${prefix}.full_description`)}
            placeholder={lang === 'pt' ? 'Descrição detalhada do projeto...' : 'Detailed project description...'}
            rows={12}
            className="font-mono text-sm leading-relaxed"
          />
        </div>

        <div className="space-y-2 border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${lang}-meta_description`} className="text-muted-foreground">
              Meta Descrição (SEO)
            </Label>
            {lang === 'en' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 hover:text-primary"
                onClick={() => handleTranslateField('meta_description')}
                disabled={isTranslating['meta_description']}
              >
                {isTranslating['meta_description'] ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Traduzir com IA
              </Button>
            )}
          </div>
          <Textarea
            id={`${lang}-meta_description`}
            {...form.register(`${prefix}.meta_description`)}
            placeholder={lang === 'pt' ? 'Descrição resumida para os mecanismos de busca (Google)' : 'SEO search engine description'}
            rows={2}
            className="text-xs"
          />
        </div>
      </div>
    )
  }

  // Filtragem de Tecnologias & Tags baseadas nas pesquisas
  const filteredTechnologies = availableTechnologies.filter((tech) =>
    tech.name.toLowerCase().includes(techSearch.toLowerCase())
  )

  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  )

  const categoriesMap = {
    language: { name: 'Linguagens', icon: Code2, color: 'text-amber-500' },
    framework: { name: 'Frameworks', icon: Cpu, color: 'text-blue-500' },
    lib: { name: 'Bibliotecas', icon: Layers, color: 'text-purple-500' },
    db: { name: 'Bancos de Dados', icon: Database, color: 'text-emerald-500' },
    tool: { name: 'Ferramentas', icon: Wrench, color: 'text-rose-500' },
    other: { name: 'Outros', icon: Bookmark, color: 'text-slate-500' },
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8 relative">
      {/* Actions Bar - Sticky Premium */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border border-border/40 rounded-2xl shadow-lg shadow-black/5">
        <Button variant="ghost" asChild className="rounded-xl hover:bg-muted/60 transition-all">
          <Link href="/admin/projects">
            <ArrowLeft className="mr-2 h-4 w-4 text-muted-foreground" />
            Voltar
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="rounded-xl hover:bg-muted/40 transition-all border-border/60"
          >
            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
            Visualizar Prévia
          </Button>
          {isEditing && project?.slug && (
            <Button variant="outline" asChild className="rounded-xl hover:bg-muted/40 transition-all border-border/60">
              <Link href={`/projetos/${project.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                Ver no site
              </Link>
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="rounded-xl px-5 transition-all shadow-md active:scale-95">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditing ? 'Salvar Alterações' : 'Criar Projeto'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main Content (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full space-y-6">
            {/* Tabs Selector - Premium Design */}
            <TabsList className="grid w-full grid-cols-4 h-11 items-center justify-center p-1 bg-muted/50 border border-border/30 rounded-xl">
              <TabsTrigger value="basic" className="flex items-center justify-center gap-2 rounded-lg h-9 font-medium text-sm transition-all focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border-none">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center justify-center gap-2 rounded-lg h-9 font-medium text-sm transition-all focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border-none">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Textos</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center justify-center gap-2 rounded-lg h-9 font-medium text-sm transition-all focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border-none">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Mídias</span>
              </TabsTrigger>
              <TabsTrigger value="tech" className="flex items-center justify-center gap-2 rounded-lg h-9 font-medium text-sm transition-all focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border-none">
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Tecnologias</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Geral */}
            <TabsContent value="basic" className="space-y-6 outline-none">
              <Card className="border-border/60 shadow-xl shadow-black/5 rounded-2xl bg-card/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="border-b border-border/30 pb-5">
                  <CardTitle className="text-xl font-bold">Identificação do Projeto</CardTitle>
                  <CardDescription>Configure o slug identificador e links do repositório/deploy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="font-semibold text-sm">Slug *</Label>
                    <Input
                      id="slug"
                      {...form.register('slug')}
                      placeholder="nome-do-projeto-ou-ferramenta"
                      className="rounded-xl border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all py-5"
                    />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-destructive font-medium">
                        {form.formState.errors.slug.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="repo_url" className="flex items-center gap-2 font-semibold text-sm">
                        <Link2 className="h-4 w-4 text-muted-foreground" /> URL do Repositório
                      </Label>
                      <Input
                        id="repo_url"
                        {...form.register('repo_url')}
                        placeholder="https://github.com/..."
                        type="url"
                        className="rounded-xl border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all py-5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deploy_url" className="flex items-center gap-2 font-semibold text-sm">
                        <Link2 className="h-4 w-4 text-muted-foreground" /> URL do Deploy
                      </Label>
                      <Input
                        id="deploy_url"
                        {...form.register('deploy_url')}
                        placeholder="https://..."
                        type="url"
                        className="rounded-xl border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all py-5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Textos com Tradução & IA */}
            <TabsContent value="content" className="space-y-6 outline-none">
              {/* AI Copilot Panel */}
              <div className="bg-gradient-to-r from-violet-600/5 via-indigo-600/5 to-cyan-600/5 border border-indigo-500/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <h4 className="font-bold text-base flex items-center gap-2 text-foreground">
                      <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                      Assistente de Copiloto de IA
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                      Preencha o conteúdo em Português e use as ferramentas de IA para gerar traduções e otimizações SEO automaticamente.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-background/80 hover:bg-background border-indigo-500/15 hover:border-indigo-500/35 hover:scale-[1.02] text-xs gap-1.5 py-1.5 px-3 rounded-xl transition-all shadow-sm"
                      onClick={handleGenerateSeo}
                      disabled={isGeneratingSeo}
                    >
                      {isGeneratingSeo ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                      )}
                      Gerar SEO
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-background/80 hover:bg-background border-indigo-500/15 hover:border-indigo-500/35 hover:scale-[1.02] text-xs gap-1.5 py-1.5 px-3 rounded-xl transition-all shadow-sm"
                      onClick={handleTranslateAll}
                      disabled={isTranslatingAll}
                    >
                      {isTranslatingAll ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-cyan-500" />
                      )}
                      Traduzir Tudo (EN)
                    </Button>
                  </div>
                </div>
              </div>

              <Card className="border-border/60 shadow-xl shadow-black/5 rounded-2xl bg-card/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="border-b border-border/30 pb-5">
                  <CardTitle className="text-xl font-bold">Conteúdo Escrito</CardTitle>
                  <CardDescription>Escreva e organize as descrições em múltiplos idiomas</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pt' | 'en')}>
                    <TabsList className="grid w-full grid-cols-2 h-10 items-center justify-center p-1 bg-muted/30 border border-border/20 rounded-lg mb-6">
                      <TabsTrigger value="pt" className="flex items-center justify-center gap-2 rounded-md h-8 text-xs font-medium transition-all focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border-none">
                        🇧🇷 Português
                        {form.formState.errors.translations?.pt && (
                          <span className="h-1.5 w-1.5 bg-destructive rounded-full" />
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="en" className="flex items-center justify-center gap-2 rounded-md h-8 text-xs font-medium transition-all focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border-none">
                        🇺🇸 Inglês (English)
                        {form.watch('translations.en.title') && (
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                        )}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="pt" className="outline-none">
                      <TranslationFields lang="pt" />
                    </TabsContent>
                    <TabsContent value="en" className="outline-none">
                      <TranslationFields lang="en" />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Mídias */}
            <TabsContent value="media" className="space-y-6 outline-none">
              <Card className="border-border/60 shadow-xl shadow-black/5 rounded-2xl bg-card/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="border-b border-border/30 pb-5">
                  <CardTitle className="text-xl font-bold">Imagem de Capa</CardTitle>
                  <CardDescription>Imagem principal que aparece nas listagens e cards</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ImageUploader
                    value={coverImageUrl}
                    onChange={setCoverImageUrl}
                    bucket="projects"
                    folder="covers"
                    aspectRatio="video"
                    placeholder="Arraste ou clique para enviar a imagem de capa"
                  />
                </CardContent>
              </Card>

              <GalleryManager
                images={galleryImages}
                onChange={setGalleryImages}
                bucket="projects"
                folder="gallery"
              />
            </TabsContent>

            {/* Tab: Tecnologias & Tags */}
            <TabsContent value="tech" className="space-y-6 outline-none">
              <Card className="border-border/60 shadow-xl shadow-black/5 rounded-2xl bg-card/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-5 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">Tecnologias & Tags</CardTitle>
                    <CardDescription>Associe tags de assunto e as linguagens/ferramentas utilizadas</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 border-indigo-500/25 text-indigo-500 hover:text-indigo-600 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 hover:scale-[1.02] transition-all rounded-xl py-1.5 px-3 shadow-sm"
                    onClick={handleSuggestTags}
                    disabled={isSuggestingTags}
                  >
                    {isSuggestingTags ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    )}
                    Sugerir com IA
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Seletor de Tecnologias */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <Label className="text-base font-bold text-foreground">Tecnologias</Label>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar tecnologia..."
                          className="pl-9 h-9 text-xs rounded-xl border-border/50"
                          value={techSearch}
                          onChange={(e) => setTechSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto border border-border/40 rounded-xl p-4 bg-muted/10 space-y-5">
                      {Object.entries(categoriesMap).map(([key, cat]) => {
                        const techsInCat = filteredTechnologies.filter((t) => t.category === key)
                        if (techsInCat.length === 0) return null
                        const CatIcon = cat.icon
                        return (
                          <div key={key} className="space-y-2.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              <CatIcon className={`h-3.5 w-3.5 ${cat.color}`} />
                              {cat.name}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {techsInCat.map((tech) => {
                                const isSelected = selectedTechnologies.includes(tech.id)
                                return (
                                  <Badge
                                    key={tech.id}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className="cursor-pointer py-1.5 px-3 rounded-full text-xs font-medium gap-1.5 transition-all select-none hover:scale-105 border duration-300"
                                    onClick={() => toggleTechnology(tech.id)}
                                    style={
                                      isSelected
                                        ? {
                                            backgroundColor: `${tech.color_hex}15`,
                                            color: tech.color_hex,
                                            borderColor: tech.color_hex,
                                            boxShadow: `0 0 10px ${tech.color_hex}25`,
                                          }
                                        : {
                                            borderColor: 'hsl(var(--border) / 0.5)',
                                          }
                                    }
                                  >
                                    {isSelected ? (
                                      <Check className="h-3 w-3" style={{ color: tech.color_hex }} />
                                    ) : (
                                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tech.color_hex }} />
                                    )}
                                    {tech.name}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}

                      {filteredTechnologies.length === 0 && (
                        <p className="text-xs text-muted-foreground w-full text-center py-6">
                          Nenhuma tecnologia encontrada.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Seletor de Tags */}
                  <div className="space-y-4 border-t border-border/30 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <Label className="text-base font-bold text-foreground">Tags</Label>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar tag..."
                          className="pl-9 h-9 text-xs rounded-xl border-border/50"
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto border border-border/40 rounded-xl p-4 bg-muted/10">
                      <div className="flex flex-wrap gap-2">
                        {filteredTags.map((tag) => {
                          const isSelected = selectedTags.includes(tag.id)
                          return (
                            <Badge
                              key={tag.id}
                              variant={isSelected ? 'default' : 'outline'}
                              className="cursor-pointer py-1.5 px-3.5 rounded-full text-xs font-medium gap-1.5 transition-all select-none hover:scale-105 border duration-300"
                              onClick={() => toggleTag(tag.id)}
                              style={
                                isSelected
                                  ? {
                                      backgroundColor: `${tag.color_hex}15`,
                                      color: tag.color_hex,
                                      borderColor: tag.color_hex,
                                      boxShadow: `0 0 10px ${tag.color_hex}25`,
                                    }
                                  : {
                                      borderColor: 'hsl(var(--border) / 0.5)',
                                    }
                              }
                            >
                              {isSelected ? (
                                <Check className="h-3 w-3" style={{ color: tag.color_hex }} />
                              ) : (
                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color_hex }} />
                              )}
                              {tag.name}
                            </Badge>
                          )
                        })}

                        {filteredTags.length === 0 && (
                          <p className="text-xs text-muted-foreground w-full text-center py-6">
                            Nenhuma tag encontrada.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Status / Sidebar (1 Column) */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <Card className="border-border/60 shadow-xl shadow-black/5 rounded-2xl bg-card/50 backdrop-blur-md overflow-hidden">
            <CardHeader className="border-b border-border/30 pb-5">
              <CardTitle className="text-lg font-bold">Status & Visibilidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="status" className="font-semibold text-sm">Status do Projeto</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value: any) => form.setValue('status', value)}
                >
                  <SelectTrigger id="status" className="w-full rounded-xl border-border/50 py-5 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value="dev">Em Desenvolvimento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order" className="font-semibold text-sm">Ordem de Exibição</Label>
                <Input
                  id="display_order"
                  type="number"
                  min={0}
                  {...form.register('display_order', { valueAsNumber: true })}
                  className="rounded-xl border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all py-5"
                />
              </div>

              <div className="flex items-center justify-between border-t border-border/30 pt-5">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="font-semibold text-sm">Publicado</Label>
                  <p className="text-xs text-muted-foreground">Exibir projeto no portfólio</p>
                </div>
                <Switch
                  id="is_active"
                  checked={form.watch('is_active')}
                  onCheckedChange={(checked) => form.setValue('is_active', checked)}
                />
              </div>

              <div className="flex items-center justify-between border-t border-border/30 pt-5">
                <div className="space-y-0.5">
                  <Label htmlFor="is_featured" className="font-semibold text-sm">Destaque</Label>
                  <p className="text-xs text-muted-foreground">Destaque especial na home/projetos</p>
                </div>
                <Switch
                  id="is_featured"
                  checked={form.watch('is_featured')}
                  onCheckedChange={(checked) => form.setValue('is_featured', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Prévia em Tempo Real */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl border-border/40 bg-background shadow-2xl p-6">
          <DialogHeader className="border-b border-border/30 pb-4 mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Prévia do Projeto (Tempo Real)
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="card" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted/40 border border-border/20 rounded-xl">
              <TabsTrigger value="card" className="rounded-lg h-8 text-xs font-semibold">
                Visualização em Card (Grade do Portfólio)
              </TabsTrigger>
              <TabsTrigger value="page" className="rounded-lg h-8 text-xs font-semibold">
                Visualização de Página Completa
              </TabsTrigger>
            </TabsList>

            {/* TAB: Card View */}
            <TabsContent value="card" className="flex justify-center p-6 bg-muted/10 rounded-2xl border border-border/10">
              <div className="w-full max-w-sm">
                <div className="group relative flex flex-col h-full overflow-hidden bg-card border border-border/50 hover:border-primary/50 shadow-md transition-all duration-300 rounded-2xl">
                  {/* Card Cover Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted flex items-center justify-center">
                    {coverImageUrl ? (
                      <img
                        src={coverImageUrl}
                        alt="Imagem de Capa"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-muted-foreground/30">
                        {form.watch('translations.pt.title') ? form.watch('translations.pt.title').charAt(0) : 'P'}
                      </span>
                    )}
                    {/* Top Actions Simulation */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {form.watch('repo_url') && (
                        <div className="p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-sm text-muted-foreground">
                          <Github className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {form.watch('deploy_url') && (
                        <div className="p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-sm text-muted-foreground">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-col flex-1 p-5 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-foreground line-clamp-1 flex items-center gap-1.5">
                        {form.watch('translations.pt.title') || 'Título do Projeto'}
                      </h3>
                      {form.watch('translations.pt.subtitle') && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {form.watch('translations.pt.subtitle')}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                      {form.watch('translations.pt.short_description') || 'Escreva uma descrição curta na aba Textos para visualizá-la aqui.'}
                    </p>

                    {/* Matched Technologies list */}
                    <div className="mt-auto pt-3 flex flex-wrap gap-1.5">
                      {availableTechnologies
                        .filter((tech) => selectedTechnologies.includes(tech.id))
                        .slice(0, 4)
                        .map((tech) => (
                          <Badge
                            key={tech.id}
                            variant="outline"
                            className="text-[9px] px-2 py-0 h-5 bg-muted/40"
                            style={{ borderColor: `${tech.color_hex}40` }}
                          >
                            <span
                              className="w-1 h-1 rounded-full mr-1.5"
                              style={{ backgroundColor: tech.color_hex }}
                            />
                            {tech.name}
                          </Badge>
                        ))}
                      {selectedTechnologies.length > 4 && (
                        <Badge variant="outline" className="text-[9px] px-2 py-0 h-5 bg-muted/40">
                          +{selectedTechnologies.length - 4}
                        </Badge>
                      )}
                      {selectedTechnologies.length === 0 && (
                        <span className="text-[10px] text-muted-foreground italic">Nenhuma tecnologia vinculada.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB: Detail View Simulation */}
            <TabsContent value="page" className="space-y-6">
              {/* Header section simulation */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-border/30 bg-muted/10">
                <div className="relative aspect-[21/9] w-full bg-muted flex items-center justify-center">
                  {coverImageUrl ? (
                    <img
                      src={coverImageUrl}
                      alt="Capa do Projeto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                      <span className="text-sm text-muted-foreground/40 font-medium">Sem Imagem de Capa</span>
                    </div>
                  )}
                  {/* Subtle darkness gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                </div>
                
                <div className="p-6 relative z-10 -mt-16 md:-mt-24 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                      {form.watch('translations.pt.title') || 'Título do Projeto'}
                    </h2>
                    {form.watch('translations.pt.subtitle') && (
                      <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl">
                        {form.watch('translations.pt.subtitle')}
                      </p>
                    )}
                  </div>

                  {/* Badges cloud */}
                  <div className="flex flex-wrap gap-2">
                    {availableTechnologies
                      .filter((tech) => selectedTechnologies.includes(tech.id))
                      .map((tech) => (
                        <Badge
                          key={tech.id}
                          variant="outline"
                          className="text-xs px-2.5 py-0.5 rounded-full"
                          style={{
                            borderColor: tech.color_hex,
                            backgroundColor: `${tech.color_hex}10`,
                            color: tech.color_hex,
                          }}
                        >
                          {tech.name}
                        </Badge>
                      ))}
                    {availableTags
                      .filter((tag) => selectedTags.includes(tag.id))
                      .map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-xs px-2.5 py-0.5 rounded-full"
                          style={{
                            borderColor: tag.color_hex,
                            backgroundColor: `${tag.color_hex}10`,
                            color: tag.color_hex,
                          }}
                        >
                          #{tag.name}
                        </Badge>
                      ))}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {form.watch('repo_url') && (
                      <Button size="sm" variant="outline" className="rounded-xl gap-2 text-xs border-border/80" asChild>
                        <a href={form.watch('repo_url')} target="_blank" rel="noreferrer">
                          <Github className="h-4 w-4" />
                          Código Fonte
                        </a>
                      </Button>
                    )}
                    {form.watch('deploy_url') && (
                      <Button size="sm" className="rounded-xl gap-2 text-xs" asChild>
                        <a href={form.watch('deploy_url')} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Visitar Site
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Description section simulation */}
              <div className="grid md:grid-cols-3 gap-6 p-6 border border-border/20 rounded-2xl bg-card/30">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-base font-bold uppercase tracking-wider text-muted-foreground/80">Sobre o Projeto</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed font-sans">
                    {form.watch('translations.pt.full_description') ? (
                      <MarkdownRenderer content={form.watch('translations.pt.full_description') || ''} />
                    ) : (
                      <p className="italic text-muted-foreground/60">Escreva a descrição detalhada do projeto na aba Textos para visualizar a formatação em markdown.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 border-t md:border-t-0 md:border-l border-border/20 pt-6 md:pt-0 md:pl-6">
                  <h3 className="text-base font-bold uppercase tracking-wider text-muted-foreground/80">Detalhes</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block font-medium">Status</span>
                      <Badge variant="outline" className="mt-1 capitalize rounded-md">
                        {form.watch('status') === 'dev' ? 'Em Desenvolvimento' : form.watch('status') === 'concluido' ? 'Concluído' : form.watch('status')}
                      </Badge>
                    </div>
                    {form.watch('slug') && (
                      <div>
                        <span className="text-muted-foreground block font-medium">Link do Portfólio</span>
                        <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground mt-1 block w-fit">
                          /projetos/{form.watch('slug')}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </form>
  )
}
