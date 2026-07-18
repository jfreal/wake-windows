// @doc:sibling-twins-alignment
// Overlap math for two children's nap schedules: where are both asleep at once?
// Pure interval arithmetic over minutes-from-midnight, so it handles asymmetric
// schedules (different nap counts/lengths per child) without special cases.

export interface Interval {
    start: number;
    end: number;
}

/**
 * Intersect two chronologically-sorted, non-overlapping interval lists
 * (e.g. each child's `napTimes`) with a two-pointer sweep. Returns only
 * strictly positive-length overlaps — schedules that merely touch (one nap
 * ends exactly when the other starts) share no actual quiet time.
 */
export function intersectIntervals(a: Interval[], b: Interval[]): Interval[] {
    const overlaps: Interval[] = [];
    let i = 0;
    let j = 0;
    while (i < a.length && j < b.length) {
        const start = Math.max(a[i].start, b[j].start);
        const end = Math.min(a[i].end, b[j].end);
        if (end > start) {
            overlaps.push({ start, end });
        }
        if (a[i].end < b[j].end) {
            i++;
        } else {
            j++;
        }
    }
    return overlaps;
}

/** Sum of overlap lengths in minutes. */
export function totalOverlapMinutes(overlaps: Interval[]): number {
    return overlaps.reduce((sum, o) => sum + (o.end - o.start), 0);
}
