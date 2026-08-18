import { ProjectCard, type EditorialProject } from './project-card'
import styles from '@/components/blog/editorial.module.css'

interface ProjectGridProps {
  projects: EditorialProject[]
  locale?: string
}

export function ProjectGrid({ projects, locale = 'pt-BR' }: ProjectGridProps) {
  return (
    <div className={styles.articleGrid}>
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} locale={locale} />
      ))}
    </div>
  )
}
