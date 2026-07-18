// @test:growth-percentiles
import { test, expect } from '@playwright/test';

// Feature: Growth Measurements & Percentiles (Tracking & Logging) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:growth-percentiles`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Growth Measurements & Percentiles [@feature:growth-percentiles]', () => {
  test.skip('TODO: implement E2E once growth-percentiles is built', async ({ page }) => {
    await page.goto('/');
  });
});
