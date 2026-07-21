// @test:nap-transition-detector
import { test, expect } from '@playwright/test';

// Feature: Nap-Transition Detector & Guidance (4→3→2→1) — status: Built.
// Detects an age-appropriate nap transition from a CLUSTER of signals in the
// local sleep log (never one bad day) and offers a gentle, dismissible Tier-3
// plan (lengthen wake windows ~15 min at a time). Runs on-device; hidden in the
// read-only sitter view.

/** A birthday query param that makes the child ~`months` old today (40wk term). */
function birthdayFor(months: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - months, 15);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Seed a 3→2 signal CLUSTER into the local log: four recent days that each wake
 * before 6am (early) and take only two naps, one of them short (~30 min) — i.e.
 * fewer naps than the 3-nap age expects, plus a short nap. Runs before app
 * scripts so the log is present when the detector reads localStorage on mount.
 */
async function seedCluster(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const MIN = 60000;
    const now = new Date();
    let id = 0;
    const entries: any[] = [];
    const mk = (start: number, end: number | null, kind: string) =>
      ({ id: 'e' + id++, start, end, pausedMs: 0, pauseStart: null, kind, kindOverridden: true });
    const dayAt = (offset: number, hour: number, min = 0) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, min, 0, 0).getTime();
    for (let day = -4; day <= -1; day++) {
      // Overnight ending at a 5am (early) wake.
      entries.push(mk(dayAt(day - 1, 19), dayAt(day, 5), 'night'));
      // Two naps only (age expects three): one short catnap + one longer.
      entries.push(mk(dayAt(day, 9), dayAt(day, 9) + 30 * MIN, 'nap'));
      entries.push(mk(dayAt(day, 13), dayAt(day, 13) + 80 * MIN, 'nap'));
    }
    localStorage.setItem('ww.sleepLog.v1', JSON.stringify(entries));
  });
}

/** Seed a CALM log: four days of three full naps, on-time 7am wakes — no cluster. */
async function seedCalm(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const MIN = 60000;
    const now = new Date();
    let id = 0;
    const entries: any[] = [];
    const mk = (start: number, end: number | null, kind: string) =>
      ({ id: 'e' + id++, start, end, pausedMs: 0, pauseStart: null, kind, kindOverridden: true });
    const dayAt = (offset: number, hour: number) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, 0, 0, 0).getTime();
    for (let day = -4; day <= -1; day++) {
      entries.push(mk(dayAt(day - 1, 19), dayAt(day, 7), 'night'));
      entries.push(mk(dayAt(day, 9), dayAt(day, 9) + 90 * MIN, 'nap'));
      entries.push(mk(dayAt(day, 12), dayAt(day, 12) + 90 * MIN, 'nap'));
      entries.push(mk(dayAt(day, 15), dayAt(day, 15) + 60 * MIN, 'nap'));
    }
    localStorage.setItem('ww.sleepLog.v1', JSON.stringify(entries));
  });
}

const PLAN = `?bd=${birthdayFor(8)}&s=7-2/2/2-7`; // ~8 months → the 3→2 transition age

test.describe('Nap-Transition Detector & Guidance (4→3→2→1) [@feature:nap-transition-detector]', () => {
  test('a seeded signal cluster surfaces the gentle prompt with a Tier-3 badge and plan', async ({ page }) => {
    await seedCluster(page);
    await page.goto('/' + PLAN);

    const prompt = page.getByText('This looks like it could be a transition');
    await expect(prompt).toBeVisible();
    // Tier-3 badge sits in the same header row as the prompt.
    await expect(prompt.locator('xpath=ancestor::div[1]').getByText('Tier 3')).toBeVisible();
    // Names the specific transition.
    await expect(page.getByText('3 naps → 2 naps', { exact: true })).toBeVisible();
    // The gentle lengthening plan (~15 min at a time) is shown.
    await expect(page.getByText(/Lengthen each wake window about 15 minutes at a time/i)).toBeVisible();
    await expect(page.getByText(/never drop the nap abruptly/i)).toBeVisible();
    // The Tier-3 citation link is present.
    await expect(page.getByRole('link', { name: /Why we're saying this/ })).toBeVisible();
  });

  test('the prompt is dismissible and stays dismissed on reload', async ({ page }) => {
    await seedCluster(page);
    await page.goto('/' + PLAN);
    await expect(page.getByText('This looks like it could be a transition')).toBeVisible();

    await page.getByRole('button', { name: 'Not now' }).click();
    await expect(page.getByText('This looks like it could be a transition')).toHaveCount(0);

    // Reload — dismissal persists (localStorage), the quiet "watching" line shows instead.
    await page.reload();
    await expect(page.getByText('This looks like it could be a transition')).toHaveCount(0);
    await expect(page.getByText(/Watching for the/)).toBeVisible();
  });

  test('no cluster → no prompt (one rough day is not a transition)', async ({ page }) => {
    await seedCalm(page);
    await page.goto('/' + PLAN);

    await expect(page.getByRole('heading', { name: 'Nap transitions' })).toBeVisible(); // in-window age, quiet state
    await expect(page.getByText('This looks like it could be a transition')).toHaveCount(0);
    await expect(page.getByText(/Watching for the/)).toBeVisible();
  });

  test('self-report toggles alone can surface the prompt (log-free path)', async ({ page }) => {
    // No seeded log at all.
    await page.goto('/' + PLAN);
    await expect(page.getByText('This looks like it could be a transition')).toHaveCount(0);

    await page.getByRole('button', { name: /Tell us what you're seeing/ }).click();
    await page.getByLabel('Fighting or resisting naps').check();
    await page.getByLabel('Short or skipped naps').check();

    await expect(page.getByText('This looks like it could be a transition')).toBeVisible();
  });

  test('hidden entirely in the read-only sitter view', async ({ page }) => {
    await seedCluster(page);
    await page.goto('/' + PLAN + '&view=sitter');

    await expect(page.getByRole('heading', { name: 'Nap transitions' })).toHaveCount(0);
    await expect(page.getByText('This looks like it could be a transition')).toHaveCount(0);
  });
});
