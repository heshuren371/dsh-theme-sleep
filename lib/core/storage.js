/**
 * The one durable browser store this plugin owns.
 *
 * The settings document is the primary source of truth; this store holds only
 * what must survive a page reload faster than a round trip can: the reminder
 * occurrence already shown today, and a copy of the last accepted settings so a
 * shell without the settings transport still starts from the user's rule rather
 * than from the defaults. Every read is defensive — a corrupt value degrades to
 * "nothing stored".
 * @module
 */
/** Storage key; versioned so a future shape change can migrate instead of guess. */
export const STORAGE_KEY = 'dsh-theme-sleep/v1';
/**
 * Resolve the browser's localStorage without assuming it exists or is usable
 * (private mode throws on access in some shells).
 * @returns The store, or `null` when unavailable.
 */
function storage() {
    try {
        const candidate = globalThis.localStorage;
        if (candidate === undefined || candidate === null)
            return null;
        // Touch the API: some shells expose the object but refuse every call.
        candidate.getItem(STORAGE_KEY);
        return candidate;
    }
    catch {
        return null;
    }
}
/**
 * Read the stored state.
 * @returns The parsed state, or an empty object when nothing usable is stored.
 */
export function loadStoredState() {
    const store = storage();
    if (store === null)
        return {};
    try {
        const raw = store.getItem(STORAGE_KEY);
        if (raw === null)
            return {};
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
            return {};
        const record = parsed;
        const result = {};
        if (typeof record['firedDay'] === 'string')
            result.firedDay = record['firedDay'];
        if (typeof record['snoozeUntil'] === 'number' && Number.isFinite(record['snoozeUntil'])) {
            result.snoozeUntil = record['snoozeUntil'];
        }
        if (typeof record['overrideUntil'] === 'number' && Number.isFinite(record['overrideUntil'])) {
            result.overrideUntil = record['overrideUntil'];
        }
        const settings = record['settings'];
        if (typeof settings === 'object' && settings !== null && !Array.isArray(settings)) {
            result.settings = settings;
        }
        return result;
    }
    catch {
        return {};
    }
}
/**
 * Merge a patch into the stored state and drop the fields named in `reset`.
 *
 * A merge cannot delete, so a field that must go away (a snooze that expired, an
 * override that was released) is named in `reset`; passing `undefined` for it
 * would leave the old value in place.
 * @param patch - Fields to store.
 * @param reset - Fields to delete.
 */
export function saveStoredState(patch, reset = {}) {
    const store = storage();
    if (store === null)
        return;
    try {
        const next = { ...loadStoredState(), ...patch };
        if (reset.snoozeUntil === true)
            delete next['snoozeUntil'];
        if (reset.overrideUntil === true)
            delete next['overrideUntil'];
        store.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    catch {
        /* a full or read-only store must not break the plugin */
    }
}
/**
 * Forget everything this plugin stored.
 */
export function clearStoredState() {
    const store = storage();
    if (store === null)
        return;
    try {
        store.removeItem(STORAGE_KEY);
    }
    catch {
        /* nothing to do */
    }
}
