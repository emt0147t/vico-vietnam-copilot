/**
 * 🔔 Notification Center Component
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
  breaking_news: { icon: Newspaper, color: 'text-red-500', label: 'Tin nóng' },
  competitor_move: { icon: Swords, color: 'text-orange-500', label: 'Đối thủ' },
  market_alert: { icon: TrendingUp, color: 'text-blue-500', label: 'Thị trường' },
  system: { icon: Zap, color: 'text-purple-500', label: 'Hệ thống' },
  insight: { icon: AlertTriangle, color: 'text-emerald-500', label: 'Insights' },
};

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

function priorityBorder(priority: 'high' | 'medium' | 'low'): string {
  if (priority === 'high') return 'border-l-red-500';
  if (priority === 'medium') return 'border-l-amber-400';
  return 'border-l-gray-300 dark:border-l-gray-600';
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
          ? 'bg-white dark:bg-gray-900/50 opacity-70' 
          : 'bg-blue-50/50 dark:bg-blue-900/10'
        }
        hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer
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
              <span className="px-1 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 text-[8px] font-bold rounded uppercase">
                Khẩn
              </span>
            )}
            {!notif.read && (
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className={`text-xs leading-snug line-clamp-2 ${
            notif.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'
          }`}>
            {notif.title}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-gray-400">{timeAgo(notif.timestamp)}</span>
            {notif.source && (
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                {notif.source}
              </span>
            )}
            {notif.link && (
              <ExternalLink size={10} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* Actions (on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {!notif.read && (
            <button
              onClick={(e) => { e.stopPropagation(); onRead(notif.id); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Đánh dấu đã đọc"
            >
              <Check size={12} className="text-gray-500" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Xoá"
          >
            <X size={12} className="text-gray-400 hover:text-red-500" />
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
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        title="Thông báo"
      >
        <Bell size={20} className="text-gray-500 dark:text-gray-400" />
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
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-gray-900 bg-green-400 rounded-full animate-pulse" />
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
            className="absolute right-0 top-full mt-2 w-[380px] max-h-[520px] bg-white dark:bg-[#0F1623] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-[60] flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#0F1623]">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-gray-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                  title="Làm mới"
                >
                  <RefreshCw size={14} className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <CheckCheck size={14} className="text-gray-400" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Xoá tất cả"
                  >
                    <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto max-h-[360px] divide-y divide-gray-50 dark:divide-gray-800/50">
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
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                      <Bell size={24} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Cảnh báo tin tức và đối thủ sẽ xuất hiện ở đây
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {filtered.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <p className="text-[10px] text-gray-400 text-center">
                  Tự động cập nhật mỗi 5 phút từ Google News RSS
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
