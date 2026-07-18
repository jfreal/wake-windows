// @test:read-only-babysitter-mode
import { test, expect } from '@playwright/test';

// Feature: Read-Only Babysitter / Grandparent Mode (Sharing & Collaboration) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:read-only-babysitter-mode`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Read-Only Babysitter / Grandparent Mode [@feature:read-only-babysitter-mode]', () => {
  test.skip('TODO: implement E2E once read-only-babysitter-mode is built', async ({ page }) => {
    await page.goto('/');
  });
});
