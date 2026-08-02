// @test:cues-vs-clock-mode
import { test, expect } from '@playwright/test';

/**
 * A birthday whose corrected age is EXACTLY `months` under the app's arithmetic,
 * whenever the suite runs.
 *
 * ScheduleSetting.monthsSinceBirth counts calendar months —
 * `(y2-y1)*12 + m2-m1` — not elapsed days. Subtracting `months*30` days
 * therefore lands in a different band depending on today's day-of-month: a
 * "~5.5 mo" birthday 167 days ago reads as 5 months on some dates and 6 on
 * others, so the 5–6 transition-band test failed roughly half the year.
 * Stepping whole calendar months is the only thing that matches the app.
 *
 * `setDate(15)` first: stepping back a month from the 29th–31st can roll
 * forward into the wrong month. Formatted from LOCAL parts, because the app
 * parses `bd` as a local date (`new Date(+y, +m-1, +d)`) — `toISOString()`
 * would shift the day for anyone west of UTC.
 */
function birthdayMonthsAgo(months: number): string {
  const d = new Date();
  d.setDate(15);
  d.setMonth(d.getMonth() - months);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

test.describe('Cues-vs-Clock Mode by Age [@feature:cues-vs-clock-mode]', () => {
  test('young baby gets cues-first framing with a cited rationale', async ({ page }) => {
    await page.goto(`/?bd=${birthdayMonthsAgo(2)}&s=7-1.5/1.5/1.5/1.5-7`); // exactly 2 mo -> cues
    await expect(page.getByText('Watch the baby, not the clock')).toBeVisible();
    await expect(page.getByText(/circadian clock is still maturing/)).toBeVisible();
    // rationale is cited, per the brand's badge-every-claim rule
    await page.getByRole('button', { name: /Sources \(\d+\)/ }).first().click();
    // .first(): the same source also appears in the full Sources & Evidence library
    await expect(page.getByRole('link', { name: 'The Development of Circadian Rhythms: From Animals to Humans' }).first()).toBeVisible();
  });

  test('5-6 months hands off softly — both framings, cues weighted', async ({ page }) => {
    await page.goto(`/?bd=${birthdayMonthsAgo(5)}&s=7-2/2/2/2-7`); // exactly 5 mo -> the 5-6 transition band
    await expect(page.getByText('Keep following cues — the clock is starting to matter')).toBeVisible();
  });

  test('older baby gets clock-first framing with cues as a secondary check', async ({ page }) => {
    await page.goto(`/?bd=${birthdayMonthsAgo(10)}&s=7-3/3/3-7`); // exactly 10 mo -> clock
    await expect(page.getByText('A by-the-clock schedule works now')).toBeVisible();
    await expect(page.getByText(/secondary check/)).toBeVisible();
  });

  test('preterm baby is classified by corrected age, not chronological', async ({ page }) => {
    // ~7 months chronological but born at 28 weeks (~3 months early) → ~4 months
    // corrected → still cues mode.
    await page.goto(`/?bd=${birthdayMonthsAgo(7)}&s=7-2/2/2/2-7`);
    await page.getByLabel('Weeks in Womb').first().fill('28');
    await expect(page.getByText('Watch the baby, not the clock')).toBeVisible();
  });
});
