'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { BrandLogo } from '@/components/brand/logo'
import { LanguageSelector } from './language-selector'
import { Link, usePathname } from '@/navigation'
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'

function HeaderContent() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const tNav = useTranslations('nav')
  const tA11y = useTranslations('a11y')
  const locale = useLocale()
  const isEnglish = locale === 'en'

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 36)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const navigation = [
    { index: '01', name: tNav('home'), href: '/' },
    { index: '02', name: tNav('projects'), href: '/projetos' },
    { index: '03', name: tNav('blog'), href: '/blog' },
    { index: '04', name: tNav('resume'), href: '/curriculo' },
  ]

  const isResume = pathname === '/curriculo' || pathname === '/resume'

  return (
    <header className={cn(
      'jm-nav',
      isResume && 'jm-nav--solid',
      isScrolled && 'jm-nav--scrolled',
      open && 'jm-nav--menu-open',
    )}>
      <div className="jm-nav__inner">
        <Link href="/" className="jm-nav__brand" aria-label="Maia — Home">
          <BrandLogo priority className="jm-nav__mark" />
        </Link>

        <nav className="jm-nav__links" aria-label={tA11y('navigationMenu')}>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href as never}
                className={cn('jm-nav__link', isActive && 'jm-nav__link--active')}
              >
                <span>{item.index}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="jm-nav__actions">
          <div className="jm-nav__lang">
            <LanguageSelector />
          </div>
          <Link href="/contact" className="jm-nav__contact">
            <span>{tNav('contact')}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="jm-nav__menu" aria-label={tA11y('navigationMenu')}>
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              overlayClassName="z-[70] bg-transparent"
              className="jm-menu-panel inset-0 z-[70] h-svh w-full max-w-none gap-0 border-0 p-0 sm:max-w-none"
            >
              <SheetTitle className="sr-only">{tA11y('navigationMenu')}</SheetTitle>
              <div className="jm-menu-panel__bar">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="jm-menu-panel__brand"
                  aria-label="Maia — Home"
                >
                  <BrandLogo className="jm-menu-panel__mark" />
                </Link>
                <div className="jm-menu-panel__tools">
                  <LanguageSelector
                    showLabel
                    modal={false}
                    className="jm-menu-panel__lang hover:bg-black/10"
                    contentClassName="z-[80]"
                  />
                  <SheetClose asChild>
                    <button type="button" className="jm-menu-panel__close" aria-label={tA11y('closeMenu')}>
                      <X aria-hidden="true" />
                    </button>
                  </SheetClose>
                </div>
              </div>
              <div className="jm-menu-panel__top">
                <span>{isEnglish ? 'Menu / Navigation' : 'Menu / Navegação'}</span>
                <span>©26</span>
              </div>
              <nav className="jm-menu-panel__links">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as never}
                    onClick={() => setOpen(false)}
                    className={cn(pathname === item.href && 'is-active')}
                  >
                    <span>{item.index}</span>
                    <strong>{item.name}</strong>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                ))}
                <Link href="/contact" onClick={() => setOpen(false)}>
                  <span>05</span>
                  <strong>{tNav('contact')}</strong>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </nav>
              <p className="jm-menu-panel__note">
                {isEnglish
                  ? 'Digital products, AI and automation that turn complexity into scale.'
                  : 'Produtos digitais, IA e automações que transformam complexidade em escala.'}
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export function Header() {
  return (
    <Suspense fallback={<div className="jm-nav" aria-hidden="true" />}>
      <HeaderContent />
    </Suspense>
  )
}
