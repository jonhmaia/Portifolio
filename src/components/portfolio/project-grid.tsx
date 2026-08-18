'use client'

import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { gsap, useGSAP } from '@/lib/gsap/register'
import { cn } from '@/lib/utils'
import { ProjectCard, type EditorialProject } from './project-card'
import styles from './gallery.module.css'

interface ProjectGridProps {
  projects: EditorialProject[]
  locale?: string
}

const DRAG_THRESHOLD_PX = 8

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getTrackPadding(track: HTMLDivElement) {
  return Number.parseFloat(getComputedStyle(track).scrollPaddingInlineStart || '0')
}

function getClosestIndex(track: HTMLDivElement) {
  const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-gallery-card]'))
  const origin = track.getBoundingClientRect().left + getTrackPadding(track)
  let nextIndex = 0
  let closest = Number.POSITIVE_INFINITY

  cards.forEach((card, index) => {
    const distance = Math.abs(card.getBoundingClientRect().left - origin)
    if (distance < closest) {
      closest = distance
      nextIndex = index
    }
  })

  return nextIndex
}

export function ProjectGrid({ projects, locale = 'pt-BR' }: ProjectGridProps) {
  const isEnglish = locale === 'en'
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollToIndexRef = useRef<(index: number) => void>(() => {})
  const suppressClickRef = useRef(false)
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: -1,
  })
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(projects.length > 1)
  const [dragging, setDragging] = useState(false)

  const updateMetrics = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const maxScroll = Math.max(track.scrollWidth - track.clientWidth, 0)
    const scrollLeft = track.scrollLeft

    setActiveIndex(getClosestIndex(track))
    setProgress(maxScroll === 0 ? 1 : scrollLeft / maxScroll)
    setCanPrev(scrollLeft > 8)
    setCanNext(scrollLeft < maxScroll - 8)
  }, [])

  useGSAP(
    (_context, contextSafe) => {
      const track = trackRef.current
      if (!track || !contextSafe) return

      updateMetrics()

      scrollToIndexRef.current = contextSafe((index: number) => {
        const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-gallery-card]'))
        const card = cards[Math.max(0, Math.min(index, cards.length - 1))]
        if (!card) return

        const padding = getTrackPadding(track)
        const left =
          track.scrollLeft + card.getBoundingClientRect().left - track.getBoundingClientRect().left - padding

        track.style.scrollSnapType = 'none'
        gsap.to(track, {
          scrollLeft: left,
          duration: prefersReducedMotion() ? 0 : 0.72,
          ease: 'power3.out',
          overwrite: true,
          onUpdate: updateMetrics,
          onComplete: () => {
            track.style.scrollSnapType = ''
            updateMetrics()
          },
        })
      })

      const onScroll = () => updateMetrics()
      const onResize = () => updateMetrics()

      track.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onResize)

      return () => {
        track.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResize)
      }
    },
    { scope: rootRef, dependencies: [projects.length, updateMetrics] },
  )

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || event.button !== 0) return
    const track = trackRef.current
    if (!track) return

    const target = event.target
    if (target instanceof Element && target.closest('a[target="_blank"], button')) {
      return
    }

    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: track.scrollLeft,
      pointerId: event.pointerId,
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const track = trackRef.current
    if (!drag.active || !track) return

    const delta = event.clientX - drag.startX
    if (!drag.moved && Math.abs(delta) > DRAG_THRESHOLD_PX) {
      drag.moved = true
      if (!dragging) setDragging(true)
      if (!track.hasPointerCapture(event.pointerId)) {
        track.setPointerCapture(event.pointerId)
      }
    }
    if (drag.moved) {
      track.scrollLeft = drag.scrollLeft - delta
    }
  }

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const track = trackRef.current
    if (!drag.active) return

    const moved = drag.moved
    const pointerId = drag.pointerId
    drag.active = false
    drag.moved = false
    drag.pointerId = -1
    setDragging(false)

    if (track && pointerId === event.pointerId && track.hasPointerCapture(pointerId)) {
      try {
        track.releasePointerCapture(pointerId)
      } catch {
        // already released
      }
    }

    if (moved && track) {
      suppressClickRef.current = true
      scrollToIndexRef.current(getClosestIndex(track))
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 80)
    }
  }

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      scrollToIndexRef.current(activeIndex + 1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scrollToIndexRef.current(activeIndex - 1)
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(styles.carousel, canPrev && styles.showLeft, canNext && styles.showRight)}
      role="region"
      aria-roledescription="carousel"
      aria-label={isEnglish ? 'Project gallery' : 'Galeria de projetos'}
      onKeyDown={onKeyDown}
    >
      <div className={`${styles.edge} ${styles.edgeLeft}`} aria-hidden="true" />
      <div className={`${styles.edge} ${styles.edgeRight}`} aria-hidden="true" />

      <div
        ref={trackRef}
        className={cn(styles.track, dragging && styles.trackIsDragging)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onClickCapture={onClickCapture}
      >
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            count={projects.length}
            locale={locale}
          />
        ))}
      </div>

      <div className={styles.controls}>
        <span className={styles.counter} aria-live="polite">
          {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </span>
        <div className={styles.progress} aria-hidden="true">
          <span className={styles.progressBar} style={{ width: `${Math.max(progress, 0.08) * 100}%` }} />
        </div>
        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scrollToIndexRef.current(activeIndex - 1)}
            disabled={!canPrev}
            aria-label={isEnglish ? 'Previous project' : 'Projeto anterior'}
          >
            <ChevronLeft size={18} strokeWidth={1.7} />
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scrollToIndexRef.current(activeIndex + 1)}
            disabled={!canNext}
            aria-label={isEnglish ? 'Next project' : 'Próximo projeto'}
          >
            <ChevronRight size={18} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </div>
  )
}
