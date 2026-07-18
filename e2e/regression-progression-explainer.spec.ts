// @test:regression-progression-explainer
import { test, expect } from '@playwright/test';

// Feature: Regression / Progression Explainer (Guidance & Credibility) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:regression-progression-explainer`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Regression / Progression Explainer [@feature:regression-progression-explainer]', () => {
  test.skip('TODO: implement E2E once regression-progression-explainer is built', async ({ page }) => {
    await page.goto('/');
  });
});
