'use client'

import Image from 'next/image'
import { Database, Github } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

// SVG Icons for skills without images
const SupabaseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" fill="currentColor" color="#3ECF8E">
    <path d="M12 2L2 12h8v10l10-10h-8V2z"/>
  </svg>
)

interface Skill {
  name: string
  imageSrc?: string
  imageSrcLight?: string
  icon?: React.ElementType
  progress: number
  color: string
  icon_type?: 'url' | 'embed' | 'upload'
  icon_value?: string | null
}

const staticSkills: Skill[] = [
  { name: 'Python', imageSrc: '/python.png', progress: 95, color: '#3776AB' },
  { name: 'JavaScript', imageSrc: '/javascript.png', progress: 90, color: '#F7DF1E' },
  { name: 'Django', imageSrc: '/django.png', progress: 85, color: '#092E20' },
  { name: 'Node.js', imageSrc: '/nodejs.png', progress: 88, color: '#339933' },
  { name: 'HTML5', imageSrc: '/html.png', progress: 92, color: '#E34F26' },
  { name: 'CSS3', imageSrc: '/css.png', progress: 90, color: '#1572B6' },
  { name: 'PostgreSQL', imageSrc: '/postgres.png', progress: 85, color: '#4169E1' },
  { name: 'Docker', imageSrc: '/docker.png', progress: 80, color: '#2496ED' },
  { name: 'N8N', imageSrc: '/n8n_logo.svg', imageSrcLight: '/n8n_logo_light.svg', progress: 98, color: '#FF2A7A' },
  { name: 'Bubble.io', imageSrc: '/bubbleio.png', progress: 90, color: '#03C2C2' },
  { name: 'Supabase', icon: SupabaseIcon, progress: 90, color: '#3ECF8E' },
  { name: 'C/C++', imageSrc: '/c.png', progress: 80, color: '#00599C' },
  { name: 'SQL', icon: Database, progress: 88, color: '#00758F' },
  { name: 'MCP', imageSrc: '/mcp.png', progress: 85, color: '#FF8C00' },
  { name: 'GitHub', icon: Github, progress: 90, color: '#A0A0A0' },
  { name: 'Lovable', imageSrc: '/lovable.png', progress: 90, color: '#E01E5A' },
  { name: 'Flutter', imageSrc: '/flutter.svg', progress: 80, color: '#02569B' },
  { name: 'Bootstrap', imageSrc: '/bootsstrap.png', progress: 85, color: '#7952B3' },
]

export function TechSkills({ initialSkills = [] }: { initialSkills?: any[] }) {
  const t = useTranslations('home.techSkills')

  const displayedSkills = initialSkills.length > 0 ? initialSkills : staticSkills

  const renderIcon = (skill: any) => {
    // If database dynamic skill
    if (skill.icon_type && skill.icon_value) {
      if (skill.icon_type === 'embed') {
        return (
          <div 
            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-muted-foreground group-hover:text-foreground dark:group-hover:text-white transition-colors duration-300 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
            style={{ color: skill.color }}
            dangerouslySetInnerHTML={{ __html: skill.icon_value }}
          />
        )
      }
      
      return (
        <div className="relative w-10 h-10 md:w-14 md:h-14">
          <Image 
            src={skill.icon_value} 
            alt={skill.name}
            fill
            className="object-contain transition-all duration-300"
            unoptimized
          />
        </div>
      )
    }

    // Fallback to static skills
    if (skill.imageSrc) {
      return (
        <div className="relative w-10 h-10 md:w-14 md:h-14">
          {skill.imageSrcLight ? (
            <>
              <Image 
                src={skill.imageSrcLight} 
                alt={skill.name}
                fill
                className="object-contain transition-all duration-300 dark:hidden"
              />
              <Image 
                src={skill.imageSrc} 
                alt={skill.name}
                fill
                className="object-contain transition-all duration-300 hidden dark:block"
              />
            </>
          ) : (
            <Image 
              src={skill.imageSrc} 
              alt={skill.name}
              fill
              className="object-contain transition-all duration-300"
            />
          )}
        </div>
      )
    }

    if (skill.icon) {
      const IconComp = skill.icon
      return (
        <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-muted-foreground group-hover:text-foreground dark:group-hover:text-white transition-colors duration-300">
          <IconComp className="w-8 h-8 md:w-11 md:h-11" />
        </div>
      )
    }

    return null
  }

  return (
    <section className="py-16 md:py-24 relative z-10 overflow-hidden">
      <div className="container px-4 md:px-6">
        
        {/* Título da Seção Centralizado */}
        <div className="flex items-center gap-3 text-foreground dark:text-white mb-16 justify-center">
          <div className="h-4 w-4 border-2 border-[#00ffcc] rounded-sm bg-[#00ffcc]/10 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,255,204,0.2)]">
            <div className="h-1 w-1 bg-[#00ffcc] rounded-full" />
          </div>
          <h2 className="text-xl font-bold tracking-widest uppercase text-foreground/90 dark:text-white/95">
            {t('title', { fallback: 'Skills' })}
          </h2>
        </div>

        {/* Grid de Habilidades */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12 max-w-5xl mx-auto">
          {displayedSkills.map((skill, index) => {
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex flex-col items-center justify-center space-y-4 text-center group"
              >
                {/* Nome da Skill no Topo */}
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-muted-foreground/80 uppercase group-hover:text-foreground dark:group-hover:text-white transition-colors duration-300">
                  {skill.name}
                </span>

                {/* Ícone no Centro */}
                <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  {renderIcon(skill)}
                </div>

                {/* Barra de Progresso no Rodapé */}
                <div className="w-12 md:w-16 h-[3px] bg-muted/40 dark:bg-neutral-800 rounded-full overflow-hidden relative shadow-sm">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 + index * 0.03, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: skill.color 
                    }}
                  />
                </div>

              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
