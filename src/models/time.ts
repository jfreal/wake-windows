// @doc:wake-window-schedule-generator
/** Format minutes-from-midnight as a 12-hour clock time, e.g. 570 -> "9:30 AM". */
export function formatClock(minutes: number): string {
    const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
    let h = Math.floor(m / 60);
    const min = m % 60;
    const period = h < 12 ? "AM" : "PM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${String(min).padStart(2, "0")} ${period}`;
}

// @doc:anti-anxiety-mechanics
/** Round minutes-from-midnight to the nearest `step`-minute mark (default 5),
 * so displayed range endpoints read like clock times ("9:15", not "9:23"). */
export function roundToStep(minutes: number, step = 5): number {
    return Math.round(minutes / step) * step;
}

// @doc:anti-anxiety-mechanics
/** Format a start–end pair as one range, e.g. "9:15–9:45 AM". The AM/PM
 * marker is only repeated when the range crosses noon or midnight. */
export function formatClockRange(startMinutes: number, endMinutes: number): string {
    const start = formatClock(startMinutes);
    const end = formatClock(endMinutes);
    const [startTime, startPeriod] = start.split(" ");
    const [, endPeriod] = end.split(" ");
    return startPeriod === endPeriod ? `${startTime}–${end}` : `${start}–${end}`;
}

// @doc:anti-anxiety-mechanics
/** Format a duration in minutes as friendly prose, e.g. "1 h 20 min", "45 min". */
export function formatDuration(minutes: number): string {
    const m = Math.round(minutes);
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (h <= 0) return `${rem} min`;
    if (rem === 0) return `${h} h`;
    return `${h} h ${rem} min`;
}
