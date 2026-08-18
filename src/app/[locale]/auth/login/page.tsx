import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { BrandLogo } from '@/components/brand/logo'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Acesse o painel administrativo',
}

export default async function LoginPage() {
  const t = await getTranslations('auth.loginPage')

  return (
    <div className="jm-admin-login jm-admin">
      <div className="jm-admin-login__frame space-y-8">
        <div className="flex flex-col items-center">
          <Link href="/" className="mb-4" aria-label="Maia — Home">
            <BrandLogo priority className="h-10 w-auto" />
          </Link>
          <p className="jm-admin__page-kicker mb-3">Admin</p>
          <h1 className="jm-admin-login__title">{t('title')}</h1>
          <p className="text-muted-foreground text-center mt-3 text-sm max-w-xs">
            {t('subtitle')}
          </p>
        </div>

        <LoginForm />

        <div className="text-center">
          <Link
            href="/"
            className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            {t('backToSite')}
          </Link>
        </div>
      </div>
    </div>
  )
}
