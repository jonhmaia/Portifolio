'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Menu, Sun, Moon } from 'lucide-react'
import { useState, Suspense, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion, useScroll } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { LanguageSelector } from './language-selector'
import { Link, usePathname } from '@/navigation'

function HeaderContent() {
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const tNav = useTranslations('nav')
  const tActions = useTranslations('actions')
  const tA11y = useTranslations('a11y')

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  const navigation = [
    { name: tNav('home'), href: '/' },
    { name: tNav('projects'), href: '/projetos' },
    { name: tNav('blog'), href: '/blog' },
    { name: tNav('resume'), href: '/curriculo' },
    { name: tNav('contact'), href: '/contact' },
  ]

  // Styles controlled by state for smooth transition
  const bgClass = isScrolled 
    ? "bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60" 
    : "bg-transparent border-b border-transparent"

  return (
    <motion.header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center h-16 transition-all duration-300 ease-in-out px-4 md:px-8",
        bgClass
      )}
      initial={false}
    >
      <div className="flex w-full items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-bold text-xl group">
          <motion.div 
            className="relative h-10 w-10 overflow-hidden rounded-full border border-primary/20 shadow-sm"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Image
              src="/foto.jpeg"
              alt="João Marcos"
              fill
              className="object-cover"
            />
          </motion.div>
          <span className="hidden sm:inline-block tracking-tight group-hover:text-primary transition-colors">
            João Marcos
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href as any}
                className="relative px-4 py-2 text-sm font-medium transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={cn(
                  "relative z-10 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{tActions('toggleTheme')}</span>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] backdrop-blur-xl bg-background/90 border-l border-border/40">
              <SheetTitle className="sr-only">{tA11y('navigationMenu')}</SheetTitle>
              <nav className="flex flex-col gap-2 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'px-4 py-3 text-base font-medium rounded-lg transition-all duration-200',
                      pathname === item.href
                        ? 'bg-primary/10 text-primary translate-x-2'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:translate-x-1'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

export function Header() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderContent />
    </Suspense>
  )
}

function HeaderSkeleton() {
  return (
    <div className="h-16 w-full fixed top-0 z-50 flex items-center justify-center px-4 md:px-8 pointer-events-none">
       <div className="w-full h-16 flex items-center justify-between border-b border-border/10 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
          <div className="h-6 w-24 rounded bg-muted animate-pulse hidden sm:block" />
        </div>
        <div className="hidden md:flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-16 rounded bg-muted animate-pulse" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded bg-muted animate-pulse" />
          <div className="h-9 w-9 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}
