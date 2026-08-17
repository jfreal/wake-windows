// @test:ephemerality-data-deletion
import { test, expect } from '@playwright/test';
import { openTab } from './helpers';

test.describe('Ephemerality & One-Click Data Deletion [@feature:ephemerality-data-deletion]', () => {
  test('one click clears URL plan + storage and confirms nothing remains', async ({ page }) => {
    await page.goto('/?bd=2026-01-01&s=8-3/3-8&tab=settings');
    await page.evaluate(() => {
      localStorage.setItem('test-leftover', 'x');
      sessionStorage.setItem('test-session-leftover', 'x');
    });

    await page.getByRole('button', { name: 'Delete all my data' }).click();

    // Page reloads with defaults; the user's plan is gone from the URL.
    await expect(page.getByRole('status')).toContainText('All gone');
    expect(page.url()).not.toContain('bd=2026-01-01');
    expect(page.url()).not.toContain('8-3/3-8');
    const storageLeft = await page.evaluate(
      () => localStorage.length + sessionStorage.length
    );
    expect(storageLeft).toBe(0);
  });

  // The sleep log is written back on a short debounce, so there is a window
  // where a save is queued but not yet flushed. Deleting inside that window
  // must not let the queued write land after the clear and resurrect exactly
  // the data we just promised was gone — DeleteData shuts the store's
  // persistence down before clearing, rather than racing it.
  test('deleting immediately after logging a sleep leaves nothing behind', async ({ page }) => {
    await page.goto('/?bd=2026-01-01&s=8-3/3-8&tab=log');

    await page.getByRole('button', { name: 'They went down' }).click();
    // The entry is real and on screen...
    await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();
    // ...and the write for it is still in flight. Switch screens (which does NOT
    // reload — the debounced write is still queued) and delete now, not later.
    await openTab(page, 'Settings');
    await page.getByRole('button', { name: 'Delete all my data' }).click();

    await expect(page.getByRole('status')).toContainText('All gone');

    // Give any stray debounced/flush-on-hidden write time to fire if it can.
    await page.waitForTimeout(1000);
    const leftover = await page.evaluate(() => ({
      count: localStorage.length,
      keys: Object.keys(localStorage),
    }));
    expect(leftover).toEqual({ count: 0, keys: [] });
  });

  test('temporary-by-design copy is visible before deleting', async ({ page }) => {
    await page.goto('/?tab=settings');
    await expect(page.getByText(/temporary by design/i)).toBeVisible();
    await expect(page.getByText(/no account to close and no subscription to cancel/i)).toBeVisible();
  });
});
