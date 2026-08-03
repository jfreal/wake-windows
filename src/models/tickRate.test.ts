import { describe, it, expect } from 'vitest';
import { tickRateFor, RUNNING_TICK_MS, IDLE_TICK_MS, STOPPED } from './tickRate';

// @test:sleep-nap-logging
describe('tickRateFor', () => {
    it('runs at one second while a timer is going', () => {
        expect(tickRateFor(true, 1)).toBe(RUNNING_TICK_MS);
        expect(tickRateFor(true, 3)).toBe(RUNNING_TICK_MS);
    });

    it('drops to a minute when nothing is being timed', () => {
        // Not stopped: "Today" totals are bucketed by local midnight, so a page
        // left open overnight still has to notice the day change on its own.
        expect(tickRateFor(true, 0)).toBe(IDLE_TICK_MS);
        expect(IDLE_TICK_MS).toBeGreaterThan(RUNNING_TICK_MS);
    });

    it('stops entirely while the page is hidden, running or not', () => {
        // The regression this guards: a 1s interval that kept running (and, in
        // the trends panel, re-parsed the whole log out of localStorage) whether
        // or not anything was timing and whether or not anyone was looking.
        expect(tickRateFor(false, 0)).toBe(STOPPED);
        expect(tickRateFor(false, 2)).toBe(STOPPED);
    });

    it('never returns a rate faster than one second', () => {
        for (const visible of [true, false]) {
            for (const running of [0, 1, 5, 50]) {
                const rate = tickRateFor(visible, running);
                expect(rate === STOPPED || rate >= RUNNING_TICK_MS).toBe(true);
            }
        }
    });
});
