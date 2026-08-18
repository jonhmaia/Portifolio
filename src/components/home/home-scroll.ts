'use client'

import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap/register'

type ScrollConditions = {
  reduceMotion?: boolean
  isMobile?: boolean
}

export function setupHomeScroll(root: HTMLElement, conditions: ScrollConditions) {
  if (conditions.reduceMotion) return

  const headers = root.querySelectorAll<HTMLElement>('[data-scroll="feed-header"]')
  const aboutHeading = root.querySelector<HTMLElement>('[data-scroll="about-heading"]')
  const bio = root.querySelector<HTMLElement>('[data-scroll="bio"]')
  const photoWrap = root.querySelector<HTMLElement>('[data-scroll="about-image"]')
  const cards = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-scroll="capability-card"]'))
  const stackItems = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-scroll="stack-item"]'))
  const cta = root.querySelector<HTMLElement>('[data-scroll="cta"]')

  headers.forEach((header) => {
    gsap.from(header, {
      autoAlpha: 0,
      y: 24,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: header,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    })
  })

  if (aboutHeading) {
    SplitText.create(aboutHeading, {
      type: 'lines',
      mask: 'lines',
      aria: 'auto',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: aboutHeading,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        })
      },
    })
  }

  if (bio) {
    gsap.from(bio, {
      autoAlpha: 0,
      y: 18,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: bio,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })
  }

  if (photoWrap) {
    const image = photoWrap.querySelector('img')
    if (image) {
      gsap.set(image, { scale: 1.15, transformOrigin: '50% 18%' })

      gsap.from(image, {
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: photoWrap,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })

      gsap.fromTo(
        image,
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: photoWrap,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }
  }

  if (cards.length) {
    gsap.set(cards, { autoAlpha: 0, y: 40 })
    ScrollTrigger.batch(cards, {
      start: 'top 88%',
      interval: 0.12,
      batchMax: 4,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: 'power3.out',
          overwrite: true,
          clearProps: 'transform',
        }),
      onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, y: 40, overwrite: true }),
    })
  }

  if (stackItems.length) {
    gsap.set(stackItems, { autoAlpha: 0, y: 24 })
    ScrollTrigger.batch(stackItems, {
      start: 'top 90%',
      interval: 0.08,
      batchMax: 8,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.04,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: true,
          clearProps: 'transform',
        }),
      onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, y: 24, overwrite: true }),
    })
  }

  if (cta) {
    gsap.fromTo(
      cta,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cta,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      },
    )
  }

  requestAnimationFrame(() => ScrollTrigger.refresh())
}

export function setupHeroScroll(root: HTMLElement, conditions: ScrollConditions) {
  if (conditions.reduceMotion) return

  const targets = root.querySelectorAll<HTMLElement>(
    '[data-scroll="hero-role"], [data-scroll="hero-title"], [data-scroll="hero-cluster"], [data-scroll="hero-meta"]',
  )
  if (!targets.length) return

  gsap.to(targets, {
    y: -48,
    autoAlpha: 0,
    ease: 'none',
    stagger: 0.03,
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
    },
  })

  requestAnimationFrame(() => ScrollTrigger.refresh())
}
