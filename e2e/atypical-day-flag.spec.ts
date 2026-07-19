// @test:atypical-day-flag
import { test, expect } from '@playwright/test';

function birthdayDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

test.describe('Atypical Day / Disruption Flag [@feature:atypical-day-flag]', () => {
  test('one tap flags the day, calms the copy, and shifts cues-first', async ({ page }) => {
    // ~10 months → clock mode by default
    await page.goto(`/?bd=${birthdayDaysAgo(300)}&s=7-3/3/3-7`);
    await expect(page.getByText('A by-the-clock schedule works now')).toBeVisible();

    await page.getByRole('button', { name: 'Today is atypical' }).click();
    await expect(page.getByText(/Atypical day — don't over-adjust\. Follow cues today/)).toBeVisible();
    // framing drops to cues-first even at clock age
    await expect(page.getByText('Watch the baby, not the clock')).toBeVisible();
    // flag rides the shareable URL
    await expect(page).toHaveURL(/at=other/);
  });

  test('a reason refines the flag and the URL', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(300)}&s=7-3/3/3-7`);
    await page.getByRole('button', { name: 'Today is atypical' }).click();
    await page.getByRole('button', { name: 'Teething', exact: true }).click();
    await expect(page).toHaveURL(/at=teething/);
  });

  test('a shared link carries the flag and preselects the reason', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(300)}&s=7-3/3/3-7&at=illness`);
    await expect(page.getByText(/Atypical day — don't over-adjust/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Illness', exact: true }))
      .toHaveAttribute('aria-pressed', 'true');
  });

  test('clearing the flag restores the normal plan (relief, not a demerit)', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(300)}&s=7-3/3/3-7&at=travel`);
    await page.getByRole('button', { name: 'Today is atypical' }).click();
    await expect(page.getByText(/Atypical day — don't over-adjust/)).not.toBeVisible();
    await expect(page.getByText('A by-the-clock schedule works now')).toBeVisible();
    await expect(page).not.toHaveURL(/at=/);
  });
});
