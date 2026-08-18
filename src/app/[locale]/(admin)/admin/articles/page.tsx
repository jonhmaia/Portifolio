'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye, Search, MoreHorizontal } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Article } from '@/lib/types/database'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getArticleStatusClass } from '@/lib/admin/status-colors'

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
}

async function fetchArticles() {
  const res = await fetch('/api/articles?limit=100')
  if (!res.ok) throw new Error('Falha ao carregar artigos')
  const json = await res.json()
  return json.data as Article[]
}

async function deleteArticle(id: number) {
  const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao deletar artigo')
  return res.json()
}

export default function AdminArticlesPage() {
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)

  const queryClient = useQueryClient()

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: fetchArticles,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      toast.success('Artigo deletado com sucesso!')
      setDeleteDialogOpen(false)
      setArticleToDelete(null)
    },
    onError: () => {
      toast.error('Erro ao deletar artigo')
    },
  })

  const filteredArticles = articles?.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (article: Article) => {
    setArticleToDelete(article)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (articleToDelete) {
      deleteMutation.mutate(articleToDelete.id)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        index="04 — Artigos"
        title="Artigos"
        description="Gerencie os artigos do seu blog"
        action={
          <Button asChild>
            <Link href="/admin/articles/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Artigo
            </Link>
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artigos..."
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
              <TableHead>Leitura</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Publicado em</TableHead>
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
                  Erro ao carregar artigos
                </TableCell>
              </TableRow>
            ) : filteredArticles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {search ? 'Nenhum artigo encontrado' : 'Nenhum artigo cadastrado'}
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles?.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground">{article.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getArticleStatusClass(article.status)}>
                      {statusLabels[article.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {article.reading_time_minutes ? `${article.reading_time_minutes} min` : '-'}
                  </TableCell>
                  <TableCell>{article.views_count}</TableCell>
                  <TableCell>
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {article.status === 'published' && (
                          <DropdownMenuItem asChild>
                            <Link href={`/blog/${article.slug}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/articles/${article.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(article)}
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
            <DialogTitle>Deletar Artigo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o artigo &quot;{articleToDelete?.title}&quot;?
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
