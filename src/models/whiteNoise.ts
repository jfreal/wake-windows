// @doc:white-noise-sounds
// Framework-free audio helpers for the opt-in white-noise panel. Everything the
// panel needs that isn't a DOM/Web-Audio node lives here so it can be unit-tested
// without an AudioContext: the noise-buffer sample generators (white / pink /
// brown), the track catalogue (which colour + optional filter shapes each sound),
// and the sleep-timer / volume math. The component (WhiteNoise.vue) turns these
// samples into a looping AudioBufferSourceNode and owns the actual playback.
//
// No files are bundled — all sound is synthesised from a filtered noise buffer at
// runtime, so there is nothing to license and nothing to inflate the PWA cache.

export type NoiseColor = 'white' | 'pink' | 'brown'

// A BiquadFilter shape applied downstream of the raw noise to turn plain colours
// into softer "fan" / "rain" textures. Kept as plain data so the catalogue is
// testable; the component feeds these straight into a BiquadFilterNode.
export interface FilterSpec {
     type: 'lowpass' | 'bandpass'
     frequency: number
     Q: number
}

export interface SoundTrack {
     id: string
     label: string
     // Short honest description of what the parent will hear.
     hint: string
     base: NoiseColor
     filter?: FilterSpec
}

// 5 tracks (spec: 3–5). White/pink/brown are the raw colours; fan and rain reuse
// a base colour shaped by a filter, so we still only ever synthesise three
// buffers regardless of how many tracks are offered.
export const TRACKS: readonly SoundTrack[] = [
     { id: 'white', label: 'White noise', hint: 'Bright, even hiss', base: 'white' },
     { id: 'pink', label: 'Pink noise', hint: 'Softer, balanced', base: 'pink' },
     { id: 'brown', label: 'Brown noise', hint: 'Deep, low rumble', base: 'brown' },
     { id: 'fan', label: 'Fan', hint: 'Muffled low whoosh', base: 'brown', filter: { type: 'lowpass', frequency: 800, Q: 0.7 } },
     { id: 'rain', label: 'Rain', hint: 'Steady patter', base: 'white', filter: { type: 'bandpass', frequency: 1200, Q: 0.5 } },
] as const

export function trackById(id: string): SoundTrack | undefined {
     return TRACKS.find((t) => t.id === id)
}

// --- noise sample generators ------------------------------------------------
// Each fills `data` in place with samples in [-1, 1]. `rng` returns [0, 1) and
// defaults to Math.random; tests pass a seeded generator for determinism.

type Rng = () => number

export function fillWhiteNoise(data: Float32Array, rng: Rng = Math.random): void {
     for (let i = 0; i < data.length; i++) {
          data[i] = rng() * 2 - 1
     }
}

// Paul Kellet's economical pink-noise filter: sums six one-pole filters so the
// power falls ~3 dB/octave. Output is scaled to sit within [-1, 1].
export function fillPinkNoise(data: Float32Array, rng: Rng = Math.random): void {
     let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
     for (let i = 0; i < data.length; i++) {
          const white = rng() * 2 - 1
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.969 * b2 + white * 0.153852
          b3 = 0.8665 * b3 + white * 0.3104856
          b4 = 0.55 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.016898
          const out = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
          b6 = white * 0.115926
          data[i] = clampSample(out)
     }
}

// Brown (red) noise: a leaky integral of white noise, so power falls ~6 dB/octave
// for a deep rumble. Scaled up then clamped to keep it audible without clipping.
export function fillBrownNoise(data: Float32Array, rng: Rng = Math.random): void {
     let last = 0
     for (let i = 0; i < data.length; i++) {
          const white = rng() * 2 - 1
          last = (last + 0.02 * white) / 1.02
          data[i] = clampSample(last * 3.5)
     }
}

export function fillNoise(color: NoiseColor, data: Float32Array, rng: Rng = Math.random): void {
     if (color === 'pink') fillPinkNoise(data, rng)
     else if (color === 'brown') fillBrownNoise(data, rng)
     else fillWhiteNoise(data, rng)
}

function clampSample(v: number): number {
     if (v > 1) return 1
     if (v < -1) return -1
     return v
}

// --- volume + sleep-timer math ----------------------------------------------

export function clampVolume(v: number): number {
     if (!Number.isFinite(v)) return 0
     if (v > 1) return 1
     if (v < 0) return 0
     return v
}

// Sleep-timer presets in minutes. `null` = "no timer" (plays until stopped).
export const TIMER_PRESETS_MIN = [15, 30, 45, 60] as const

// Absolute stop time for a timer started at `startMs` for `minutes`.
export function timerEndsAt(startMs: number, minutes: number): number {
     return startMs + minutes * 60_000
}

export function remainingMs(endsAt: number, now: number): number {
     return Math.max(0, endsAt - now)
}

export function isExpired(endsAt: number, now: number): boolean {
     return now >= endsAt
}

// mm:ss countdown, rounding up so a timer never shows 0:00 while still audible.
export function formatCountdown(ms: number): string {
     const totalSec = Math.ceil(Math.max(0, ms) / 1000)
     const m = Math.floor(totalSec / 60)
     const s = totalSec % 60
     return `${m}:${String(s).padStart(2, '0')}`
}
