// @test:pediatrician-report-export
import { test, expect } from '@playwright/test';

// Feature: Pediatrician-Ready Report & Export (Analytics & Insights) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:pediatrician-report-export`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Pediatrician-Ready Report & Export [@feature:pediatrician-report-export]', () => {
  test.skip('TODO: implement E2E once pediatrician-report-export is built', async ({ page }) => {
    await page.goto('/');
  });
});
