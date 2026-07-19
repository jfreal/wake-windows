// @test:ephemerality-data-deletion
import { test, expect } from '@playwright/test';

test.describe('Ephemerality & One-Click Data Deletion [@feature:ephemerality-data-deletion]', () => {
  test('one click clears URL plan + storage and confirms nothing remains', async ({ page }) => {
    await page.goto('/?bd=2026-01-01&s=8-3/3-8');
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

  test('temporary-by-design copy is visible before deleting', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/temporary by design/i)).toBeVisible();
    await expect(page.getByText(/no account to close and no subscription to cancel/i)).toBeVisible();
  });
});
