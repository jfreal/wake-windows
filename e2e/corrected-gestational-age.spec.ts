// @test:corrected-gestational-age
import { test, expect } from '@playwright/test';

test.describe('Corrected / gestational-age input [@feature:corrected-gestational-age]', () => {
  test('accepts gestational weeks and warns on out-of-range values', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    const weeks = page.locator('#weeks');
    await expect(weeks).toBeVisible();
    await weeks.fill('10');
    await expect(page.getByText(/Weeks in womb should typically be between 20 and 44/)).toBeVisible();
    await weeks.fill('40');
    await expect(page.getByText(/Weeks in womb should typically be between 20 and 44/)).toHaveCount(0);
  });
});
