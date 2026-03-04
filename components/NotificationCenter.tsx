/**
 * ðŸ”” Notification Center Component
 * Bell icon with badge + dropdown panel showing real-time alerts.
 * Breaking news, competitor moves, market alerts from Google News RSS.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, Check, CheckCheck, Trash2, RefreshCw,
  Newspaper, Swords, TrendingUp, Zap, ExternalLink, AlertTriangle
} from 'lucide-react';
import { VNotification, NotificationType } from '../hooks/useNotifications';

// ============================================================================
// TYPES
// ============================================================================

interface NotificationCenterProps {
  notifications: VNotification[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onRefresh: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; label: string }> = {
  breaking_news: { icon: Newspaper, color: 'text-red-500', label: 'Breaking News' },
  competitor_move: { icon: Swords, color: 'text-orange-500', label: 'Competitor' },
  market_alert: { icon: TrendingUp, color: 'text-blue-500', label: 'Market' },
  system: { icon: Zap, color: 'text-purple-500', label: 'System' },
  insight: { icon: AlertTriangle, color: 'text-emerald-500', label: 'Insights' },
};

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-US');
}

function priorityBorder(priority: 'high' | 'medium' | 'low'): string {
  if (priority === 'high') return 'border-l-red-500';
  if (priority === 'medium') return 'border-l-amber-400';
  return 'border-l-gray-300';
}

// ============================================================================
// SINGLE NOTIFICATION ITEM
// ============================================================================

const NotificationItem: React.FC<{
  notif: VNotification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}> = ({ notif, onRead, onDismiss }) => {
  const config = typeConfig[notif.type] || typeConfig.system;
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        relative group px-4 py-3 border-l-[3px] ${priorityBorder(notif.priority)}
        ${notif.read 
          ? 'bg-white opacity-70' 
          : 'bg-blue-50/50'
        }
        hover:bg-[#FAFAFA] transition-colors cursor-pointer
      `}
      onClick={() => {
        if (!notif.read) onRead(notif.id);
        if (notif.link) window.open(notif.link, '_blank', 'noopener,noreferrer');
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`mt-0.5 flex-shrink-0 ${config.color}`}>
          <IconComponent size={16} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[9px] font-bold uppercase tracking-wider ${config.color}`}>
              {config.label}
            </span>
            {notif.priority === 'high' && (
              <span className="px-1 py-0.5 bg-red-100 text-red-600 text-[8px] font-bold rounded uppercase">
                Urgent
              </span>
            )}
            {!notif.read && (
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className={`text-xs leading-snug line-clamp-2 ${
            notif.read ? 'text-[#71717A]' : 'text-[#18181B] font-medium'
          }`}>
            {notif.title}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-[#A1A1AA]">{timeAgo(notif.timestamp)}</span>
            {notif.source && (
              <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1">
                {notif.source}
              </span>
            )}
            {notif.link && (
              <ExternalLink size={10} className="text-[#A1A1AA]" />
            )}
          </div>
        </div>

        {/* Actions (on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {!notif.read && (
            <button
              onClick={(e) => { e.stopPropagation(); onRead(notif.id); }}
              className="p-1 hover:bg-[#E4E4E7] rounded transition-colors"
              title="Mark as read"
            >
              <Check size={12} className="text-[#71717A]" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="Delete"
          >
            <X size={12} className="text-[#A1A1AA] hover:text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// NOTIFICATION CENTER
// ============================================================================

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 hover:bg-[#F4F4F5] rounded-xl transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        title="Notifications"
      >
        <Bell size={20} className="text-[#71717A]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-sm"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
        {isLoading && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white bg-green-400 rounded-full animate-pulse" />
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-h-[520px] bg-white border border-[#E4E4E7] rounded-2xl shadow-2xl overflow-hidden z-[60] flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#E4E4E7] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-[#71717A]" />
                <h3 className="text-sm font-bold text-[#18181B]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="p-1.5 hover:bg-[#F4F4F5] rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw size={14} className={`text-[#A1A1AA] ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="p-1.5 hover:bg-[#F4F4F5] rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} className="text-[#A1A1AA]" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete all"
                  >
                    <Trash2 size={14} className="text-[#A1A1AA] hover:text-red-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-[#E4E4E7] flex gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-[#F4F4F5] text-[#18181B]'
                    : 'text-[#71717A] hover:bg-[#FAFAFA]'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-[#71717A] hover:bg-[#FAFAFA]'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto max-h-[360px] divide-y divide-gray-50">
              <AnimatePresence>
                {filtered.length > 0 ? (
                  filtered.map(notif => (
                    <NotificationItem
                      key={notif.id}
                      notif={notif}
                      onRead={onMarkAsRead}
                      onDismiss={onDismiss}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 px-6 text-center"
                  >
                    <div className="w-14 h-14 bg-[#F4F4F5] rounded-2xl flex items-center justify-center mb-4">
                      <Bell size={24} className="text-[#A1A1AA]" />
                    </div>
                    <p className="text-sm font-medium text-[#71717A] mb-1">
                      {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                    <p className="text-xs text-[#A1A1AA]">
                      News and competitor alerts will appear here
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {filtered.length > 0 && (
              <div className="px-4 py-2.5 border-t border-[#E4E4E7] bg-[#FAFAFA]">
                <p className="text-[10px] text-[#A1A1AA] text-center">
                  Auto-updates every 5 minutes from Google News RSS
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
