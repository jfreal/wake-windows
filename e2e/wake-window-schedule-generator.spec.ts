// @test:wake-window-schedule-generator
import { test, expect } from '@playwright/test';

test.describe('Wake-window schedule generator [@feature:wake-window-schedule-generator]', () => {
  test('turns age + wake windows + bedtime into a clock-time nap schedule', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.getByRole('heading', { level: 1, name: /Wake Windows/ })).toBeAttached();
    await expect(page.getByText('Rest of the day', { exact: true })).toBeVisible();
    // at least one nap row renders a clock-time range, e.g. "8:45–9:15 AM"
    // (formatClockRange repeats AM/PM only when the range crosses noon/midnight)
    await expect(
      page.getByText(/\d{1,2}:\d{2}(\s?(AM|PM))?\s?[–-]\s?\d{1,2}:\d{2}\s?(AM|PM)/).first()
    ).toBeVisible();
    await expect(page.getByText('Total Sleep', { exact: true })).toBeVisible();
  });
});
