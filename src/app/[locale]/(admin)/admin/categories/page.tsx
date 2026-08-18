'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, MoreHorizontal, GripVertical, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import type { Category, CategoryTranslation } from '@/lib/types/database'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { BRAND_COLOR_HEX } from '@/lib/admin/status-colors'

interface CategoryWithTranslations extends Category {
  translations?: {
    pt?: CategoryTranslation
    en?: CategoryTranslation
  }
}

async function fetchCategories() {
  const res = await fetch('/api/categories?include_translations=true')
  if (!res.ok) throw new Error('Falha ao carregar categorias')
  const json = await res.json()
  return json.data as CategoryWithTranslations[]
}

async function createCategory(data: any) {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Falha ao criar categoria')
  return res.json()
}

async function updateCategory({ id, ...data }: any) {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Falha ao atualizar categoria')
  return res.json()
}

async function deleteCategory(id: number) {
  const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao deletar categoria')
  return res.json()
}

interface TranslationData {
  name: string
  description: string
}

interface FormData {
  slug: string
  color_hex: string
  display_order: number
  translations: {
    pt: TranslationData
    en: TranslationData
  }
}

const defaultFormData: FormData = {
  slug: '',
  color_hex: BRAND_COLOR_HEX,
  display_order: 0,
  translations: {
    pt: { name: '', description: '' },
    en: { name: '', description: '' },
  },
}

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithTranslations | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithTranslations | null>(null)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [langTab, setLangTab] = useState<'pt' | 'en'>('pt')

  const queryClient = useQueryClient()

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
  })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success('Categoria criada com sucesso!')
      closeDialog()
    },
    onError: () => toast.error('Erro ao criar categoria'),
  })

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success('Categoria atualizada!')
      closeDialog()
    },
    onError: () => toast.error('Erro ao atualizar categoria'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success('Categoria deletada!')
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    },
    onError: () => toast.error('Erro ao deletar categoria'),
  })

  const filteredCategories = categories?.filter((category) => {
    const ptName = category.translations?.pt?.name || category.name
    const enName = category.translations?.en?.name || ''
    return ptName.toLowerCase().includes(search.toLowerCase()) ||
           enName.toLowerCase().includes(search.toLowerCase())
  })

  const openNewDialog = () => {
    setEditingCategory(null)
    setFormData({
      ...defaultFormData,
      display_order: (categories?.length || 0) + 1,
    })
    setLangTab('pt')
    setDialogOpen(true)
  }

  const openEditDialog = (category: CategoryWithTranslations) => {
    setEditingCategory(category)
    setFormData({
      slug: category.slug,
      color_hex: category.color_hex,
      display_order: category.display_order,
      translations: {
        pt: {
          name: category.translations?.pt?.name || category.name || '',
          description: category.translations?.pt?.description || category.description || '',
        },
        en: {
          name: category.translations?.en?.name || '',
          description: category.translations?.en?.description || '',
        },
      },
    })
    setLangTab('pt')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
    setFormData(defaultFormData)
  }

  const handleNameChange = (lang: 'pt' | 'en', name: string) => {
    setFormData((prev) => ({
      ...prev,
      slug: lang === 'pt' && !editingCategory ? slugify(name) : prev.slug,
      translations: {
        ...prev.translations,
        [lang]: { ...prev.translations[lang], name },
      },
    }))
  }

  const handleDescriptionChange = (lang: 'pt' | 'en', description: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: { ...prev.translations[lang], description },
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
      display_order: formData.display_order,
      translations: {
        pt: {
          name: formData.translations.pt.name,
          description: formData.translations.pt.description || null,
        },
        en: formData.translations.en.name ? {
          name: formData.translations.en.name,
          description: formData.translations.en.description || null,
        } : null,
      },
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        index="08 — Categorias"
        title="Categorias"
        description="Gerencie as categorias de artigos"
        action={
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorias..."
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
              <TableHead className="w-[50px]">Ordem</TableHead>
              <TableHead>Nome (PT)</TableHead>
              <TableHead>Nome (EN)</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Erro ao carregar categorias
                </TableCell>
              </TableRow>
            ) : filteredCategories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {search ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories
                ?.sort((a, b) => a.display_order - b.display_order)
                .map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        {category.display_order}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color_hex }}
                        />
                        <span className="font-medium">
                          {category.translations?.pt?.name || category.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.translations?.en?.name || (
                        <span className="text-muted-foreground/50 italic">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {category.color_hex}
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
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setCategoryToDelete(category)
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Atualize as informações da categoria em ambos os idiomas'
                : 'Adicione uma nova categoria para artigos'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Non-translatable fields */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="desenvolvimento-web"
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
              <div className="space-y-2">
                <Label htmlFor="display_order">Ordem</Label>
                <Input
                  id="display_order"
                  type="number"
                  min={0}
                  value={formData.display_order}
                  onChange={(e) => setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
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
                <div className="space-y-2">
                  <Label htmlFor="description-pt">Descrição</Label>
                  <Textarea
                    id="description-pt"
                    value={formData.translations.pt.description}
                    onChange={(e) => handleDescriptionChange('pt', e.target.value)}
                    placeholder="Uma breve descrição da categoria..."
                    rows={2}
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
                <div className="space-y-2">
                  <Label htmlFor="description-en">Description</Label>
                  <Textarea
                    id="description-en"
                    value={formData.translations.en.description}
                    onChange={(e) => handleDescriptionChange('en', e.target.value)}
                    placeholder="A brief description of the category..."
                    rows={2}
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
            <DialogTitle>Deletar Categoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a categoria &quot;{categoryToDelete?.translations?.pt?.name || categoryToDelete?.name}&quot;?
              Artigos associados ficarão sem categoria.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
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
