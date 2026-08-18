import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getCachedHomepageData, getCachedSkills } from '@/lib/supabase/cached'
import { GridCursor } from '@/components/home/grid-cursor'
import { ImmersiveHero } from '@/components/home/immersive-hero'
import { HomeExperience } from '@/components/home/home-experience'
import styles from '@/components/blog/editorial.module.css'

interface HomeProps {
  params: Promise<{ locale: string }>
}

const fallbackSkills = [
  'Python', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Django', 'PostgreSQL', 'Supabase',
  'Docker', 'n8n', 'LLMs', 'RAG', 'Agentes de IA', 'Observabilidade', 'Bubble', 'Flutter',
].map((name, index) => ({ id: `fallback-${index}`, name }))

export default async function Home({ params }: HomeProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')
  const isEnglish = locale === 'en'
  const hasSupabaseEnvironment = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [dbHome, dbSkills] = (await Promise.all([
    (hasSupabaseEnvironment ? getCachedHomepageData() : Promise.resolve(null)).catch((error) => {
      console.error('Error fetching homepage data from cache:', error)
      return null
    }),
    (hasSupabaseEnvironment ? getCachedSkills() : Promise.resolve([])).catch((error) => {
      console.error('Error fetching skills from cache:', error)
      return []
    }),
  ])) as [Record<string, any> | null, Array<Record<string, any>>]

  const name = dbHome?.[isEnglish ? 'name_en' : 'name_pt'] || t('hero.title')
  const location = dbHome?.[isEnglish ? 'location_en' : 'location_pt'] || t('hero.location')
  const role = dbHome?.[isEnglish ? 'role_en' : 'role_pt'] || t('hero.role')
  const aboutTitle = dbHome?.[isEnglish ? 'about_title_en' : 'about_title_pt'] || t('about.title')
  const aboutSubtitle = t('about.subtitle')
  const avatarUrl = '/joao-maia.jpg'
  const email = dbHome?.email || 'contato@maiainteligencia.com'
  const githubUrl = dbHome?.github_url || 'https://github.com/jonhmaia'
  const linkedinUrl = dbHome?.linkedin_url || 'https://www.linkedin.com/in/joaomarcosmaia'
  const fallbackBio = isEnglish
    ? `Passionate about technology, I have been working in software development for **6 years** with one goal: solve problems and deliver products that serve the customer journey — where **code meets creativity**.

As a developer, I don't just ship code; I deliver the solution to a problem. Throughout my career I have built high-performance platforms for different business models, combining the robustness large operations demand with the explosive speed of a startup. The goal? Scale fast, with security and absolute focus on the **solution**.

In the end, effective engineering becomes efficiency and scale. I bring the background of someone who researches **Artificial Intelligence** in theory and the pragmatism of someone who needs to generate impact every day. Less promise, more speed and results.

It doesn't matter how sophisticated the engineering is; without creativity, everything is an impossible problem.`
    : `Apaixonado por tecnologia, atuando há **6 anos** na área de desenvolvimento de software com o objetivo de solucionar problemas e oferecer produtos de tecnologia que satisfaçam a jornada dos clientes, onde o **código se encontra com a criatividade**.

Como Desenvolvedor, não entrego apenas código; entrego a solução de um problema. Durante minha carreira construí plataformas de alta performance para diversos modelos de negócios, unindo a robustez que grandes operações exigem com a velocidade explosiva de uma Startup. O objetivo? Escalar rápido, com segurança e foco absoluto na **Solução**.

No fim das contas, a eficaz engenharia se traduz em eficiência e escala. Tenho a bagagem de quem pesquisa a **Inteligência Artificial** na teoria com o pragmatismo de quem precisa gerar impacto no dia a dia. Menos promessa, mais velocidade e resultado.

Não importa quão sofisticada a engenharia é; sem criatividade tudo é um problema impossível.`

  const skills = dbSkills.length
    ? dbSkills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        icon_type: skill.icon_type,
        icon_value: skill.icon_value,
      }))
    : fallbackSkills

  return (
    <main className={`${styles.blogPage} ${styles.homePage}`}>
      <GridCursor />
      <div className={styles.shell}>
        <ImmersiveHero locale={locale} name={name} role={role} location={location} />
        <HomeExperience
          locale={locale}
          name={name}
          aboutTitle={aboutTitle}
          aboutSubtitle={aboutSubtitle}
          bioMarkdown={fallbackBio}
          avatarUrl={avatarUrl}
          email={email}
          githubUrl={githubUrl}
          linkedinUrl={linkedinUrl}
          location={location}
          skills={skills}
        />
      </div>
    </main>
  )
}
