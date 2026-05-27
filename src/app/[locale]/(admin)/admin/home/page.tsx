'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUploader } from '@/components/admin/image-uploader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Globe, Sparkles, Code2, Link2, Upload, FileCode2 } from 'lucide-react'
import Image from 'next/image'

interface HomepageData {
  avatar_url: string | null
  email: string
  github_url: string
  linkedin_url: string
  name_pt: string
  location_pt: string
  role_pt: string
  about_title_pt: string
  about_subtitle_pt: string
  bio_pt: string
  name_en: string
  location_en: string
  role_en: string
  about_title_en: string
  about_subtitle_en: string
  bio_en: string
}

interface Skill {
  id: number
  name: string
  progress: number
  color: string
  icon_type: 'url' | 'embed' | 'upload'
  icon_value: string | null
  display_order: number
}

const defaultHomepageData: HomepageData = {
  avatar_url: null,
  email: '',
  github_url: '',
  linkedin_url: '',
  name_pt: '',
  location_pt: '',
  role_pt: '',
  about_title_pt: '',
  about_subtitle_pt: '',
  bio_pt: '',
  name_en: '',
  location_en: '',
  role_en: '',
  about_title_en: '',
  about_subtitle_en: '',
  bio_en: '',
}

const defaultSkillData = {
  name: '',
  progress: 80,
  color: '#3ECF8E',
  icon_type: 'url' as 'url' | 'embed' | 'upload',
  icon_value: '',
}

export default function AdminHomePage() {
  const supabase = createClient() as any

  // States
  const [loadingText, setLoadingText] = useState(true)
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [savingText, setSavingText] = useState(false)
  const [homepageData, setHomepageData] = useState<HomepageData>(defaultHomepageData)
  const [skills, setSkills] = useState<Skill[]>([])

  // Skill Dialog States
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [skillForm, setSkillForm] = useState(defaultSkillData)
  const [savingSkill, setSavingSkill] = useState(false)

  // Fetch Homepage Data
  const loadHomepageData = async () => {
    try {
      setLoadingText(true)
      const { data, error } = await supabase
        .from('homepage_data')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // If no row exists, we keep defaults
          setHomepageData(defaultHomepageData)
        } else {
          throw error
        }
      } else if (data) {
        setHomepageData(data as HomepageData)
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar os dados da página inicial')
    } finally {
      setLoadingText(false)
    }
  }

  // Fetch Skills Data
  const loadSkills = async () => {
    try {
      setLoadingSkills(true)
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setSkills((data || []) as Skill[])
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar habilidades')
    } finally {
      setLoadingSkills(false)
    }
  }

  useEffect(() => {
    loadHomepageData()
    loadSkills()
  }, [])

  // Save Homepage Data
  const handleSaveHomepage = async () => {
    try {
      setSavingText(true)
      const { error } = await supabase
        .from('homepage_data')
        .upsert({ id: 1, ...homepageData })

      if (error) throw error
      toast.success('Dados da página inicial salvos com sucesso!')
      await fetch('/api/revalidate?tag=homepage_data').catch(err => console.error('Failed to revalidate homepage_data:', err))
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar os dados')
    } finally {
      setSavingText(false)
    }
  }

  // Open Dialog for New Skill
  const handleNewSkill = () => {
    setEditingSkill(null)
    setSkillForm(defaultSkillData)
    setDialogOpen(true)
  }

  // Open Dialog for Edit Skill
  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill)
    setSkillForm({
      name: skill.name,
      progress: skill.progress,
      color: skill.color,
      icon_type: skill.icon_type,
      icon_value: skill.icon_value || '',
    })
    setDialogOpen(true)
  }

  // Save Skill
  const handleSaveSkill = async () => {
    if (!skillForm.name) {
      toast.error('Nome da habilidade é obrigatório')
      return
    }

    try {
      setSavingSkill(true)
      if (editingSkill) {
        // Update
        const { error } = await supabase
          .from('skills')
          .update({
            name: skillForm.name,
            progress: skillForm.progress,
            color: skillForm.color,
            icon_type: skillForm.icon_type,
            icon_value: skillForm.icon_value || null,
          })
          .eq('id', editingSkill.id)

        if (error) throw error
        toast.success('Habilidade atualizada com sucesso!')
      } else {
        // Create - calculate display order
        const maxOrder = skills.reduce((max, s) => (s.display_order > max ? s.display_order : max), 0)
        const { error } = await supabase
          .from('skills')
          .insert({
            name: skillForm.name,
            progress: skillForm.progress,
            color: skillForm.color,
            icon_type: skillForm.icon_type,
            icon_value: skillForm.icon_value || null,
            display_order: maxOrder + 1,
          })

        if (error) throw error
        toast.success('Habilidade adicionada com sucesso!')
      }
      await fetch('/api/revalidate?tag=skills').catch(err => console.error('Failed to revalidate skills:', err))
      setDialogOpen(false)
      loadSkills()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar habilidade')
    } finally {
      setSavingSkill(false)
    }
  }

  // Delete Skill
  const handleDeleteSkill = async (id: number) => {
    if (!confirm('Deseja realmente deletar esta habilidade?')) return

    try {
      const { error } = await supabase.from('skills').delete().eq('id', id)
      if (error) throw error
      toast.success('Habilidade removida!')
      await fetch('/api/revalidate?tag=skills').catch(err => console.error('Failed to revalidate skills:', err))
      loadSkills()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao deletar habilidade')
    }
  }

  // Move Skill Order
  const handleMoveSkill = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= skills.length) return

    const updatedSkills = [...skills]
    // Swap
    const temp = updatedSkills[index]
    updatedSkills[index] = updatedSkills[newIndex]
    updatedSkills[newIndex] = temp

    // Update display_order of both
    try {
      const updates = updatedSkills.map((s, idx) => ({
        id: s.id,
        name: s.name,
        progress: s.progress,
        color: s.color,
        icon_type: s.icon_type,
        icon_value: s.icon_value,
        display_order: idx + 1,
      }))

      // Upsert updates
      const { error } = await supabase.from('skills').upsert(updates)
      if (error) throw error

      await fetch('/api/revalidate?tag=skills').catch(err => console.error('Failed to revalidate skills:', err))
      setSkills(updatedSkills)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao reordenar habilidades')
    }
  }

  // Helper component to render preview icon
  const PreviewIcon = ({ type, value, color }: { type: string; value: string | null; color: string }) => {
    if (!value) {
      return <Code2 className="w-10 h-10 text-muted-foreground" />
    }

    if (type === 'embed') {
      return (
        <div 
          className="w-10 h-10 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          style={{ color }}
          dangerouslySetInnerHTML={{ __html: value }} 
        />
      )
    }

    return (
      <div className="relative w-10 h-10">
        <Image 
          src={value} 
          alt="Icon Preview" 
          fill 
          className="object-contain" 
          unoptimized 
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Página Inicial</h1>
          <p className="text-muted-foreground">Gerencie o conteúdo estático do seu perfil, biografias e as habilidades técnicas.</p>
        </div>
      </div>

      <Tabs defaultValue="texts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="texts">Textos & Biografias</TabsTrigger>
          <TabsTrigger value="skills">Habilidades (Grid)</TabsTrigger>
        </TabsList>

        {/* Tab 1: Texts and Info */}
        <TabsContent value="texts" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais e Biografias</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais, links de redes sociais e o texto de biografia bilingue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingText ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <p className="text-sm text-muted-foreground">Carregando informações...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Photo & Contacts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4 flex flex-col items-center justify-center space-y-2">
                      <Label className="mb-2">Foto de Perfil</Label>
                      <ImageUploader
                        value={homepageData.avatar_url}
                        onChange={(url) => setHomepageData(prev => ({ ...prev, avatar_url: url }))}
                        bucket="projects"
                        aspectRatio="square"
                        placeholder="Clique para enviar foto de perfil"
                        className="w-40 h-40"
                      />
                    </div>
                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          value={homepageData.email}
                          onChange={(e) => setHomepageData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="contato@exemplo.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github_url">GitHub URL</Label>
                        <Input
                          id="github_url"
                          value={homepageData.github_url}
                          onChange={(e) => setHomepageData(prev => ({ ...prev, github_url: e.target.value }))}
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                        <Input
                          id="linkedin_url"
                          value={homepageData.linkedin_url}
                          onChange={(e) => setHomepageData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PT-BR / EN Tabs for texts */}
                  <Tabs defaultValue="pt">
                    <TabsList className="bg-muted p-1">
                      <TabsTrigger value="pt" className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        Português (PT-BR)
                      </TabsTrigger>
                      <TabsTrigger value="en" className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        Inglês (EN)
                      </TabsTrigger>
                    </TabsList>

                    {/* Portuguese Form */}
                    <TabsContent value="pt" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name_pt">Nome</Label>
                          <Input
                            id="name_pt"
                            value={homepageData.name_pt || ''}
                            onChange={(e) => setHomepageData(prev => ({ ...prev, name_pt: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="role_pt">Cargo / Subtítulo Hero</Label>
                          <Input
                            id="role_pt"
                            value={homepageData.role_pt || ''}
                            onChange={(e) => setHomepageData(prev => ({ ...prev, role_pt: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location_pt">Localização</Label>
                          <Input
                            id="location_pt"
                            value={homepageData.location_pt || ''}
                            onChange={(e) => setHomepageData(prev => ({ ...prev, location_pt: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="about_title_pt">Título da Seção Sobre</Label>
                          <Input
                            id="about_title_pt"
                            value={homepageData.about_title_pt || ''}
                            onChange={(e) => setHomepageData(prev => ({ ...prev, about_title_pt: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="about_subtitle_pt">Subtítulo da Seção Sobre</Label>
                        <Input
                          id="about_subtitle_pt"
                          value={homepageData.about_subtitle_pt || ''}
                          onChange={(e) => setHomepageData(prev => ({ ...prev, about_subtitle_pt: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label htmlFor="bio_pt">Biografia (Markdown)</Label>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Dica: Use **negrito** para destacar trechos com o efeito de brilho.
                          </span>
                        </div>
                        <Textarea
                          id="bio_pt"
                          rows={12}
                          value={homepageData.bio_pt || ''}
                          onChange={(e) => setHomepageData(prev => ({ ...prev, bio_pt: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </TabsContent>

                    {/* English Form */}
                    <TabsContent value="en" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name_en">Name</Label>
                          <Input
                            id="name_en"
                            value={homepageData.name_en || ''}
                            onChange={(e) => setHomepageData(prev => ({ ...prev, name_en: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="role_en">Role / Hero Subtitle</Label>
                          <Input
                            id="role_en"
                            value={homepageData.role_en || ''}
                            onChange={(e) => setHomepageData(prev => ({ ...prev, role_en: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location_en">Location</Label>
                          <Input
                            id="location_en"
                            value={homepageData.location_en || ''}
                            onChange={(e) => setHomepageData(prev => ({ ...prev, location_en: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="about_title_en">About Section Title</Label>
                          <Input
                            id="about_title_en"
                            value={homepageData.about_title_en || ''}
                            onChange={(e) => setHomepageData(prev => ({ ...prev, about_title_en: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="about_subtitle_en">About Section Subtitle</Label>
                        <Input
                          id="about_subtitle_en"
                          value={homepageData.about_subtitle_en || ''}
                          onChange={(e) => setHomepageData(prev => ({ ...prev, about_subtitle_en: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label htmlFor="bio_en">Biography (Markdown)</Label>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Tip: Use **bold** to highlight text with glowing styling.
                          </span>
                        </div>
                        <Textarea
                          id="bio_en"
                          rows={12}
                          value={homepageData.bio_en || ''}
                          onChange={(e) => setHomepageData(prev => ({ ...prev, bio_en: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Save button */}
                  <div className="flex justify-end border-t pt-4">
                    <Button onClick={handleSaveHomepage} disabled={savingText}>
                      {savingText ? 'Salvando...' : 'Salvar Conteúdo'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Skills list */}
        <TabsContent value="skills" className="pt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Habilidades Técnicas</CardTitle>
                <CardDescription>
                  Gerencie as habilidades que aparecem na grade da página principal, seus níveis (porcentagem), cores de destaque e ícones.
                </CardDescription>
              </div>
              <Button onClick={handleNewSkill}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Habilidade
              </Button>
            </CardHeader>
            <CardContent>
              {loadingSkills ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <p className="text-sm text-muted-foreground">Carregando habilidades...</p>
                </div>
              ) : skills.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma habilidade cadastrada no momento. Clique no botão acima para adicionar.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Ordem</TableHead>
                        <TableHead>Ícone</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead>Cor</TableHead>
                        <TableHead>Tipo Ícone</TableHead>
                        <TableHead className="w-[100px] text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skills.map((skill, index) => (
                        <TableRow key={skill.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === 0}
                                onClick={() => handleMoveSkill(index, 'up')}
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === skills.length - 1}
                                onClick={() => handleMoveSkill(index, 'down')}
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="p-1 rounded bg-background/50 border w-12 h-12 flex items-center justify-center">
                              <PreviewIcon type={skill.icon_type} value={skill.icon_value} color={skill.color} />
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{skill.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-muted rounded-full h-2 overflow-hidden">
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ width: `${skill.progress}%`, backgroundColor: skill.color }} 
                                />
                              </div>
                              <span className="text-xs font-mono">{skill.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: skill.color }} />
                              <span className="font-mono text-xs">{skill.color}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize text-xs text-muted-foreground">
                            {skill.icon_type === 'upload' ? 'Upload' : skill.icon_type === 'embed' ? 'Código SVG' : 'Link Web'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditSkill(skill)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteSkill(skill.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Skill Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Editar Habilidade' : 'Nova Habilidade'}</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo. Você pode ver o preview em tempo real ao lado.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4">
            {/* Form Fields */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <Label htmlFor="skill_name">Nome *</Label>
                <Input
                  id="skill_name"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Python, React, n8n"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="skill_progress">Progresso (%) *</Label>
                  <Input
                    id="skill_progress"
                    type="number"
                    min={0}
                    max={100}
                    value={skillForm.progress}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="skill_color">Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      id="skill_color"
                      type="color"
                      value={skillForm.color}
                      onChange={(e) => setSkillForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={skillForm.color}
                      onChange={(e) => setSkillForm(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="#3ECF8E"
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Origem do Ícone</Label>
                <Select
                  value={skillForm.icon_type}
                  onValueChange={(val: 'url' | 'embed' | 'upload') => setSkillForm(prev => ({ ...prev, icon_type: val, icon_value: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">Link Externo / URL</SelectItem>
                    <SelectItem value="upload">Fazer Upload de Imagem (SVG/PNG)</SelectItem>
                    <SelectItem value="embed">Código SVG Incorporado (Raw HTML)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Icon Input */}
              {skillForm.icon_type === 'url' && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Label htmlFor="icon_value_url">URL do Ícone</Label>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Link2 className="h-3 w-3" />
                      Insira o link direto para a imagem.
                    </span>
                  </div>
                  <Input
                    id="icon_value_url"
                    value={skillForm.icon_value}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, icon_value: e.target.value }))}
                    placeholder="https://exemplo.com/icon.svg"
                  />
                </div>
              )}

              {skillForm.icon_type === 'upload' && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Label>Fazer Upload do Ícone</Label>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Upload className="h-3 w-3" />
                      Arraste ou clique para selecionar.
                    </span>
                  </div>
                  <ImageUploader
                    value={skillForm.icon_value}
                    onChange={(url) => setSkillForm(prev => ({ ...prev, icon_value: url || '' }))}
                    bucket="projects"
                    aspectRatio="square"
                    placeholder="Arraste o ícone (SVG/PNG) ou clique"
                  />
                </div>
              )}

              {skillForm.icon_type === 'embed' && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Label htmlFor="icon_value_embed">Código SVG (Raw XML)</Label>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <FileCode2 className="h-3 w-3" />
                      Copie e cole o código &lt;svg&gt;&lt;/svg&gt;.
                    </span>
                  </div>
                  <Textarea
                    id="icon_value_embed"
                    rows={5}
                    value={skillForm.icon_value}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, icon_value: e.target.value }))}
                    placeholder="<svg viewBox='0 0 24 24'>...</svg>"
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </div>

            {/* Live Preview Card (Right panel) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center border-l pl-6">
              <Label className="mb-4 text-muted-foreground text-xs uppercase tracking-wider">Preview ao vivo</Label>
              <div className="relative p-6 rounded-xl border bg-card w-40 flex flex-col items-center justify-center space-y-4 text-center group shadow-sm bg-gradient-to-b from-card/80 to-muted/20">
                {/* Nome */}
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase">
                  {skillForm.name || 'Habilidade'}
                </span>

                {/* Ícone */}
                <div className="relative w-14 h-14 flex items-center justify-center bg-muted/40 rounded-lg p-2 border border-border/60">
                  <PreviewIcon type={skillForm.icon_type} value={skillForm.icon_value} color={skillForm.color} />
                </div>

                {/* Barra progresso */}
                <div className="w-14 h-[4px] bg-muted dark:bg-neutral-800 rounded-full overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${skillForm.progress}%`, backgroundColor: skillForm.color }}
                  />
                </div>
                
                {/* Porcentagem */}
                <span className="text-[10px] font-mono text-muted-foreground">{skillForm.progress}%</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveSkill} disabled={savingSkill}>
              {savingSkill ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
