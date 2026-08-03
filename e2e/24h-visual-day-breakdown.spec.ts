// @test:24h-visual-day-breakdown
import { test, expect } from '@playwright/test';

test.describe('24-hour visual day breakdown [@feature:24h-visual-day-breakdown]', () => {
  test('renders the awake / night-sleep / nap day bar and stats', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.getByRole('img', { name: /awake.*night sleep.*naps/ })).toBeVisible();
    // Scope to the heading: "Sleep Stats" is also named in the accessibility
    // statement's prose (it is where the bar's figures live when a band is too
    // narrow to draw them), so a bare substring match is ambiguous.
    await expect(page.getByRole('heading', { name: 'Sleep Stats', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Total Wake' })).toBeVisible();
  });

  // The bar is a data visualization, so a band must never be the only place a
  // number exists: a narrow band drops its icon, then its figure, and the
  // Sleep Stats table plus the aria-label carry all three regardless.
  test('every figure in the bar also exists as text, however narrow the bands are', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    // Long wake windows squeeze the nap band down to a sliver.
    await page.goto('/?bd=2026-03-01&s=7-2.75/2.75/2.75/2.75-7');

    const bar = page.getByRole('img', { name: /awake.*night sleep.*naps/ });
    // toBeVisible first: toHaveAttribute passes on an attached-but-hidden
    // element, so on its own it would not prove the bar rendered at all.
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('aria-label', /11 hours awake.*12 hours night sleep.*1 hours of naps/);

    // Nothing in the bar is clipped: any figure still shown fits its band.
    const clipped = await bar.evaluate((el) => [...el.children].filter((d) => {
      const sp = d.querySelector('span');
      if (!sp || getComputedStyle(sp).display === 'none') return false;
      return sp.getBoundingClientRect().right > d.getBoundingClientRect().right + 0.5;
    }).length);
    expect(clipped).toBe(0);

    // At this width the nap band is a sliver and drops its figure entirely —
    // which is only acceptable because the number is still readable as text.
    // Assert the VALUES, not just the row labels: the labels being present says
    // nothing about whether "1h" survived anywhere on the page.
    //
    // Scoped to the Sleep Stats block. The guidance comparison tables further
    // down carry rows labelled "Night sleep"/"Day sleep" with their own hour
    // figures, so an unscoped row lookup matches four tables, not one.
    const stats = page.getByRole('heading', { name: 'Sleep Stats', exact: true }).locator('..');
    const statsRow = (label: string) => stats.getByRole('row').filter({ hasText: label });

    await expect(statsRow('Naps (')).toContainText('1h');
    await expect(statsRow('Night Sleep')).toContainText('12h');
    await expect(statsRow('Total Wake')).toContainText('11h');
  });
});
