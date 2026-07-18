// @test:sleepy-cues-reference
import { test, expect } from '@playwright/test';

test.describe('Sleepy-cues reference [@feature:sleepy-cues-reference]', () => {
  test('surfaces the cues-over-clock reminder', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.getByText(/tiredness cues over the clock/)).toBeVisible();
  });
});
