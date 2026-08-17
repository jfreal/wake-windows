// @test:safe-sleep-panel
import { test, expect } from '@playwright/test';

test.describe('AAP safe-sleep panel [@feature:safe-sleep-panel]', () => {
  test('shows the safe-sleep essentials', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7&tab=learn&topic=safe-sleep');
    await expect(page.getByText('Safe sleep', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Place baby fully on their back/)).toBeVisible();
  });
});
