import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ResumeView } from '@/components/resume/resume-view'

interface ResumePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ResumePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'resume' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ResumeView locale={locale} />
}
