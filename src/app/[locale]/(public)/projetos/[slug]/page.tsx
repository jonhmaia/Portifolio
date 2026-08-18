import type { Metadata } from 'next'
import {
  ProjectCaseStudy,
  generateProjectMetadata,
  generateProjectStaticParams,
  type ProjectPageProps,
} from '@/components/portfolio/project-case-study'
import 'highlight.js/styles/github-dark.css'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  return generateProjectStaticParams()
}

export async function generateMetadata(props: ProjectPageProps): Promise<Metadata> {
  return generateProjectMetadata(props)
}

export default function ProjectPage(props: ProjectPageProps) {
  return <ProjectCaseStudy {...props} />
}
