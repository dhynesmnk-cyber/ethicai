import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const baseURL = 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Optional: run against an already-installed Chromium instead of the build pinned by
        // @playwright/test (e.g. in a sandbox image that ships a different one).
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    reuseExistingServer: true,
    url: baseURL,
    timeout: 180_000,
  },
})
