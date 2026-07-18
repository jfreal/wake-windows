// @test:voice-siri-logging
import { test, expect } from '@playwright/test';

// Feature: Voice & Siri Shortcuts Logging (Utility & Integrations) — status: Proposed (not built yet).
// Placeholder kept skipped so the E2E matrix covers every feature.
// When this ships: tag the code with `// @doc:voice-siri-logging`, then replace test.skip
// with real assertions and run `npm run test:e2e`.
test.describe('Voice & Siri Shortcuts Logging [@feature:voice-siri-logging]', () => {
  test.skip('TODO: implement E2E once voice-siri-logging is built', async ({ page }) => {
    await page.goto('/');
  });
});
