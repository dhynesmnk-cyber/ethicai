/** Joins class names, skipping falsy values. Callers avoid passing conflicting utilities. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
