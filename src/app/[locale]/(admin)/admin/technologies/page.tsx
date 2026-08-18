'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils/slugify'
import type { Technology, TechnologyCategory } from '@/lib/types/database'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { BRAND_COLOR_HEX } from '@/lib/admin/status-colors'

const categoryLabels: Record<TechnologyCategory, string> = {
  language: 'Linguagem',
  framework: 'Framework',
  lib: 'Biblioteca',
  db: 'Banco de Dados',
  tool: 'Ferramenta',
  other: 'Outro',
}

async function fetchTechnologies() {
  const res = await fetch('/api/technologies')
  if (!res.ok) throw new Error('Falha ao carregar tecnologias')
  const json = await res.json()
  return json.data as Technology[]
}

async function createTechnology(data: Partial<Technology>) {
  const res = await fetch('/api/technologies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Falha ao criar tecnologia')
  return res.json()
}

async function updateTechnology({ id, ...data }: Partial<Technology> & { id: number }) {
  const res = await fetch(`/api/technologies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Falha ao atualizar tecnologia')
  return res.json()
}

async function deleteTechnology(id: number) {
  const res = await fetch(`/api/technologies/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao deletar tecnologia')
  return res.json()
}

const defaultFormData = {
  name: '',
  slug: '',
  icon_class: '',
  color_hex: BRAND_COLOR_HEX,
  category: 'other' as TechnologyCategory,
  is_active: true,
}

export default function AdminTechnologiesPage() {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingTech, setEditingTech] = useState<Technology | null>(null)
  const [techToDelete, setTechToDelete] = useState<Technology | null>(null)
  const [formData, setFormData] = useState(defaultFormData)

  const queryClient = useQueryClient()

  const { data: technologies, isLoading, error } = useQuery({
    queryKey: ['admin-technologies'],
    queryFn: fetchTechnologies,
  })

  const createMutation = useMutation({
    mutationFn: createTechnology,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-technologies'] })
      toast.success('Tecnologia criada com sucesso!')
      closeDialog()
    },
    onError: () => toast.error('Erro ao criar tecnologia'),
  })

  const updateMutation = useMutation({
    mutationFn: updateTechnology,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-technologies'] })
      toast.success('Tecnologia atualizada!')
      closeDialog()
    },
    onError: () => toast.error('Erro ao atualizar tecnologia'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTechnology,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-technologies'] })
      toast.success('Tecnologia deletada!')
      setDeleteDialogOpen(false)
      setTechToDelete(null)
    },
    onError: () => toast.error('Erro ao deletar tecnologia'),
  })

  const filteredTechnologies = technologies?.filter((tech) =>
    tech.name.toLowerCase().includes(search.toLowerCase())
  )

  const openNewDialog = () => {
    setEditingTech(null)
    setFormData(defaultFormData)
    setDialogOpen(true)
  }

  const openEditDialog = (tech: Technology) => {
    setEditingTech(tech)
    setFormData({
      name: tech.name,
      slug: tech.slug,
      icon_class: tech.icon_class || '',
      color_hex: tech.color_hex,
      category: tech.category,
      is_active: tech.is_active,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingTech(null)
    setFormData(defaultFormData)
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingTech ? prev.slug : slugify(name),
    }))
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.slug) {
      toast.error('Nome e slug são obrigatórios')
      return
    }

    const data = {
      ...formData,
      icon_class: formData.icon_class || null,
    }

    if (editingTech) {
      updateMutation.mutate({ id: editingTech.id, ...data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        index="06 — Tecnologias"
        title="Tecnologias"
        description="Gerencie as tecnologias dos projetos"
        action={
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tecnologia
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tecnologias..."
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
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Erro ao carregar tecnologias
                </TableCell>
              </TableRow>
            ) : filteredTechnologies?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {search ? 'Nenhuma tecnologia encontrada' : 'Nenhuma tecnologia cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              filteredTechnologies?.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tech.color_hex }}
                      />
                      <span className="font-medium">{tech.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {categoryLabels[tech.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {tech.color_hex}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tech.is_active ? 'default' : 'outline'}>
                      {tech.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(tech)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setTechToDelete(tech)
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTech ? 'Editar Tecnologia' : 'Nova Tecnologia'}
            </DialogTitle>
            <DialogDescription>
              {editingTech
                ? 'Atualize as informações da tecnologia'
                : 'Adicione uma nova tecnologia ao sistema'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="React"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="react"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value: TechnologyCategory) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="icon_class">Classe do Ícone (opcional)</Label>
              <Input
                id="icon_class"
                value={formData.icon_class}
                onChange={(e) => setFormData((prev) => ({ ...prev, icon_class: e.target.value }))}
                placeholder="devicon-react-original"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Ativo</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>
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
            <DialogTitle>Deletar Tecnologia</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a tecnologia &quot;{techToDelete?.name}&quot;?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => techToDelete && deleteMutation.mutate(techToDelete.id)}
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
