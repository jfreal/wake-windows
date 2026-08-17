// @test:read-only-babysitter-mode
import { test, expect } from '@playwright/test';

test.describe('Read-Only Babysitter / Grandparent Mode [@feature:read-only-babysitter-mode]', () => {
  test('renders the sitter view with next nap and bedtime as ranges and zero edit controls', async ({ page }) => {
    // Birthday pinned far in the past so the baby is always in clock-guidance
    // mode (>6 mo corrected) → ±15 min windows, independent of the run date.
    // A recent birthday would drift through cues/transition slop over time.
    await page.goto('/?bd=2024-06-01&s=7-2/2/2/2-7&view=sitter');

    await expect(page.getByText('Sitter view · read-only')).toBeVisible();
    await expect(page.getByText('Next nap')).toBeVisible();
    await expect(page.getByText('Next bedtime')).toBeVisible();
    // Ranges, not a countdown: clock-mode bedtime shows as ~6:45–7:15 PM for bed=7.
    await expect(page.getByText('~6:45–7:15 PM').first()).toBeVisible();

    // Truly read-only: no inputs, selects, buttons, or links anywhere.
    await expect(page.locator('input, select, textarea, button, a[href], [role="link"], [contenteditable]')).toHaveCount(0);
  });

  test('keeps the view=sitter param (no URL rewriting in sitter mode)', async ({ page }) => {
    await page.goto('/?bd=2024-06-01&s=7-2/2/2/2-7&view=sitter');
    await expect(page.getByText('Next nap')).toBeVisible();
    expect(decodeURIComponent(page.url())).toContain('view=sitter');
  });

  test('normal view offers a Copy sitter link action that produces the read-only URL', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/?bd=2024-06-01&s=7-2/2/2/2-7&tab=settings');
    await page.getByRole('button', { name: 'Copy sitter link' }).click();
    await expect(page.getByText('Copied!')).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(decodeURIComponent(copied)).toContain('bd=2024-06-01');
    expect(decodeURIComponent(copied)).toContain('s=7-2/2/2/2-7');
    expect(copied).toContain('view=sitter');
  });
});
