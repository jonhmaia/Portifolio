'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, MoreHorizontal, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils/slugify'
import type { Tag, TagTranslation } from '@/lib/types/database'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { BRAND_COLOR_HEX } from '@/lib/admin/status-colors'

interface TagWithTranslations extends Tag {
  translations?: {
    pt?: TagTranslation
    en?: TagTranslation
  }
}

async function fetchTags() {
  const res = await fetch('/api/tags?include_translations=true')
  if (!res.ok) throw new Error('Falha ao carregar tags')
  const json = await res.json()
  return json.data as TagWithTranslations[]
}

async function createTag(data: any) {
  const res = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Falha ao criar tag')
  return res.json()
}

async function updateTag({ id, ...data }: any) {
  const res = await fetch(`/api/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Falha ao atualizar tag')
  return res.json()
}

async function deleteTag(id: number) {
  const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao deletar tag')
  return res.json()
}

interface TranslationData {
  name: string
}

interface FormData {
  slug: string
  color_hex: string
  translations: {
    pt: TranslationData
    en: TranslationData
  }
}

const defaultFormData: FormData = {
  slug: '',
  color_hex: BRAND_COLOR_HEX,
  translations: {
    pt: { name: '' },
    en: { name: '' },
  },
}

export default function AdminTagsPage() {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagWithTranslations | null>(null)
  const [tagToDelete, setTagToDelete] = useState<TagWithTranslations | null>(null)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [langTab, setLangTab] = useState<'pt' | 'en'>('pt')

  const queryClient = useQueryClient()

  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: fetchTags,
  })

  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] })
      toast.success('Tag criada com sucesso!')
      closeDialog()
    },
    onError: () => toast.error('Erro ao criar tag'),
  })

  const updateMutation = useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] })
      toast.success('Tag atualizada!')
      closeDialog()
    },
    onError: () => toast.error('Erro ao atualizar tag'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] })
      toast.success('Tag deletada!')
      setDeleteDialogOpen(false)
      setTagToDelete(null)
    },
    onError: () => toast.error('Erro ao deletar tag'),
  })

  const filteredTags = tags?.filter((tag) => {
    const ptName = tag.translations?.pt?.name || tag.name
    const enName = tag.translations?.en?.name || ''
    return ptName.toLowerCase().includes(search.toLowerCase()) ||
           enName.toLowerCase().includes(search.toLowerCase())
  })

  const openNewDialog = () => {
    setEditingTag(null)
    setFormData(defaultFormData)
    setLangTab('pt')
    setDialogOpen(true)
  }

  const openEditDialog = (tag: TagWithTranslations) => {
    setEditingTag(tag)
    setFormData({
      slug: tag.slug,
      color_hex: tag.color_hex,
      translations: {
        pt: { name: tag.translations?.pt?.name || tag.name || '' },
        en: { name: tag.translations?.en?.name || '' },
      },
    })
    setLangTab('pt')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingTag(null)
    setFormData(defaultFormData)
  }

  const handleNameChange = (lang: 'pt' | 'en', name: string) => {
    setFormData((prev) => ({
      ...prev,
      slug: lang === 'pt' && !editingTag ? slugify(name) : prev.slug,
      translations: {
        ...prev.translations,
        [lang]: { name },
      },
    }))
  }

  const handleSubmit = () => {
    if (!formData.translations.pt.name || !formData.slug) {
      toast.error('Nome (PT-BR) e slug são obrigatórios')
      return
    }

    const data = {
      slug: formData.slug,
      color_hex: formData.color_hex,
      translations: {
        pt: { name: formData.translations.pt.name },
        en: formData.translations.en.name ? { name: formData.translations.en.name } : null,
      },
    }

    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, ...data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        index="07 — Tags"
        title="Tags"
        description="Gerencie as tags para projetos e artigos"
        action={
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tag
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="jm-admin__table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome (PT)</TableHead>
              <TableHead>Nome (EN)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Erro ao carregar tags
                </TableCell>
              </TableRow>
            ) : filteredTags?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {search ? 'Nenhuma tag encontrada' : 'Nenhuma tag cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              filteredTags?.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color_hex }}
                      />
                      <span className="font-medium">
                        {tag.translations?.pt?.name || tag.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.translations?.en?.name || (
                      <span className="text-muted-foreground/50 italic">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {tag.color_hex}
                    </code>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setTagToDelete(tag)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {editingTag ? 'Editar Tag' : 'Nova Tag'}
            </DialogTitle>
            <DialogDescription>
              {editingTag
                ? 'Atualize as informações da tag em ambos os idiomas'
                : 'Adicione uma nova tag ao sistema'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Non-translatable fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="web-development"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color_hex}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color_hex: e.target.value }))}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.color_hex}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color_hex: e.target.value }))}
                    placeholder={BRAND_COLOR_HEX}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Translatable fields */}
            <Tabs value={langTab} onValueChange={(v) => setLangTab(v as 'pt' | 'en')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pt" className="gap-2">
                  🇧🇷 Português
                  {!formData.translations.pt.name && (
                    <span className="h-2 w-2 bg-destructive rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="en" className="gap-2">
                  🇺🇸 English
                  {formData.translations.en.name && (
                    <span className="h-2 w-2 bg-green-500 rounded-full" />
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pt" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name-pt">Nome *</Label>
                  <Input
                    id="name-pt"
                    value={formData.translations.pt.name}
                    onChange={(e) => handleNameChange('pt', e.target.value)}
                    placeholder="Desenvolvimento Web"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="en" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name-en">Name</Label>
                  <Input
                    id="name-en"
                    value={formData.translations.en.name}
                    onChange={(e) => handleNameChange('en', e.target.value)}
                    placeholder="Web Development"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Tag</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a tag &quot;{tagToDelete?.translations?.pt?.name || tagToDelete?.name}&quot;?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => tagToDelete && deleteMutation.mutate(tagToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
