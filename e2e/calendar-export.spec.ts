// @test:calendar-export
import { test, expect } from '@playwright/test';

// Feature: Calendar Export (ICS) (Utility & Integrations) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:calendar-export`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Calendar Export (ICS) [@feature:calendar-export]', () => {
  test.skip('TODO: implement E2E once calendar-export is built', async ({ page }) => {
    await page.goto('/');
  });
});
