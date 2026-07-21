// @test:reminders-nudges
import { test, expect } from '@playwright/test';

// Feature: Reminders & Pre-Nap Nudges (F01). One opt-in "pre-nap wind-down"
// nudge, off by default, fired a selectable lead time before the END of the
// current wake-window range. Copy is range-based ("next nap window: 9:40–10:10"),
// never a single deadline, never "you missed it". Web Notifications are scheduled
// in the service worker with a graceful in-page countdown fallback — which is the
// path headless Chromium exercises, since it grants no notification permission.
//
// The clock is pinned to mid-morning so a nap window is always still ahead,
// making the countdown deterministic regardless of when the suite runs.
const plan = '/?bd=2026-01-15&s=7-2/2.25/2.5-19';
const pinnedMorning = new Date('2026-07-21T08:30:00');

test.describe('Reminders & Pre-Nap Nudges [@feature:reminders-nudges]', () => {
  test('opt in reveals range copy, lead-time control, and the in-page countdown fallback', async ({ page }) => {
    await page.clock.install({ time: pinnedMorning });
    await page.goto(plan);

    const section = page.getByRole('region', { name: 'Pre-nap reminder' });
    await expect(section).toBeVisible();

    // Off by default — opt-in per session (a button toggle, keyboard-sized like
    // the app's other opt-ins).
    const toggle = section.getByRole('button', { name: /before the next nap window/i });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    // Lead-time control: default 30, selectable 15 / 30 / 45.
    const lead = section.getByLabel('Remind me');
    await expect(lead).toHaveValue('30');
    await expect(lead.locator('option')).toHaveText(['15 min', '30 min', '45 min']);
    await lead.selectOption('15');
    await expect(lead).toHaveValue('15');

    // Range-based copy — a window, never a single deadline.
    const range = section.getByTestId('nudge-range');
    await expect(range).toContainText('Next nap window:');
    await expect(range).toContainText('–'); // en-dash range separator

    // Headless grants no notification permission, so the graceful in-page
    // countdown fallback is what renders.
    await expect(section.getByTestId('nudge-countdown')).toBeVisible();
    await expect(section.getByTestId('nudge-countdown')).toContainText(/\bmin\b|\bh\b/);

    // Calm, non-scolding: never "you missed it", and no red accent.
    await expect(section).not.toContainText(/missed/i);
    expect(await section.locator('.text-red-500, .text-red-600, .bg-red-500, .bg-red-600').count()).toBe(0);
  });

  test('is hidden in the read-only sitter view', async ({ page }) => {
    await page.clock.install({ time: pinnedMorning });
    await page.goto(`${plan}&view=sitter`);
    await expect(page.getByRole('region', { name: 'Pre-nap reminder' })).toHaveCount(0);
  });
});
