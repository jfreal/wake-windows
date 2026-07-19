import { describe, it, expect } from 'vitest';
import { buildIcs, type IcsPlan } from './ics';

// A representative plan: two nap windows + bedtime, ±15 min windows.
function samplePlan(overrides: Partial<IcsPlan> = {}): IcsPlan {
    return {
        date: { year: 2026, month: 7, day: 19 },
        timeZone: 'America/Chicago',
        napWindows: [
            { earliest: 9 * 60 + 40, latest: 10 * 60 + 10 }, // 9:40–10:10 AM
            { earliest: 13 * 60 + 15, latest: 13 * 60 + 45 }, // 1:15–1:45 PM
        ],
        bedtimeWindow: { earliest: 18 * 60 + 45, latest: 19 * 60 + 15 }, // 6:45–7:15 PM
        ...overrides,
    };
}

function lines(ics: string): string[] {
    return ics.split('\r\n');
}

describe('buildIcs — VCALENDAR envelope', () => {
    it('wraps events in a valid VERSION 2.0 VCALENDAR', () => {
        const ics = buildIcs(samplePlan());
        const ls = lines(ics);
        expect(ls[0]).toBe('BEGIN:VCALENDAR');
        expect(ls).toContain('VERSION:2.0');
        expect(ls).toContain('PRODID:-//Wake Windows//Calendar Export//EN');
        expect(ls).toContain('CALSCALE:GREGORIAN');
        // Last non-empty line closes the calendar.
        expect(ls.filter((l) => l.length).at(-1)).toBe('END:VCALENDAR');
    });

    it('uses CRLF line endings and a trailing CRLF', () => {
        const ics = buildIcs(samplePlan());
        expect(ics.endsWith('\r\n')).toBe(true);
        // No bare LF anywhere (every LF is preceded by CR).
        expect(/[^\r]\n/.test(ics)).toBe(false);
    });
});

describe('buildIcs — VEVENTs', () => {
    it('emits one VEVENT per nap window plus bedtime', () => {
        const ics = buildIcs(samplePlan());
        const begins = lines(ics).filter((l) => l === 'BEGIN:VEVENT').length;
        const ends = lines(ics).filter((l) => l === 'END:VEVENT').length;
        expect(begins).toBe(3); // 2 naps + bedtime
        expect(ends).toBe(3);
    });

    it('titles carry the guidance range, not a single time', () => {
        const ics = buildIcs(samplePlan());
        expect(ics).toContain('SUMMARY:Nap window 9:40–10:10 AM');
        expect(ics).toContain('SUMMARY:Nap window 1:15–1:45 PM');
        expect(ics).toContain('SUMMARY:Bedtime 6:45–7:15 PM');
    });

    it('describes events as guidance ranges, not fixed appointments', () => {
        const ics = buildIcs(samplePlan());
        expect(ics).toContain('DESCRIPTION:Tier-3 guidance range\\, not a fixed appointment');
    });

    it('scales VEVENT count with the number of naps', () => {
        const oneNap = buildIcs(samplePlan({ napWindows: [{ earliest: 600, latest: 630 }] }));
        expect(lines(oneNap).filter((l) => l === 'BEGIN:VEVENT').length).toBe(2); // 1 nap + bedtime
    });
});

describe('buildIcs — time zone handling', () => {
    it('anchors each event to the named TZID so DST/travel does not shift it', () => {
        const ics = buildIcs(samplePlan());
        expect(ics).toContain('DTSTART;TZID=America/Chicago:20260719T094000');
        expect(ics).toContain('DTEND;TZID=America/Chicago:20260719T101000');
        // Bedtime window.
        expect(ics).toContain('DTSTART;TZID=America/Chicago:20260719T184500');
        expect(ics).toContain('DTEND;TZID=America/Chicago:20260719T191500');
    });

    it('honours a different time zone', () => {
        const ics = buildIcs(samplePlan({ timeZone: 'Europe/London' }));
        expect(ics).toContain('DTSTART;TZID=Europe/London:20260719T094000');
        expect(ics).not.toContain('America/Chicago');
    });

    it('writes a UTC DTSTAMP', () => {
        const ics = buildIcs(samplePlan());
        expect(ics).toContain('DTSTAMP:20260719T000000Z');
    });
});

describe('buildIcs — deterministic, stable UIDs', () => {
    it('produces identical UIDs across two calls for the same plan+date', () => {
        const first = buildIcs(samplePlan());
        const second = buildIcs(samplePlan());
        const uids = (ics: string) => lines(ics).filter((l) => l.startsWith('UID:'));
        expect(uids(first)).toEqual(uids(second));
        expect(uids(first)).toEqual([
            'UID:nap-1-20260719@wakewindows.app',
            'UID:nap-2-20260719@wakewindows.app',
            'UID:bedtime-20260719@wakewindows.app',
        ]);
    });

    it('keeps UIDs stable when the times change, so re-export updates rather than duplicates', () => {
        const before = buildIcs(samplePlan());
        // Same date + slots, but the parent edited the wake windows → shifted times.
        const after = buildIcs(
            samplePlan({
                napWindows: [
                    { earliest: 10 * 60, latest: 10 * 60 + 30 },
                    { earliest: 14 * 60, latest: 14 * 60 + 30 },
                ],
            }),
        );
        const uids = (ics: string) => lines(ics).filter((l) => l.startsWith('UID:'));
        expect(uids(before)).toEqual(uids(after)); // stable UID ⇒ calendar updates the event
        expect(after).toContain('DTSTART;TZID=America/Chicago:20260719T100000'); // but the time moved
        expect(after).not.toContain('20260719T094000');
    });

    it('changes UIDs across dates so different days do not collide', () => {
        const day1 = buildIcs(samplePlan());
        const day2 = buildIcs(samplePlan({ date: { year: 2026, month: 7, day: 20 } }));
        expect(day1).toContain('UID:nap-1-20260719@wakewindows.app');
        expect(day2).toContain('UID:nap-1-20260720@wakewindows.app');
    });
});

describe('buildIcs — robustness', () => {
    it('long DESCRIPTION lines are folded to <=75 octets', () => {
        const ics = buildIcs(samplePlan());
        for (const line of lines(ics)) {
            // Continuation lines begin with a space; every physical line must fit.
            expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
        }
    });

    it('never emits a zero-length event if a window is collapsed', () => {
        const ics = buildIcs(
            samplePlan({ napWindows: [{ earliest: 600, latest: 600 }], bedtimeWindow: { earliest: 1140, latest: 1140 } }),
        );
        expect(ics).toContain('DTSTART;TZID=America/Chicago:20260719T100000');
        expect(ics).toContain('DTEND;TZID=America/Chicago:20260719T103000'); // start + 30
    });
});
