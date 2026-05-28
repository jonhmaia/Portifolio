'use client'

import React from 'react'
import Image from 'next/image'
import { Link } from '@/navigation'
import { Github, Linkedin, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear()

  // Classes padrão de Glassmorphism para os cards iguais ao BioWrapper
  const glassCardClasses = "bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/5 backdrop-blur-md shadow-2xl transition-all duration-500 overflow-hidden relative"
  const glassCardHoverClasses = "hover:bg-black/10 dark:hover:bg-black/30 hover:backdrop-blur-lg group"

  return (
    <footer className="w-full bg-transparent py-10 md:py-20 px-4 md:px-8 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-4 md:gap-6 w-full md:w-1/2">
          
          {/* Top Left Box: Contact Card */}
          <div className={`rounded-3xl p-8 md:p-10 flex flex-col justify-between ${glassCardClasses} ${glassCardHoverClasses}`}>
            {/* Efeito Glow interno no hover */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ffcc]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="space-y-1 mb-12 relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold text-foreground dark:text-white tracking-tight leading-tight">
                Tem uma ideia?
              </h2>
              <h2 className="text-2xl md:text-4xl font-bold text-muted-foreground dark:text-white/50 tracking-tight leading-tight">
                Sinta-se livre para<br />me contatar
              </h2>
            </div>

            {/* Botão de Contato */}
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center gap-3 bg-[#00ffcc] hover:bg-white text-[#1a1a24] font-bold py-3 px-8 md:py-4 md:px-10 rounded-full text-sm md:text-base transition-all duration-300 shadow-[0_0_20px_rgba(0,255,204,0.3)] hover:shadow-[0_0_30px_rgba(0,255,204,0.5)] hover:scale-105 relative z-10 w-fit"
            >
              <Mail className="w-5 h-5" />
              Entrar em Contato
            </Link>
          </div>

          {/* Bottom Left Box: Links & Copyright */}
          <div className={`rounded-3xl p-8 md:p-10 flex flex-col justify-between flex-1 ${glassCardClasses} ${glassCardHoverClasses}`}>
            <div className="mb-12 relative z-10">
              <h3 className="text-xl md:text-2xl font-bold text-foreground dark:text-white mb-1">
                Confira estes links
              </h3>
              <h3 className="text-xl md:text-2xl font-bold text-muted-foreground dark:text-white/50">
                antes de ir
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-16 relative z-10">
              {/* Col 1 */}
              <div className="flex flex-col gap-3">
                <h4 className="text-foreground dark:text-white text-sm font-semibold mb-1">Páginas</h4>
                <Link href="/" className="text-muted-foreground dark:text-white/60 hover:text-[#00ffcc] transition-colors text-xs font-medium">Home</Link>
                <Link href="/projetos" className="text-muted-foreground dark:text-white/60 hover:text-[#00ffcc] transition-colors text-xs font-medium">Projetos</Link>
                <Link href="/blog" className="text-muted-foreground dark:text-white/60 hover:text-[#00ffcc] transition-colors text-xs font-medium">Blog</Link>
              </div>
              {/* Col 2 */}
              <div className="flex flex-col gap-3">
                <h4 className="text-foreground dark:text-white text-sm font-semibold mb-1">Contato</h4>
                <a href="mailto:contato@maiainteligencia.com" className="text-muted-foreground dark:text-white/60 hover:text-[#00ffcc] transition-colors text-xs font-medium">Email</a>
                <a href="tel:+5562999018119" className="text-muted-foreground dark:text-white/60 hover:text-[#00ffcc] transition-colors text-xs font-medium">WhatsApp</a>
                <Link href="/contact" className="text-muted-foreground dark:text-white/60 hover:text-[#00ffcc] transition-colors text-xs font-medium">Formulário</Link>
              </div>
              {/* Col 3 */}
              <div className="flex flex-col gap-3">
                <h4 className="text-foreground dark:text-white text-sm font-semibold mb-1">Legal</h4>
                <Link href="/curriculo" className="text-muted-foreground dark:text-white/60 hover:text-[#00ffcc] transition-colors text-xs font-medium">Currículo</Link>
                <a href="/sitemap.xml" className="text-muted-foreground dark:text-white/60 hover:text-[#00ffcc] transition-colors text-xs font-medium">Sitemap</a>
                <Link href="/admin" className="text-muted-foreground dark:text-white/60 hover:text-[#00ffcc] transition-colors text-xs font-medium">Admin</Link>
              </div>
            </div>

            <p className="text-center text-muted-foreground/50 dark:text-white/30 text-[10px] md:text-xs mt-auto relative z-10 uppercase tracking-widest">
              © Copyright {currentYear}, Todos os Direitos Reservados
            </p>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 md:gap-6 w-full md:w-1/2">
          
          {/* Top Right Box: Focus Areas */}
          <div className={`rounded-3xl p-8 md:p-10 flex-1 ${glassCardClasses} ${glassCardHoverClasses}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white leading-tight mb-16 max-w-sm relative z-10">
              Você está lançando um novo Projeto / Startup?
            </h2>

            <div className="relative z-10">
              <p className="text-muted-foreground/80 dark:text-white/40 text-[10px] md:text-xs mb-3 font-semibold uppercase tracking-wider">Áreas de atuação</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-foreground dark:text-white font-medium text-xs">Soluções RPA</span>
                  <span className="text-muted-foreground dark:text-white/50 text-[10px]">Automação com N8N</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-foreground dark:text-white font-medium text-xs">Dev & Web App</span>
                  <span className="text-muted-foreground dark:text-white/50 text-[10px]">Sistemas e SaaS</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-foreground dark:text-white font-medium text-xs">AI Engineer</span>
                  <span className="text-muted-foreground dark:text-white/50 text-[10px]">LLMs & Agentes</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-foreground dark:text-white font-medium text-xs">Parcerias</span>
                  <span className="text-muted-foreground dark:text-white/50 text-[10px]">Consultoria técnica</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Right Row: Social Links */}
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <a 
              href="https://github.com/jonhmaia" 
              target="_blank" 
              className={`rounded-3xl aspect-square flex items-center justify-center ${glassCardClasses} ${glassCardHoverClasses}`}
            >
              <Github className="w-10 h-10 text-muted-foreground/60 dark:text-white/50 group-hover:text-[#24292e] dark:group-hover:text-white transition-colors group-hover:scale-110 duration-300" />
            </a>
            <a 
              href="https://www.linkedin.com/in/joaomarcosmaia" 
              target="_blank" 
              className={`rounded-3xl aspect-square flex items-center justify-center ${glassCardClasses} ${glassCardHoverClasses}`}
            >
              <Linkedin className="w-10 h-10 text-muted-foreground/60 dark:text-white/50 group-hover:text-[#0077b5] transition-colors group-hover:scale-110 duration-300" />
            </a>
            <a 
              href="mailto:contato@maiainteligencia.com" 
              className={`rounded-3xl aspect-square flex items-center justify-center ${glassCardClasses} ${glassCardHoverClasses}`}
            >
              <Mail className="w-10 h-10 text-muted-foreground/60 dark:text-white/50 group-hover:text-[#ea4335] transition-colors group-hover:scale-110 duration-300" />
            </a>
          </div>

          {/* Bottom Right Box: Brand */}
          <div className="p-6 md:p-8 flex flex-col items-center justify-center gap-4">
            <span className="relative z-10 text-muted-foreground/80 dark:text-white/40 text-[10px] md:text-xs font-semibold uppercase tracking-wider">
              Conheça minha empresa
            </span>
            <a 
              href="https://www.maiainteligencia.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative z-10 w-32 h-32 md:w-40 md:h-40 transition-transform duration-500 hover:scale-110 hover:rotate-3"
            >
              <Image 
                src="/maia-logo.png" 
                alt="Maia Inteligência" 
                fill
                className="object-contain drop-shadow-[0_0_20px_rgba(0,255,204,0.4)]"
              />
            </a>
          </div>

        </div>

      </div>
    </footer>
  )
}
