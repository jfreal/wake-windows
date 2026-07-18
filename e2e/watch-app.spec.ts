// @test:watch-app
import { test, expect } from '@playwright/test';

// Feature: Apple Watch / Wear OS Companion (Utility & Integrations) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:watch-app`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Apple Watch / Wear OS Companion [@feature:watch-app]', () => {
  test.skip('TODO: implement E2E once watch-app is built', async ({ page }) => {
    await page.goto('/');
  });
});
