// @test:atypical-day-flag
import { test, expect } from '@playwright/test';

// Feature: Atypical Day" / Disruption Flag (Scheduling & Prediction) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:atypical-day-flag`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Atypical Day" / Disruption Flag [@feature:atypical-day-flag]', () => {
  test.skip('TODO: implement E2E once atypical-day-flag is built', async ({ page }) => {
    await page.goto('/');
  });
});
