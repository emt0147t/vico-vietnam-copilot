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

/**
 * React hook that returns an authenticated fetch function.
 * Attaches Bearer token from Clerk session automatically.
 */
export function useAuthFetch() {
    const { getToken } = useAuth();

    return useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
        let token: string | null = null;
        try {
            token = await getToken();
        } catch {
            // Not signed in — proceed without token
        }

        const headers = new Headers(options.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
            headers.set('Content-Type', 'application/json');
        }

        return fetch(url, { ...options, headers });
    }, [getToken]);
}
