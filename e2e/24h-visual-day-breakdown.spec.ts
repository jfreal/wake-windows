// @test:24h-visual-day-breakdown
import { test, expect } from '@playwright/test';

// The day view is now a POSITIONAL strip — midnight to midnight, with a marker
// for right now — rather than three proportional blocks. That change is why the
// figures moved out of the bands entirely: a nap at 9am and a nap at 4pm are in
// different places on the strip, so bands can be a few pixels wide and nothing
// legible would fit inside one. The rule that made the old bar safe still
// applies and is now unconditional: every number the picture encodes exists as
// text in the Sleep Stats table directly below it, and in the aria-label.
test.describe('24-hour visual day breakdown [@feature:24h-visual-day-breakdown]', () => {
  test('renders the awake / night-sleep / nap day strip and stats', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.getByRole('img', { name: /awake.*night sleep.*naps/ })).toBeVisible();
    // Scope to the heading: "Sleep Stats" is also named in the accessibility
    // statement's prose, so a bare substring match is ambiguous.
    await expect(page.getByRole('heading', { name: 'Sleep Stats', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Total Wake' })).toBeVisible();
  });

  test('the strip covers the whole day and marks the current time inside it', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    const strip = page.getByRole('img', { name: /awake.*night sleep.*naps/ });
    await expect(strip).toBeVisible();

    // The now-marker sits within the strip, never off either end.
    const geometry = await strip.evaluate((el) => {
      const marker = el.querySelector('div[style*="left"]') as HTMLElement;
      const s = el.getBoundingClientRect();
      const m = marker.getBoundingClientRect();
      return { fits: m.left >= s.left - 1 && m.right <= s.right + 1, width: s.width };
    });
    expect(geometry.width).toBeGreaterThan(0);
    expect(geometry.fits).toBe(true);
  });

  test('every figure the strip encodes also exists as text, at any width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    // Long wake windows squeeze the nap segments down to slivers.
    await page.goto('/?bd=2026-03-01&s=7-2.75/2.75/2.75/2.75-7');

    const strip = page.getByRole('img', { name: /awake.*night sleep.*naps/ });
    // toBeVisible first: toHaveAttribute passes on an attached-but-hidden
    // element, so on its own it would not prove the strip rendered at all.
    await expect(strip).toBeVisible();
    await expect(strip).toHaveAttribute(
      'aria-label', /11 hours awake.*12 hours night sleep.*1 hours of naps/);

    // Assert the VALUES, not just the row labels: the labels being present says
    // nothing about whether "1h" survived anywhere on the page.
    //
    // Scoped to the Sleep Stats block. The guidance comparison tables under
    // Learn carry rows labelled "Night sleep"/"Day sleep" with their own hour
    // figures, so an unscoped row lookup is not specific to this table.
    const stats = page.getByRole('heading', { name: 'Sleep Stats', exact: true }).locator('..');
    const statsRow = (label: string) => stats.getByRole('row').filter({ hasText: label });

    await expect(statsRow('Naps (')).toContainText('1h');
    await expect(statsRow('Night Sleep')).toContainText('12h');
    await expect(statsRow('Total Wake')).toContainText('11h');
    await expect(statsRow('Total Sleep')).toContainText('13h');
  });
});
