// @test:personalized-from-local-history
import { test, expect } from '@playwright/test';

// Feature: Personalized Windows from Local History (optional) — status: Built.
// Opt-in, OFF by default. Refines the plan's wake windows from the baby's own
// last-N-days sleep log (median arithmetic, on-device). The age plan is complete
// without it; one tap resets to the age default.

/**
 * Seed a realistic local sleep log: five recent days whose MORNINGS consistently
 * run ~45 min longer than a [2,2,2] wake-window plan. Runs before app scripts so
 * the log is present when the component reads localStorage on mount.
 */
async function seed(page: import('@playwright/test').Page, windows: number[]) {
  await page.addInitScript((ww: number[]) => {
    const H = 3600000;
    const now = new Date();
    let id = 0;
    const entries: any[] = [];
    const mk = (start: number, end: number | null, kind: string) =>
      ({ id: 'e' + id++, start, end, pausedMs: 0, pauseStart: null, kind, kindOverridden: true });
    const dayAt = (offset: number, hour: number) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, 0, 0, 0).getTime();
    entries.push(mk(dayAt(-7, 19), dayAt(-6, 7), 'night'));
    for (let day = -6; day <= -2; day++) {
      let t = dayAt(day, 7);
      for (let i = 0; i < ww.length - 1; i++) {
        const ns = t + ww[i] * H;
        const ne = ns + H;
        entries.push(mk(ns, ne, 'nap'));
        t = ne;
      }
      const nightStart = t + ww[ww.length - 1] * H;
      entries.push(mk(nightStart, dayAt(day + 1, 7), 'night'));
    }
    localStorage.setItem('ww.sleepLog.v1', JSON.stringify(entries));
  }, windows);
}

test.describe('Personalized Windows from Local History (optional) [@feature:personalized-from-local-history]', () => {
  test('is off by default and does not touch the age plan', async ({ page }) => {
    await seed(page, [2.75, 2, 2]);
    await page.goto('/?bd=2026-01-01&s=7-2/2/2-7');

    const toggle = page.getByRole('button', { name: 'Personalize from my logs' });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    // Nothing changed yet — the explainer is absent.
    await expect(page.getByText('What we changed')).toHaveCount(0);
  });

  test('opting in nudges the morning window toward the logged median and shows its work', async ({ page }) => {
    await seed(page, [2.75, 2, 2]);
    await page.goto('/?bd=2026-01-01&s=7-2/2/2-7');

    await page.getByRole('button', { name: 'Personalize from my logs' }).click();

    // Show-the-work explainer with the Tier-3 badge and a plain-language line.
    const changed = page.getByText('What we changed');
    await expect(changed).toBeVisible();
    await expect(changed.locator('..').getByText('Tier 3')).toBeVisible();
    await expect(page.getByText(/morning wake window runs ~\d+ min longer than the default/)).toBeVisible();

    // The nudge is applied to the plan (morning 2h → 2.5h, capped at ±30 min).
    await expect(page.getByText('7-2.5/2/2-7')).toBeVisible();
  });

  test('one tap resets to the age default', async ({ page }) => {
    await seed(page, [2.75, 2, 2]);
    await page.goto('/?bd=2026-01-01&s=7-2/2/2-7');

    await page.getByRole('button', { name: 'Personalize from my logs' }).click();
    await expect(page.getByText('7-2.5/2/2-7')).toBeVisible();

    await page.getByRole('button', { name: 'Reset to age default' }).click();
    await expect(page.getByRole('button', { name: 'Personalize from my logs' })).toBeVisible();
    await expect(page.getByText('7-2/2/2-7')).toBeVisible();
  });

  test('too little data keeps the age default and says so', async ({ page }) => {
    // No seeded log at all.
    await page.goto('/?bd=2026-01-01&s=7-2/2/2-7');

    await page.getByRole('button', { name: 'Personalize from my logs' }).click();
    await expect(page.getByText(/Not enough logged sleep yet to personalize/)).toBeVisible();
    // Plan is untouched.
    await expect(page.getByText('7-2/2/2-7')).toBeVisible();
  });
});
