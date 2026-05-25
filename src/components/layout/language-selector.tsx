'use client'

import { useTransition } from 'react'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/navigation'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const BrazilFlag = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 720 500" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="720" height="500" fill="#009c3b" />
    <polygon points="360,80 640,250 360,420 80,250" fill="#ffdf00" />
    <circle cx="360" cy="250" r="105" fill="#002776" />
    <path d="M 267,280 A 105,105 0 0,1 453,280" fill="none" stroke="#ffffff" strokeWidth="8" />
  </svg>
)

const USFlag = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 741 390" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="741" height="390" fill="#ffffff" />
    {/* 7 Red stripes */}
    <rect width="741" height="30" fill="#b22234" />
    <rect y="60" width="741" height="30" fill="#b22234" />
    <rect y="120" width="741" height="30" fill="#b22234" />
    <rect y="180" width="741" height="30" fill="#b22234" />
    <rect y="240" width="741" height="30" fill="#b22234" />
    <rect y="300" width="741" height="30" fill="#b22234" />
    <rect y="360" width="741" height="30" fill="#b22234" />
    {/* Blue canton */}
    <rect width="296" height="210" fill="#3c3b6e" />
    {/* Stars grid (minimalist white circles representing stars) */}
    <circle cx="40" cy="30" r="4.5" fill="#ffffff" />
    <circle cx="90" cy="30" r="4.5" fill="#ffffff" />
    <circle cx="140" cy="30" r="4.5" fill="#ffffff" />
    <circle cx="190" cy="30" r="4.5" fill="#ffffff" />
    <circle cx="240" cy="30" r="4.5" fill="#ffffff" />

    <circle cx="65" cy="65" r="4.5" fill="#ffffff" />
    <circle cx="115" cy="65" r="4.5" fill="#ffffff" />
    <circle cx="165" cy="65" r="4.5" fill="#ffffff" />
    <circle cx="215" cy="65" r="4.5" fill="#ffffff" />

    <circle cx="40" cy="100" r="4.5" fill="#ffffff" />
    <circle cx="90" cy="100" r="4.5" fill="#ffffff" />
    <circle cx="140" cy="100" r="4.5" fill="#ffffff" />
    <circle cx="190" cy="100" r="4.5" fill="#ffffff" />
    <circle cx="240" cy="100" r="4.5" fill="#ffffff" />

    <circle cx="65" cy="135" r="4.5" fill="#ffffff" />
    <circle cx="115" cy="135" r="4.5" fill="#ffffff" />
    <circle cx="165" cy="135" r="4.5" fill="#ffffff" />
    <circle cx="215" cy="135" r="4.5" fill="#ffffff" />

    <circle cx="40" cy="170" r="4.5" fill="#ffffff" />
    <circle cx="90" cy="170" r="4.5" fill="#ffffff" />
    <circle cx="140" cy="170" r="4.5" fill="#ffffff" />
    <circle cx="190" cy="170" r="4.5" fill="#ffffff" />
    <circle cx="240" cy="170" r="4.5" fill="#ffffff" />
  </svg>
)

interface Language {
  code: 'pt-BR' | 'en'
  name: string
  flag: React.ComponentType<{ className?: string }>
  country: string
}

const languages: Language[] = [
  { code: 'pt-BR', name: 'Português', flag: BrazilFlag, country: 'Brasil' },
  { code: 'en', name: 'English', flag: USFlag, country: 'USA' },
]

export function LanguageSelector() {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const locale = useLocale() as 'pt-BR' | 'en'
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = (lang: 'pt-BR' | 'en') => {
    startTransition(() => {
      router.replace(
        { pathname, params: params as Record<string, string> } as any,
        { locale: lang }
      )
    })
  }

  const currentLanguage = languages.find((l) => l.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-accent"
          disabled={isPending}
        >
          {currentLanguage && (
            <currentLanguage.flag className="w-5 h-3.5 rounded-[2px] object-cover shadow-sm border border-border/10" />
          )}
          <span className="hidden sm:inline font-medium">{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-3 cursor-pointer transition-colors ${
              locale === lang.code 
                ? 'bg-accent font-semibold' 
                : 'hover:bg-accent/50'
            }`}
          >
            <lang.flag className="w-6 h-4 rounded-[2px] object-cover shadow-sm flex-shrink-0 border border-border/10" />
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium leading-tight">{lang.name}</span>
              <span className="text-xs text-muted-foreground">{lang.country}</span>
            </div>
            {locale === lang.code && (
              <span className="text-xs text-primary ml-auto">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
