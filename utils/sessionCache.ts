/**
 * Session-level cache for API responses.
 * Survives page refresh (sessionStorage) but not tab close.
 * Each entry has a TTL (default 10 minutes).
 */

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

export function sessionCacheGet<T>(key: string): T | null {
    try {
        const raw = sessionStorage.getItem(`vico_cache_${key}`);
        if (!raw) return null;
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.timestamp > entry.ttl) {
            sessionStorage.removeItem(`vico_cache_${key}`);
            return null;
        }
        return entry.data;
    } catch {
        return null;
    }
}

export function sessionCacheSet<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    try {
        const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl: ttlMs };
        sessionStorage.setItem(`vico_cache_${key}`, JSON.stringify(entry));
    } catch {
        // sessionStorage full or unavailable — silently ignore
    }
}

export function sessionCacheClear(key: string): void {
    try {
        sessionStorage.removeItem(`vico_cache_${key}`);
    } catch {}
}
