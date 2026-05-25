'use client'

import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Tag,
  Layers,
  Code2,
  ChevronLeft,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Link, usePathname } from '@/navigation'

function SidebarContent() {
  const pathname = usePathname()
  const t = useTranslations('admin.sidebar')

  const navigation = [
    { name: t('dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('projects'), href: '/admin/projects', icon: FolderKanban },
    { name: t('articles'), href: '/admin/articles', icon: FileText },
    { name: t('resume'), href: '/admin/curriculo', icon: FileText },
    { name: t('technologies'), href: '/admin/technologies', icon: Layers },
    { name: t('tags'), href: '/admin/tags', icon: Tag },
    { name: t('categories'), href: '/admin/categories', icon: Layers },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-lg">Admin</span>
            <p className="text-xs text-muted-foreground">{t('controlPanel')}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href as any}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Back to site */}
      <div className="p-4 border-t border-border/50">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          {t('backToSite')}
        </Link>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)
  const t = useTranslations('admin.sidebar')

  return (
    <>
      {/* Mobile Sidebar Trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">{t('navigationMenu')}</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-card border-r border-border/50">
        <SidebarContent />
      </aside>
    </>
  )
}
