'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye, ExternalLink, Search, MoreHorizontal } from 'lucide-react'
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
import { toast } from 'sonner'
import type { Project } from '@/lib/types/database'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getProjectStatusClass } from '@/lib/admin/status-colors'

const statusLabels: Record<string, string> = {
  dev: 'Em Desenvolvimento',
  concluido: 'Concluído',
  pausado: 'Pausado',
  arquivado: 'Arquivado',
}

async function fetchProjects() {
  const res = await fetch('/api/projects?limit=100')
  if (!res.ok) throw new Error('Falha ao carregar projetos')
  const json = await res.json()
  return json.data as Project[]
}

async function deleteProject(id: number) {
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao deletar projeto')
  return res.json()
}

export default function AdminProjectsPage() {
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const queryClient = useQueryClient()

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: fetchProjects,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] })
      toast.success('Projeto deletado com sucesso!')
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    },
    onError: () => {
      toast.error('Erro ao deletar projeto')
    },
  })

  const filteredProjects = projects?.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase()) ||
    project.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        index="03 — Projetos"
        title="Projetos"
        description="Gerencie seus projetos do portfólio"
        action={
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Link>
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
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
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Destaque</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Erro ao carregar projetos
                </TableCell>
              </TableRow>
            ) : filteredProjects?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {search ? 'Nenhum projeto encontrado' : 'Nenhum projeto cadastrado'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects?.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground">{project.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getProjectStatusClass(project.status)}>
                      {statusLabels[project.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {project.is_featured ? (
                      <Badge variant="secondary">Sim</Badge>
                    ) : (
                      <span className="text-muted-foreground">Não</span>
                    )}
                  </TableCell>
                  <TableCell>{project.views_count}</TableCell>
                  <TableCell>
                    {new Date(project.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/portfolio/${project.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/projects/${project.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        {project.deploy_url && (
                          <DropdownMenuItem asChild>
                            <a href={project.deploy_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ver Demo
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(project)}
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Projeto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o projeto &quot;{projectToDelete?.title}&quot;?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
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
