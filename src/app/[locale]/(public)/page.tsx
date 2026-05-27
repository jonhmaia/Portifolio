import Image from 'next/image'
import { Mail } from 'lucide-react'
import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server'
import { Link } from '@/navigation'
import { getCachedHomepageData, getCachedSkills } from '@/lib/supabase/cached'
import ReactMarkdown from 'react-markdown'
import iconImg from '@/app/icon.png'

import { TechSkills } from '@/components/home/tech-skills'
import { HeroWrapper, AnimatedElement, BioWrapper } from '@/components/home/wrappers'

interface HomeProps {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')

  // Fetch homepage data and skills in parallel using the cached layer
  const [dbHome, dbSkills] = (await Promise.all([
    getCachedHomepageData().catch((err) => {
      console.error('Error fetching homepage data from cache:', err);
      return null;
    }),
    getCachedSkills().catch((err) => {
      console.error('Error fetching skills from cache:', err);
      return [];
    })
  ])) as [any, any[]]

  // Determine dynamic fields or fallbacks
  const isEn = locale === 'en'
  const name = dbHome?.[isEn ? 'name_en' : 'name_pt'] || t('hero.title')
  const location = dbHome?.[isEn ? 'location_en' : 'location_pt'] || t('hero.location')
  const role = dbHome?.[isEn ? 'role_en' : 'role_pt'] || t('hero.role')
  const aboutTitle = dbHome?.[isEn ? 'about_title_en' : 'about_title_pt'] || t('about.title')
  const aboutSubtitle = dbHome?.[isEn ? 'about_subtitle_en' : 'about_subtitle_pt'] || t('about.subtitle')
  const avatarUrl = dbHome?.avatar_url || iconImg
  const email = dbHome?.email || 'contato@maiainteligencia.com'
  const githubUrl = dbHome?.github_url || 'https://github.com/jonhmaia'
  const linkedinUrl = dbHome?.linkedin_url || 'https://www.linkedin.com/in/joaomarcosmaia'
  
  // Bio content (Markdown string)
  const bioMarkdown = dbHome?.[isEn ? 'bio_en' : 'bio_pt']

  return (
    <div className="flex flex-col min-h-screen relative">
      
      {/* Bio & Skills Section */}
      <HeroWrapper>
        
        {/* Seção Sobre (2 colunas dentro do BioWrapper) */}
        <div className="w-full">
          <BioWrapper>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
              
              {/* Lado Esquerdo - Foto de Perfil, Nome e Redes Sociais */}
              <div className="md:col-span-4 flex flex-col items-center text-center space-y-6 md:sticky md:top-24">
                
                {/* Profile Image com Glass & Glow */}
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-[#00ffcc] opacity-0 group-hover:opacity-30 blur-2xl rounded-full transition-opacity duration-500" />
                  
                  <div className="relative h-36 w-36 md:h-44 md:w-44 rounded-full p-[3px] bg-gradient-to-tr from-[#00ffcc]/40 via-white/10 to-[#1a1a24] group-hover:from-[#00ffcc] group-hover:to-[#2dd4bf] transition-all duration-300 shadow-[0_0_15px_rgba(0,255,204,0.1)] group-hover:shadow-[0_0_30px_rgba(0,255,204,0.3)]">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-[#1a1a24]">
                      <Image
                        src={avatarUrl}
                        alt={name}
                        fill
                        className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
 
                {/* Nome */}
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-wider text-foreground">
                    {name}
                  </h3>
                  <p className="text-xs text-muted-foreground tracking-widest uppercase">
                    {location}
                  </p>
                </div>
 
                {/* Redes Sociais com ícones minimalistas */}
                <div className="flex gap-4 items-center justify-center pt-2">
                  <a 
                    href={`mailto:${email}`} 
                    className="p-3 rounded-full border border-border hover:border-[#00ffcc]/80 hover:text-[#00ffcc] bg-background/50 hover:bg-[#00ffcc]/10 text-muted-foreground transition-all duration-300 hover:scale-105"
                    title="E-mail"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                  
                  <a 
                    href={githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 rounded-full border border-border hover:border-[#00ffcc]/80 hover:text-[#00ffcc] bg-background/50 hover:bg-[#00ffcc]/10 text-muted-foreground transition-all duration-300 hover:scale-105"
                    title="GitHub"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </a>
                  
                  <a 
                    href={linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 rounded-full border border-border hover:border-[#00ffcc]/80 hover:text-[#00ffcc] bg-background/50 hover:bg-[#00ffcc]/10 text-muted-foreground transition-all duration-300 hover:scale-105"
                    title="LinkedIn"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
                    </svg>
                  </a>
                </div>
 
              </div>
 
              {/* Lado Direito - Bio Detalhada */}
              <div className="md:col-span-8 flex flex-col text-left space-y-6">
                
                {/* Cabeçalho do Sobre */}
                <div className="flex items-center gap-2 text-[#00ffcc] font-bold tracking-wider text-xs md:text-sm uppercase">
                  <span className="h-2 w-2 bg-[#00ffcc] rounded-full inline-block" />
                  {aboutTitle}
                </div>
                
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                  {aboutSubtitle}
                </h2>
                
                <div className="space-y-6 text-muted-foreground/90 text-base md:text-lg leading-relaxed font-light">
                  {bioMarkdown ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-muted-foreground/90 text-base md:text-lg leading-relaxed font-light mb-6 last:mb-0">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <span className="text-foreground font-semibold dark:text-white dark:font-medium">
                            {children}
                          </span>
                        ),
                      }}
                    >
                      {bioMarkdown}
                    </ReactMarkdown>
                  ) : (
                    <>
                      <p>
                        {t.rich('bio.p1', {
                          emphasis: (chunks) => (
                            <span className="text-foreground font-semibold dark:text-white dark:font-medium">{chunks}</span>
                          ),
                        })}
                      </p>
                      <p>
                        {t.rich('bio.p2', {
                          emphasis: (chunks) => (
                            <span className="text-foreground font-semibold dark:text-white dark:font-medium">{chunks}</span>
                          ),
                        })}
                      </p>
                      <p>
                        {t.rich('bio.p3', {
                          emphasis: (chunks) => (
                            <span className="text-foreground font-semibold dark:text-white dark:font-medium">{chunks}</span>
                          ),
                        })}
                      </p>
                      <p>
                        {t.rich('bio.p4', {
                          emphasis: (chunks) => (
                            <span className="text-foreground font-semibold dark:text-white dark:font-medium">{chunks}</span>
                          ),
                        })}
                      </p>
                    </>
                  )}
                </div>
                
              </div>
              
            </div>
          </BioWrapper>
        </div>
 
        {/* Tech Skills Section */}
        <AnimatedElement className="w-full pt-16">
          <TechSkills initialSkills={(dbSkills as any) || []} />
        </AnimatedElement>
        
      </HeroWrapper>
    </div>
  )
}
