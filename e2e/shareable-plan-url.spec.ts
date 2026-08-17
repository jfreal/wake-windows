// @test:shareable-plan-url
import { test, expect } from '@playwright/test';

test.describe('Shareable plan URL [@feature:shareable-plan-url]', () => {
  test('encodes the plan in the URL and rewrites it as inputs change', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7&tab=settings');
    await expect.poll(() => decodeURIComponent(page.url())).toContain('s=7-2/2/2/2-7');
    await page.locator('#bed').selectOption('8');
    await expect.poll(() => decodeURIComponent(page.url())).toContain('s=7-2/2/2/2-8');
  });
});
