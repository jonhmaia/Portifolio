'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import mermaid from 'mermaid'
import { Download, Maximize2, ZoomIn, ZoomOut, X } from 'lucide-react'
import { Button } from './button'

// Inicializa o Mermaid apenas no cliente
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      background: 'transparent',
      primaryColor: '#6366f1', // indigo-500
      primaryTextColor: '#f8fafc', // slate-50
      lineColor: '#475569', // slate-600
    }
  })
}

interface MermaidRendererProps {
  chart: string
}

export function MermaidRenderer({ chart }: MermaidRendererProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const viewportRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef({ isDragging: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 })

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = viewportRef.current
    if (!container) return

    // Evita pan se clicar em botões
    if ((e.target as HTMLElement).closest('button')) return

    dragStart.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop
    }
    
    container.style.cursor = 'grabbing'
    container.style.userSelect = 'none'
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const drag = dragStart.current
    if (!drag.isDragging) return
    
    const container = viewportRef.current
    if (!container) return

    e.preventDefault()
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    
    container.scrollLeft = drag.scrollLeft - dx
    container.scrollTop = drag.scrollTop - dy
  }

  const handleMouseUpOrLeave = () => {
    const drag = dragStart.current
    if (!drag.isDragging) return

    drag.isDragging = false
    const container = viewportRef.current
    if (!container) return

    container.style.cursor = 'grab'
    container.style.userSelect = ''
  }

  useEffect(() => {
    let isMounted = true
    const id = `mermaid-${Math.floor(Math.random() * 1000000)}`

    const renderChart = async () => {
      try {
        setError(null)
        // Sanitiza a string removendo quebras de linha adicionais nas pontas
        const cleanChart = chart.trim()
        
        const { svg: renderedSvg } = await mermaid.render(id, cleanChart)
        
        if (isMounted) {
          setSvg(renderedSvg)
        }
      } catch (err: any) {
        console.error('Erro de renderização do diagrama Mermaid:', err)
        if (isMounted) {
          setError(err.message || 'Erro de sintaxe no diagrama Mermaid.')
        }
      }
    }

    renderChart()

    return () => {
      isMounted = false
    }
  }, [chart])

  // Fecha tela cheia ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // Reseta o zoom quando a tela cheia é aberta
  useEffect(() => {
    if (isFullscreen) {
      setZoom(1)
    }
  }, [isFullscreen])

  if (error) {
    return (
      <div className="my-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-mono overflow-x-auto shadow-sm">
        <div className="font-bold mb-1 text-red-500">❌ Erro no Diagrama:</div>
        <code>{error}</code>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center p-8 my-6 bg-muted/20 border border-border/40 rounded-xl animate-pulse text-xs text-muted-foreground">
        Renderizando diagrama Mermaid...
      </div>
    )
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diagrama-arquitetura.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao baixar diagrama:', err)
    }
  }

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 5))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25))
  const handleResetZoom = () => setZoom(1)

  // Extrai a largura e altura originais do viewBox do SVG para garantir redimensionamento perfeito
  const viewBoxMatch = svg.match(/viewBox\s*=\s*["'](-?[\d.]+)\s+(-?[\d.]+)\s+([\d.]+)\s+([\d.]+)["']/)
  let originalWidth = 800
  let originalHeight = 600

  if (viewBoxMatch) {
    originalWidth = parseFloat(viewBoxMatch[3])
    originalHeight = parseFloat(viewBoxMatch[4])
  } else {
    const widthMatch = svg.match(/width\s*=\s*["']([\d.]+)px["']/) || svg.match(/width\s*=\s*["']([\d.]+)["']/)
    const heightMatch = svg.match(/height\s*=\s*["']([\d.]+)px["']/) || svg.match(/height\s*=\s*["']([\d.]+)["']/)
    if (widthMatch) originalWidth = parseFloat(widthMatch[1])
    if (heightMatch) originalHeight = parseFloat(heightMatch[1])
  }

  const scaledWidth = originalWidth * zoom
  const scaledHeight = originalHeight * zoom

  return (
    <>
      <div className="relative w-full group/mermaid my-6 border border-border/50 rounded-xl overflow-hidden bg-muted/5 shadow-inner invert dark:invert-0">
        {/* Floating actions */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover/mermaid:opacity-100 transition-all duration-300 transform translate-y-[-4px] group-hover/mermaid:translate-y-0 flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setIsFullscreen(true)}
            size="sm"
            variant="secondary"
            className="h-8 rounded-lg text-xs font-semibold gap-1.5 shadow-md border border-border/50 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Ver Completo
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            size="sm"
            variant="secondary"
            className="h-8 rounded-lg text-xs font-semibold gap-1.5 shadow-md border border-border/50 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <Download className="h-3.5 w-3.5" />
            Baixar SVG
          </Button>
        </div>

        {/* Clickable rendered diagram */}
        <div 
          className="flex justify-center p-6 overflow-x-auto select-none transition-all cursor-pointer hover:opacity-90 active:scale-[0.99] hover:bg-muted/5"
          dangerouslySetInnerHTML={{ __html: svg }}
          onClick={() => setIsFullscreen(true)}
          title="Clique para ver em tela cheia"
        />
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && mounted && createPortal(
        <div className="fixed inset-0 z-[999] bg-background/98 dark:bg-slate-950/98 backdrop-blur-md flex flex-col p-6 animate-in fade-in duration-200">
          {/* Header controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/30 pb-4 mb-4 gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-indigo-500" />
                Visualização do Diagrama
              </h3>
              <p className="text-xs text-muted-foreground">O diagrama cresce fisicamente permitindo rolagem perfeita sem cortes</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-1.5 bg-muted/50 border border-border/30 rounded-lg p-1">
                <Button
                  type="button"
                  onClick={handleZoomOut}
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-md hover:bg-muted"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[11px] font-mono font-bold min-w-[36px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  type="button"
                  onClick={handleZoomIn}
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-md hover:bg-muted"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  onClick={handleResetZoom}
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[10px] font-semibold px-2 rounded-md hover:bg-muted"
                >
                  Reset
                </Button>
              </div>

              <div className="h-4 w-px bg-border/40 mx-1 hidden sm:block" />

              <Button
                type="button"
                onClick={handleDownload}
                size="sm"
                variant="outline"
                className="h-8 rounded-lg text-xs font-semibold gap-1.5 shadow-sm border border-border/40 hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar SVG
              </Button>
              
              <Button
                type="button"
                onClick={() => setIsFullscreen(false)}
                size="sm"
                variant="secondary"
                className="h-8 rounded-lg text-xs font-semibold gap-1.5 shadow-sm border border-border/40"
              >
                <X className="h-3.5 w-3.5" />
                Fechar (Esc)
              </Button>
            </div>
          </div>

          {/* SVG Viewport with Physical Layout Zoom, Click & Drag Panning, & Native Scrollbar Recalculation */}
          <div 
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex-1 overflow-auto flex p-8 bg-muted/5 rounded-2xl border border-border/30 relative cursor-grab select-none active:cursor-grabbing invert dark:invert-0"
          >
            <style dangerouslySetInnerHTML={{ __html: `
              .mermaid-viewport svg {
                width: 100% !important;
                height: 100% !important;
                max-width: none !important;
              }
            `}} />
            <div 
              className="select-none transition-all duration-150 ease-out mermaid-viewport flex-shrink-0 m-auto"
              style={{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                display: 'block'
              }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
