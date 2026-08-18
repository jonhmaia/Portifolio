import type { Metadata } from 'next'
import { ProjectsArchive, type ProjectsArchiveProps } from '@/components/portfolio/projects-archive'

export const metadata: Metadata = {
  title: 'Projetos | Galeria Premium',
  description: 'Uma coleção curada de projetos de engenharia de software e inteligência artificial.',
}

export default function ProjectsPage(props: ProjectsArchiveProps) {
  return <ProjectsArchive {...props} />
}
