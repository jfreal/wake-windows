// @test:regression-progression-explainer
import { test, expect } from '@playwright/test';

// Feature: Regression / Progression Explainer (Guidance & Credibility).
// Opens the collapsible explainer, asserts the 4-month permanent-progression
// framing, and confirms a tier badge renders alongside the cited claims.
test.describe('Regression / Progression Explainer [@feature:regression-progression-explainer]', () => {
  test('reframes the 4-month change as a progression with a tier badge', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');

    const panel = page.getByText('Regressions & progressions', { exact: false });
    await expect(panel).toBeVisible();
    await panel.click();

    // Progression framing, not a "blip" / broken baby.
    await expect(page.getByText('A permanent step forward, not a blip')).toBeVisible();
    await expect(page.getByText(/one-way/)).toBeVisible();
    await expect(page.getByText(/Night wakings are normal/)).toBeVisible();

    // At least one evidence-tier badge renders on the cited claims.
    await expect(page.getByText(/Tier 1 · Evidence-based/).first()).toBeVisible();
  });
});
