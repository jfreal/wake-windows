// @test:sleep-nap-logging
import { test, expect } from '@playwright/test';
import { openEntryEditor, setEntryToMidday } from './helpers';

// Feature: Sleep & Nap Logging (Tracking & Logging) — status: Built.
// Local-only timer + editable/backdatable entries; hidden from the read-only
// sitter view. Each test runs in a fresh browser context (empty localStorage).
test.describe('Sleep & Nap Logging [@feature:sleep-nap-logging]', () => {
  test('is hidden in read-only sitter mode, shown otherwise', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7&view=sitter');
    await expect(page.getByRole('heading', { name: 'Sleep & Nap Log' })).toHaveCount(0);

    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7&tab=log');
    await expect(page.getByRole('heading', { name: 'Sleep & Nap Log' })).toBeVisible();
  });

  test('starts and stops a sleep timer', async ({ page }) => {
    await page.goto('/?tab=log');
    // The one big control on the Log screen. Its accessible name deliberately
    // avoids "start"/"stop" so it can't collide with the per-entry controls.
    await page.getByRole('button', { name: 'They went down' }).click();

    // A running entry appears with a Stop control.
    await expect(page.getByText('running')).toBeVisible();
    const stop = page.getByRole('button', { name: 'Stop' });
    await expect(stop).toBeVisible();

    await stop.click();

    // Once stopped there is no running badge, and the End time becomes editable
    // (the time fields live behind "Edit" — the log lists what happened, and
    // changing it is a control rather than a form under every row).
    await expect(page.getByText('running')).toHaveCount(0);
    await openEntryEditor(page);
    await expect(page.getByLabel('End')).toBeEnabled();
  });

  test('a backdated past sleep updates today\'s totals', async ({ page }) => {
    await page.goto('/?tab=log');
    // "Add past sleep" drops in a completed one-hour block ending NOW, which is
    // only wholly inside today if the suite runs after 01:00 local. Between
    // midnight and 1am it straddles the boundary and dailyTotals correctly
    // splits it (e.g. 48 min yesterday + 12 min today), failing an assertion of
    // "1 h". Pin the block to a fixed midday hour so the test measures the
    // totals, not the clock the runner happened to start at.
    await page.getByRole('button', { name: 'Add past sleep' }).click();
    await setEntryToMidday(page);
    // Pin it to a nap; the inferred label depends on the wall-clock hour.
    await page.getByRole('button', { name: 'Nap', exact: true }).click();
    await expect(page.getByText('Naps today').locator('..')).toContainText('1 h');
  });

  test('an entry can be backdated across midnight without clamping to today', async ({ page }) => {
    await page.goto('/?tab=log');
    await page.getByRole('button', { name: 'Add past sleep' }).click();
    await openEntryEditor(page);

    // A sleep that ran from 11pm one day to 6am the next — dates on two days.
    await page.getByLabel('Start').fill('2026-07-18T23:00');
    await page.getByLabel('End').fill('2026-07-19T06:00');

    // The start date is preserved exactly (no snap to "today"), and 11pm infers
    // as night sleep.
    await expect(page.getByLabel('Start')).toHaveValue('2026-07-18T23:00');
    await expect(page.getByLabel('End')).toHaveValue('2026-07-19T06:00');
    await expect(page.getByRole('button', { name: 'Night', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });
});
