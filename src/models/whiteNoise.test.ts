import { describe, it, expect } from 'vitest'
import {
     TRACKS,
     trackById,
     fillWhiteNoise,
     fillPinkNoise,
     fillBrownNoise,
     fillNoise,
     clampVolume,
     TIMER_PRESETS_MIN,
     timerEndsAt,
     remainingMs,
     isExpired,
     formatCountdown,
     type NoiseColor,
} from './whiteNoise'

// Deterministic RNG (mulberry32) so noise generators are testable.
function seeded(seed: number): () => number {
     let a = seed >>> 0
     return () => {
          a |= 0
          a = (a + 0x6d2b79f5) | 0
          let t = Math.imul(a ^ (a >>> 15), 1 | a)
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296
     }
}

describe('track catalogue', () => {
     it('offers 3–5 tracks (spec MVP range)', () => {
          expect(TRACKS.length).toBeGreaterThanOrEqual(3)
          expect(TRACKS.length).toBeLessThanOrEqual(5)
     })

     it('every track has a unique id, a label, a hint, and a valid base colour', () => {
          const ids = new Set<string>()
          for (const t of TRACKS) {
               expect(t.id).toBeTruthy()
               expect(t.label).toBeTruthy()
               expect(t.hint).toBeTruthy()
               expect(['white', 'pink', 'brown']).toContain(t.base)
               expect(ids.has(t.id)).toBe(false)
               ids.add(t.id)
          }
     })

     it('filtered tracks use only supported biquad shapes and positive params', () => {
          for (const t of TRACKS) {
               if (!t.filter) continue
               expect(['lowpass', 'bandpass']).toContain(t.filter.type)
               expect(t.filter.frequency).toBeGreaterThan(0)
               expect(t.filter.Q).toBeGreaterThan(0)
          }
     })

     it('trackById resolves known ids and returns undefined otherwise', () => {
          expect(trackById('white')?.label).toBe('White noise')
          expect(trackById('nope')).toBeUndefined()
     })
})

describe('noise generators', () => {
     const colors: NoiseColor[] = ['white', 'pink', 'brown']

     it.each(colors)('%s noise stays within [-1, 1] and is finite', (color) => {
          const data = new Float32Array(4096)
          fillNoise(color, data, seeded(42))
          for (const v of data) {
               expect(Number.isFinite(v)).toBe(true)
               expect(v).toBeGreaterThanOrEqual(-1)
               expect(v).toBeLessThanOrEqual(1)
          }
     })

     it('white noise is roughly zero-mean and actually varies', () => {
          const data = new Float32Array(8192)
          fillWhiteNoise(data, seeded(7))
          const mean = data.reduce((s, v) => s + v, 0) / data.length
          expect(Math.abs(mean)).toBeLessThan(0.05)
          expect(new Set(data).size).toBeGreaterThan(100)
     })

     it('is deterministic for a given seed', () => {
          const a = new Float32Array(256)
          const b = new Float32Array(256)
          fillPinkNoise(a, seeded(99))
          fillPinkNoise(b, seeded(99))
          expect(Array.from(a)).toEqual(Array.from(b))
     })

     it('brown noise has more low-frequency energy than white (smoother)', () => {
          // Mean absolute sample-to-sample delta: brown integrates, so neighbouring
          // samples are far closer together than white's independent samples.
          const white = new Float32Array(8192)
          const brown = new Float32Array(8192)
          fillWhiteNoise(white, seeded(3))
          fillBrownNoise(brown, seeded(3))
          const roughness = (d: Float32Array) => {
               let sum = 0
               for (let i = 1; i < d.length; i++) sum += Math.abs(d[i] - d[i - 1])
               return sum / (d.length - 1)
          }
          expect(roughness(brown)).toBeLessThan(roughness(white))
     })
})

describe('clampVolume', () => {
     it('clamps to [0, 1] and rejects non-finite input', () => {
          expect(clampVolume(0.5)).toBe(0.5)
          expect(clampVolume(-1)).toBe(0)
          expect(clampVolume(2)).toBe(1)
          expect(clampVolume(NaN)).toBe(0)
          expect(clampVolume(Infinity)).toBe(0) // non-finite is rejected, not clamped
     })
})

describe('sleep-timer math', () => {
     it('exposes sane presets', () => {
          expect(TIMER_PRESETS_MIN).toEqual([15, 30, 45, 60])
     })

     it('computes an absolute end time', () => {
          expect(timerEndsAt(1_000_000, 30)).toBe(1_000_000 + 30 * 60_000)
     })

     it('remaining never goes negative', () => {
          const end = timerEndsAt(0, 1) // 60_000
          expect(remainingMs(end, 0)).toBe(60_000)
          expect(remainingMs(end, 30_000)).toBe(30_000)
          expect(remainingMs(end, 90_000)).toBe(0)
     })

     it('isExpired flips exactly at the end time', () => {
          const end = timerEndsAt(0, 1)
          expect(isExpired(end, 59_999)).toBe(false)
          expect(isExpired(end, 60_000)).toBe(true)
          expect(isExpired(end, 60_001)).toBe(true)
     })
})

describe('formatCountdown', () => {
     it('formats mm:ss and rounds up remaining seconds', () => {
          expect(formatCountdown(0)).toBe('0:00')
          expect(formatCountdown(1)).toBe('0:01') // 1ms still audible → shows 0:01
          expect(formatCountdown(59_000)).toBe('0:59')
          expect(formatCountdown(60_000)).toBe('1:00')
          expect(formatCountdown(29 * 60_000 + 30_000)).toBe('29:30')
     })

     it('never shows a negative time', () => {
          expect(formatCountdown(-5000)).toBe('0:00')
     })
})
