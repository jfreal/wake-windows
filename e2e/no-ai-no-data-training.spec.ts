// @test:no-ai-no-data-training
import { test, expect } from '@playwright/test';

// Feature: No-AI / No-Data-Training Stance (Brand & Product) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:no-ai-no-data-training`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('No-AI / No-Data-Training Stance [@feature:no-ai-no-data-training]', () => {
  test.skip('TODO: implement E2E once no-ai-no-data-training is built', async ({ page }) => {
    await page.goto('/');
  });
});
