// @test:trends-daily-totals
import { test, expect } from '@playwright/test';

// Feature: Trends & Daily Totals at a Glance (Analytics & Insights) — status: Built.
// A glanceable "Today" block (total sleep + nap count) plus a 7-day sleep
// sparkline, computed purely from the on-device sleep log. Additive; hidden in
// the read-only sitter view. Each test runs in a fresh context (empty storage).
test.describe('Trends & Daily Totals at a Glance [@feature:trends-daily-totals]', () => {
  // ~4.5-month-old, so the Tier 1 total-sleep context band is available.
  const plan = '/?bd=2026-03-01&s=7-2/2/2/2-7';

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
    // The sparkline still renders (7-day text alternative present).
    await expect(today.getByRole('img', { name: /Sleep over the last 7 days/ })).toBeVisible();
  });

  test('a logged past nap flows into today\'s totals and nap count', async ({ page }) => {
    await page.goto(plan);
    // Log a completed one-hour block via the sleep log below, pinned to a nap so
    // it lands wholly in today.
    await page.getByRole('button', { name: 'Add past sleep' }).click();
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

    await page.getByRole('button', { name: 'Start sleep timer' }).click();
    await expect(today.getByText('so far')).toBeVisible();
  });

  test('tap-through reveals the 7-day breakdown', async ({ page }) => {
    await page.goto(plan);
    const today = page.getByRole('region', { name: 'Today' });
    await today.getByRole('button', { name: 'View breakdown' }).click();
    await expect(today.getByRole('cell', { name: 'Today' })).toBeVisible();
    await expect(today).toContainText('split at local midnight');
  });
});
