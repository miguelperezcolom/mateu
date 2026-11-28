import type React from 'react'
import { useLayoutEffect, useRef, useState } from 'react'

/** The dynamic page scrolls itself: its height is what is left of the window below where it starts. */
export function useFillViewport(ref: React.RefObject<HTMLDivElement | null>): number | undefined {
  const [height, setHeight] = useState<number | undefined>(undefined)
  const last = useRef(0)
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      const next = Math.max(320, Math.round(window.innerHeight - top))
      if (next !== last.current) { last.current = next; setHeight(next) }
    }
    measure()
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    if (ref.current?.parentElement) ro.observe(ref.current.parentElement)
    return () => { window.removeEventListener('resize', measure); ro.disconnect() }
  }, [ref])
  return height
}
