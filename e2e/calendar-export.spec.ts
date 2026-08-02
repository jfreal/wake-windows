// @test:calendar-export
import { test, expect } from '@playwright/test';

// Feature: Calendar Export (ICS) (Utility & Integrations).
// The "Add to calendar" button builds a standards-compliant .ics entirely
// client-side and hands it off as a download. We assert the download fires and
// that its contents are a well-formed VCALENDAR with range-titled VEVENTs.
test.describe('Calendar Export (ICS) [@feature:calendar-export]', () => {
  // Birthday pinned far in the past so the baby is always in clock-guidance mode
  // (>6 mo corrected) → stable ±15 min windows independent of the run date.
  const PLAN = '/?bd=2024-06-01&s=7-2/2/2/2-7';

  test('exports a well-formed .ics for today\'s plan', async ({ page }) => {
    await page.goto(PLAN);

    const button = page.getByRole('button', { name: 'Add to calendar (.ics)' });
    await expect(button).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      button.click(),
    ]);

    // Filename is dated and carries the .ics extension.
    expect(download.suggestedFilename()).toMatch(/^wake-windows-\d{4}-\d{2}-\d{2}\.ics$/);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const ics = Buffer.concat(chunks).toString('utf-8');

    // Valid VCALENDAR envelope.
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Wake Windows//Calendar Export//EN');
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);

    // One VEVENT per nap window plus bedtime (this plan has 4 wake windows ⇒ 3 naps).
    const events = ics.match(/BEGIN:VEVENT/g) ?? [];
    expect(events.length).toBe(4);

    // Range-titled guidance events, anchored to a named time zone, not appointments.
    expect(ics).toMatch(/SUMMARY:Nap window /);
    expect(ics).toMatch(/SUMMARY:Bedtime /);
    expect(ics).toMatch(/DTSTART;TZID=[^:]+:\d{8}T\d{6}/);
    expect(ics).toContain('Tier-3 guidance range');
  });

  // Regression: the panel used to rebuild its own ScheduleSetting from the URL
  // at setup and never re-read it, so it exported the plan as it stood at page
  // load. Change bedtime, export, and the file was byte-identical — silently
  // wrong times on a real calendar, with nothing on screen to say so. It now
  // reads the shared reactive plan (src/stores/plan.ts).
  test('exports the CURRENT plan after an edit, not the one the page loaded with', async ({ page }) => {
    await page.goto(PLAN);

    const button = page.getByRole('button', { name: 'Add to calendar (.ics)' });

    const readIcs = async () => {
      const [download] = await Promise.all([page.waitForEvent('download'), button.click()]);
      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(Buffer.from(chunk));
      return Buffer.concat(chunks).toString('utf-8');
    };

    const starts = (ics: string) => (ics.match(/DTSTART[^\r\n]*/g) ?? []);

    const before = starts(await readIcs());
    expect(before.length).toBe(4);

    // Move bedtime 7:00 PM -> 9:00 PM. Every nap and the bedtime event shift.
    await page.locator('#bed').selectOption('9');
    await expect(page).toHaveURL(/s=7-2\/2\/2\/2-9/);

    const after = starts(await readIcs());
    expect(after.length).toBe(4);
    expect(after).not.toEqual(before);
  });

  test('the export panel is absent from the read-only sitter view', async ({ page }) => {
    await page.goto(`${PLAN}&view=sitter`);
    await expect(page.getByRole('button', { name: 'Add to calendar (.ics)' })).toHaveCount(0);
  });
});
