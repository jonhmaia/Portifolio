import type { Metadata } from 'next'
import { ProjectsArchive, type ProjectsArchiveProps } from '@/components/portfolio/projects-archive'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore my software development projects',
}

export default function ProjectsPage(props: ProjectsArchiveProps) {
  return <ProjectsArchive {...props} />
}
