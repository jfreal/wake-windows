// @test:no-account-privacy-first
import { test, expect } from '@playwright/test';

test.describe('No-Account, Privacy-First [@feature:no-account-privacy-first]', () => {
  test('full plan renders from a bare URL with no account UI anywhere', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.getByRole('heading', { name: 'Nap Schedule' })).toBeVisible();
    // No auth controls anywhere — the privacy copy *mentions* "no sign-up,
    // no password", so assert on inputs/buttons/links, not raw page text.
    await expect(page.locator('input[type="password"], input[type="email"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /sign.?up|log.?in/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /sign.?up|log.?in/i })).toHaveCount(0);
  });

  test('"What we don\'t collect" panel states the four promises in plain English', async ({ page }) => {
    await page.goto('/');
    await page.getByText("What we don't collect").click();
    await expect(page.getByText('No account', { exact: true })).toBeVisible();
    await expect(page.getByText('No data sold — because none is collected')).toBeVisible();
    await expect(page.getByText('Local-first', { exact: true })).toBeVisible();
    await expect(page.getByText('No AI training', { exact: true })).toBeVisible();
    // The honest caveat about birthdays living in shared links.
    await expect(page.getByText(/anyone you send the link to/i)).toBeVisible();
  });
});
