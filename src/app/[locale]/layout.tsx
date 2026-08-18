import type { Metadata } from 'next'
import { Comfortaa, JetBrains_Mono, Montserrat, Orbitron } from 'next/font/google'
import { headers } from 'next/headers'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from '@/lib/providers/theme-provider'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import { routing, type Locale } from '@/i18n/routing'

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const comfortaa = Comfortaa({
  variable: "--font-brand",
  subsets: ["latin", "latin-ext"],
  display: "swap",
})

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const [{ locale }, requestHeaders] = await Promise.all([params, headers()])
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || 'localhost:8080'
  const protocol = requestHeaders.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const metadataBase = new URL(`${protocol}://${host}`)
  const isEnglish = locale === 'en'
  const title = isEnglish
    ? 'João Marcos — Software, AI & Automation'
    : 'João Marcos — Software, IA & Automação'
  const description = isEnglish
    ? 'Digital engineer building software, applied AI and intelligent automation for ambitious operations.'
    : 'Engenheiro digital construindo software, IA aplicada e automações inteligentes para operações ambiciosas.'
  const socialImage = new URL('/og.png', metadataBase).toString()

  return {
    metadataBase,
    title: { default: title, template: '%s — João Marcos' },
    description,
    keywords: ['software engineering', 'full stack', 'artificial intelligence', 'automation', 'n8n', 'digital products'],
    authors: [{ name: 'João Marcos' }],
    creator: 'João Marcos',
    openGraph: {
      type: 'website',
      locale: isEnglish ? 'en_US' : 'pt_BR',
      alternateLocale: isEnglish ? 'pt_BR' : 'en_US',
      siteName: 'João Marcos — Digital Engineer',
      title,
      description,
      images: [{ url: socialImage, width: 1734, height: 909, alt: 'Software que move negócios — João Marcos' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
    robots: { index: true, follow: true },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const resolvedLocale = routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale

  setRequestLocale(resolvedLocale)
  const messages = await getMessages()

  return (
    <html lang={resolvedLocale} suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${comfortaa.variable} ${jetbrainsMono.variable} ${orbitron.variable} font-sans antialiased min-h-screen bg-background`}
      >
        <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster position="top-right" />
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
