import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for Wake Windows.
 *
 * Target is switchable via the E2E_BASE_URL env var:
 *   - unset  -> builds the app and runs a local `vite preview` on :4173 (default; CI-friendly)
 *   - set    -> runs against that URL and skips the local server,
 *               e.g.  E2E_BASE_URL=https://wake-windows.netlify.app  (live smoke test)
 *
 * Specs live in ./e2e, one file per feature, each tagged `@test:<docKey>` so the
 * sync-docs skill can verify every Built feature has a matching E2E test.
 */
const hostedBaseUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: hostedBaseUrl || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Firefox / WebKit can be enabled once their browsers are installed:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
  ],
  ...(hostedBaseUrl
    ? {}
    : {
        webServer: {
          command: 'npm run build && npm run preview -- --port 4173 --strictPort',
          url: 'http://localhost:4173',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
