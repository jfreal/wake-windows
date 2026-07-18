// @test:24h-visual-day-breakdown
import { test, expect } from '@playwright/test';

test.describe('24-hour visual day breakdown [@feature:24h-visual-day-breakdown]', () => {
  test('renders the awake / night-sleep / nap day bar and stats', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.getByRole('img', { name: /awake.*night sleep.*naps/ })).toBeVisible();
    await expect(page.getByText('Sleep Stats')).toBeVisible();
    await expect(page.getByText('Total Wake')).toBeVisible();
  });
});
