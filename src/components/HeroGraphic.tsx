/** Restrained line work for the home hero (BUILD-SPEC §5.2, §6: no stock imagery). Decorative. */
export function HeroGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" focusable="false" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.25">
        <circle cx="200" cy="200" r="180" opacity="0.25" />
        <circle cx="200" cy="200" r="140" opacity="0.35" />
        <circle cx="200" cy="200" r="100" opacity="0.5" />
        <circle cx="200" cy="200" r="60" opacity="0.7" />
        <path d="M20 200h360M200 20v360" opacity="0.2" />
        <path d="M73 73l254 254M327 73L73 327" opacity="0.12" />
      </g>
      <circle cx="200" cy="200" r="10" fill="currentColor" />
      <circle cx="300" cy="130" r="6" fill="currentColor" opacity="0.6" />
      <circle cx="110" cy="290" r="6" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
