// @doc:sleep-nap-logging
// First on-device persistence layer for the app. Everything is stored under a
// single namespaced, versioned localStorage key so that:
//   - `DeleteData.vue`'s `localStorage.clear()` wipes it (ephemerality is kept),
//   - future logs (feeding, diaper, trends…) reuse the exact same helpers and
//     key convention (`ww.<name>.v<n>`),
//   - a schema bump is a key bump, so stale shapes never crash a new build.
// No network, no account — reads and writes never leave the device.

const NAMESPACE = 'ww';

/** Build a namespaced, versioned storage key, e.g. `ww.sleepLog.v1`. */
export function storageKey(name: string, version = 1): string {
    return `${NAMESPACE}.${name}.v${version}`;
}

/**
 * Read and JSON-parse a value. Returns `fallback` on anything unexpected —
 * missing key, private-mode SecurityError, or corrupt JSON — so a bad blob can
 * never break the app (the caller is expected to re-validate the shape).
 */
export function loadJSON<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

/**
 * JSON-serialize and store a value. Swallows failures (quota, private mode) —
 * losing a write is acceptable for a tool that promises to be ephemeral; a
 * thrown error mid-render is not.
 */
export function saveJSON(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* storage unavailable or full — nothing we can (or should) do */
    }
}

/** Remove a single stored key. Best-effort, never throws. */
export function removeKey(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        /* nothing stored anyway */
    }
}
