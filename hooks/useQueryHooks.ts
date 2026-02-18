/**
 * 🔄 React Query Hooks for VICO
 * Enterprise-grade data fetching with caching, retries, and error handling
 * 
 * Features:
 * - TanStack Query integration pattern
 * - Automatic retry with exponential backoff
 * - Stale-while-revalidate caching
 * - Optimistic updates
 * - Error boundaries support
 * - Graceful degradation for 429/500 errors
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface QueryState<T> {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;
    isStale: boolean;
    refetch: () => Promise<void>;
    mutate: (data: T) => void;
}

export interface QueryOptions<T> {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    retry?: number | boolean;
    retryDelay?: number | ((attempt: number) => number);
    refetchOnWindowFocus?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    placeholderData?: T | (() => T);
}

export interface MutationState<TData, TVariables> {
    data: TData | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isSuccess: boolean;
    mutate: (variables: TVariables) => Promise<TData | undefined>;
    mutateAsync: (variables: TVariables) => Promise<TData>;
    reset: () => void;
}

export interface MutationOptions<TData, TVariables> {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
    retry?: number | boolean;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    staleTime: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const getCacheKey = (key: unknown): string => {
    if (typeof key === 'string') return key;
    return JSON.stringify(key);
};

const getFromCache = <T>(key: string, staleTime: number): { data: T; isStale: boolean } | null => {
    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    
    const age = Date.now() - entry.timestamp;
    const isStale = age > staleTime;
    
    return { data: entry.data, isStale };
};

const setCache = <T>(key: string, data: T, staleTime: number): void => {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        staleTime
    });
};

const invalidateCache = (keyPattern?: string): void => {
    if (!keyPattern) {
        cache.clear();
        return;
    }
    
    for (const key of cache.keys()) {
        if (key.includes(keyPattern)) {
            cache.delete(key);
        }
    }
};

// ============================================================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ============================================================================

const defaultRetryDelay = (attempt: number): number => {
    // Exponential backoff: 1s, 2s, 4s, 8s max
    return Math.min(1000 * Math.pow(2, attempt), 8000);
};

const isRetryableError = (error: Error): boolean => {
    // @ts-ignore - custom error property
    const status = error.status || error.statusCode;
    if (status === 429 || status >= 500) return true;
    if (error.message.includes('network') || error.message.includes('timeout')) return true;
    return false;
};

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// CUSTOM FETCH WITH ERROR HANDLING
// ============================================================================

interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
}

class ApiError extends Error {
    status: number;
    statusCode: number;
    isRetryable: boolean;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.statusCode = status;
        this.isRetryable = status === 429 || status >= 500;
    }
}

export const apiFetch = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
    const { method = 'GET', body, headers = {}, signal } = options;

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new ApiError(
            `API Error: ${response.status} - ${errorText}`,
            response.status
        );
    }

    return response.json();
};

// ============================================================================
// USE QUERY HOOK
// ============================================================================

export function useQuery<T>(
    queryKey: string | unknown[],
    queryFn: (signal: AbortSignal) => Promise<T>,
    options: QueryOptions<T> = {}
): QueryState<T> {
    const {
        enabled = true,
        staleTime = 5 * 60 * 1000, // 5 minutes
        retry = 3,
        retryDelay = defaultRetryDelay,
        refetchOnWindowFocus = true,
        onSuccess,
        onError,
        placeholderData
    } = options;

    const key = getCacheKey(queryKey);
    const [data, setData] = useState<T | undefined>(() => {
        const cached = getFromCache<T>(key, staleTime);
        return cached?.data ?? (typeof placeholderData === 'function' 
            ? (placeholderData as () => T)() 
            : placeholderData);
    });
    const [isLoading, setIsLoading] = useState(!getFromCache(key, staleTime));
    const [isFetching, setIsFetching] = useState(false);
    const [isStale, setIsStale] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const abortControllerRef = useRef<AbortController | null>(null);
    const retryCountRef = useRef(0);

    const fetch = useCallback(async () => {
        if (!enabled) return;

        // Check cache first
        const cached = getFromCache<T>(key, staleTime);
        if (cached && !cached.isStale) {
            setData(cached.data);
            setIsLoading(false);
            setIsStale(false);
            return;
        }

        // If we have stale data, show it while fetching
        if (cached?.isStale) {
            setData(cached.data);
            setIsStale(true);
        }

        setIsFetching(true);
        if (!data && !cached) {
            setIsLoading(true);
        }
        setError(null);

        // Cancel previous request
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        try {
            const result = await queryFn(abortControllerRef.current.signal);
            setData(result);
            setCache(key, result, staleTime);
            setIsStale(false);
            retryCountRef.current = 0;
            onSuccess?.(result);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return; // Ignore aborted requests
            }

            const error = err as Error;
            const maxRetries = typeof retry === 'number' ? retry : (retry ? 3 : 0);

            // Retry logic
            if (retryCountRef.current < maxRetries && isRetryableError(error)) {
                retryCountRef.current++;
                const delay = typeof retryDelay === 'function' 
                    ? retryDelay(retryCountRef.current) 
                    : retryDelay;
                await sleep(delay);
                return fetch();
            }

            setError(error);
            onError?.(error);
        } finally {
            setIsLoading(false);
            setIsFetching(false);
        }
    }, [enabled, key, staleTime, data, retry, retryDelay, onSuccess, onError, queryFn]);

    // Initial fetch
    useEffect(() => {
        fetch();
        return () => abortControllerRef.current?.abort();
    }, [key, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

    // Refetch on window focus
    useEffect(() => {
        if (!refetchOnWindowFocus) return;

        const handleFocus = () => {
            const cached = getFromCache<T>(key, staleTime);
            if (!cached || cached.isStale) {
                fetch();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [key, staleTime, refetchOnWindowFocus, fetch]);

    const mutate = useCallback((newData: T) => {
        setData(newData);
        setCache(key, newData, staleTime);
    }, [key, staleTime]);

    return {
        data,
        isLoading,
        isError: !!error,
        error,
        isFetching,
        isStale,
        refetch: fetch,
        mutate
    };
}

// ============================================================================
// USE MUTATION HOOK
// ============================================================================

export function useMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options: MutationOptions<TData, TVariables> = {}
): MutationState<TData, TVariables> {
    const { onSuccess, onError, onSettled, retry = 1 } = options;

    const [data, setData] = useState<TData | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const retryCountRef = useRef(0);

    const reset = useCallback(() => {
        setData(undefined);
        setIsLoading(false);
        setError(null);
        setIsSuccess(false);
        retryCountRef.current = 0;
    }, []);

    const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        const maxRetries = typeof retry === 'number' ? retry : (retry ? 1 : 0);

        const attemptMutation = async (): Promise<TData> => {
            try {
                const result = await mutationFn(variables);
                setData(result);
                setIsSuccess(true);
                retryCountRef.current = 0;
                onSuccess?.(result, variables);
                onSettled?.(result, null, variables);
                return result;
            } catch (err) {
                const error = err as Error;

                if (retryCountRef.current < maxRetries && isRetryableError(error)) {
                    retryCountRef.current++;
                    await sleep(defaultRetryDelay(retryCountRef.current));
                    return attemptMutation();
                }

                setError(error);
                onError?.(error, variables);
                onSettled?.(undefined, error, variables);
                throw error;
            }
        };

        try {
            return await attemptMutation();
        } finally {
            setIsLoading(false);
        }
    }, [mutationFn, retry, onSuccess, onError, onSettled]);

    const mutate = useCallback(async (variables: TVariables): Promise<TData | undefined> => {
        try {
            return await mutateAsync(variables);
        } catch {
            return undefined;
        }
    }, [mutateAsync]);

    return {
        data,
        isLoading,
        isError: !!error,
        error,
        isSuccess,
        mutate,
        mutateAsync,
        reset
    };
}

// ============================================================================
// SPECIALIZED HOOKS FOR VICO
// ============================================================================

interface Company {
    id: string;
    name: string;
    englishName?: string;
    ticker?: string;
    industry?: string;
    address?: string;
    yearFounded?: number;
    employeeSize?: string;
    revenue?: string;
    intro?: string;
    latestNewsSentiment?: 'Positive' | 'Neutral' | 'Negative' | null;
    newsCount?: number;
    headlineSnapshot?: string[];
    latestNewsAt?: Date | string;
}

interface News {
    id: string;
    title: string;
    summary?: string;
    url: string;
    sourceName?: string;
    publishedAt?: Date | string;
    sentiment?: 'Positive' | 'Neutral' | 'Negative' | null;
    category?: string;
}

interface SearchResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

const API_BASE = '';

// Company queries
export const useCompanies = (params: { 
    search?: string; 
    industry?: string; 
    page?: number; 
    pageSize?: number;
} = {}) => {
    const queryKey = ['companies', params];
    
    return useQuery<SearchResult<Company>>(
        queryKey,
        async (signal) => {
            const searchParams = new URLSearchParams();
            if (params.search) searchParams.set('search', params.search);
            if (params.industry) searchParams.set('industry', params.industry);
            if (params.page) searchParams.set('page', String(params.page));
            if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
            
            return apiFetch(`${API_BASE}/api/companies?${searchParams}`, { signal });
        },
        {
            staleTime: 2 * 60 * 1000, // 2 minutes
            placeholderData: { items: [], total: 0, page: 1, pageSize: 20 }
        }
    );
};

export const useCompany = (id: string) => {
    return useQuery<Company>(
        ['company', id],
        async (signal) => apiFetch(`${API_BASE}/api/companies/${id}`, { signal }),
        { enabled: !!id }
    );
};

// News queries
export const useNews = (params: {
    companyId?: string;
    search?: string;
    sentiment?: string;
    page?: number;
    pageSize?: number;
} = {}) => {
    const queryKey = ['news', params];

    return useQuery<SearchResult<News>>(
        queryKey,
        async (signal) => {
            const searchParams = new URLSearchParams();
            if (params.companyId) searchParams.set('companyId', params.companyId);
            if (params.search) searchParams.set('search', params.search);
            if (params.sentiment) searchParams.set('sentiment', params.sentiment);
            if (params.page) searchParams.set('page', String(params.page));
            if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
            
            return apiFetch(`${API_BASE}/api/news?${searchParams}`, { signal });
        },
        {
            staleTime: 1 * 60 * 1000, // 1 minute
            placeholderData: { items: [], total: 0, page: 1, pageSize: 20 }
        }
    );
};

// Vector search
export const useVectorSearch = (query: string, options: { type?: 'company' | 'news' | 'all'; limit?: number } = {}) => {
    return useQuery(
        ['vector-search', query, options],
        async (signal) => apiFetch(`${API_BASE}/api/search/semantic`, {
            method: 'POST',
            body: { query, type: options.type || 'all', limit: options.limit || 10 },
            signal
        }),
        {
            enabled: query.length > 2,
            staleTime: 5 * 60 * 1000
        }
    );
};

// Cache invalidation utilities
export const queryUtils = {
    invalidateCompanies: () => invalidateCache('companies'),
    invalidateNews: () => invalidateCache('news'),
    invalidateAll: () => invalidateCache()
};

export default useQuery;
