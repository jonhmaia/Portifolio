'use client'

import { useRef } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { ArrowUpRight, Github, Linkedin, Mail, MapPin } from 'lucide-react'
import { Link } from '@/navigation'
import editorial from '@/components/blog/editorial.module.css'
import { SkillIcon } from '@/components/home/skill-icon'
import { gsap, useGSAP } from '@/lib/gsap/register'
import { setupHomeScroll } from './home-scroll'
import styles from './home-experience.module.css'

interface SkillInput {
  id?: number | string
  name: string
  icon_type?: 'url' | 'embed' | 'upload' | null
  icon_value?: string | null
}

interface HomeExperienceProps {
  locale: string
  name: string
  aboutTitle: string
  aboutSubtitle: string
  bioMarkdown?: string | null
  avatarUrl: string
  email: string
  githubUrl: string
  linkedinUrl: string
  location: string
  skills: SkillInput[]
}

export function HomeExperience({
  locale,
  name,
  aboutTitle,
  aboutSubtitle,
  bioMarkdown,
  avatarUrl,
  email,
  githubUrl,
  linkedinUrl,
  location,
  skills,
}: HomeExperienceProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const isEnglish = locale === 'en'

  useGSAP(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()
    let cancelled = false

    const run = () => {
      if (cancelled || !root.isConnected) return
      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          isMobile: '(max-width: 780px)',
          isDesktop: '(min-width: 781px)',
        },
        (context) => {
          setupHomeScroll(root, {
            reduceMotion: Boolean(context.conditions?.reduceMotion),
            isMobile: Boolean(context.conditions?.isMobile),
          })
        },
        root,
      )
    }

    const fontsReady = document.fonts?.ready
    if (fontsReady) {
      void fontsReady.then(run)
    } else {
      run()
    }

    return () => {
      cancelled = true
      mm.revert()
    }
  }, {
    scope: rootRef,
    dependencies: [locale, aboutSubtitle, bioMarkdown, skills.length],
    revertOnUpdate: true,
  })

  const copy = isEnglish
    ? {
        expertiseLabel: 'Capabilities',
        expertiseMeta: 'to create what deserves to exist',
        services: [
          ['01', 'Digital products', 'Scalable SaaS, internal platforms and web experiences designed around real operations.', ['Full-stack', 'SaaS', 'UX / UI']],
          ['02', 'Applied AI', 'LLMs, conversational agents and intelligent pipelines that turn context into action.', ['Agents', 'NLP', 'RAG']],
          ['03', 'Automation', 'Resilient n8n and RPA ecosystems that remove friction from critical processes.', ['n8n', 'RPA', 'Integrations']],
          ['04', 'Revenue engineering', 'Systems, data and observability working together to accelerate commercial operations.', ['Data', 'Funnel', 'Observability']],
        ],
        defaultBio: 'Passionate about technology, I have been working in software development for 6 years with one goal: solve problems and deliver products that serve the customer journey — where code meets creativity.',
        stackLabel: 'Stack',
        stackMeta: 'Tools change, reasoning remains',
        contactLabel: 'Have an ambitious problem?',
        contactTitle: 'Let’s build something that earns its place in the world.',
        contactCta: 'Start the conversation',
        location: 'Goiânia · Brazil · Remote worldwide',
      }
    : {
        expertiseLabel: 'Competências',
        expertiseMeta: 'para criar o que merece existir',
        services: [
          ['01', 'Produtos digitais', 'SaaS, plataformas internas e experiências web escaláveis, desenhadas a partir da operação real.', ['Full-stack', 'SaaS', 'UX / UI']],
          ['02', 'IA aplicada', 'LLMs, agentes conversacionais e pipelines inteligentes que transformam contexto em ação.', ['Agentes', 'NLP', 'RAG']],
          ['03', 'Automação', 'Ecossistemas resilientes em n8n e RPA que eliminam atrito de processos críticos.', ['n8n', 'RPA', 'Integrações']],
          ['04', 'Engenharia de receita', 'Sistemas, dados e observabilidade trabalhando juntos para acelerar operações comerciais.', ['Dados', 'Funil', 'Observabilidade']],
        ],
        defaultBio: 'Apaixonado por tecnologia, atuando há 6 anos na área de desenvolvimento de software com o objetivo de solucionar problemas e oferecer produtos de tecnologia que satisfaçam a jornada dos clientes, onde o código se encontra com a criatividade.',
        stackLabel: 'Stack',
        stackMeta: 'As ferramentas mudam, o raciocínio fica',
        contactLabel: 'Tem um problema ambicioso?',
        contactTitle: 'Vamos construir algo que mereça existir.',
        contactCta: 'Começar a conversa',
        location: 'Goiânia · Brasil · Remoto para o mundo',
      }

  return (
    <div className={styles.root} ref={rootRef}>
      <section id="sobre" className={styles.section} aria-labelledby="about-title">
        <div className={editorial.feedHeader} data-scroll="feed-header">
          <h2 className={editorial.sectionLabel} id="about-title">
            {aboutTitle} / João Marcos
          </h2>
          <span className={editorial.feedCount}>JM / GOIÂNIA / 2026</span>
        </div>

        <div className={styles.aboutPanel}>
          <div className={styles.aboutImageWrap}>
            <div className={styles.aboutImage} data-scroll="about-image">
              <Image src={avatarUrl} alt={name} fill sizes="(max-width: 760px) 100vw, 28vw" className={styles.aboutImageElement} />
            </div>
            <p className={styles.aboutLocation}>
              <MapPin aria-hidden="true" size={14} />
              <span>{location.split(',')[0]}</span>
            </p>
            <div className={styles.aboutLinks}>
              <a href={githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                <Github aria-hidden="true" size={16} />
              </a>
              <a href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Linkedin aria-hidden="true" size={16} />
              </a>
              <a href={`mailto:${email}`} aria-label="E-mail">
                <Mail aria-hidden="true" size={16} />
              </a>
            </div>
          </div>

          <div className={styles.aboutCopy}>
            <h3 data-scroll="about-heading">{aboutSubtitle}</h3>
            <div className={styles.bio} data-scroll="bio">
              {bioMarkdown ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p>{children}</p>,
                    strong: ({ children }) => <strong>{children}</strong>,
                  }}
                >
                  {bioMarkdown}
                </ReactMarkdown>
              ) : (
                <p>{copy.defaultBio}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="capabilities">
        <div className={editorial.feedHeader} data-scroll="feed-header">
          <h2 className={editorial.sectionLabel} id="capabilities">
            {copy.expertiseLabel}
          </h2>
          <span className={editorial.feedCount}>{copy.expertiseMeta}</span>
        </div>

        <div className={styles.capabilityGrid}>
          {copy.services.map(([index, title, description, tags]) => (
            <article key={String(index)} className={styles.capabilityCard} data-scroll="capability-card">
              <span className={styles.capabilityIndex}>{index as string}</span>
              <h3>{title as string}</h3>
              <p>{description as string}</p>
              <ul>
                {(tags as string[]).map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="stack-title">
        <div className={editorial.feedHeader} data-scroll="feed-header">
          <h2 className={editorial.sectionLabel} id="stack-title">
            {copy.stackLabel}
          </h2>
          <span className={editorial.feedCount}>
            {copy.stackMeta} · {String(skills.length).padStart(2, '0')}
          </span>
        </div>

        <div className={styles.stackList}>
          {skills.map((skill) => (
            <span key={skill.id || skill.name} className={styles.stackItem} data-scroll="stack-item">
              <SkillIcon name={skill.name} icon_type={skill.icon_type} icon_value={skill.icon_value} />
              {skill.name}
            </span>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="home-contact">
        <div className={editorial.feedHeader} data-scroll="feed-header">
          <h2 className={editorial.sectionLabel} id="home-contact">
            {copy.contactLabel}
          </h2>
          <span className={editorial.feedCount}>{copy.location}</span>
        </div>

        <Link href="/contact" className={`${editorial.ctaCard} ${editorial.ctaFlush} ${styles.glassCta}`} data-scroll="cta">
          <div>
            <span className={editorial.ctaOverline}>{copy.contactCta} / 2026</span>
            <h2 className={editorial.ctaTitle}>{copy.contactTitle}</h2>
          </div>
          <span className={editorial.readArrow} aria-hidden="true">
            <ArrowUpRight size={18} strokeWidth={1.7} />
          </span>
        </Link>
      </section>
    </div>
  )
}
