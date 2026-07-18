// @test:widgets-live-activities
import { test, expect } from '@playwright/test';

// Feature: Home/Lock-Screen Widgets & Live Activities (Utility & Integrations) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:widgets-live-activities`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Home/Lock-Screen Widgets & Live Activities [@feature:widgets-live-activities]', () => {
  test.skip('TODO: implement E2E once widgets-live-activities is built', async ({ page }) => {
    await page.goto('/');
  });
});
