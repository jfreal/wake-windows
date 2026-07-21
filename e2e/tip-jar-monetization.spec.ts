// @test:tip-jar-monetization
import { test, expect } from '@playwright/test';

test.describe('Tip-Jar Monetization (No Subscription, No Auto-Renew) [@feature:tip-jar-monetization]', () => {
  test('single unobtrusive tip-jar link with the "no subscription, ever" statement', async ({ page }) => {
    await page.goto('/');
    const tipLink = page.getByRole('link', { name: /tip jar/i });
    await expect(tipLink).toHaveCount(1); // one link, never nag-ware
    await expect(tipLink).toHaveAttribute('href', /.+/);
    await expect(page.getByText('No subscription, ever.')).toBeVisible();
    await expect(page.getByText(/no auto-renew/i)).toBeVisible();
    await expect(page.getByText(/one-time/i)).toBeVisible();
  });

  test('nothing is paywalled — plan, schedule, and evidence render without payment', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    // exact: the descriptive H1 ("Infant Nap Schedule & Wake Windows Planner")
    // also contains "Nap Schedule"; scope to the section heading.
    await expect(page.getByRole('heading', { name: 'Nap Schedule', exact: true })).toBeVisible();
    await expect(page.getByText('Safe sleep', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/upgrade|premium|unlock|pro plan/i)).toHaveCount(0);
  });
});
