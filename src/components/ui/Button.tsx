import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * `primary`/`secondary`/`ghost` sit on light backgrounds. On night or indigo sections use
 * `light` (a white pill) or `underline` (selma.au's quiet text link with a hairline underline).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light' | 'underline'
export type ButtonSize = 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'rounded-full bg-accent text-white hover:bg-accent-strong',
  secondary: 'rounded-full border border-accent text-accent hover:bg-accent-tint',
  ghost: 'rounded-full text-accent hover:bg-accent-tint',
  light: 'rounded-full bg-white text-accent hover:bg-mist',
  underline:
    'rounded-sm border-b border-white/40 px-0! text-white/80 hover:border-white/80 hover:text-white',
}

const sizes: Record<ButtonSize, string> = {
  md: 'min-h-11 px-5 text-base',
  lg: 'min-h-12 px-7 text-lg',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return cn(
    'inline-flex items-center justify-center gap-2 font-semibold leading-tight no-underline',
    'transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.98]',
    'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    variants[variant],
    sizes[size],
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonClasses(variant, size), className)} {...props} />
}

type ButtonLinkProps = {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

/** A link styled as a button. Absolute URLs (e.g. Substack, selma.au) render a plain anchor. */
export function ButtonLink({ href, children, variant, size, className }: ButtonLinkProps) {
  const classes = cn(buttonClasses(variant, size), className)
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
