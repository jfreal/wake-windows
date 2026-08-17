// @test:dst-timezone-shift
import { test, expect } from '@playwright/test';

function birthdayDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

test.describe('Daylight Saving & Time-Zone Shift Tool [@feature:dst-timezone-shift]', () => {
  test('fall-back preset renders the 4-day later ramp plus the change day', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(150)}&s=7-2/2/2/2-7&tab=settings`);
    await page.getByRole('button', { name: /Fall back/ }).click();

    await expect(page.getByText('4 days before', { exact: true })).toBeVisible();
    await expect(page.getByText('1 day before', { exact: true })).toBeVisible();
    await expect(page.getByText('Change day onward')).toBeVisible();
    await expect(page.getByText('+15 min')).toBeVisible();
    await expect(page.getByText('+60 min')).toBeVisible();
    // fall-back asymmetry: ramp days transparently run past the preferred bedtime
    await expect(page.getByText(/Runs past your preferred bedtime on purpose/).first()).toBeVisible();
    // selection rides the shareable URL
    await expect(page).toHaveURL(/shift=fall/);
  });

  test('spring-forward preset walks the day earlier instead', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(150)}&s=7-2/2/2/2-7&tab=settings`);
    await page.getByRole('button', { name: /Spring forward/ }).click();

    await expect(page.getByText('−15 min')).toBeVisible();
    await expect(page.getByText('−60 min')).toBeVisible();
    // no "past your preferred bedtime" note when shifting earlier
    await expect(page.getByText(/Runs past your preferred bedtime/)).not.toBeVisible();
    await expect(page).toHaveURL(/shift=spring/);
  });

  test('a shared link opens the identical step plan for the other caregiver', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(150)}&s=7-2/2/2/2-7&shift=spring&tab=settings`);
    await expect(page.getByRole('button', { name: /Spring forward/ }))
      .toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Change day onward')).toBeVisible();
  });

  test('the plan carries the Tier 3 badge and speaks in ranges', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(150)}&s=7-2/2/2/2-7&shift=fall&tab=settings`);
    // filter({ visible: true }): Tier 3 badges also exist inside collapsed
    // guidance <details> panels earlier in the DOM; the DST plan's badge is
    // the first VISIBLE one.
    await expect(page.getByText('Tier 3 · Practitioner convention').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/Ranges, not targets/)).toBeVisible();
  });

  test('deselecting the preset clears the plan and the URL param', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(150)}&s=7-2/2/2/2-7&shift=fall&tab=settings`);
    await page.getByRole('button', { name: /Fall back/ }).click();
    await expect(page.getByText('Change day onward')).not.toBeVisible();
    await expect(page).not.toHaveURL(/shift=/);
  });
});
