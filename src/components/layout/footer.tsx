'use client'

import { ArrowUpRight } from 'lucide-react'
import { useLocale } from 'next-intl'
import { BrandLogo } from '@/components/brand/logo'
import { Link } from '@/navigation'
import styles from './footer.module.css'

export function Footer() {
  const locale = useLocale()
  const isEnglish = locale === 'en'
  const year = new Date().getFullYear()

  const copy = isEnglish
    ? {
        label: 'Independent digital engineer',
        intro: 'Building software, AI and automation for ambitious operations.',
        navigation: 'Navigation',
        home: 'Home',
        projects: 'Projects',
        blog: 'Notes',
        resume: 'Resume',
        contact: 'Contact',
        social: 'Elsewhere',
        company: 'Company',
        availability: 'Available for selected projects',
        top: 'Back to top',
      }
    : {
        label: 'Engenheiro digital independente',
        intro: 'Construindo software, IA e automações para operações ambiciosas.',
        navigation: 'Navegação',
        home: 'Início',
        projects: 'Projetos',
        blog: 'Notas',
        resume: 'Currículo',
        contact: 'Contato',
        social: 'Outros lugares',
        company: 'Empresa',
        availability: 'Disponível para projetos selecionados',
        top: 'Voltar ao topo',
      }

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.statement}>
          <p className={styles.label}>{copy.label}</p>
          <h2>{copy.intro}</h2>
        </div>

        <nav className={styles.column} aria-label={copy.navigation}>
          <p className={styles.label}>01 / {copy.navigation}</p>
          <Link href="/">{copy.home}</Link>
          <Link href="/projetos">{copy.projects}</Link>
          <Link href="/blog">{copy.blog}</Link>
          <Link href="/curriculo">{copy.resume}</Link>
          <Link href="/contact">{copy.contact}</Link>
        </nav>

        <div className={styles.column}>
          <p className={styles.label}>02 / {copy.social}</p>
          <a href="https://github.com/jonhmaia" target="_blank" rel="noreferrer">GitHub <ArrowUpRight aria-hidden="true" /></a>
          <a href="https://www.linkedin.com/in/joaomarcosmaia" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight aria-hidden="true" /></a>
          <a href="mailto:contato@maiainteligencia.com">E-mail <ArrowUpRight aria-hidden="true" /></a>
          <a href="https://www.maiainteligencia.com.br/" target="_blank" rel="noreferrer">Maia Inteligência <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </div>

      <a href="#top" className={styles.wordmark} aria-label={copy.top}>
        <BrandLogo className={styles.wordmarkLogo} />
      </a>

      <div className={styles.bottom}>
        <span className={styles.availability}><i aria-hidden="true" /> {copy.availability}</span>
        <span>GOIÂNIA / BRASIL</span>
        <span>© {year} JM</span>
        <Link href="/admin">CMS</Link>
      </div>
    </footer>
  )
}
