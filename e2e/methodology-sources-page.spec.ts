// @test:methodology-sources-page
import { test, expect } from '@playwright/test';

test.describe('Methodology & sources [@feature:methodology-sources-page]', () => {
  test('exposes a sources & evidence library with the tier explainer', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7&tab=learn&topic=sources');
    // "Sources & Evidence" is also referenced by name in the G04 "How this
    // was calculated" copy, so target the disclosure element itself.
    const summary = page.locator('summary', { hasText: 'Sources & Evidence' });
    await expect(summary).toBeVisible();
    await summary.click(); // open the <details>
    await expect(page.getByText('What do these tiers mean?')).toBeVisible();
  });
});
