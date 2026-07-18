// @test:white-noise-sounds
import { test, expect } from '@playwright/test';

// Feature: White-Noise & Sleep Sounds (Utility & Integrations) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:white-noise-sounds`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('White-Noise & Sleep Sounds [@feature:white-noise-sounds]', () => {
  test.skip('TODO: implement E2E once white-noise-sounds is built', async ({ page }) => {
    await page.goto('/');
  });
});
