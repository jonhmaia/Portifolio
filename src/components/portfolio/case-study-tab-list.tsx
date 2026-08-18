'use client'

import { useRef, type ComponentProps } from 'react'
import { TabsList } from '@/components/ui/tabs'
import { gsap, useGSAP } from '@/lib/gsap/register'
import styles from './portfolio.module.css'

type CaseStudyTabListProps = ComponentProps<typeof TabsList>

function getActiveLayout(list: HTMLElement) {
  const active = list.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]')
  if (!active) return null

  return {
    x: active.offsetLeft,
    y: active.offsetTop,
    width: active.offsetWidth,
    height: active.offsetHeight,
  }
}

export function CaseStudyTabList({ children, className, ...props }: CaseStudyTabListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)

  useGSAP((_, contextSafe) => {
    const list = listRef.current
    const indicator = indicatorRef.current
    if (!list || !indicator || !contextSafe) return

    const prefersReducedMotion = () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const base = { width: 0, height: 0 }

    const syncBase = (layout: NonNullable<ReturnType<typeof getActiveLayout>>) => {
      base.width = layout.width
      base.height = layout.height
      gsap.set(indicator, {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
        scaleX: 1,
        scaleY: 1,
        transformOrigin: '0 0',
      })
    }

    const firstLayout = getActiveLayout(list)
    if (firstLayout) syncBase(firstLayout)

    const move = contextSafe((animate = true) => {
      const next = getActiveLayout(list)
      if (!next || !base.width || !base.height) return

      gsap.to(indicator, {
        x: next.x,
        y: next.y,
        scaleX: next.width / base.width,
        scaleY: next.height / base.height,
        duration: animate && !prefersReducedMotion() ? 0.52 : 0,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    })

    const snap = contextSafe(() => {
      const next = getActiveLayout(list)
      if (!next) return
      syncBase(next)
    })

    const mutationObserver = new MutationObserver(() => move(true))
    list.querySelectorAll('[data-slot="tabs-trigger"]').forEach((trigger) => {
      mutationObserver.observe(trigger, {
        attributes: true,
        attributeFilter: ['data-state'],
      })
    })

    window.addEventListener('resize', snap)

    return () => {
      mutationObserver.disconnect()
      window.removeEventListener('resize', snap)
    }
  }, { scope: listRef })

  return (
    <TabsList ref={listRef} className={className} {...props}>
      <span ref={indicatorRef} className={styles.tabIndicator} aria-hidden="true" />
      {children}
    </TabsList>
  )
}
