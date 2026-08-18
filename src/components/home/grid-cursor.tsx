'use client'

import { useEffect, useRef } from 'react'
import styles from '@/components/blog/editorial.module.css'

const CELL = 26
const DECAY = 0.045

export function GridCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const page = canvas?.parentElement
    if (!canvas || !page) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return

    const context = canvas.getContext('2d')
    if (!context) return

    const cells = new Map<string, number>()
    let frame = 0

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(bounds.width * ratio))
      canvas.height = Math.max(1, Math.floor(bounds.height * ratio))
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const lightCell = (column: number, row: number, intensity: number) => {
      const key = `${column},${row}`
      cells.set(key, Math.max(cells.get(key) ?? 0, intensity))
    }

    const onPointerMove = (event: PointerEvent) => {
      const bounds = page.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      if (x < 0 || y < 0 || x > bounds.width || y > canvas.offsetHeight) return

      const column = Math.floor(x / CELL)
      const row = Math.floor(y / CELL)
      lightCell(column, row, 1)

      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          if (offsetX === 0 && offsetY === 0) continue
          lightCell(column + offsetX, row + offsetY, 0.32)
        }
      }
    }

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect()
      context.clearRect(0, 0, width, height)

      for (const [key, opacity] of cells) {
        const [column, row] = key.split(',').map(Number)
        context.fillStyle = `rgba(77, 163, 255, ${opacity * 0.46})`
        context.fillRect(column * CELL, row * CELL, CELL - 1, CELL - 1)

        const next = opacity - DECAY
        if (next <= 0) cells.delete(key)
        else cells.set(key, next)
      }

      frame = window.requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', resize)
    frame = window.requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.gridCursor} aria-hidden="true" />
}
