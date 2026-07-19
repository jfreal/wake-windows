// @test:anti-anxiety-mechanics
import { test, expect } from '@playwright/test';

test.describe('Anti-Anxiety Mechanics (Ranges, No Streaks) [@feature:anti-anxiety-mechanics]', () => {
  test('nap schedule shows ranges, never a single to-the-minute target', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7'); // 3 naps
    const napRows = page.getByText(/aim for roughly/i);
    await expect(napRows).toHaveCount(3);
    // Range format like "8:45–9:15 AM", endpoints on 5-minute marks.
    await expect(napRows.first()).toContainText(/\d{1,2}:[0-5][05]–\d{1,2}:[0-5][05]/);
  });

  test('reassurance copy informs and cites normal variation, never scolds', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.getByText(/ranges, not deadlines/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Iglowstein 2003/i })).toBeVisible();
    await expect(page.getByText(/you missed|off track|behind schedule/i)).toHaveCount(0);
  });

  test('no streaks, scores, or grades anywhere', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    // Word-bounded gamification terms only — "GRADE-assessed review" in a
    // citation summary is legitimate scientific text, not a game mechanic.
    await expect(page.getByText(/\bstreaks?\b|sleep score|badge earned|\bgraded\b/i)).toHaveCount(0);
  });
});
