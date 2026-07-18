// @test:nap-transition-detector
import { test, expect } from '@playwright/test';

// Feature: Nap-Transition Detector & Guidance (4→3→2→1) (Scheduling & Prediction) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:nap-transition-detector`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Nap-Transition Detector & Guidance (4→3→2→1) [@feature:nap-transition-detector]', () => {
  test.skip('TODO: implement E2E once nap-transition-detector is built', async ({ page }) => {
    await page.goto('/');
  });
});
