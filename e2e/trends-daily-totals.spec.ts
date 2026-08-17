// @test:trends-daily-totals
import { test, expect } from '@playwright/test';
import { setEntryToMidday } from './helpers';

// Feature: Trends & Daily Totals at a Glance (Analytics & Insights) — status: Built.
// A glanceable "Today" block (total sleep + nap count) plus a 7-day sleep
// sparkline, computed purely from the on-device sleep log. Additive; hidden in
// the read-only sitter view. Each test runs in a fresh context (empty storage).
test.describe('Trends & Daily Totals at a Glance [@feature:trends-daily-totals]', () => {
  // ~4.5-month-old, so the Tier 1 total-sleep context band is available.
  const plan = '/?bd=2026-03-01&s=7-2/2/2/2-7&tab=log';

  test('is hidden in read-only sitter mode, shown otherwise', async ({ page }) => {
    await page.goto(`${plan}&view=sitter`);
    await expect(page.getByRole('region', { name: 'Today' })).toHaveCount(0);

    await page.goto(plan);
    await expect(page.getByRole('region', { name: 'Today' })).toBeVisible();
  });

  test('shows the age-appropriate total-sleep context band with a tier badge', async ({ page }) => {
    await page.goto(plan);
    const today = page.getByRole('region', { name: 'Today' });
    // Context vs the AASM/NSF band — informative, never a grade. Tier 1 badge.
    await expect(today).toContainText('Typical at');
    await expect(today).toContainText('in 24h');
    await expect(today.getByText(/Tier 1/i)).toBeVisible();
  });

  test('never blank-shames an empty day', async ({ page }) => {
    await page.goto(plan);
    const today = page.getByRole('region', { name: 'Today' });
    // Honest zero, plus a reassuring (not guilt-tripping) empty state.
    await expect(today).toContainText('Nothing to keep up with');
    // The sparkline still renders, with a 7-day screen-reader text alternative.
    await expect(today.getByText(/Sleep over the last 7 days/)).toHaveCount(1);
  });

  test('a logged past nap flows into today\'s totals and nap count', async ({ page }) => {
    await page.goto(plan);
    // Log a completed one-hour block via the sleep log below, pinned to a nap so
    // it lands wholly in today. The block is moved to a fixed midday hour first:
    // "Add past sleep" defaults to the hour ending NOW, which straddles local
    // midnight when the suite runs between 00:00 and 01:00, and dailyTotals then
    // correctly splits it across two days.
    await page.getByRole('button', { name: 'Add past sleep' }).click();
    await setEntryToMidday(page);
    await page.getByRole('button', { name: 'Nap', exact: true }).click();

    const today = page.getByRole('region', { name: 'Today' });
    // Total sleep tile picks it up (re-read on the 1s tick; expect auto-retries).
    await expect(today).toContainText('1 h');
    // Nap count reads 1.
    await expect(today.getByText('Naps', { exact: true }).locator('..')).toContainText('1');
  });

  test('an in-progress sleep is labeled "so far"', async ({ page }) => {
    await page.goto(plan);
    const today = page.getByRole('region', { name: 'Today' });
    await expect(today).not.toContainText('so far');

    await page.getByRole('button', { name: 'They went down' }).click();
    await expect(today.getByText('so far')).toBeVisible();
  });

  // The observed average is a mean over the days that HAVE logged sleep, not a
  // 7-day average — blank days are skipped and a nap-only day counts whole. It
  // has to name its sample and say "logged", or a parent who tracks naps but
  // not nights is handed a number hours short of the real day and told to
  // schedule by it.
  test('the observed average names its sample and does not claim a full week', async ({ page }) => {
    await page.addInitScript(() => {
      const MIN = 60000;
      const now = new Date();
      let id = 0;
      const dayAt = (offset: number, hour: number) =>
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, 0, 0, 0).getTime();
      // Three past days, naps only (2 × 90 min = 3 h) — nights untracked, the
      // common case. Today stays empty, so it is excluded either way.
      const entries: any[] = [];
      for (let day = -3; day <= -1; day++) {
        for (const hour of [9, 13]) {
          entries.push({
            id: 'e' + id++, start: dayAt(day, hour), end: dayAt(day, hour) + 90 * MIN,
            pausedMs: 0, pauseStart: null, kind: 'nap', kindOverridden: true,
          });
        }
      }
      localStorage.setItem('ww.sleepLog.v1', JSON.stringify(entries));
    });

    await page.goto(plan);
    const today = page.getByRole('region', { name: 'Today' });
    const observed = today.getByText(/days you logged this week/);
    await expect(observed).toBeVisible();
    await expect(observed).toContainText('Across the 3 days');
    await expect(observed).toContainText('3 h/day');
    await expect(today).not.toContainText('7-day average');
  });

  test('tap-through reveals the 7-day breakdown', async ({ page }) => {
    await page.goto(plan);
    const today = page.getByRole('region', { name: 'Today' });
    await today.getByRole('button', { name: 'View breakdown' }).click();
    await expect(today.getByRole('cell', { name: 'Today' })).toBeVisible();
    await expect(today).toContainText('split at local midnight');
  });
});
