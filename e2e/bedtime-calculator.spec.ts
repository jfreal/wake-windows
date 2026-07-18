// @test:bedtime-calculator
import { test, expect } from '@playwright/test';

test.describe('Bedtime calculator [@feature:bedtime-calculator]', () => {
  test('shows a bedtime in the schedule and updates it when bedtime changes', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.locator('label[for="bed"]')).toBeVisible();
    await expect(page.getByText(/\d{1,2}:\d{2}\s?PM/).first()).toBeVisible();
    await page.locator('#bed').selectOption('8');
    await expect.poll(() => decodeURIComponent(page.url())).toContain('s=7-2/2/2/2-8');
  });
});
