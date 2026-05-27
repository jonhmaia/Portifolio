import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Orbitron } from 'next/font/google'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from '@/lib/providers/theme-provider'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import { routing, type Locale } from '@/i18n/routing'

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
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

export const metadata: Metadata = {
  title: {
    default: "João Marcos | Desenvolvedor Full Stack",
    template: "%s | João Marcos",
  },
  description: "Portfólio e blog de João Marcos - Desenvolvedor Full Stack especializado em React, Node.js, Python e soluções web modernas.",
  keywords: ["desenvolvedor", "full stack", "react", "node.js", "python", "portfolio", "web development"],
  authors: [{ name: "João Marcos" }],
  creator: "João Marcos",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    alternateLocale: "en_US",
    siteName: "João Marcos - Portfolio",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        className={`${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} font-sans antialiased min-h-screen bg-background`}
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
