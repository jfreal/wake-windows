<script setup lang="ts">
// @doc:white-noise-sounds
// Opt-in white-noise / sleep-sounds panel. Hidden behind a single "Add white
// noise" toggle so it never adds clutter or empty-tracker guilt — the schedule
// stays the headline. All sound is synthesised in-browser from a filtered noise
// buffer via the Web Audio API: nothing is bundled, nothing is licensed, nothing
// leaves the device, and it works offline (F07). Reusable noise/timer/volume math
// lives in ../models/whiteNoise.ts (unit-tested); this component only wires those
// into Web Audio nodes and the UI.
import { ref, computed, shallowRef, onUnmounted } from 'vue'
import {
     TRACKS,
     trackById,
     fillNoise,
     clampVolume,
     TIMER_PRESETS_MIN,
     timerEndsAt,
     remainingMs,
     formatCountdown,
     type NoiseColor,
} from '../models/whiteNoise'

// Panel stays collapsed until the parent explicitly opts in (no autoplay, no
// clutter). Once open it reveals the track buttons and controls.
const enabled = ref(false)

// --- Web Audio state (created lazily on the first user tap) ------------------
// AudioContext must be created/resumed from a user gesture or the autoplay policy
// leaves it suspended, so we build everything the first time play() is called.
const ctx = shallowRef<AudioContext | null>(null)
const source = shallowRef<AudioBufferSourceNode | null>(null)
const gain = shallowRef<GainNode | null>(null)
// One decoded buffer per noise colour, reused across tracks that share a colour.
const bufferCache = new Map<NoiseColor, AudioBuffer>()

const currentTrackId = ref<string | null>(null)
const isPlaying = ref(false)
const volume = ref(0.6)

// --- sleep timer ------------------------------------------------------------
const timerMinutes = ref<number | null>(null) // null = play until stopped
const timerEnd = ref<number | null>(null)
const now = ref(Date.now())
let timerTick: ReturnType<typeof setInterval> | undefined

const timerRemaining = computed(() =>
     timerEnd.value == null ? null : remainingMs(timerEnd.value, now.value))
const timerLabel = computed(() =>
     timerRemaining.value == null ? '' : formatCountdown(timerRemaining.value))

function startTimerTick() {
     stopTimerTick()
     timerTick = setInterval(() => {
          now.value = Date.now()
          if (timerEnd.value != null && now.value >= timerEnd.value) {
               stop() // stop() clears the timer tick too
          }
     }, 500)
}
function stopTimerTick() {
     if (timerTick) { clearInterval(timerTick); timerTick = undefined }
}

// --- buffer synthesis -------------------------------------------------------
function noiseBuffer(context: AudioContext, color: NoiseColor): AudioBuffer {
     const cached = bufferCache.get(color)
     if (cached) return cached
     // ~2 s of mono noise, looped seamlessly by the source node.
     const length = context.sampleRate * 2
     const buffer = context.createBuffer(1, length, context.sampleRate)
     fillNoise(color, buffer.getChannelData(0))
     bufferCache.set(color, buffer)
     return buffer
}

// --- playback (must be called from a user gesture) --------------------------
function play(trackId: string) {
     const track = trackById(trackId)
     if (!track) return

     // Lazily create the context on first tap so the browser ties it to the
     // gesture and lets it actually produce sound.
     if (!ctx.value) {
          const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          ctx.value = new Ctor()
          const g = ctx.value.createGain()
          g.gain.value = clampVolume(volume.value)
          g.connect(ctx.value.destination)
          gain.value = g
     }
     const context = ctx.value
     if (context.state === 'suspended') void context.resume()

     stopSource()

     const src = context.createBufferSource()
     src.buffer = noiseBuffer(context, track.base)
     src.loop = true

     // Optional filter turns a raw colour into a "fan" / "rain" texture.
     let tail: AudioNode = src
     if (track.filter) {
          const biquad = context.createBiquadFilter()
          biquad.type = track.filter.type
          biquad.frequency.value = track.filter.frequency
          biquad.Q.value = track.filter.Q
          src.connect(biquad)
          tail = biquad
     }
     tail.connect(gain.value!)
     src.start()

     source.value = src
     currentTrackId.value = trackId
     isPlaying.value = true

     // (Re)start the sleep timer if one is selected.
     if (timerMinutes.value != null) {
          timerEnd.value = timerEndsAt(Date.now(), timerMinutes.value)
          now.value = Date.now()
          startTimerTick()
     }
}

function toggleTrack(trackId: string) {
     if (isPlaying.value && currentTrackId.value === trackId) {
          stop()
     } else {
          play(trackId)
     }
}

function stopSource() {
     if (source.value) {
          try { source.value.stop() } catch { /* already stopped */ }
          source.value.disconnect()
          source.value = null
     }
}

function stop() {
     stopSource()
     isPlaying.value = false
     currentTrackId.value = null
     timerEnd.value = null
     stopTimerTick()
}

function onVolumeInput(e: Event) {
     const v = clampVolume(Number((e.target as HTMLInputElement).value))
     volume.value = v
     if (gain.value) gain.value.gain.value = v
}

// Selecting a timer while already playing re-arms it from now; selecting "off"
// clears it. Persists for the next track too.
function setTimer(minutes: number | null) {
     timerMinutes.value = minutes
     if (minutes == null) {
          timerEnd.value = null
          stopTimerTick()
     } else if (isPlaying.value) {
          timerEnd.value = timerEndsAt(Date.now(), minutes)
          now.value = Date.now()
          startTimerTick()
     }
}

onUnmounted(() => {
     stop()
     if (ctx.value) void ctx.value.close()
})
</script>

<template>
     <!-- @doc:white-noise-sounds -->
     <section class="mt-6 rounded-lg border border-slate-800 p-4" aria-labelledby="white-noise-heading">
          <div class="flex items-baseline justify-between gap-2">
               <h2 id="white-noise-heading" class="text-slate-400 text-sm uppercase font-normal">White noise</h2>
               <button v-if="!enabled" type="button"
                    class="btn-inline text-sm"
                    v-on:click="enabled = true">Add white noise</button>
               <button v-else type="button"
                    class="btn-inline"
                    v-on:click="stop(); enabled = false">Hide</button>
          </div>

          <p v-if="!enabled" class="text-muted text-xs mt-1">
               Optional in-app sound machine — deep, even noise to help settle a nap. Off by default so it stays out of
               the way.
          </p>

          <div v-else>
               <p class="text-muted text-xs mt-1 mb-3">
                    Synthesised on your device — nothing to download, works offline. Tap a sound to start; tap again to
                    stop.
               </p>

               <!-- Track picker. Each button is a toggle: the playing track shows as
                    pressed. Sound only ever starts from one of these taps. -->
               <div class="flex flex-wrap gap-2" role="group" aria-label="Choose a sound">
                    <button v-for="t in TRACKS" :key="t.id" type="button"
                         class="inline-flex flex-col items-start rounded border px-3 py-2 min-h-11 text-left transition-colors"
                         :class="isPlaying && currentTrackId === t.id
                              ? 'border-sky-500 bg-sky-500/10 text-sky-200'
                              : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'"
                         :aria-pressed="isPlaying && currentTrackId === t.id"
                         v-on:click="toggleTrack(t.id)">
                         <span class="text-sm">{{ t.label }}</span>
                         <!-- muted-raised: this hint sits on a slate-800 track button,
                              where the body-tuned `muted` measures 4.13:1. -->
                         <span class="text-xs text-muted-raised">{{ t.hint }}</span>
                    </button>
               </div>

               <!-- Transport + status -->
               <div class="flex items-center gap-3 mt-3">
                    <button type="button"
                         class="btn btn-quiet"
                         :disabled="!isPlaying" v-on:click="stop()">Stop</button>
                    <span role="status" aria-live="polite" class="text-sm"
                         :class="isPlaying ? 'text-emerald-400' : 'text-muted'">
                         {{ isPlaying ? 'Playing' : 'Stopped' }}
                         <span v-if="isPlaying && timerLabel" class="tabular-nums"> · {{ timerLabel }} left</span>
                    </span>
               </div>

               <!-- Volume -->
               <div class="mt-3">
                    <label for="white-noise-volume" class="text-slate-400 text-xs uppercase">Volume</label>
                    <!-- h-11: a native range renders a ~16px box, so the draggable
                         thumb was a 16px target. Giving the input the full 44px
                         height centres the track and makes the whole strip
                         grabbable, which is the point for one-handed use. -->
                    <input id="white-noise-volume" type="range" min="0" max="1" step="0.01" :value="volume"
                         class="w-full max-w-xs mt-1 h-11 accent-sky-500" v-on:input="onVolumeInput" />
               </div>

               <!-- Sleep timer -->
               <div class="mt-3">
                    <div class="text-slate-400 text-xs uppercase">Sleep timer</div>
                    <div class="flex flex-wrap gap-2 mt-1" role="group" aria-label="Sleep timer">
                         <button type="button"
                              class="inline-flex items-center rounded border px-3 min-h-11 text-sm transition-colors"
                              :class="timerMinutes === null
                                   ? 'border-sky-500 bg-sky-500/10 text-sky-200'
                                   : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'"
                              :aria-pressed="timerMinutes === null" v-on:click="setTimer(null)">Off</button>
                         <button v-for="m in TIMER_PRESETS_MIN" :key="m" type="button"
                              class="inline-flex items-center rounded border px-3 min-h-11 text-sm transition-colors"
                              :class="timerMinutes === m
                                   ? 'border-sky-500 bg-sky-500/10 text-sky-200'
                                   : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'"
                              :aria-pressed="timerMinutes === m" v-on:click="setTimer(m)">{{ m }} min</button>
                    </div>
               </div>

               <!-- Honest limitation note (spec: under-promise on locked-screen). -->
               <p class="text-muted text-xs mt-3">
                    A locked phone may pause playback — mobile web can't guarantee always-on background audio the way a
                    dedicated sound machine does. Keep the screen on for a full nap.
               </p>
          </div>
     </section>
</template>
