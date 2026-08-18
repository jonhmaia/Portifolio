'use client'

import { useTranslations } from 'next-intl'
import {
  Home,
  LayoutDashboard,
  FolderKanban,
  FileText,
  Tag,
  Layers,
  ChevronLeft,
  Menu,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand/logo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Link, usePathname } from '@/navigation'

function SidebarContent() {
  const pathname = usePathname()
  const t = useTranslations('admin.sidebar')

  const navigation = [
    { name: t('home'), href: '/admin/home', icon: Home, index: '01' },
    { name: t('dashboard'), href: '/admin', icon: LayoutDashboard, index: '02' },
    { name: t('projects'), href: '/admin/projects', icon: FolderKanban, index: '03' },
    { name: t('articles'), href: '/admin/articles', icon: FileText, index: '04' },
    { name: t('resume'), href: '/admin/curriculo', icon: FileText, index: '05' },
    { name: t('technologies'), href: '/admin/technologies', icon: Layers, index: '06' },
    { name: t('tags'), href: '/admin/tags', icon: Tag, index: '07' },
    { name: t('categories'), href: '/admin/categories', icon: Layers, index: '08' },
  ]

  return (
    <div className="flex flex-col h-full jm-admin__sidebar">
      <div className="jm-admin__sidebar-brand">
        <Link href="/admin" className="flex flex-col items-start gap-2" aria-label="Maia Admin">
          <BrandLogo className="h-7 w-auto" />
          <p className="jm-admin__sidebar-label">{t('controlPanel')}</p>
        </Link>
      </div>

      <nav className="jm-admin__nav">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href as any}
              className={cn(
                'jm-admin__nav-link',
                isActive && 'jm-admin__nav-link--active'
              )}
            >
              <item.icon />
              {item.name}
              <span className="jm-admin__nav-index">{item.index}</span>
            </Link>
          )
        })}
      </nav>

      <div className="jm-admin__sidebar-footer">
        <Link href="/" className="jm-admin__nav-link">
          <ChevronLeft />
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
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="jm-admin__menu-trigger">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 jm-admin">
          <SheetTitle className="sr-only">{t('navigationMenu')}</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 jm-admin__sidebar">
        <SidebarContent />
      </aside>
    </>
  )
}
