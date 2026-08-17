// @test:bedtime-calculator
import { test, expect } from '@playwright/test';
import { openTab } from './helpers';

test.describe('Bedtime calculator [@feature:bedtime-calculator]', () => {
  test('shows a bedtime in the schedule and updates it when bedtime changes', async ({ page }) => {
    // Bedtime is SET in Settings and READ on Today, so this crosses screens —
    // and does it without a reload, which is the part worth testing: the plan is
    // one reactive object, so the schedule must already be right on arrival.
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7&tab=settings');
    await expect(page.locator('label[for="bed"]')).toBeVisible();
    await page.locator('#bed').selectOption('8');
    await expect.poll(() => decodeURIComponent(page.url())).toContain('s=7-2/2/2/2-8');

    await openTab(page, 'Today');
    const bedtime = page.getByRole('region', { name: 'Rest of the day' })
      .getByRole('listitem').filter({ hasText: 'Bedtime' });
    await expect(bedtime).toContainText(/8:\d{2}\s?PM/);
  });
});
