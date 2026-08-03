import { expect, type Page } from '@playwright/test';

// Shared e2e helpers for the time-sensitive bits.
//
// Not a spec file: Playwright's default testMatch only collects `*.spec.ts`,
// so this is imported, never run. It exists because these two helpers encode
// assumptions about the app's date arithmetic that are easy to get subtly
// wrong, and each copy of a wrong assumption is a test that fails on some
// fraction of days. Both bugs below were real.

/** Local YYYY-MM-DD. Not `toISOString().slice(0,10)`, which is UTC and lands on
 * the wrong day for anyone west of Greenwich for part of each day. */
export async function localToday(page: Page): Promise<string> {
    return page.evaluate(() => {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    });
}

/**
 * Move the newest sleep-log entry to a fixed 13:00–14:00 block today.
 *
 * "Add past sleep" defaults to the one hour ending NOW, which is only wholly
 * inside today if the suite runs after 01:00 local. Run it at 00:12 — as CI
 * did — and the block straddles local midnight, so `dailyTotals` correctly
 * splits it (48 min yesterday, 12 min today) and any assertion of "1 h" for
 * today fails. Midday is unambiguous, and it is also a nap-hour, so the
 * nap/night inference is stable too.
 */
export async function setEntryToMidday(page: Page): Promise<void> {
    const today = await localToday(page);
    await page.getByLabel('Start').first().fill(`${today}T13:00`);
    await page.getByLabel('End').first().fill(`${today}T14:00`);
    // Wait for the entry's own duration readout to settle so later assertions
    // aren't racing the edit. Scoped by the log's landmark rather than a CSS
    // class, so restyling the list can't quietly break every caller.
    const log = page.getByRole('region', { name: /Sleep & Nap Log/i });
    await expect(log.getByRole('listitem').first()).toContainText('1 h');
}
