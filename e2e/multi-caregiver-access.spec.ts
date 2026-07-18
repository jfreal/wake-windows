// @test:multi-caregiver-access
import { test, expect } from '@playwright/test';

// Feature: Multi-Caregiver Access (Local-First, Per-Person) (Sharing & Collaboration) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:multi-caregiver-access`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Multi-Caregiver Access (Local-First, Per-Person) [@feature:multi-caregiver-access]', () => {
  test.skip('TODO: implement E2E once multi-caregiver-access is built', async ({ page }) => {
    await page.goto('/');
  });
});
