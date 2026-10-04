import type { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

/** Fades and lifts content in once it scrolls into view. Used throughout the
 * site instead of one-off animations so every section moves the same way. */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
