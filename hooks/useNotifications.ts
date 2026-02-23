/**
 * 🔔 Notification System Hook
 * Manages alerts for breaking news, competitor moves, market changes.
 * Persists to sessionStorage. Auto-generates from real RSS data.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCompanyNews, NewsItem } from '../services/newsService';

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType = 'breaking_news' | 'competitor_move' | 'market_alert' | 'system' | 'insight';

export interface VNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;       // ISO string
  read: boolean;
  link?: string;           // URL for news items
  source?: string;         // e.g. "Google News", "VICO AI"
  priority: 'high' | 'medium' | 'low';
  relatedEntity?: string;  // company name, industry, etc.
}

interface NotificationState {
  notifications: VNotification[];
  lastFetchTimestamp: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'vico_notifications';
const FETCH_INTERVAL_MS = 5 * 60 * 1000;  // 5 minutes
const MAX_NOTIFICATIONS = 50;

// ============================================================================
// HELPERS
// ============================================================================

function loadState(): NotificationState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { notifications: [], lastFetchTimestamp: null };
}

function saveState(state: NotificationState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota */ }
}

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Classify a news headline into a notification type + priority */
function classifyNews(item: NewsItem, _companyName?: string): { type: NotificationType; priority: 'high' | 'medium' | 'low' } {
  const title = (item.title || '').toLowerCase();
  const content = (item.content || '').toLowerCase();
  const combined = title + ' ' + content;

  // High priority: breaking, urgent, crisis keywords
  const breakingKeywords = ['khẩn cấp', 'breaking', 'nóng', 'sốc', 'scandal', 'phá sản', 'sụp đổ', 'bắt giữ', 'cảnh báo', 'cấm', 'thu hồi', 'đình chỉ'];
  if (breakingKeywords.some(k => combined.includes(k))) {
    return { type: 'breaking_news', priority: 'high' };
  }

  // Competitor moves: M&A, partnerships, launches
  const competitorKeywords = ['mua lại', 'sáp nhập', 'hợp tác', 'đối tác', 'ra mắt', 'tung ra', 'mở rộng', 'chiến lược', 'acquisition', 'merger', 'partnership', 'launch', 'expand'];
  if (competitorKeywords.some(k => combined.includes(k))) {
    return { type: 'competitor_move', priority: 'medium' };
  }

  // Market alerts: regulation, policy, economic
  const marketKeywords = ['chính sách', 'quy định', 'luật', 'thuế', 'lãi suất', 'gdp', 'tăng trưởng', 'regulation', 'policy', 'tax', 'inflation', 'thị trường'];
  if (marketKeywords.some(k => combined.includes(k))) {
    return { type: 'market_alert', priority: 'medium' };
  }

  return { type: 'breaking_news', priority: 'low' };
}

/** Convert a NewsItem to a VNotification */
function newsToNotification(item: NewsItem, companyName?: string): VNotification {
  const { type, priority } = classifyNews(item, companyName);
  return {
    id: generateId(),
    type,
    title: item.title.length > 80 ? item.title.slice(0, 77) + '...' : item.title,
    message: (item.content || 'Nhấn để xem chi tiết').slice(0, 120),
    timestamp: item.pubDate || new Date().toISOString(),
    read: false,
    link: item.link,
    source: item.source || 'Google News',
    priority,
    relatedEntity: companyName,
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function useNotifications(companyName?: string, competitors?: string[]) {
  const [notifications, setNotifications] = useState<VNotification[]>(() => loadState().notifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Sync unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Persist on change
  useEffect(() => {
    saveState({ notifications, lastFetchTimestamp: new Date().toISOString() });
  }, [notifications]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  /** Fetch live news and generate new notifications */
  const fetchAlerts = useCallback(async () => {
    if (!companyName && (!competitors || competitors.length === 0)) return;
    setIsLoading(true);
    try {
      const queries = [
        companyName,
        ...(competitors || []),
        companyName ? `${companyName} thị trường Việt Nam` : 'thị trường Việt Nam kinh tế',
      ].filter(Boolean) as string[];

      // Fetch news for all queries in parallel (max 3 to avoid rate limits)
      const batchQueries = queries.slice(0, 3);
      const results = await Promise.allSettled(
        batchQueries.map(q => getCompanyNews(q))
      );

      if (!isMountedRef.current) return;

      const existingTitles = new Set(notifications.map(n => n.title));
      const newNotifs: VNotification[] = [];

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          const entity = batchQueries[idx];
          // Take top 3 news per query
          result.value.slice(0, 3).forEach(item => {
            const truncTitle = item.title.length > 80 ? item.title.slice(0, 77) + '...' : item.title;
            if (!existingTitles.has(truncTitle)) {
              newNotifs.push(newsToNotification(item, entity));
              existingTitles.add(truncTitle);
            }
          });
        }
      });

      if (newNotifs.length > 0 && isMountedRef.current) {
        setNotifications(prev => {
          const merged = [...newNotifs, ...prev];
          return merged.slice(0, MAX_NOTIFICATIONS);
        });
      }
    } catch (err) {
      console.error('🔔 Notification fetch error:', err);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [companyName, competitors, notifications]);

  // Initial fetch + interval
  useEffect(() => {
    const state = loadState();
    const lastFetch = state.lastFetchTimestamp ? new Date(state.lastFetchTimestamp).getTime() : 0;
    const shouldFetch = Date.now() - lastFetch > FETCH_INTERVAL_MS;

    if (shouldFetch && (companyName || (competitors && competitors.length > 0))) {
      fetchAlerts();
    }

    // Set up periodic refresh
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) fetchAlerts();
    }, FETCH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [companyName]); // Only re-init on company change, not on every fetchAlerts change

  /** Mark a single notification as read */
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  /** Mark all as read */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  /** Remove a notification */
  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /** Clear all notifications */
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  /** Add a system notification manually */
  const addNotification = useCallback((notif: Omit<VNotification, 'id' | 'timestamp' | 'read'>) => {
    const full: VNotification = {
      ...notif,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [full, ...prev].slice(0, MAX_NOTIFICATIONS));
  }, []);

  /** Force refresh */
  const refresh = useCallback(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismiss,
    clearAll,
    addNotification,
    refresh,
  };
}
