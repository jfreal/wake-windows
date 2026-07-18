// @test:offline-mode
import { test, expect } from '@playwright/test';

// Feature: Offline Mode (Utility & Integrations) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:offline-mode`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Offline Mode [@feature:offline-mode]', () => {
  test.skip('TODO: implement E2E once offline-mode is built', async ({ page }) => {
    await page.goto('/');
  });
});
