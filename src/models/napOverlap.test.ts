import { describe, it, expect } from 'vitest';
import { intersectIntervals, totalOverlapMinutes } from './napOverlap';
import { ScheduleSetting } from './ScheduleSetting';

describe('intersectIntervals', () => {
    it('returns the naps themselves for identical schedules (twins)', () => {
        const naps = [
            { start: 540, end: 620 },
            { start: 740, end: 820 },
        ];
        expect(intersectIntervals(naps, naps)).toEqual(naps);
    });

    it('returns partial overlaps when naps only partly coincide', () => {
        const a = [{ start: 540, end: 630 }];  // 9:00–10:30
        const b = [{ start: 600, end: 690 }];  // 10:00–11:30
        expect(intersectIntervals(a, b)).toEqual([{ start: 600, end: 630 }]);
    });

    it('returns empty for disjoint schedules', () => {
        const a = [{ start: 540, end: 600 }];
        const b = [{ start: 700, end: 760 }];
        expect(intersectIntervals(a, b)).toEqual([]);
    });

    it('excludes zero-length touches (one nap ends as the other starts)', () => {
        const a = [{ start: 540, end: 600 }];
        const b = [{ start: 600, end: 660 }];
        expect(intersectIntervals(a, b)).toEqual([]);
    });

    it('handles asymmetric nap counts (4 naps vs 2)', () => {
        // Younger child: four short naps; older child: two long naps.
        const younger = [
            { start: 480, end: 540 },   // 8:00–9:00
            { start: 660, end: 720 },   // 11:00–12:00
            { start: 840, end: 900 },   // 2:00–3:00
            { start: 1020, end: 1080 }, // 5:00–6:00
        ];
        const older = [
            { start: 510, end: 690 },   // 8:30–11:30
            { start: 870, end: 990 },   // 2:30–4:30
        ];
        expect(intersectIntervals(younger, older)).toEqual([
            { start: 510, end: 540 },   // tail of younger nap 1
            { start: 660, end: 690 },   // head of younger nap 2
            { start: 870, end: 900 },   // tail of younger nap 3
        ]);
    });

    it('captures one long nap spanning several short ones', () => {
        const short = [
            { start: 540, end: 570 },
            { start: 630, end: 660 },
            { start: 720, end: 750 },
        ];
        const long = [{ start: 500, end: 800 }];
        expect(intersectIntervals(short, long)).toEqual(short);
    });

    it('returns empty when either child has no naps', () => {
        const naps = [{ start: 540, end: 620 }];
        expect(intersectIntervals(naps, [])).toEqual([]);
        expect(intersectIntervals([], naps)).toEqual([]);
    });

    it('is honestly empty for real schedules whose naps only ever touch', () => {
        const a = new ScheduleSetting();
        a.dwt = 7;
        a.bed = 7;
        a.wws = [2, 2, 2, 2, 2]; // naps 540–570, 690–720, 840–870, 990–1020

        const b = new ScheduleSetting();
        b.dwt = 7;
        b.bed = 7;
        b.wws = [3, 3, 3];       // naps 600–690, 870–960 — grazes a at 690 and 870

        expect(intersectIntervals(a.napTimes, b.napTimes)).toEqual([]);
    });

    it('finds the shared block for real schedules of different ages', () => {
        const a = new ScheduleSetting();
        a.dwt = 7;
        a.bed = 7;
        a.wws = [2, 2, 2, 2, 2]; // naps 540–570, 690–720, 840–870, 990–1020

        const b = new ScheduleSetting();
        b.dwt = 7;
        b.bed = 7;
        b.wws = [2.5, 3, 3];     // naps 570–675, 855–960

        expect(intersectIntervals(a.napTimes, b.napTimes)).toEqual([
            { start: 855, end: 870 }, // 2:15–2:30 PM shared quiet block
        ]);
    });
});

describe('totalOverlapMinutes', () => {
    it('sums overlap lengths', () => {
        expect(totalOverlapMinutes([
            { start: 600, end: 630 },
            { start: 870, end: 900 },
        ])).toBe(60);
    });

    it('is 0 for no overlaps', () => {
        expect(totalOverlapMinutes([])).toBe(0);
    });
});
