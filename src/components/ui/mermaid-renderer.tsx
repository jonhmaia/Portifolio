'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

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
        // Limpa mensagens de erro internas do mermaid que podem ser confusas
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

  return (
    <div 
      className="flex justify-center my-6 p-6 bg-muted/10 border border-border/50 rounded-xl overflow-x-auto shadow-inner select-none transition-all"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
