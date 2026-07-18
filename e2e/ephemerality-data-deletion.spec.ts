// @test:ephemerality-data-deletion
import { test, expect } from '@playwright/test';

// Feature: Ephemerality & One-Click Data Deletion (Brand & Product) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:ephemerality-data-deletion`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Ephemerality & One-Click Data Deletion [@feature:ephemerality-data-deletion]', () => {
  test.skip('TODO: implement E2E once ephemerality-data-deletion is built', async ({ page }) => {
    await page.goto('/');
  });
});
