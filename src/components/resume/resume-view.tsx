import { getTranslations } from 'next-intl/server'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import editorialStyles from '@/components/blog/editorial.module.css'
import { getCachedHomepageData, getCachedResumeData } from '@/lib/supabase/cached'
import type { HomepageData, ResumeData } from '@/lib/types/database'
import {
  ResumeDocument,
  type ResumeEducation,
  type ResumeExperience,
  type ResumeLanguage,
  type ResumeProject,
  type ResumeSkillGroup,
} from '@/components/resume/resume-document'

const DEFAULT_EMAIL = 'contato@maiainteligencia.com'
const DEFAULT_PHONE = '(62) 99901-8119'
const DEFAULT_GITHUB = 'https://github.com/jonhmaia'
const DEFAULT_LINKEDIN = 'https://www.linkedin.com/in/joaomarcosmaia'
const RESEARCH_HREF = 'https://jems3.sbc.org.br/submissions/16411'

type ResumeViewProps = {
  locale: string
}

function asList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

export async function ResumeView({ locale }: ResumeViewProps) {
  const t = await getTranslations('resume')
  const isEnglish = locale === 'en'

  const [resumeDbData, homepageData] = await Promise.all([
    getCachedResumeData(locale).catch((error) => {
      console.error('Error fetching resume data from cache:', error)
      return null
    }) as Promise<ResumeData | null>,
    getCachedHomepageData().catch((error) => {
      console.error('Error fetching homepage data from cache:', error)
      return null
    }) as Promise<HomepageData | null>,
  ])

  const name =
    homepageData?.[isEnglish ? 'name_en' : 'name_pt'] ||
    'João Marcos'
  const role = resumeDbData?.role || homepageData?.[isEnglish ? 'role_en' : 'role_pt'] || t('role')
  const avatar = '/joao-maia.jpg'
  const pdfPath = resumeDbData?.pdf_url || (isEnglish ? '/curriculo-en.pdf' : '/curriculo-pt.pdf')

  const experiences: ResumeExperience[] = asList<ResumeExperience>(resumeDbData?.experiences)
  const projects: ResumeProject[] = asList<ResumeProject>(resumeDbData?.featured_projects)
  const education: ResumeEducation[] = asList<ResumeEducation>(resumeDbData?.education)
  const skills: ResumeSkillGroup[] = asList<ResumeSkillGroup>(resumeDbData?.skills)
  const languages: ResumeLanguage[] = asList<ResumeLanguage>(resumeDbData?.languages)

  const summary = resumeDbData?.summary ? (
    <MarkdownRenderer content={resumeDbData.summary} className={editorialStyles.richTextOnDark} />
  ) : (
    <>
      <p>
        {t.rich('professionalSummary.p1', {
          emphasis: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>
      <p>
        {t.rich('professionalSummary.p2', {
          emphasis: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>
      <p>
        {t.rich('professionalSummary.p3', {
          emphasis: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>
    </>
  )

  return (
    <ResumeDocument
      name={name}
      role={role}
      avatar={avatar}
      summary={summary}
      experiences={experiences.length > 0 ? experiences : fallbackExperiences(t)}
      projects={projects.length > 0 ? projects : fallbackProjects(t)}
      education={education.length > 0 ? education : fallbackEducation(t)}
      skills={skills.length > 0 ? skills : fallbackSkills(t, isEnglish)}
      languages={languages.length > 0 ? languages : fallbackLanguages(t)}
      contact={{
        email: homepageData?.email || DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        location: homepageData?.[isEnglish ? 'location_en' : 'location_pt'] || (isEnglish ? 'Goiânia, Brazil' : 'Goiânia, GO'),
        linkedin: homepageData?.linkedin_url || DEFAULT_LINKEDIN,
        github: homepageData?.github_url || DEFAULT_GITHUB,
      }}
      labels={{
        documentLabel: t('document.documentLabel'),
        profileLabel: t('document.profileLabel'),
        currentFocus: t('document.currentFocus'),
        professionalSummary: t('professionalSummary.title'),
        summaryEyebrow: t('document.summaryEyebrow'),
        summaryHeadline: t('document.summaryHeadline'),
        experience: t('experience.title'),
        experienceEyebrow: t('document.experienceEyebrow'),
        projects: t('featuredProjects.title'),
        projectsEyebrow: t('document.projectsEyebrow'),
        education: t('education.title'),
        skills: t('skills.title'),
        languages: t('languages.title'),
        download: t('downloadPdf'),
        contact: t('document.contact'),
        ctaEyebrow: t('document.ctaEyebrow'),
        ctaHeadline: t('document.ctaHeadline'),
        ctaBody: t('document.ctaBody'),
        email: t('document.email'),
        phone: t('document.phone'),
        location: t('document.location'),
        portraitMark: t('document.portraitMark'),
        educationEyebrow: t('document.educationEyebrow'),
        skillsEyebrow: t('document.skillsEyebrow'),
        languagesEyebrow: t('document.languagesEyebrow'),
        practiceLine: t('document.practiceLine'),
      }}
      pdfPath={pdfPath}
      downloadFileName={isEnglish ? 'resume.pdf' : 'curriculo.pdf'}
    />
  )
}

function fallbackExperiences(t: Awaited<ReturnType<typeof getTranslations<'resume'>>>): ResumeExperience[] {
  return [
    {
      company: t('experience.watrix.company'),
      role: t('experience.watrix.role'),
      period: t('experience.watrix.period'),
      items: [t('experience.watrix.items.1'), t('experience.watrix.items.2'), t('experience.watrix.items.3'), t('experience.watrix.items.4')],
    },
    {
      company: t('experience.flexOn.company'),
      role: t('experience.flexOn.role'),
      period: t('experience.flexOn.period'),
      items: [t('experience.flexOn.items.1'), t('experience.flexOn.items.2'), t('experience.flexOn.items.3')],
    },
    {
      company: t('experience.ceia.company'),
      role: t('experience.ceia.role'),
      period: t('experience.ceia.period'),
      items: [t('experience.ceia.items.1'), t('experience.ceia.items.2'), t('experience.ceia.items.3')],
    },
  ]
}

function fallbackProjects(t: Awaited<ReturnType<typeof getTranslations<'resume'>>>): ResumeProject[] {
  return [
    {
      title: t('featuredProjects.maestro.title'),
      subtitle: t('featuredProjects.maestro.subtitle'),
      description: t('featuredProjects.maestro.description'),
      techs: ['n8n', 'OpenAI', 'Supabase'],
    },
    {
      title: t('featuredProjects.camapum.title'),
      subtitle: t('featuredProjects.camapum.subtitle'),
      description: t('featuredProjects.camapum.description'),
      techs: ['React', 'Supabase', 'n8n'],
    },
    {
      title: t('featuredProjects.cashmed.title'),
      subtitle: t('featuredProjects.cashmed.subtitle'),
      description: t('featuredProjects.cashmed.description'),
      techs: ['Python', 'Django', 'Fintech'],
    },
  ]
}

function fallbackEducation(t: Awaited<ReturnType<typeof getTranslations<'resume'>>>): ResumeEducation[] {
  return [
    {
      institution: t('education.ufg.institution'),
      degree: t('education.ufg.title'),
      period: t('education.ufg.period'),
    },
    {
      institution: t('education.research.event'),
      degree: t('education.research.title'),
      period: '2025',
      description: t('education.research.description'),
      href: RESEARCH_HREF,
      badge: t('education.research.badge'),
    },
  ]
}

function fallbackSkills(
  t: Awaited<ReturnType<typeof getTranslations<'resume'>>>,
  isEnglish: boolean
): ResumeSkillGroup[] {
  return [
    {
      title: t('skills.fullstack.title'),
      tags: ['Python', 'TypeScript', 'Node.js', 'React', 'Next.js', 'C/C++', 'SQL'],
    },
    {
      title: t('skills.ai.title'),
      tags: ['LLM Fine-Tuning', 'NLP', 'RAG', 'Generative AI', 'Data Governance', 'Observability', 'RPA'],
    },
    {
      title: t('skills.automation.title'),
      tags: ['n8n', 'Bubble.io', 'Docker', 'PostgreSQL', 'Supabase', 'Git', 'CI/CD'],
    },
    {
      title: t('skills.strategy.title'),
      tags: isEnglish
        ? ['Technical Leadership', 'Revenue Engineering', 'Software Architecture', 'Hyperautomation', 'Scrum/Agile']
        : ['Liderança Técnica', 'Engenharia de Receita', 'Arquitetura de Software', 'Hiperautomação', 'Scrum/Agile'],
    },
  ]
}

function fallbackLanguages(t: Awaited<ReturnType<typeof getTranslations<'resume'>>>): ResumeLanguage[] {
  return [
    { name: t('languages.pt.name'), level: t('languages.pt.level') },
    { name: t('languages.en.name'), level: t('languages.en.level') },
  ]
}
