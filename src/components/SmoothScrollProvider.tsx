import { useEffect } from 'react'
import type { ReactNode } from 'react'
import Lenis from 'lenis'

type SmoothScrollProviderProps = {
  children: ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const mobileQuery = window.matchMedia(
      '(max-width: 768px), (pointer: coarse)',
    )

    if (reducedMotionQuery.matches || mobileQuery.matches) {
      return
    }

    const lenis = new Lenis({
      duration: 0.85,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 0,
    })

    let animationFrameId = 0

    function raf(time: number) {
      lenis.raf(time)
      animationFrameId = window.requestAnimationFrame(raf)
    }

    animationFrameId = window.requestAnimationFrame(raf)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      lenis.destroy()
    }
  }, [])

  return children
}
