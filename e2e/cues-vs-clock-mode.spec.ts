// @test:cues-vs-clock-mode
import { test, expect } from '@playwright/test';

/** Birthday `days` ago as YYYY-MM-DD, so the app's corrected-age math lands in
 * a known guidance band regardless of when the suite runs. */
function birthdayDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

test.describe('Cues-vs-Clock Mode by Age [@feature:cues-vs-clock-mode]', () => {
  test('young baby gets cues-first framing with a cited rationale', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(60)}&s=7-1.5/1.5/1.5/1.5-7`); // ~2 mo
    await expect(page.getByText('Watch the baby, not the clock')).toBeVisible();
    await expect(page.getByText(/circadian clock is still maturing/)).toBeVisible();
    // rationale is cited, per the brand's badge-every-claim rule
    await page.getByRole('button', { name: /Sources \(\d+\)/ }).first().click();
    // .first(): the same source also appears in the full Sources & Evidence library
    await expect(page.getByRole('link', { name: 'The Development of Circadian Rhythms: From Animals to Humans' }).first()).toBeVisible();
  });

  test('5-6 months hands off softly — both framings, cues weighted', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(167)}&s=7-2/2/2/2-7`); // ~5.5 mo
    await expect(page.getByText('Keep following cues — the clock is starting to matter')).toBeVisible();
  });

  test('older baby gets clock-first framing with cues as a secondary check', async ({ page }) => {
    await page.goto(`/?bd=${birthdayDaysAgo(300)}&s=7-3/3/3-7`); // ~10 mo
    await expect(page.getByText('A by-the-clock schedule works now')).toBeVisible();
    await expect(page.getByText(/secondary check/)).toBeVisible();
  });

  test('preterm baby is classified by corrected age, not chronological', async ({ page }) => {
    // ~7 months chronological but born at 28 weeks (~3 months early) → ~4 months
    // corrected → still cues mode.
    await page.goto(`/?bd=${birthdayDaysAgo(210)}&s=7-2/2/2/2-7`);
    await page.getByLabel('Weeks in Womb').first().fill('28');
    await expect(page.getByText('Watch the baby, not the clock')).toBeVisible();
  });
});
