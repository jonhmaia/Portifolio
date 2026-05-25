'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Loader2, 
  ArrowLeft, 
  Save, 
  Eye, 
  FileText, 
  Sparkles, 
  Globe, 
  Search, 
  Check, 
  Image as ImageIcon,
  Settings,
  Bookmark,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils/slugify'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import { articleFormSchema, type ArticleFormInput } from '@/lib/validations/article'
import type { Article, Category, Tag, Project, ArticleTranslation } from '@/lib/types/database'

// Usar o schema centralizado de formulário
const formSchema = articleFormSchema
type FormData = ArticleFormInput

interface TranslationFieldsProps {
  lang: 'pt' | 'en'
  form: UseFormReturn<FormData>
  editorTab: 'write' | 'preview'
  setEditorTab: (v: 'write' | 'preview') => void
  handleTitleChange: (lang: 'pt' | 'en', value: string) => void
  isTranslating: Record<string, boolean>
  handleTranslateField: (field: 'title' | 'summary' | 'content' | 'excerpt' | 'meta_description') => void
}

function TranslationFields({ 
  lang, 
  form, 
  editorTab, 
  setEditorTab, 
  handleTitleChange,
  isTranslating,
  handleTranslateField
}: TranslationFieldsProps) {
  const isRequired = lang === 'pt'
  const prefix = `translations.${lang}` as const
  const watchContent = form.watch(`${prefix}.content`)

  return (
    <div className="space-y-6">
      {/* Title & Summary */}
      <div className="space-y-4">
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
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Traduzir com IA
              </Button>
            )}
          </div>
          <Input
            id={`${lang}-title`}
            {...form.register(`${prefix}.title`)}
            onChange={(e) => {
              form.register(`${prefix}.title`).onChange(e)
              handleTitleChange(lang, e.target.value)
            }}
            placeholder={lang === 'pt' ? 'Título do artigo' : 'Article title'}
          />
          {form.formState.errors.translations?.[lang]?.title && (
            <p className="text-sm text-destructive">
              {form.formState.errors.translations[lang]?.title?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${lang}-summary`}>Resumo</Label>
            {lang === 'en' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 hover:text-primary"
                onClick={() => handleTranslateField('summary')}
                disabled={isTranslating['summary']}
              >
                {isTranslating['summary'] ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Traduzir com IA
              </Button>
            )}
          </div>
          <Textarea
            id={`${lang}-summary`}
            {...form.register(`${prefix}.summary`)}
            placeholder={lang === 'pt' ? 'Breve resumo ou subtítulo do artigo' : 'Brief summary of the article'}
            rows={2}
          />
        </div>
      </div>

      {/* Content Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            Conteúdo {isRequired && '*'}
          </Label>
          {lang === 'en' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 hover:text-primary"
              onClick={() => handleTranslateField('content')}
              disabled={isTranslating['content']}
            >
              {isTranslating['content'] ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Traduzir com IA
            </Button>
          )}
        </div>
        <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as 'write' | 'preview')}>
          <TabsList className="mb-4">
            <TabsTrigger value="write" className="gap-2">
              <FileText className="h-4 w-4" />
              Escrever
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="write" className="mt-0 outline-none">
            <Textarea
              {...form.register(`${prefix}.content`)}
              placeholder={lang === 'pt' ? 'Escreva seu artigo em Markdown...' : 'Write your article in Markdown...'}
              rows={22}
              className="font-mono text-sm leading-relaxed resize-y min-h-[400px]"
            />
            {form.formState.errors.translations?.[lang]?.content && (
              <p className="text-sm text-destructive mt-2">
                {form.formState.errors.translations[lang]?.content?.message}
              </p>
            )}
          </TabsContent>
          <TabsContent value="preview" className="mt-0 outline-none">
            <div className="min-h-[400px] border rounded-lg p-6 bg-background max-h-[600px] overflow-y-auto prose-custom">
              {watchContent ? (
                <MarkdownRenderer content={watchContent} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {lang === 'pt' ? 'Nenhum conteúdo para visualizar' : 'No content to preview'}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* SEO Sub-Section */}
      <div className="space-y-4 pt-4 border-t mt-6">
        <h4 className="font-semibold text-muted-foreground text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          SEO Relacionado
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${lang}-excerpt`}>Excerpt (Excerto)</Label>
            {lang === 'en' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 hover:text-primary"
                onClick={() => handleTranslateField('excerpt')}
                disabled={isTranslating['excerpt']}
              >
                {isTranslating['excerpt'] ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Traduzir com IA
              </Button>
            )}
          </div>
          <Textarea
            id={`${lang}-excerpt`}
            {...form.register(`${prefix}.excerpt`)}
            placeholder={lang === 'pt' ? 'Resumo estendido ou introdução do artigo para busca' : 'Extended summary for SEO'}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${lang}-meta_description`}>Meta Descrição (SEO)</Label>
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
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Traduzir com IA
              </Button>
            )}
          </div>
          <Textarea
            id={`${lang}-meta_description`}
            {...form.register(`${prefix}.meta_description`)}
            placeholder={lang === 'pt' ? 'Descrição para mecanismos de busca (160 caracteres)' : 'Description for search engines'}
            rows={2}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  )
}

interface ArticleFormProps {
  article?: Article & {
    tag_ids?: number[]
    project_ids?: number[]
    translations?: {
      pt?: ArticleTranslation
      en?: ArticleTranslation
    }
  }
  categories: Category[]
  tags: Tag[]
  projects: Pick<Project, 'id' | 'title' | 'slug'>[]
}

export function ArticleForm({ article, categories, tags, projects }: ArticleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // IA States
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({})
  const [isTranslatingAll, setIsTranslatingAll] = useState(false)
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false)

  // Seletores e Filtros
  const [selectedTags, setSelectedTags] = useState<number[]>(article?.tag_ids || [])
  const [selectedProjects, setSelectedProjects] = useState<number[]>(article?.project_ids || [])
  const [tagSearch, setTagSearch] = useState('')
  const [projectSearch, setProjectSearch] = useState('')

  const [langTab, setLangTab] = useState<'pt' | 'en'>('pt')
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write')

  const isEditing = !!article

  // Extrair traduções existentes ou usar dados legados
  const existingPtTranslation = article?.translations?.pt || {
    title: article?.title || '',
    content: article?.content || '',
    summary: article?.summary || '',
    excerpt: article?.excerpt || '',
    meta_description: article?.meta_description || '',
  }

  const existingEnTranslation = article?.translations?.en || {
    title: '',
    content: '',
    summary: '',
    excerpt: '',
    meta_description: '',
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      slug: article?.slug || '',
      cover_image_url: article?.cover_image_url || '',
      status: article?.status || 'draft',
      category_id: article?.category_id || null,
      translations: {
        pt: existingPtTranslation,
        en: existingEnTranslation,
      },
    },
  })

  const handleTitleChange = (lang: 'pt' | 'en', value: string) => {
    form.setValue(`translations.${lang}.title`, value)
    if (lang === 'pt' && (!isEditing || !article?.slug)) {
      form.setValue('slug', slugify(value))
    }
  }

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const toggleProject = (id: number) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  // Ações de Inteligência Artificial para Artigos
  const handleTranslateField = async (field: 'title' | 'summary' | 'content' | 'excerpt' | 'meta_description') => {
    const sourceText = form.getValues(`translations.pt.${field}`)
    if (!sourceText) {
      toast.error('Preencha o conteúdo em Português primeiro.')
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
      if (!res.ok) throw new Error(json.error || 'Erro ao traduzir')

      form.setValue(`translations.en.${field}`, json.data)
      toast.success('Campo traduzido pela IA com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro na tradução do campo')
    } finally {
      setIsTranslating(prev => ({ ...prev, [field]: false }))
    }
  }

  const handleTranslateAll = async () => {
    const fields: Array<'title' | 'summary' | 'content' | 'excerpt' | 'meta_description'> = 
      ['title', 'summary', 'content', 'excerpt', 'meta_description']

    let hasSource = false
    fields.forEach(field => {
      if (form.getValues(`translations.pt.${field}`)) hasSource = true
    })

    if (!hasSource) {
      toast.error('Nenhum conteúdo em Português para traduzir.')
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
      toast.success(`Tradução concluída! ${successCount} campos traduzidos para o inglês.`);
    } catch (error) {
      toast.error('Erro na tradução automatizada.')
    } finally {
      setIsTranslatingAll(false)
    }
  }

  const handleGenerateSeo = async () => {
    const title = form.getValues('translations.pt.title')
    const description = form.getValues('translations.pt.content') || form.getValues('translations.pt.summary')

    if (!title) {
      toast.error('Preencha o título em Português primeiro.')
      return
    }

    setIsGeneratingSeo(true)
    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_seo', title, description: (description || title).substring(0, 1500) })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao gerar SEO')

      const seo = json.data
      if (seo.short_description) {
        form.setValue('translations.pt.summary', seo.short_description)
      }
      if (seo.meta_description) {
        form.setValue('translations.pt.meta_description', seo.meta_description)
        form.setValue('translations.pt.excerpt', seo.meta_description)
      }
      toast.success('Resumo e Metadados SEO sugeridos pela IA aplicados!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar SEO com IA')
    } finally {
      setIsGeneratingSeo(false)
    }
  }

  const onSubmit = async (data: FormData): Promise<void> => {
    setIsSubmitting(true)

    try {
      const payload = {
        slug: data.slug,
        cover_image_url: data.cover_image_url || null,
        status: data.status,
        category_id: data.category_id,
        tag_ids: selectedTags,
        project_ids: selectedProjects,
        translations: {
          pt: {
            title: data.translations.pt.title,
            content: data.translations.pt.content,
            summary: data.translations.pt.summary || null,
            excerpt: data.translations.pt.excerpt || null,
            meta_description: data.translations.pt.meta_description || null,
          },
          en: data.translations.en?.title && data.translations.en?.content ? {
            title: data.translations.en.title,
            content: data.translations.en.content,
            summary: data.translations.en.summary || null,
            excerpt: data.translations.en.excerpt || null,
            meta_description: data.translations.en.meta_description || null,
          } : null,
        },
      }

      const url = isEditing ? `/api/articles/${article.id}` : '/api/articles'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao salvar artigo')
      }

      toast.success(isEditing ? 'Artigo atualizado!' : 'Artigo criado com sucesso!')
      router.push('/admin/articles')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar artigo')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtragem de Tags e Projetos
  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(projectSearch.toLowerCase()))

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Actions Bar */}
      <div className="flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm">
        <Button variant="ghost" asChild>
          <Link href="/admin/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex gap-2">
          {isEditing && article?.status === 'published' && article?.slug && (
            <Button variant="outline" asChild>
              <Link href={`/blog/${article.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </Link>
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditing ? 'Salvar Alterações' : 'Criar Artigo'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content (2 Columns) */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="texts" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3 p-1 bg-muted rounded-xl">
              <TabsTrigger value="texts" className="gap-2 rounded-lg py-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Textos do Post</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="gap-2 rounded-lg py-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Identificação & Capa</span>
              </TabsTrigger>
              <TabsTrigger value="taxonomies" className="gap-2 rounded-lg py-2">
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Tags & Projetos</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Textos do Post (Com suporte a IA) */}
            <TabsContent value="texts" className="space-y-6 outline-none">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Conteúdo Escrito</CardTitle>
                    <CardDescription>Escreva o artigo técnico em markdown e traduza com a IA</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={handleGenerateSeo}
                      disabled={isGeneratingSeo}
                    >
                      {isGeneratingSeo ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      Gerar SEO com IA
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={handleTranslateAll}
                      disabled={isTranslatingAll}
                    >
                      {isTranslatingAll ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Globe className="h-3.5 w-3.5" />
                      )}
                      Traduzir tudo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={langTab} onValueChange={(v) => setLangTab(v as 'pt' | 'en')}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="pt" className="gap-2">
                        🇧🇷 Português
                        {form.formState.errors.translations?.pt && (
                          <span className="h-2 w-2 bg-destructive rounded-full" />
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="en" className="gap-2">
                        🇺🇸 Inglês (English)
                        {form.watch('translations.en.title') && form.watch('translations.en.content') && (
                          <span className="h-2 w-2 bg-green-500 rounded-full" />
                        )}
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pt" className="outline-none">
                      <TranslationFields
                        lang="pt"
                        form={form}
                        editorTab={editorTab}
                        setEditorTab={setEditorTab}
                        handleTitleChange={handleTitleChange}
                        isTranslating={isTranslating}
                        handleTranslateField={handleTranslateField}
                      />
                    </TabsContent>
                    
                    <TabsContent value="en" className="outline-none">
                      <TranslationFields
                        lang="en"
                        form={form}
                        editorTab={editorTab}
                        setEditorTab={setEditorTab}
                        handleTitleChange={handleTitleChange}
                        isTranslating={isTranslating}
                        handleTranslateField={handleTranslateField}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Identificação & Capa */}
            <TabsContent value="general" className="space-y-6 outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Identificação</CardTitle>
                  <CardDescription>O slug identificador na URL</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      {...form.register('slug')}
                      placeholder="titulo-do-artigo-tecnico"
                    />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.slug.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover_image_url">URL da Imagem de Capa</Label>
                    <Input
                      id="cover_image_url"
                      {...form.register('cover_image_url')}
                      placeholder="https://sua-imagem-aqui.png"
                      type="url"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Tags e Projetos Relacionados */}
            <TabsContent value="taxonomies" className="space-y-6 outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Taxonomia & Vínculos</CardTitle>
                  <CardDescription>Adicione tags e associe este artigo a projetos do seu portfólio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tags */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Tags</Label>
                      <div className="relative w-48 sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Buscar tag..."
                          className="pl-8 h-8 text-xs"
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-4 bg-muted/20">
                      <div className="flex flex-wrap gap-2">
                        {filteredTags.map((tag) => {
                          const isSelected = selectedTags.includes(tag.id)
                          return (
                            <Badge
                              key={tag.id}
                              variant={isSelected ? 'default' : 'outline'}
                              className="cursor-pointer py-1 px-3 rounded-full text-xs gap-1 select-none hover:scale-105"
                              onClick={() => toggleTag(tag.id)}
                              style={
                                isSelected ? { backgroundColor: tag.color_hex, color: '#1a1a24' } : undefined
                              }
                            >
                              {isSelected && <Check className="h-3 w-3 mr-0.5" />}
                              {tag.name}
                            </Badge>
                          )
                        })}
                        {filteredTags.length === 0 && (
                          <p className="text-xs text-muted-foreground w-full text-center py-4">Nenhuma tag cadastrada</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Projetos Relacionados */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Projetos Relacionados</Label>
                      <div className="relative w-48 sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Buscar projeto..."
                          className="pl-8 h-8 text-xs"
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto border rounded-lg bg-muted/10">
                      <div className="divide-y">
                        {filteredProjects.map((project) => {
                          const isChecked = selectedProjects.includes(project.id)
                          return (
                            <label
                              key={project.id}
                              className="flex items-center gap-3 cursor-pointer p-3 hover:bg-muted/40 transition-colors"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleProject(project.id)}
                              />
                              <div className="flex items-center gap-1.5 text-sm font-medium">
                                {isChecked && <ChevronRight className="h-3 w-3 text-primary" />}
                                <span>{project.title}</span>
                              </div>
                            </label>
                          )
                        })}
                        {filteredProjects.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-6">Nenhum projeto encontrado</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Status / Category */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publicação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status do Artigo</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value: 'draft' | 'published') => form.setValue('status', value)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Categoria</Label>
                <Select
                  value={form.watch('category_id')?.toString() || undefined}
                  onValueChange={(value) => form.setValue('category_id', value ? parseInt(value) : null)}
                >
                  <SelectTrigger id="category_id" className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {article?.reading_time_minutes && (
                <div className="pt-4 border-t flex justify-between text-xs text-muted-foreground">
                  <span>Tempo de leitura estimado:</span>
                  <span className="font-semibold text-foreground">{article.reading_time_minutes} min</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
