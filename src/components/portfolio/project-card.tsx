'use client'

import { Link } from '@/navigation'
import Image from 'next/image'
import { ExternalLink, Github, ArrowUpRight, Eye } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { ProjectWithRelations } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface ProjectCardProps {
  project: ProjectWithRelations & {
    subtitle?: string | null
    views_count?: number
  }
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={cn("group relative", className)}
    >
      {/* Dynamic Background Ambient Glow (Vibrant Neon Green/Emerald) */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ffcc]/25 via-emerald-500/15 to-[#00ffcc]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:duration-300" />
      
      <Card className="relative flex flex-col h-full overflow-hidden bg-card/25 backdrop-blur-xl border border-border/30 hover:border-[#00ffcc]/35 shadow-sm hover:shadow-2xl hover:shadow-[#00ffcc]/10 transition-all duration-500 rounded-2xl">
        {/* Cover Image Wrapper */}
        <div className="relative aspect-[16/10] w-full overflow-hidden z-10 shrink-0 bg-muted/30">
          <Link href={`/projetos/${project.slug}` as any} className="block w-full h-full">
            {project.cover_image_url ? (
              <Image
                src={project.cover_image_url}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-108 group-hover:rotate-[0.5deg]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/20">
                <span className="text-4xl font-bold text-muted-foreground/20 tracking-tighter">
                  {project.title.charAt(0)}
                </span>
              </div>
            )}
            
            {/* Elegant glassmorphism dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-90 transition-opacity duration-500" />
            {/* Multi-layered soft glow hover screen overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00ffcc]/10 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </Link>

          {/* Views Count Badge */}
          {project.views_count && project.views_count > 0 && (
            <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/45 backdrop-blur-md border border-white/5 rounded-full flex items-center gap-1.5 text-[11px] text-white/90 font-medium tracking-wide shadow-sm">
              <Eye className="w-3.5 h-3.5 text-[#00ffcc] animate-pulse" />
              <span>{project.views_count}</span>
            </div>
          )}

          {/* Quick Actions (Github & Deploy) - Slide & bounce in on hover */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            {project.repo_url && (
              <a 
                href={project.repo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 bg-background/60 backdrop-blur-md border border-white/5 rounded-full shadow-lg text-muted-foreground hover:text-[#00ffcc] hover:border-[#00ffcc]/30 hover:bg-background/90 transition-all duration-300 hover:scale-110 active:scale-95 translate-y-[-12px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                title="Ver Código"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {project.deploy_url && (
              <a 
                href={project.deploy_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 bg-background/60 backdrop-blur-md border border-white/5 rounded-full shadow-lg text-muted-foreground hover:text-[#00ffcc] hover:border-[#00ffcc]/30 hover:bg-background/90 transition-all duration-300 hover:scale-110 active:scale-95 translate-y-[-12px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) delay-[50ms]"
                title="Ver Projeto"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="flex flex-col flex-1 p-6 space-y-4">
          <div className="space-y-2">
            <Link href={`/projetos/${project.slug}` as any} className="group/title block">
              <h3 className="text-xl font-bold tracking-tight text-foreground transition-all duration-300 flex items-center justify-between gap-2">
                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground group-hover/title:from-[#00ffcc] group-hover/title:to-emerald-400 bg-clip-text group-hover/title:text-transparent transition-all duration-300">
                  {project.title}
                </span>
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/20 text-[#00ffcc] opacity-0 scale-75 translate-x-[-10px] group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </h3>
            </Link>
            
            {project.subtitle && (
              <p className="text-[10px] font-bold tracking-widest text-[#00ffcc]/90 uppercase">
                {project.subtitle}
              </p>
            )}
          </div>

          {project.short_description && (
            <p className="text-xs text-muted-foreground/85 line-clamp-3 leading-relaxed font-medium">
              {project.short_description}
            </p>
          )}

          {/* Technologies Badges - Custom Glowing Elements */}
          <div className="mt-auto pt-4 flex flex-wrap gap-2">
            {project.technologies && project.technologies.slice(0, 4).map((tech: any) => (
              <Badge
                key={tech.id}
                variant="outline"
                className="text-[10px] font-semibold px-2.5 py-1 h-7 bg-background/40 hover:bg-background/80 border border-border/50 hover:border-[#00ffcc]/20 transition-all duration-300 shadow-sm rounded-md"
                style={{
                  borderColor: tech.color_hex ? `${tech.color_hex}30` : undefined,
                }}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full mr-2 shrink-0 animate-pulse" 
                  style={{ 
                    backgroundColor: tech.color_hex || '#666',
                    boxShadow: tech.color_hex ? `0 0 8px 1px ${tech.color_hex}` : undefined
                  }}
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {tech.name}
                </span>
              </Badge>
            ))}
            {project.technologies && project.technologies.length > 4 && (
              <Badge 
                variant="outline" 
                className="text-[10px] font-bold px-2 py-1 h-7 bg-background/40 hover:bg-background/80 border border-border/50 hover:border-[#00ffcc]/20 transition-all duration-300 rounded-md"
              >
                +{project.technologies.length - 4}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
