// @test:no-account-privacy-first
import { test, expect } from '@playwright/test';

// Feature: No-Account, Privacy-First Architecture (Brand & Product) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:no-account-privacy-first`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('No-Account, Privacy-First Architecture [@feature:no-account-privacy-first]', () => {
  test.skip('TODO: implement E2E once no-account-privacy-first is built', async ({ page }) => {
    await page.goto('/');
  });
});
