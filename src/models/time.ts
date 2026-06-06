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
