import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server'
import { getCachedProfile, getCachedResumeData } from '@/lib/supabase/cached'
import type { Profile } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ResumePageProps {
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Professional resume and experience',
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('resume')

  // Get profile and resume data from the cached layer
  let profile: Profile | null = null
  let resumeData: any = null
  try {
    const [profileRes, resumeRes] = await Promise.all([
      getCachedProfile(),
      getCachedResumeData(locale)
    ])
    profile = profileRes as Profile
    resumeData = resumeRes
  } catch (error) {
    console.error('Error fetching profile or resume from cache:', error)
    notFound()
  }

  // Sample resume data - in a real app, this would come from your database
  const experience = [
    {
      title: locale === 'en' ? 'Senior Full Stack Developer' : 'Desenvolvedor Full Stack Sênior',
      company: 'Tech Solutions Inc.',
      period: '2022 - Present',
      description: locale === 'en' 
        ? 'Development of web applications using React, Next.js, and Node.js. Leading a team of 5 developers.'
        : 'Desenvolvimento de aplicações web utilizando React, Next.js e Node.js. Liderando uma equipe de 5 desenvolvedores.',
      technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL']
    },
    {
      title: locale === 'en' ? 'Full Stack Developer' : 'Desenvolvedor Full Stack',
      company: 'Digital Agency',
      period: '2020 - 2022',
      description: locale === 'en'
        ? 'Development and maintenance of e-commerce and institutional websites. Integration with payment systems and APIs.'
        : 'Desenvolvimento e manutenção de e-commerces e sites institucionais. Integração com sistemas de pagamento e APIs.',
      technologies: ['React', 'Vue.js', 'Laravel', 'MySQL', 'Redis']
    }
  ]

  const education = [
    {
      degree: locale === 'en' ? 'Bachelor in Computer Science' : 'Bacharelado em Ciência da Computação',
      institution: 'Federal University',
      period: '2016 - 2020',
      description: locale === 'en'
        ? 'Focus on software engineering and web development'
        : 'Foco em engenharia de software e desenvolvimento web'
    }
  ]

  const skills = [
    { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vue.js'] },
    { category: 'Backend', items: ['Node.js', 'Python', 'Laravel', 'Express', 'NestJS'] },
    { category: 'Database', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
    { category: 'Tools', items: ['Git', 'Docker', 'AWS', 'Figma', 'VS Code'] }
  ]

  const languages = [
    { name: 'Portuguese', level: locale === 'en' ? 'Native' : 'Nativo' },
    { name: 'English', level: locale === 'en' ? 'Advanced' : 'Avançado' }
  ]

  return (
    <div className="container py-12 md:py-16 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-2">{profile.full_name}</h2>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>
                )}
                <div className="space-y-2 text-sm">
                  {profile.email && (
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <a href={`mailto:${profile.email}`} className="hover:text-primary">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.website_url && (
                    <div className="flex items-center justify-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        {profile.website_url.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                  {profile.linkedin_url && (
                    <div className="flex items-center justify-center gap-2">
                      <Linkedin className="h-4 w-4 text-primary" />
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {profile.github_url && (
                    <div className="flex items-center justify-center gap-2">
                      <Github className="h-4 w-4 text-primary" />
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        GitHub
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t('skills.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((category) => (
                  <div key={category.category}>
                    <h4 className="font-semibold text-sm mb-2">{category.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.items.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Languages */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>{t('languages.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <div key={lang.name} className="flex justify-between items-center">
                      <span className="font-medium">{lang.name}</span>
                      <Badge variant="outline">{lang.level}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {t('experience.title')}
              </h2>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <Card key={index} className="border-border/50 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{exp.title}</h3>
                          <p className="text-primary font-medium">{exp.company}</p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {exp.period}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{exp.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                {t('education.title')}
              </h2>
              <div className="space-y-6">
                {education.map((edu, index) => (
                  <Card key={index} className="border-border/50 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{edu.degree}</h3>
                          <p className="text-primary font-medium">{edu.institution}</p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {edu.period}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{edu.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Download Button */}
            <div className="flex justify-center pt-8">
              <Button size="lg" className="gap-2" asChild>
                <a href={resumeData?.pdf_url || (locale === 'en' ? '/curriculo-en.pdf' : '/curriculo-pt.pdf')} download={locale === 'en' ? 'resume.pdf' : 'curriculo.pdf'}>
                  <Download className="h-4 w-4" />
                  {t('downloadResume')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}