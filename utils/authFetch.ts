/**
 * Authenticated fetch wrapper for VICO API calls.
 * Automatically attaches Clerk JWT token when available.
 * 
 * Usage:
 *   import { useAuthFetch } from '../utils/authFetch';
 *   const authFetch = useAuthFetch();
 *   const data = await authFetch('/api/strategies/my');
 */

import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

const CLERK_AVAILABLE = !!(process.env as any).VITE_CLERK_PUBLISHABLE_KEY;

/**
 * React hook that returns an authenticated fetch function.
 * Attaches Bearer token from Clerk session automatically.
 * Falls back to plain fetch when Clerk is not configured.
 */
export function useAuthFetch() {
    // Only call useAuth when Clerk is available (ClerkProvider is mounted)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const auth = CLERK_AVAILABLE ? useAuth() : null;

    return useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
        let token: string | null = null;
        if (auth?.getToken) {
            try {
                token = await auth.getToken();
            } catch {
                // Not signed in — proceed without token
            }
        }

        const headers = new Headers(options.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
            headers.set('Content-Type', 'application/json');
        }

        return fetch(url, { ...options, headers });
    }, [auth]);
}
