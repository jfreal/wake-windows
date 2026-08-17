import { describe, expect, it } from 'vitest'
import {
    bandGeometry,
    daySegments,
    hoursText,
    minutesFromMidnight,
    nextEvent,
    segmentsToGradient,
} from './today'

const H = (h: number, m = 0) => h * 60 + m

describe('daySegments', () => {
    it('walks the day night → awake → nap → … → night', () => {
        const segs = daySegments(H(6, 45), H(19, 15), [
            { start: H(8, 45), end: H(10) },
            { start: H(12), end: H(13, 30) },
        ])
        expect(segs.map((s) => s.kind)).toEqual([
            'night', 'awake', 'nap', 'awake', 'nap', 'awake', 'night',
        ])
        expect(segs[0]).toEqual({ start: 0, end: H(6, 45), kind: 'night' })
        expect(segs.at(-1)).toEqual({ start: H(19, 15), end: 1440, kind: 'night' })
    })

    it('always covers exactly 24 hours with no gaps', () => {
        const segs = daySegments(H(7), H(19), [{ start: H(9), end: H(10) }])
        expect(segs[0].start).toBe(0)
        expect(segs.at(-1)!.end).toBe(1440)
        for (let i = 1; i < segs.length; i++) {
            expect(segs[i].start).toBe(segs[i - 1].end)
        }
    })

    it('drops zero-length segments rather than emitting empty stops', () => {
        // A nap that starts the instant the baby wakes leaves no awake segment.
        const segs = daySegments(H(7), H(19), [{ start: H(7), end: H(8) }])
        expect(segs.every((s) => s.end > s.start)).toBe(true)
        expect(segs.map((s) => s.kind)).toEqual(['night', 'nap', 'awake', 'night'])
    })

    it('degrades instead of drawing backwards nap time on an impossible plan', () => {
        // Nap ends before it starts (negative nap length from over-long windows).
        const segs = daySegments(H(7), H(19), [{ start: H(12), end: H(11) }])
        expect(segs.every((s) => s.end > s.start)).toBe(true)
        expect(segs.some((s) => s.kind === 'nap')).toBe(false)
    })

    it('clamps a bedtime past midnight into the day', () => {
        const segs = daySegments(H(7), H(26), [])
        expect(segs.at(-1)!.end).toBe(1440)
        expect(segs.every((s) => s.start >= 0 && s.end <= 1440)).toBe(true)
    })
})

describe('segmentsToGradient', () => {
    it('emits a hard stop pair per segment so bands do not blend', () => {
        const gradient = segmentsToGradient(
            [{ start: 0, end: 720, kind: 'night' }, { start: 720, end: 1440, kind: 'awake' }],
            { night: '#000', awake: '#fff', nap: '#f00' },
        )
        expect(gradient).toBe(
            'linear-gradient(to right, #000 0.00%, #000 50.00%, #fff 50.00%, #fff 100.00%)')
    })
})

describe('nextEvent', () => {
    const naps = [
        { earliest: H(9), latest: H(9, 30), lengthMinutes: 75 },
        { earliest: H(12), latest: H(12, 30), lengthMinutes: 90 },
    ]
    const bed = { earliest: H(19), latest: H(19, 30) }

    it('counts down to the next nap that has not opened yet', () => {
        const e = nextEvent(naps, bed, H(8))!
        expect(e.kind).toBe('nap')
        expect(e.index).toBe(1)
        expect(e.inWindow).toBe(false)
        expect(e.untilMinutes).toBe(60)
    })

    it('keeps a window as "next" while the clock sits inside it', () => {
        // Mid-window is exactly when to put the baby down — skipping to nap 2
        // here would tell a parent standing over the crib that they missed it.
        const e = nextEvent(naps, bed, H(9, 15))!
        expect(e.index).toBe(1)
        expect(e.inWindow).toBe(true)
        expect(e.untilMinutes).toBe(0)
    })

    it('moves on once the latest start has passed', () => {
        const e = nextEvent(naps, bed, H(9, 31))!
        expect(e.index).toBe(2)
    })

    it('falls through to bedtime after the last nap', () => {
        const e = nextEvent(naps, bed, H(17))!
        expect(e.kind).toBe('bedtime')
        expect(e.index).toBe(0)
        expect(e.untilMinutes).toBe(120)
    })

    it('returns null once bedtime is behind us, never a negative countdown', () => {
        expect(nextEvent(naps, bed, H(21))).toBeNull()
    })

    it('handles a plan with no naps at all', () => {
        const e = nextEvent([], bed, H(8))!
        expect(e.kind).toBe('bedtime')
    })
})

describe('minutesFromMidnight', () => {
    it('reads local wall-clock time', () => {
        const d = new Date(2026, 7, 16, 14, 37)
        expect(minutesFromMidnight(d)).toBe(H(14, 37))
    })
})

describe('bandGeometry', () => {
    it('places the range and the mark on a 0-100% track', () => {
        const g = bandGeometry(12, 15, 13.25, 9, 18)
        expect(g.bandLeft).toBe('33.3%')
        expect(g.bandWidth).toBe('33.3%')
        expect(g.markLeft).toBe('47.2%')
        expect(g.inRange).toBe(true)
    })

    it('clamps an out-of-range mark onto the track instead of off it', () => {
        const g = bandGeometry(12, 15, 22, 9, 18)
        expect(g.markLeft).toBe('100.0%')
        expect(g.inRange).toBe(false)
    })

    it('treats the range endpoints as in range', () => {
        expect(bandGeometry(12, 15, 12, 9, 18).inRange).toBe(true)
        expect(bandGeometry(12, 15, 15, 9, 18).inRange).toBe(true)
    })

    it('survives a degenerate scale without emitting NaN%', () => {
        const g = bandGeometry(3, 3, 3, 5, 5)
        expect(g.markLeft).toBe('0.0%')
        expect(g.bandWidth).toBe('0.0%')
    })
})

describe('hoursText', () => {
    it('reads as prose at quarter-hour precision', () => {
        expect(hoursText(13.25)).toBe('13 hr 15 min')
        expect(hoursText(12)).toBe('12 hr')
        expect(hoursText(0.75)).toBe('45 min')
    })
})
