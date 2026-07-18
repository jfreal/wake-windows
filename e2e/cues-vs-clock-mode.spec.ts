// @test:cues-vs-clock-mode
import { test, expect } from '@playwright/test';

// Feature: Cues-vs-Clock Mode by Age (Scheduling & Prediction) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:cues-vs-clock-mode`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Cues-vs-Clock Mode by Age [@feature:cues-vs-clock-mode]', () => {
  test.skip('TODO: implement E2E once cues-vs-clock-mode is built', async ({ page }) => {
    await page.goto('/');
  });
});
