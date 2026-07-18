// @test:reminders-nudges
import { test, expect } from '@playwright/test';

// Feature: Reminders & Pre-Nap Nudges (Utility & Integrations) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:reminders-nudges`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Reminders & Pre-Nap Nudges [@feature:reminders-nudges]', () => {
  test.skip('TODO: implement E2E once reminders-nudges is built', async ({ page }) => {
    await page.goto('/');
  });
});
