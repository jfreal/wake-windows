// @test:caregiver-handoff-notes
import { test, expect } from '@playwright/test';

// Feature: Caregiver Handoff Notes & Summary (Sharing & Collaboration).
// Flow under test: outgoing caregiver leaves a note -> copies the read-only
// handoff link -> incoming caregiver opens it and sees the note + a rule-based
// "since you last had the baby" recap next to the plan.
//
// Birthday pinned far in the past so the baby is always in clock-guidance mode
// (>6 mo corrected → ±15 min windows), independent of the run date.
const PLAN = '/?bd=2024-06-01&s=7-2/2/2/2-7';

test.describe('Caregiver Handoff Notes & Summary [@feature:caregiver-handoff-notes]', () => {
  test('note + since-last summary ride a read-only handoff link', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Seed an in-progress nap on the outgoing device (started 40 min ago) so the
    // recap exercises the "asleep so far" path, not a blank.
    await page.addInitScript(() => {
      const start = Date.now() - 40 * 60 * 1000;
      const entry = {
        id: 'e2e-nap', start, end: null, pausedMs: 0, pauseStart: null,
        kind: 'nap', kindOverridden: false,
      };
      localStorage.setItem('ww.sleepLog.v1', JSON.stringify([entry]));
    });

    await page.goto(PLAN);

    // Leave a handoff note.
    const note = 'Fed at 2pm, a bit cranky today.';
    await page.getByLabel('Handoff note').fill(note);

    // Live preview reflects the in-progress nap before we even share.
    await expect(page.getByText(/Asleep since .* so far/)).toBeVisible();

    // Copy the read-only handoff link.
    await page.getByRole('button', { name: 'Copy handoff link' }).click();
    await expect(page.getByText('Copied!')).toBeVisible();
    const link = await page.evaluate(() => navigator.clipboard.readText());
    expect(link).toContain('view=sitter');
    expect(decodeURIComponent(link)).toContain(note);

    // Open the link as the incoming caregiver.
    await page.goto(link);

    // Read-only recap is visible: heading, the note, the in-progress nap, and
    // the next window — with no edit controls in the DOM.
    await expect(page.getByText('Since you last had the baby')).toBeVisible();
    await expect(page.getByText(note)).toBeVisible();
    await expect(page.getByText(/Asleep since .* so far/)).toBeVisible();
    // The recap's next-window line lives in the handoff section; scope to it so
    // the SitterView "Next nap" card above doesn't collide.
    // The line reads "Next nap ~3:25–3:55 PM" during the day, or "Next nap No
    // more naps today" once the windows have passed — assert the label only, so
    // the test doesn't depend on the CI runner's wall-clock (which is UTC).
    const recap = page.locator('section', { has: page.getByText('Since you last had the baby') });
    await expect(recap.getByText(/Next nap/)).toBeVisible();
  });
});
