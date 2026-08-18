import Image, { type StaticImageData } from 'next/image'
import {
  ArrowDownToLine,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import type { ReactNode } from 'react'

import styles from './resume-document.module.css'

export interface ResumeExperience {
  company: string
  role: string
  period: string
  items: string[]
}

export interface ResumeProject {
  title: string
  subtitle?: string
  description: string
  techs: string[]
}

export interface ResumeEducation {
  institution: string
  degree: string
  period: string
  description?: string
  href?: string
  badge?: string
}

export interface ResumeSkillGroup {
  title: string
  tags: string[]
}

export interface ResumeLanguage {
  name: string
  level: string
}

export interface ResumeContact {
  email: string
  phone?: string
  location?: string
  website?: string
  linkedin?: string
  github?: string
}

export interface ResumeLabels {
  documentLabel: string
  profileLabel: string
  currentFocus: string
  professionalSummary: string
  summaryEyebrow: string
  summaryHeadline: string
  experience: string
  experienceEyebrow: string
  projects: string
  projectsEyebrow: string
  education: string
  skills: string
  languages: string
  download: string
  contact: string
  metricExperiences: string
  metricProjects: string
  metricSkills: string
  metricLanguages: string
  ctaEyebrow: string
  ctaHeadline: string
  ctaBody: string
  email: string
  phone: string
  location: string
}

interface ResumeDocumentProps {
  name: string
  role: string
  avatar: string | StaticImageData
  summary: ReactNode
  experiences: ResumeExperience[]
  projects: ResumeProject[]
  education: ResumeEducation[]
  skills: ResumeSkillGroup[]
  languages: ResumeLanguage[]
  contact: ResumeContact
  labels: ResumeLabels
  pdfPath: string
  downloadFileName: string
}

interface SectionHeadingProps {
  index: string
  eyebrow: string
  title: string
  id: string
  inverse?: boolean
}

function SectionHeading({ index, eyebrow, title, id, inverse = false }: SectionHeadingProps) {
  return (
    <header className={`${styles.sectionHeading} ${inverse ? styles.sectionHeadingInverse : ''}`}>
      <div className={styles.sectionMeta}>
        <span>{index}</span>
        <span aria-hidden="true" className={styles.sectionRule} />
        <span>{eyebrow}</span>
      </div>
      <h2 id={id} className={styles.sectionTitle}>{title}</h2>
    </header>
  )
}

function numberWithLeadingZero(value: number) {
  return String(value).padStart(2, '0')
}

export function ResumeDocument({
  name,
  role,
  avatar,
  summary,
  experiences,
  projects,
  education,
  skills,
  languages,
  contact,
  labels,
  pdfPath,
  downloadFileName,
}: ResumeDocumentProps) {
  const [firstName, ...remainingNames] = name.trim().split(/\s+/)
  const secondLine = remainingNames.join(' ') || firstName
  const skillCount = new Set(skills.flatMap((group) => group.tags)).size
  const metrics = [
    { value: experiences.length, label: labels.metricExperiences },
    { value: projects.length, label: labels.metricProjects },
    { value: skillCount, label: labels.metricSkills },
    { value: languages.length, label: labels.metricLanguages },
  ]

  return (
    <article className={styles.resumeRoot}>
      <section className={`${styles.panel} ${styles.paperPanel} ${styles.hero}`} aria-labelledby="resume-name">
        <div className={styles.frame}>
          <div className={styles.heroTopline}>
            <span>{labels.documentLabel}</span>
            <span className={styles.focusLine}>
              <i aria-hidden="true" />
              {labels.currentFocus}
            </span>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>{labels.profileLabel}</p>
              <h1 id="resume-name" className={styles.heroName} aria-label={name}>
                <span>{firstName}</span>
                <span className={styles.heroNameAccent}>{secondLine}</span>
              </h1>
              <p className={styles.heroRole}>{role}</p>

              <div className={`${styles.heroActions} ${styles.noPrint}`}>
                <a className={styles.primaryAction} href={pdfPath} download={downloadFileName}>
                  <ArrowDownToLine aria-hidden="true" />
                  {labels.download}
                </a>
                <a className={styles.secondaryAction} href={`mailto:${contact.email}`}>
                  {labels.contact}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className={styles.portraitColumn}>
              <div className={styles.portraitFrame}>
                <Image
                  src={avatar}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 767px) 84vw, (max-width: 1199px) 38vw, 440px"
                  className={styles.portraitImage}
                />
              </div>
              <div className={styles.portraitCaption}>
                <span>JM / 001</span>
                <span>{labels.profileLabel}</span>
              </div>
            </div>
          </div>

          <div className={styles.contactStrip}>
            <a href={`mailto:${contact.email}`} className={styles.contactItem}>
              <Mail aria-hidden="true" />
              <span>
                <small>{labels.email}</small>
                {contact.email}
              </span>
            </a>
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className={styles.contactItem}>
                <Phone aria-hidden="true" />
                <span>
                  <small>{labels.phone}</small>
                  {contact.phone}
                </span>
              </a>
            )}
            {contact.location && (
              <div className={styles.contactItem}>
                <MapPin aria-hidden="true" />
                <span>
                  <small>{labels.location}</small>
                  {contact.location}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.inkPanel} ${styles.summaryPanel}`} aria-labelledby="resume-summary">
        <div className={styles.frame}>
          <SectionHeading
            index="01"
            eyebrow={labels.summaryEyebrow}
            title={labels.professionalSummary}
            id="resume-summary"
            inverse
          />

          <div className={styles.summaryGrid}>
            <p className={styles.summaryHeadline}>{labels.summaryHeadline}</p>
            <div className={styles.summaryContent}>{summary}</div>
          </div>

          <dl className={styles.metricsGrid}>
            {metrics.map((metric) => (
              <div className={styles.metric} key={metric.label}>
                <dd>{numberWithLeadingZero(metric.value)}</dd>
                <dt>{metric.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.paperPanel} ${styles.experiencePanel}`} aria-labelledby="resume-experience">
        <div className={styles.frame}>
          <SectionHeading
            index="02"
            eyebrow={labels.experienceEyebrow}
            title={labels.experience}
            id="resume-experience"
          />

          <ol className={styles.timeline}>
            {experiences.map((experience, index) => (
              <li className={styles.timelineItem} key={`${experience.company}-${experience.role}-${index}`}>
                <div className={styles.timelineIndex} aria-hidden="true">
                  <span>{numberWithLeadingZero(index + 1)}</span>
                </div>
                <div className={styles.timelineMeta}>
                  <time>{experience.period}</time>
                  <p>{experience.company}</p>
                </div>
                <div className={styles.timelineBody}>
                  <h3>{experience.role}</h3>
                  {experience.items.length > 0 && (
                    <ul>
                      {experience.items.map((item, itemIndex) => (
                        <li key={`${experience.company}-item-${itemIndex}`}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.inkPanel} ${styles.projectsPanel}`} aria-labelledby="resume-projects">
        <div className={styles.frame}>
          <SectionHeading
            index="03"
            eyebrow={labels.projectsEyebrow}
            title={labels.projects}
            id="resume-projects"
            inverse
          />

          <div className={styles.projectGrid}>
            {projects.map((project, index) => (
              <article className={styles.projectCard} key={`${project.title}-${index}`}>
                <div className={styles.projectTopline}>
                  <span>{numberWithLeadingZero(index + 1)}</span>
                  <ArrowUpRight aria-hidden="true" />
                </div>
                <div>
                  <h3>{project.title}</h3>
                  {project.subtitle && <p className={styles.projectSubtitle}>{project.subtitle}</p>}
                </div>
                <p className={styles.projectDescription}>{project.description}</p>
                {project.techs.length > 0 && (
                  <ul className={styles.techList} aria-label="Stack">
                    {project.techs.map((tech) => <li key={`${project.title}-${tech}`}>{tech}</li>)}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.paperPanel} ${styles.detailsPanel}`}>
        <div className={styles.frame}>
          <div className={styles.detailsGrid}>
            <section aria-labelledby="resume-education">
              <SectionHeading index="04A" eyebrow="Archive" title={labels.education} id="resume-education" />
              <div className={styles.educationList}>
                {education.map((item, index) => (
                  <article className={styles.educationItem} key={`${item.institution}-${item.degree}-${index}`}>
                    <div className={styles.educationTopline}>
                      <span>{item.period}</span>
                      {item.badge && <span>{item.badge}</span>}
                    </div>
                    <h3>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                          {item.degree}
                          <ArrowUpRight aria-hidden="true" />
                        </a>
                      ) : item.degree}
                    </h3>
                    <p className={styles.educationInstitution}>{item.institution}</p>
                    {item.description && <p className={styles.educationDescription}>{item.description}</p>}
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="resume-skills">
              <SectionHeading index="04B" eyebrow="Toolkit" title={labels.skills} id="resume-skills" />
              <div className={styles.skillList}>
                {skills.map((group, index) => (
                  <article className={styles.skillGroup} key={`${group.title}-${index}`}>
                    <div className={styles.skillHeading}>
                      <span>{numberWithLeadingZero(index + 1)}</span>
                      <h3>{group.title}</h3>
                    </div>
                    <ul>
                      {group.tags.map((tag) => <li key={`${group.title}-${tag}`}>{tag}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section className={styles.languagesSection} aria-labelledby="resume-languages">
            <div className={styles.languagesHeading}>
              <span>05 / Languages</span>
              <h2 id="resume-languages">{labels.languages}</h2>
            </div>
            <div className={styles.languagesGrid}>
              {languages.map((language, index) => (
                <article className={styles.languageItem} key={`${language.name}-${index}`}>
                  <span>{language.name.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <h3>{language.name}</h3>
                    <p>{language.level}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.inkPanel} ${styles.ctaPanel}`} aria-labelledby="resume-contact-title">
        <div className={styles.frame}>
          <p className={styles.ctaEyebrow}>{labels.ctaEyebrow}</p>
          <div className={styles.ctaGrid}>
            <h2 id="resume-contact-title">{labels.ctaHeadline}</h2>
            <div className={styles.ctaAside}>
              <p>{labels.ctaBody}</p>
              <a className={styles.ctaEmail} href={`mailto:${contact.email}`}>
                {contact.email}
                <ArrowUpRight aria-hidden="true" />
              </a>
              <nav className={`${styles.socialLinks} ${styles.noPrint}`} aria-label="Social links">
                {contact.linkedin && (
                  <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin aria-hidden="true" /> LinkedIn
                  </a>
                )}
                {contact.github && (
                  <a href={contact.github} target="_blank" rel="noopener noreferrer">
                    <Github aria-hidden="true" /> GitHub
                  </a>
                )}
                {contact.website && (
                  <a href={contact.website} target="_blank" rel="noopener noreferrer">
                    Web <ArrowUpRight aria-hidden="true" />
                  </a>
                )}
              </nav>
            </div>
          </div>
          <div className={styles.ctaFooter}>
            <span>João Marcos © {new Date().getFullYear()}</span>
            <span>Software / AI / Automation</span>
          </div>
        </div>
      </section>
    </article>
  )
}
