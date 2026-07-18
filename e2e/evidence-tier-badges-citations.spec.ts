// @test:evidence-tier-badges-citations
import { test, expect } from '@playwright/test';

test.describe('Evidence tier badges & citations [@feature:evidence-tier-badges-citations]', () => {
  test('shows evidence-based guidance with a tier badge', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.getByText('Evidence-based guidance')).toBeVisible();
    await expect(page.getByText(/Tier 1/).first()).toBeVisible();
  });
});
