'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Globe, 
  FileText,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

// Importando mensagens locais para usar como fallback e dados iniciais
import ptMessages from '@/messages/pt-BR.json'
import enMessages from '@/messages/en.json'

interface Experience {
  company: string
  role: string
  period: string
  items: string[]
}

interface FeaturedProject {
  title: string
  subtitle: string
  description: string
  techs: string[]
}

interface Education {
  institution: string
  degree: string
  period: string
  description: string
}

interface SkillGroup {
  title: string
  tags: string[]
}

interface Language {
  name: string
  level: string
}

interface ResumeData {
  role: string
  summary: string
  experiences: Experience[]
  featured_projects: FeaturedProject[]
  education: Education[]
  skills: SkillGroup[]
  languages: Language[]
}

const emptyResumeState = (): ResumeData => ({
  role: '',
  summary: '',
  experiences: [],
  featured_projects: [],
  education: [],
  skills: [],
  languages: []
})

// Mapeamento das mensagens estáticas para preencher dados iniciais se o banco de dados estiver vazio
const mapStaticMessagesToResume = (resumeMsg: any): ResumeData => {
  const summaryParagraphs: string[] = []
  if (resumeMsg?.professionalSummary?.p1) summaryParagraphs.push(resumeMsg.professionalSummary.p1)
  if (resumeMsg?.professionalSummary?.p2) summaryParagraphs.push(resumeMsg.professionalSummary.p2)
  if (resumeMsg?.professionalSummary?.p3) summaryParagraphs.push(resumeMsg.professionalSummary.p3)
  
  const experiences = Object.keys(resumeMsg?.experience || {})
    .filter(key => key !== 'title')
    .map(key => {
      const exp = resumeMsg.experience[key]
      const items = Object.keys(exp.items || {})
        .sort((a, b) => Number(a) - Number(b))
        .map(iKey => exp.items[iKey])
      return {
        company: exp.company || '',
        role: exp.role || '',
        period: exp.period || '',
        items: items || []
      }
    })

  const featured_projects = Object.keys(resumeMsg?.featuredProjects || {})
    .filter(key => key !== 'title')
    .map(key => {
      const proj = resumeMsg.featuredProjects[key]
      return {
        title: proj.title || '',
        subtitle: proj.subtitle || '',
        description: proj.description || '',
        techs: key === 'maestro' ? ['n8n', 'OpenAI', 'Supabase'] : key === 'camapum' ? ['React', 'Supabase', 'n8n'] : ['Python (Django)', 'Fintech']
      }
    })

  const education = []
  if (resumeMsg?.education?.ufg) {
    education.push({
      institution: resumeMsg.education.ufg.institution || '',
      degree: resumeMsg.education.ufg.title || '',
      period: resumeMsg.education.ufg.period || '',
      description: ''
    })
  }
  if (resumeMsg?.education?.research) {
    education.push({
      institution: resumeMsg.education.research.event || '',
      degree: resumeMsg.education.research.title || '',
      period: 'WebMedia 2025',
      description: resumeMsg.education.research.description || ''
    })
  }

  const skills = Object.keys(resumeMsg?.skills || {})
    .filter(key => key !== 'title')
    .map(key => {
      const sk = resumeMsg.skills[key]
      let tags: string[] = []
      if (key === 'fullstack') tags = ['Python', 'TypeScript', 'Node.js', 'React', 'Next.js', 'C/C++', 'SQL']
      if (key === 'ai') tags = ['LLM Fine-Tuning', 'NLP', 'RAG', 'Generative AI', 'Data Governance', 'Observability', 'RPA']
      if (key === 'automation') tags = ['n8n', 'Bubble.io', 'Docker', 'PostgreSQL', 'Supabase', 'Git', 'CI/CD']
      if (key === 'strategy') tags = ['Liderança Técnica', 'Engenharia de Receita', 'Arquitetura de Software', 'Hiperautomação', 'Scrum/Agile']
      return {
        title: sk.title || '',
        tags
      }
    })

  const languages = Object.keys(resumeMsg?.languages || {})
    .filter(key => key !== 'title')
    .map(key => {
      const lang = resumeMsg.languages[key]
      return {
        name: lang.name || '',
        level: lang.level || ''
      }
    })

  return {
    role: resumeMsg?.role || '',
    summary: summaryParagraphs.join('\n\n'),
    experiences,
    featured_projects,
    education,
    skills,
    languages
  }
}

export default function ResumeAdminPage() {
  const supabase = createClient() as any
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isTranslating, startTranslation] = useTransition()
  
  // Dados do currículo para cada idioma
  const [ptData, setPtData] = useState<ResumeData>(emptyResumeState())
  const [enData, setEnData] = useState<ResumeData>(emptyResumeState())

  useEffect(() => {
    async function loadResumeData() {
      try {
        const { data, error } = await supabase
          .from('resume_data')
          .select('*')
        
        if (error) throw error

        let ptLoaded = false
        let enLoaded = false

        if (data && data.length > 0) {
          data.forEach((row: any) => {
            const parsed: ResumeData = {
              role: row.role || '',
              summary: row.summary || '',
              experiences: row.experiences || [],
              featured_projects: row.featured_projects || [],
              education: row.education || [],
              skills: row.skills || [],
              languages: row.languages || []
            }
            if (row.language === 'pt-BR') {
              setPtData(parsed)
              ptLoaded = true
            } else if (row.language === 'en') {
              setEnData(parsed)
              enLoaded = true
            }
          })
        }

        // Se o banco estiver vazio, carrega dados dos arquivos JSON locais como inicialização
        if (!ptLoaded) {
          setPtData(mapStaticMessagesToResume(ptMessages.resume))
        }
        if (!enLoaded) {
          setEnData(mapStaticMessagesToResume(enMessages.resume))
        }
      } catch (err) {
        console.error('Erro ao carregar dados do currículo do banco:', err)
        // Fallback para mensagens locais
        setPtData(mapStaticMessagesToResume(ptMessages.resume))
        setEnData(mapStaticMessagesToResume(enMessages.resume))
      } finally {
        setLoading(false)
      }
    }

    loadResumeData()
  }, [])

  const handleSave = async (lang: 'pt-BR' | 'en') => {
    setSaving(true)
    const targetData = lang === 'pt-BR' ? ptData : enData

    try {
      // 1. Tentar fazer upsert do registro
      const { error } = await supabase
        .from('resume_data')
        .upsert({
          language: lang,
          role: targetData.role,
          summary: targetData.summary,
          experiences: targetData.experiences,
          featured_projects: targetData.featured_projects,
          education: targetData.education,
          skills: targetData.skills,
          languages: targetData.languages,
          updated_at: new Date().toISOString()
        }, { onConflict: 'language' })

      if (error) throw error
      toast.success(`Currículo em ${lang === 'pt-BR' ? 'Português' : 'Inglês'} salvo com sucesso!`)
    } catch (err) {
      console.error('Erro ao salvar currículo:', err)
      toast.error('Erro ao salvar currículo no banco de dados. Certifique-se de aplicar a migração SQL 006 no painel do Supabase.')
    } finally {
      setSaving(false)
    }
  }

  const handleTranslateViaIA = (sourceLang: 'pt-BR' | 'en') => {
    const sourceData = sourceLang === 'pt-BR' ? ptData : enData
    const targetLang = sourceLang === 'pt-BR' ? 'en' : 'pt-BR'

    startTranslation(async () => {
      try {
        const response = await fetch('/api/admin/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'translate_resume',
            resumeData: sourceData,
            targetLanguage: targetLang
          })
        })

        if (!response.ok) {
          const errRes = await response.json()
          throw new Error(errRes.error || 'Erro na tradução')
        }

        const resData = await response.json()
        const translated: ResumeData = resData.data

        if (targetLang === 'en') {
          setEnData(translated)
        } else {
          setPtData(translated)
        }
        toast.success(`Currículo traduzido com sucesso para o ${targetLang === 'en' ? 'Inglês' : 'Português'}! (Revisão necessária antes de Salvar)`)
      } catch (err) {
        console.error('Erro ao traduzir via IA:', err)
        toast.error(err instanceof Error ? err.message : 'Falha na tradução com IA.')
      }
    })
  }

  // Manipuladores de listas dinâmicas para um determinado idioma (PT ou EN)
  const updateField = (lang: 'pt-BR' | 'en', field: keyof ResumeData, value: any) => {
    if (lang === 'pt-BR') {
      setPtData(prev => ({ ...prev, [field]: value }))
    } else {
      setEnData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Mover item para cima/baixo na lista
  const moveItem = (lang: 'pt-BR' | 'en', field: 'experiences' | 'featured_projects' | 'education' | 'skills' | 'languages', index: number, dir: 'up' | 'down') => {
    const currentList = lang === 'pt-BR' ? [...ptData[field]] : [...enData[field]]
    const targetIndex = dir === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= currentList.length) return
    
    // Troca os elementos de posição
    const temp = currentList[index]
    currentList[index] = currentList[targetIndex]
    currentList[targetIndex] = temp
    
    updateField(lang, field, currentList)
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Carregando currículo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editor de Currículo</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu currículo profissional dinamicamente nos dois idiomas com inteligência artificial.</p>
        </div>
      </div>

      <Tabs defaultValue="pt-BR" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-border/40 pb-2">
          <TabsList className="grid grid-cols-2 w-full sm:w-60 h-10">
            <TabsTrigger value="pt-BR" className="text-sm font-medium">Português (PT)</TabsTrigger>
            <TabsTrigger value="en" className="text-sm font-medium">Inglês (EN)</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Botão de Tradução via IA */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTranslateViaIA('pt-BR')}
              disabled={isTranslating || saving}
              className="gap-2 border-primary/20 hover:border-primary/50 text-foreground"
            >
              {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
              Traduzir PT para EN via IA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTranslateViaIA('en')}
              disabled={isTranslating || saving}
              className="gap-2 border-primary/20 hover:border-primary/50 text-foreground"
            >
              {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
              Traduzir EN para PT via IA
            </Button>
          </div>
        </div>

        {/* Tab CONTENT: PORTUGUÊS */}
        <TabsContent value="pt-BR" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <ResumeFormSection 
            lang="pt-BR" 
            data={ptData} 
            setData={setPtData} 
            onSave={() => handleSave('pt-BR')} 
            saving={saving} 
            isPending={isTranslating}
            moveItem={moveItem}
            updateField={updateField}
          />
        </TabsContent>

        {/* Tab CONTENT: INGLÊS */}
        <TabsContent value="en" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <ResumeFormSection 
            lang="en" 
            data={enData} 
            setData={setEnData} 
            onSave={() => handleSave('en')} 
            saving={saving} 
            isPending={isTranslating}
            moveItem={moveItem}
            updateField={updateField}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ResumeFormSectionProps {
  lang: 'pt-BR' | 'en'
  data: ResumeData
  setData: React.Dispatch<React.SetStateAction<ResumeData>>
  onSave: () => void
  saving: boolean
  isPending: boolean
  moveItem: (lang: 'pt-BR' | 'en', field: any, index: number, dir: 'up' | 'down') => void
  updateField: (lang: 'pt-BR' | 'en', field: keyof ResumeData, value: any) => void
}

function ResumeFormSection({ 
  lang, 
  data, 
  setData, 
  onSave, 
  saving, 
  isPending,
  moveItem,
  updateField
}: ResumeFormSectionProps) {

  // Manipulação de Experiências
  const addExperience = () => {
    const newExp: Experience = { company: '', role: '', period: '', items: [''] }
    updateField(lang, 'experiences', [...data.experiences, newExp])
  }

  const removeExperience = (index: number) => {
    const list = [...data.experiences]
    list.splice(index, 1)
    updateField(lang, 'experiences', list)
  }

  const updateExperience = (index: number, key: keyof Experience, value: any) => {
    const list = [...data.experiences]
    list[index] = { ...list[index], [key]: value }
    updateField(lang, 'experiences', list)
  }

  const addExperienceBullet = (expIndex: number) => {
    const list = [...data.experiences]
    list[expIndex].items = [...list[expIndex].items, '']
    updateField(lang, 'experiences', list)
  }

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    const list = [...data.experiences]
    list[expIndex].items.splice(bulletIndex, 1)
    updateField(lang, 'experiences', list)
  }

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const list = [...data.experiences]
    list[expIndex].items[bulletIndex] = value
    updateField(lang, 'experiences', list)
  }

  // Manipulação de Projetos em Destaque
  const addProject = () => {
    const newProj: FeaturedProject = { title: '', subtitle: '', description: '', techs: [] }
    updateField(lang, 'featured_projects', [...data.featured_projects, newProj])
  }

  const removeProject = (index: number) => {
    const list = [...data.featured_projects]
    list.splice(index, 1)
    updateField(lang, 'featured_projects', list)
  }

  const updateProject = (index: number, key: keyof FeaturedProject, value: any) => {
    const list = [...data.featured_projects]
    if (key === 'techs') {
      // Divide string por vírgula em array de tags limpas
      const array = value.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
      list[index] = { ...list[index], [key]: array }
    } else {
      list[index] = { ...list[index], [key]: value }
    }
    updateField(lang, 'featured_projects', list)
  }

  // Manipulação de Educação
  const addEducation = () => {
    const newEdu: Education = { institution: '', degree: '', period: '', description: '' }
    updateField(lang, 'education', [...data.education, newEdu])
  }

  const removeEducation = (index: number) => {
    const list = [...data.education]
    list.splice(index, 1)
    updateField(lang, 'education', list)
  }

  const updateEducation = (index: number, key: keyof Education, value: any) => {
    const list = [...data.education]
    list[index] = { ...list[index], [key]: value }
    updateField(lang, 'education', list)
  }

  // Habilidades
  const addSkillGroup = () => {
    const newSkill: SkillGroup = { title: '', tags: [] }
    updateField(lang, 'skills', [...data.skills, newSkill])
  }

  const removeSkillGroup = (index: number) => {
    const list = [...data.skills]
    list.splice(index, 1)
    updateField(lang, 'skills', list)
  }

  const updateSkillGroup = (index: number, key: keyof SkillGroup, value: any) => {
    const list = [...data.skills]
    if (key === 'tags') {
      const array = value.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
      list[index] = { ...list[index], [key]: array }
    } else {
      list[index] = { ...list[index], [key]: value }
    }
    updateField(lang, 'skills', list)
  }

  // Idiomas
  const addLanguage = () => {
    const newLang: Language = { name: '', level: '' }
    updateField(lang, 'languages', [...data.languages, newLang])
  }

  const removeLanguage = (index: number) => {
    const list = [...data.languages]
    list.splice(index, 1)
    updateField(lang, 'languages', list)
  }

  const updateLanguage = (index: number, key: keyof Language, value: any) => {
    const list = [...data.languages]
    list[index] = { ...list[index], [key]: value }
    updateField(lang, 'languages', list)
  }

  return (
    <div className="space-y-6">
      {/* 1. Informações de Cargo & Resumo */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Informações Gerais & Resumo Profissional
          </CardTitle>
          <CardDescription>Defina seu cargo principal e crie um resumo de perfil usando Markdown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Cargo / Subtítulo Profissional</Label>
            <Input 
              id="role"
              value={data.role}
              onChange={(e) => updateField(lang, 'role', e.target.value)}
              placeholder="Ex: N8N Expert | Software Engineer | RPA | Python | AI Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Resumo Profissional (Markdown)</Label>
            <Textarea 
              id="summary"
              value={data.summary}
              onChange={(e) => updateField(lang, 'summary', e.target.value)}
              placeholder="Escreva seu resumo de forma profissional. O texto pode ter múltiplos parágrafos usando quebra de linha dupla."
              className="min-h-[140px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Experiências Profissionais */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Experiência Profissional
            </CardTitle>
            <CardDescription>Adicione as empresas onde trabalhou, cargos ocupados e as conquistas/tarefas de cada uma.</CardDescription>
          </div>
          <Button onClick={addExperience} size="sm" className="gap-1 flex-shrink-0">
            <Plus className="h-4 w-4" /> Adicionar Experiência
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.experiences.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Nenhuma experiência adicionada.</p>
          ) : (
            data.experiences.map((exp, expIdx) => (
              <div key={expIdx} className="space-y-4 p-5 rounded-2xl bg-muted/40 border border-border/50 relative group/card">
                
                {/* Actions: Reordenar / Deletar */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-80 group-hover/card:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveItem(lang, 'experiences', expIdx, 'up')}
                    disabled={expIdx === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveItem(lang, 'experiences', expIdx, 'down')}
                    disabled={expIdx === data.experiences.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => removeExperience(expIdx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Empresa</Label>
                    <Input 
                      value={exp.company}
                      onChange={(e) => updateExperience(expIdx, 'company', e.target.value)}
                      placeholder="Ex: Watrix Tecnologia"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Cargo</Label>
                    <Input 
                      value={exp.role}
                      onChange={(e) => updateExperience(expIdx, 'role', e.target.value)}
                      placeholder="Ex: Desenvolvedor RPA Sênior"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5 pr-20 md:pr-0">
                    <Label className="text-xs">Período</Label>
                    <Input 
                      value={exp.period}
                      onChange={(e) => updateExperience(expIdx, 'period', e.target.value)}
                      placeholder="Ex: Jan 2024 - Presente"
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Bullets (Tópicos de atividades) */}
                <div className="space-y-2 mt-3 pl-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Principais Atividades / Bullet Points</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addExperienceBullet(expIdx)}
                      className="h-6 px-2 text-xs gap-1 hover:bg-primary/10 text-primary"
                    >
                      <Plus className="h-3 w-3" /> Adicionar Tópico
                    </Button>
                  </div>
                  
                  {exp.items.map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">{bulletIdx + 1}.</span>
                      <Input 
                        value={bullet}
                        onChange={(e) => updateExperienceBullet(expIdx, bulletIdx, e.target.value)}
                        placeholder="Escreva a atividade ou conquista profissional..."
                        className="h-9 flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => removeExperienceBullet(expIdx, bulletIdx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 3. Projetos em Destaque */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderKanbanIcon className="h-5 w-5 text-primary" />
              Projetos em Destaque
            </CardTitle>
            <CardDescription>Crie o portfólio de projetos mais proeminentes exibidos na página do currículo.</CardDescription>
          </div>
          <Button onClick={addProject} size="sm" className="gap-1 flex-shrink-0">
            <Plus className="h-4 w-4" /> Adicionar Projeto
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.featured_projects.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Nenhum projeto em destaque adicionado.</p>
          ) : (
            data.featured_projects.map((proj, projIdx) => (
              <div key={projIdx} className="space-y-4 p-5 rounded-2xl bg-muted/40 border border-border/50 relative group/card">
                
                {/* Actions: Reordenar / Deletar */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-80 group-hover/card:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveItem(lang, 'featured_projects', projIdx, 'up')}
                    disabled={projIdx === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveItem(lang, 'featured_projects', projIdx, 'down')}
                    disabled={projIdx === data.featured_projects.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => removeProject(projIdx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Título do Projeto</Label>
                    <Input 
                      value={proj.title}
                      onChange={(e) => updateProject(projIdx, 'title', e.target.value)}
                      placeholder="Ex: Maestro AI (Assistente WhatsApp)"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5 pr-20 md:pr-0">
                    <Label className="text-xs">Subtítulo / Meta</Label>
                    <Input 
                      value={proj.subtitle}
                      onChange={(e) => updateProject(projIdx, 'subtitle', e.target.value)}
                      placeholder="Ex: Life OS integrado com WhatsApp"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição Curta</Label>
                  <Textarea 
                    value={proj.description}
                    onChange={(e) => updateProject(projIdx, 'description', e.target.value)}
                    placeholder="Descrição sobre o funcionamento e o objetivo do projeto..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Tecnologias Utilizadas (Separadas por vírgula)</Label>
                  <Input 
                    defaultValue={proj.techs.join(', ')}
                    onBlur={(e) => updateProject(projIdx, 'techs', e.target.value)}
                    placeholder="Ex: React, Supabase, n8n, OpenAI"
                    className="h-9"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 4. Formação & Pesquisa */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Formação & Pesquisa Acadêmica
            </CardTitle>
            <CardDescription>Adicione sua graduação e projetos de P&D científicos.</CardDescription>
          </div>
          <Button onClick={addEducation} size="sm" className="gap-1 flex-shrink-0">
            <Plus className="h-4 w-4" /> Adicionar Formação
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.education.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Nenhuma formação adicionada.</p>
          ) : (
            data.education.map((edu, eduIdx) => (
              <div key={eduIdx} className="space-y-4 p-5 rounded-2xl bg-muted/40 border border-border/50 relative group/card">
                
                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-80 group-hover/card:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveItem(lang, 'education', eduIdx, 'up')}
                    disabled={eduIdx === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveItem(lang, 'education', eduIdx, 'down')}
                    disabled={eduIdx === data.education.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => removeEducation(eduIdx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Instituição / Evento</Label>
                    <Input 
                      value={edu.institution}
                      onChange={(e) => updateEducation(eduIdx, 'institution', e.target.value)}
                      placeholder="Ex: Universidade Federal de Goiás (UFG)"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Curso / Título da Pesquisa</Label>
                    <Input 
                      value={edu.degree}
                      onChange={(e) => updateEducation(eduIdx, 'degree', e.target.value)}
                      placeholder="Ex: Ciência da Computação"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5 pr-20 md:pr-0">
                    <Label className="text-xs">Período / Ano</Label>
                    <Input 
                      value={edu.period}
                      onChange={(e) => updateEducation(eduIdx, 'period', e.target.value)}
                      placeholder="Ex: 2022 - Atual"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição Curta (Opcional)</Label>
                  <Textarea 
                    value={edu.description}
                    onChange={(e) => updateEducation(eduIdx, 'description', e.target.value)}
                    placeholder="Descrição opcional de sua pesquisa científica, projetos acadêmicos relevantes ou publicação de artigos..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 5. Competências Técnicas */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Competências & Habilidades
            </CardTitle>
            <CardDescription>Agrupe suas habilidades técnicas em categorias específicas.</CardDescription>
          </div>
          <Button onClick={addSkillGroup} size="sm" className="gap-1 flex-shrink-0">
            <Plus className="h-4 w-4" /> Adicionar Grupo
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.skills.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Nenhum grupo de competência adicionado.</p>
          ) : (
            data.skills.map((skill, skillIdx) => (
              <div key={skillIdx} className="space-y-4 p-5 rounded-2xl bg-muted/40 border border-border/50 relative group/card">
                
                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-80 group-hover/card:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveItem(lang, 'skills', skillIdx, 'up')}
                    disabled={skillIdx === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveItem(lang, 'skills', skillIdx, 'down')}
                    disabled={skillIdx === data.skills.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => removeSkillGroup(skillIdx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-1">
                    <Label className="text-xs">Título da Categoria</Label>
                    <Input 
                      value={skill.title}
                      onChange={(e) => updateSkillGroup(skillIdx, 'title', e.target.value)}
                      placeholder="Ex: Desenvolvimento Full Stack"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2 pr-20 md:pr-0">
                    <Label className="text-xs">Habilidades / Tags (Separadas por vírgula)</Label>
                    <Input 
                      defaultValue={skill.tags.join(', ')}
                      onBlur={(e) => updateSkillGroup(skillIdx, 'tags', e.target.value)}
                      placeholder="Ex: Python, TypeScript, React, Next.js"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 6. Idiomas */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Idiomas
            </CardTitle>
            <CardDescription>Adicione as línguas que você fala e seu grau de proficiência.</CardDescription>
          </div>
          <Button onClick={addLanguage} size="sm" className="gap-1 flex-shrink-0">
            <Plus className="h-4 w-4" /> Adicionar Idioma
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.languages.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Nenhum idioma adicionado.</p>
          ) : (
            data.languages.map((item, langIdx) => (
              <div key={langIdx} className="space-y-4 p-5 rounded-2xl bg-muted/40 border border-border/50 relative group/card">
                
                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-80 group-hover/card:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveItem(lang, 'languages', langIdx, 'up')}
                    disabled={langIdx === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveItem(lang, 'languages', langIdx, 'down')}
                    disabled={langIdx === data.languages.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => removeLanguage(langIdx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Idioma</Label>
                    <Input 
                      value={item.name}
                      onChange={(e) => updateLanguage(langIdx, 'name', e.target.value)}
                      placeholder="Ex: Inglês"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5 pr-20 md:pr-0">
                    <Label className="text-xs">Nível de Proficiência</Label>
                    <Input 
                      value={item.level}
                      onChange={(e) => updateLanguage(langIdx, 'level', e.target.value)}
                      placeholder="Ex: Fluente / Avançado"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Salvar Botão de Ação Inferior */}
      <div className="flex justify-end gap-3 border-t border-border/50 pt-6">
        <Button 
          onClick={onSave}
          disabled={saving || isPending}
          className="gap-2 px-8"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Currículo em {lang === 'pt-BR' ? 'Português' : 'Inglês'}
        </Button>
      </div>
    </div>
  )
}

function FolderKanbanIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      <path d="M8 10v4" />
      <path d="M12 10v4" />
      <path d="M16 10v4" />
    </svg>
  )
}
