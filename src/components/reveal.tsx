'use client'

import { useEffect, useRef, useState } from 'react'

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Transition delay in ms, for staggering siblings */
  delay?: number
}

/**
 * Scroll-triggered reveal. Adds `.in-view` once the element enters the
 * viewport, which drives the `.reveal` / `.reveal-mask-inner` / `.rule-grow`
 * transitions defined in globals.css. Fires once, then disconnects.
 */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -48px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'in-view' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
