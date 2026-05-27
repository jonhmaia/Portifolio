import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Github, Linkedin, Mail, MapPin, Phone, Download, Code2, Brain, Cpu, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server'
import { cn } from '@/lib/utils'

import { getCachedResumeData, getCachedHomepageData } from '@/lib/supabase/cached'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import iconImg from '@/app/icon.png'

interface ResumePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ResumePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'resume' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('resume')
  
  // Define o caminho do PDF baseado no idioma
  const pdfPath = locale === 'en' ? '/curriculo-en.pdf' : '/curriculo-pt.pdf'

  // Busca dados dinâmicos do currículo e homepage no Supabase usando o cached layer
  let resumeDbData: any = null
  let dbHome: any = null
  try {
    const [resumeData, homeData] = await Promise.all([
      getCachedResumeData(locale),
      getCachedHomepageData()
    ])
    resumeDbData = resumeData
    dbHome = homeData
  } catch (err) {
    console.error('Erro ao ler dados de currículo do banco, usando fallback:', err)
  }

  const avatarUrl = dbHome?.avatar_url || iconImg

  return (
    <div className="container py-12 md:py-16 max-w-4xl">
      
      {/* Header / Contact Info */}
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        <div className="relative h-32 w-32 md:h-40 md:w-40 flex-shrink-0 rounded-full overflow-hidden border-4 border-muted">
          <Image
            src={avatarUrl}
            alt="João Marcos"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">João Marcos</h1>
            <p className="text-xl text-primary font-medium mt-1">
              {resumeDbData ? resumeDbData.role : t('role')}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <a href="mailto:contato@maiainteligencia.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              contato@maiainteligencia.com
            </a>
            <a href="tel:+5562999018119" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              (62) 99901-8119
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Goiânia, GO
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button size="sm" className="gap-2" asChild>
              <a href={pdfPath} download={locale === 'en' ? 'resume.pdf' : 'curriculo.pdf'}>
                <Download className="h-4 w-4" />
                {t('downloadPdf')}
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://www.linkedin.com/in/joaomarcosmaia" target="_blank">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://github.com/jonhmaia" target="_blank">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Professional Summary */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-8 bg-primary rounded-full"></span>
          {t('professionalSummary.title')}
        </h2>
        <div className="prose prose-invert max-w-none text-muted-foreground">
          {resumeDbData ? (
            <MarkdownRenderer content={resumeDbData.summary} />
          ) : (
            <>
              <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.raw('professionalSummary.p1') }} />
              <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.raw('professionalSummary.p2') }} />
              <p dangerouslySetInnerHTML={{ __html: t.raw('professionalSummary.p3') }} />
            </>
          )}
        </div>
      </section>

      {/* Experience */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-primary rounded-full"></span>
          {t('experience.title')}
        </h2>
        
        <div className="space-y-8">
          {resumeDbData ? (
            resumeDbData.experiences.map((exp: any, idx: number) => (
              <div key={idx} className="relative pl-8 border-l-2 border-border/50">
                <div className={cn(
                  "absolute -left-[9px] top-0 w-4 h-4 rounded-full ring-4 ring-background",
                  idx === 0 ? "bg-primary" : "bg-muted"
                )} />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-xl font-bold">{exp.role}</h3>
                  <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">{exp.period}</span>
                </div>
                <p className="text-primary/80 font-medium mb-4">{exp.company}</p>
                <ul className="list-disc list-outside ml-4 space-y-2 text-muted-foreground">
                  {exp.items?.map((bullet: string, bIdx: number) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              {/* Watrix Tecnologia */}
              <div className="relative pl-8 border-l-2 border-border/50">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-xl font-bold">{t('experience.watrix.role')}</h3>
                  <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">{t('experience.watrix.period')}</span>
                </div>
                <p className="text-primary/80 font-medium mb-4">{t('experience.watrix.company')}</p>
                <ul className="list-disc list-outside ml-4 space-y-2 text-muted-foreground">
                  <li>{t('experience.watrix.items.1')}</li>
                  <li>{t('experience.watrix.items.2')}</li>
                  <li>{t('experience.watrix.items.3')}</li>
                  <li>{t('experience.watrix.items.4')}</li>
                </ul>
              </div>

              {/* Flex ON */}
              <div className="relative pl-8 border-l-2 border-border/50">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-muted ring-4 ring-background" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-xl font-bold">{t('experience.flexOn.role')}</h3>
                  <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">{t('experience.flexOn.period')}</span>
                </div>
                <p className="text-primary/80 font-medium mb-4">{t('experience.flexOn.company')}</p>
                <ul className="list-disc list-outside ml-4 space-y-2 text-muted-foreground">
                  <li>{t('experience.flexOn.items.1')}</li>
                  <li>{t('experience.flexOn.items.2')}</li>
                  <li>{t('experience.flexOn.items.3')}</li>
                </ul>
              </div>

              {/* CEIA */}
              <div className="relative pl-8 border-l-2 border-border/50">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-muted ring-4 ring-background" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-xl font-bold">{t('experience.ceia.role')}</h3>
                  <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">{t('experience.ceia.period')}</span>
                </div>
                <p className="text-primary/80 font-medium mb-4">{t('experience.ceia.company')}</p>
                <ul className="list-disc list-outside ml-4 space-y-2 text-muted-foreground">
                  <li>{t('experience.ceia.items.1')}</li>
                  <li>{t('experience.ceia.items.2')}</li>
                  <li>{t('experience.ceia.items.3')}</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-primary rounded-full"></span>
          {t('featuredProjects.title')}
        </h2>

        <div className="space-y-6">
          {resumeDbData ? (
            resumeDbData.featured_projects.map((proj: any, idx: number) => (
              <Card key={idx} className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{proj.title}</h3>
                      {proj.subtitle && <p className="text-muted-foreground text-sm">{proj.subtitle}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 h-fit">
                      {proj.techs?.map((tech: string) => (
                        <Badge key={tech} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {proj.description}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{t('featuredProjects.maestro.title')}</h3>
                      <p className="text-muted-foreground text-sm">{t('featuredProjects.maestro.subtitle')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">n8n</Badge>
                      <Badge variant="outline">OpenAI</Badge>
                      <Badge variant="outline">Supabase</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('featuredProjects.maestro.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{t('featuredProjects.camapum.title')}</h3>
                      <p className="text-muted-foreground text-sm">{t('featuredProjects.camapum.subtitle')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">React</Badge>
                      <Badge variant="outline">Supabase</Badge>
                      <Badge variant="outline">n8n</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('featuredProjects.camapum.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{t('featuredProjects.cashmed.title')}</h3>
                      <p className="text-muted-foreground text-sm">{t('featuredProjects.cashmed.subtitle')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Python (Django)</Badge>
                      <Badge variant="outline">Fintech</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('featuredProjects.cashmed.description')}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Academic / Research */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-primary rounded-full"></span>
          {t('education.title')}
        </h2>
        
        <div className="space-y-6">
          {resumeDbData ? (
            resumeDbData.education.map((edu: any, idx: number) => (
              <Card key={idx} className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{edu.degree}</h3>
                      <p className="text-muted-foreground">{edu.institution}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">{edu.period}</Badge>
                  </div>
                  {edu.description && (
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{t('education.ufg.title')}</h3>
                      <p className="text-muted-foreground">{t('education.ufg.institution')}</p>
                    </div>
                    <Badge variant="secondary">{t('education.ufg.period')}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        <a 
                          href="https://jems3.sbc.org.br/submissions/16411" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors hover:underline"
                        >
                          {t('education.research.title')}
                        </a>
                      </h3>
                      <p className="text-muted-foreground">{t('education.research.event')}</p>
                    </div>
                    <Badge variant="secondary">{t('education.research.badge')}</Badge>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t('education.research.description')}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-primary rounded-full"></span>
          {t('skills.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumeDbData ? (
            resumeDbData.skills.map((skillGroup: any, idx: number) => {
              // Associa o ícone baseado no índice do card
              let IconComponent = Code2
              if (idx === 1) IconComponent = Brain
              if (idx === 2) IconComponent = Cpu
              if (idx === 3) IconComponent = TrendingUp

              return (
                <Card key={idx} className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg">{skillGroup.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="hover:bg-primary/20 transition-colors">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <>
              <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Code2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg">{t('skills.fullstack.title')}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Python', 'TypeScript', 'Node.js', 'React', 'Next.js', 'C/C++', 'SQL'].map((skill) => (
                      <Badge key={skill} variant="secondary" className="hover:bg-primary/20 transition-colors">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Brain className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg">{t('skills.ai.title')}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['LLM Fine-Tuning', 'NLP', 'RAG', 'Generative AI', 'Data Governance', 'Observability', 'RPA'].map((skill) => (
                      <Badge key={skill} variant="secondary" className="hover:bg-primary/20 transition-colors">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg">{t('skills.automation.title')}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['n8n', 'Bubble.io', 'Docker', 'PostgreSQL', 'Supabase', 'Git', 'CI/CD'].map((skill) => (
                      <Badge key={skill} variant="secondary" className="hover:bg-primary/20 transition-colors">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg">{t('skills.strategy.title')}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Liderança Técnica', 'Engenharia de Receita', 'Arquitetura de Software', 'Hiperautomação', 'Scrum/Agile'].map((skill) => (
                      <Badge key={skill} variant="secondary" className="hover:bg-primary/20 transition-colors">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Languages */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-primary rounded-full"></span>
          {t('languages.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumeDbData ? (
            resumeDbData.languages.map((lang: any, idx: number) => (
              <Card key={idx} className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {lang.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold">{lang.name}</h3>
                      <p className="text-sm text-muted-foreground">{lang.level}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      PT
                    </div>
                    <div>
                      <h3 className="font-bold">{t('languages.pt.name')}</h3>
                      <p className="text-sm text-muted-foreground">{t('languages.pt.level')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      EN
                    </div>
                    <div>
                      <h3 className="font-bold">{t('languages.en.name')}</h3>
                      <p className="text-sm text-muted-foreground">{t('languages.en.level')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

    </div>
  )
}
