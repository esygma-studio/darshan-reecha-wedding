/** Hairline + botanical mark used between sections instead of a hard border. */
export function SectionDivider({ color = 'var(--color-gold)' }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-2" aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[color:var(--divider-color)]/60" style={{ '--divider-color': color } as React.CSSProperties} />
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
        <path
          d="M9 1C9 1 9 6 9 9C9 12 9 17 9 17M1 9C1 9 6 9 9 9C12 9 17 9 17 9"
          stroke={color}
          strokeWidth="0.75"
          strokeLinecap="round"
        />
        <circle cx="9" cy="9" r="2.5" stroke={color} strokeWidth="0.75" fill="none" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[color:var(--divider-color)]/60" style={{ '--divider-color': color } as React.CSSProperties} />
    </div>
  )
}
