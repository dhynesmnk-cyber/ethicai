import type { Page } from '@playwright/test'

type ShiftWindow = { __cls?: number }
type LayoutShift = PerformanceEntry & { value: number; hadRecentInput: boolean }

/** Starts recording Cumulative Layout Shift; call before page.goto(). */
export async function recordLayoutShift(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const win = window as unknown as ShiftWindow
    win.__cls = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShift[]) {
        if (!entry.hadRecentInput) win.__cls = (win.__cls ?? 0) + entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
}

export async function layoutShift(page: Page): Promise<number> {
  await page.waitForLoadState('networkidle')
  return page.evaluate(() => (window as unknown as ShiftWindow).__cls ?? 0)
}
