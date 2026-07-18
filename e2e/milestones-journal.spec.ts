// @test:milestones-journal
import { test, expect } from '@playwright/test';

// Feature: Milestones, Journal & Photos (Tracking & Logging) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:milestones-journal`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Milestones, Journal & Photos [@feature:milestones-journal]', () => {
  test.skip('TODO: implement E2E once milestones-journal is built', async ({ page }) => {
    await page.goto('/');
  });
});
