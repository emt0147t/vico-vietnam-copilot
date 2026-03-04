
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    MessageCircle, X, Send, Trash2, Search, Newspaper,
    Swords, Brain, Sparkles, Copy, Check,
    Bot, User, Loader2, Minimize2, ArrowDown,
    RotateCcw
} from 'lucide-react';
import { chatService, type ChatMessage } from '../services/chatService';

// â”€â”€â”€ Quick Action Items â”€â”€â”€
const QUICK_ACTIONS = [
    { icon: Search, label: 'Find company', prompt: 'Search for information about VinFast', color: 'blue' },
    { icon: Newspaper, label: 'Latest news', prompt: 'Latest news about Vietnam market today', color: 'green' },
    { icon: Swords, label: 'Competitor analysis', prompt: 'Find competitors of FPT Software', color: 'orange' },
    { icon: Brain, label: 'Market insight', prompt: 'Top trends in Vietnam tech industry 2026', color: 'purple' },
    { icon: Sparkles, label: 'PESTEL Analysis', prompt: 'PESTEL analysis for Vietnam tech industry', color: 'indigo' },
    { icon: Brain, label: 'Macroeconomics', prompt: 'Vietnam macro overview: GDP, inflation, FDI', color: 'emerald' },
];

const TOOL_LABELS: Record<string, string> = {
    search_companies: 'ðŸ” Tra cá»©u cÃ´ng ty',
    get_latest_news: 'ðŸ“° TÃ¬m tin tá»©c',
    find_competitors: 'âš”ï¸ PhÃ¢n tÃ­ch Ä‘á»‘i thá»§',
    search_knowledge_base: 'ðŸ§  Tra cá»©u tri thá»©c',
    get_pestel_analysis: 'ðŸ›ï¸ PESTEL Analysis',
    get_vietnam_macro: 'ðŸ“Š Dá»¯ liá»‡u vÄ© mÃ´ VN',
    generate_customer_insights: 'ðŸ‘¤ Customer Insights',
    get_trade_data: 'ðŸ“¦ Dá»¯ liá»‡u thÆ°Æ¡ng máº¡i',
    get_industry_analytics: 'ðŸ“ˆ PhÃ¢n tÃ­ch ngÃ nh',
};

// â”€â”€â”€ Markdown Renderer â”€â”€â”€
function renderMarkdown(text: string): React.ReactNode {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listBuffer: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
        if (listBuffer.length > 0 && listType) {
            const Tag = listType;
            elements.push(
                <Tag key={`list-${elements.length}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} pl-5 my-2 space-y-1`}>
                    {listBuffer.map((item, i) => (
                        <li key={i} className="text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: processInline(item) }} />
                    ))}
                </Tag>
            );
            listBuffer = [];
            listType = null;
        }
    };

    const processInline = (line: string): string => {
        return line
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code class="bg-[#F4F4F5] px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
            flushList();
            continue;
        }

        // Headings
        if (trimmed.startsWith('### ')) {
            flushList();
            elements.push(<h4 key={`h-${i}`} className="font-bold text-sm mt-3 mb-1 text-[#18181B]" dangerouslySetInnerHTML={{ __html: processInline(trimmed.slice(4)) }} />);
            continue;
        }
        if (trimmed.startsWith('## ')) {
            flushList();
            elements.push(<h3 key={`h-${i}`} className="font-bold text-[15px] mt-3 mb-1 text-[#18181B]" dangerouslySetInnerHTML={{ __html: processInline(trimmed.slice(3)) }} />);
            continue;
        }

        // Unordered list
        if (/^[-*â€¢]\s/.test(trimmed)) {
            if (listType !== 'ul') flushList();
            listType = 'ul';
            listBuffer.push(trimmed.replace(/^[-*â€¢]\s/, ''));
            continue;
        }

        // Ordered list
        if (/^\d+\.\s/.test(trimmed)) {
            if (listType !== 'ol') flushList();
            listType = 'ol';
            listBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
            continue;
        }

        // Normal paragraph
        flushList();
        elements.push(
            <p key={`p-${i}`} className="text-[13px] leading-relaxed my-1" dangerouslySetInnerHTML={{ __html: processInline(trimmed) }} />
        );
    }
    flushList();
    return <>{elements}</>;
}

// â”€â”€â”€ Main Component â”€â”€â”€
export const VicoChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showScrollBtn, setShowScrollBtn] = useState<boolean>(false);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [hasInteracted, setHasInteracted] = useState<boolean>(false);
    const [activeTools, setActiveTools] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = useCallback((smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }, []);

    useEffect(() => {
        if (isOpen) scrollToBottom(false);
    }, [isOpen, scrollToBottom]);

    useEffect(() => {
        if (isOpen && messages.length > 0) {
            scrollToBottom();
            setUnreadCount(0);
        }
    }, [messages.length, isOpen, scrollToBottom]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Scroll detection for "scroll to bottom" button
    const handleScroll = useCallback(() => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        setShowScrollBtn(!isNearBottom);
    }, []);

    // Send message
    const handleSend = useCallback(async (text?: string) => {
        const messageText = (text || input).trim();
        if (!messageText || isLoading) return;

        setInput('');
        setHasInteracted(true);
        setIsLoading(true);
        setActiveTools([]);

        // Add user message immediately
        const userMsg: ChatMessage = {
            id: `u_${Date.now()}`,
            role: 'user',
            content: messageText,
            timestamp: Date.now(),
        };
        setMessages((prev: ChatMessage[]) => [...prev, userMsg]);

        try {
            const result = await chatService.sendMessage(messageText);
            // Show which tools were used
            if (result.toolsUsed?.length) setActiveTools(result.toolsUsed);
            setMessages(chatService.getHistory().filter(m => !m.isLoading));

            // If chat is closed, increment unread
            if (!isOpen) {
                setUnreadCount((prev: number) => prev + 1);
            }
        } catch {
            setMessages(chatService.getHistory().filter(m => !m.isLoading));
        } finally {
            setIsLoading(false);
            setTimeout(() => setActiveTools([]), 3000);
        }
    }, [input, isLoading, isOpen]);

    // Retry last failed message
    const handleRetry = useCallback(() => {
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
        if (!lastUserMsg) return;
        // Remove the error response
        const lastAssistant = messages[messages.length - 1];
        if (lastAssistant?.role === 'assistant' && lastAssistant.content.includes('âš ï¸')) {
            chatService.clearHistory();
            // Re-add all messages except the last assistant error
            const cleaned = messages.slice(0, -1);
            cleaned.forEach(m => {
                (chatService as any).history = [...(chatService as any).history || [], m];
            });
            setMessages(cleaned);
        }
        handleSend(lastUserMsg.content);
    }, [messages, handleSend]);

    // Handle Enter key (Shift+Enter for newline)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Copy message content
    const handleCopy = async (msg: ChatMessage) => {
        try {
            await navigator.clipboard.writeText(msg.content);
            setCopiedId(msg.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch { /* clipboard may not be available */ }
    };

    // Clear chat
    const handleClear = () => {
        chatService.clearHistory();
        setMessages([]);
        setHasInteracted(false);
    };

    // Toggle open
    const toggleOpen = () => {
        setIsOpen((prev: boolean) => !prev);
        if (!isOpen) setUnreadCount(0);
    };

    // Quick action
    const handleQuickAction = (prompt: string) => {
        handleSend(prompt);
    };

    // Auto-resize textarea
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    };

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* â”€â”€â”€ Floating Button â”€â”€â”€ */}
            <button
                onClick={toggleOpen}
                className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group ${isOpen
                    ? 'bg-[#E4E4E7] rotate-0 scale-90'
                    : 'bg-gradient-to-br from-[#E11D48] to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-110 hover:shadow-[0_0_30px_rgba(185,28,28,0.4)]'
                    }`}
                aria-label={isOpen ? 'Close chat' : 'Open VICO AI Chat'}
            >
                {isOpen ? (
                    <X size={22} className="text-[#71717A]" />
                ) : (
                    <>
                        <MessageCircle size={24} className="text-white" />
                        {/* Pulse animation when haven't interacted */}
                        {!hasInteracted && (
                            <span className="absolute inset-0 rounded-full bg-[#E11D48] animate-ping opacity-30" />
                        )}
                    </>
                )}

                {/* Unread badge */}
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* â”€â”€â”€ Chat Panel â”€â”€â”€ */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-[9998] w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)]
                        bg-white border border-[#E4E4E7]
                        rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)]
                        flex flex-col overflow-hidden
                        animate-slide-up"
                    role="dialog"
                    aria-label="VICO AI Chat"
                >
                    {/* â”€â”€â”€ Header â”€â”€â”€ */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#E11D48] to-red-700 text-white flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h3 className="font-black text-sm tracking-tight leading-none">VICO AI</h3>
                                <p className="text-[10px] text-white/70 font-medium mt-0.5">Market Intelligence Assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleClear}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                aria-label="Clear conversation"
                                title="Clear conversation"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                aria-label="Minimize"
                                title="Minimize"
                            >
                                <Minimize2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* â”€â”€â”€ Messages Area â”€â”€â”€ */}
                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        {/* Welcome Screen */}
                        {!hasInteracted && messages.length === 0 && (
                            <div className="flex flex-col items-center text-center py-6 animate-fade-in">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#E11D48] to-red-700 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-red-900/20">
                                    <Bot size={32} className="text-white" />
                                </div>
                                <h4 className="text-lg font-black text-[#18181B] mb-1">Hello! ðŸ‘‹</h4>
                                <p className="text-xs text-[#71717A] max-w-[280px] leading-relaxed mb-6">
                                    I'm <strong className="text-[#E11D48]">VICO AI</strong> â€” your Vietnam market assistant. Ask me anything about companies, markets, competitors, or news.
                                </p>

                                {/* Quick Actions Grid */}
                                <div className="grid grid-cols-2 gap-2 w-full">
                                    {QUICK_ACTIONS.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuickAction(action.prompt)}
                                            disabled={isLoading}
                                            className="flex items-center gap-2.5 p-3 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl
                                                hover:bg-[#F4F4F5] hover:border-[#E4E4E7] 
                                                disabled:opacity-40 disabled:cursor-not-allowed
                                                transition-all text-left group"
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                                                ${action.color === 'blue' ? 'bg-blue-50 text-blue-500' : ''}
                                                ${action.color === 'green' ? 'bg-green-50 text-green-500' : ''}
                                                ${action.color === 'orange' ? 'bg-orange-50 text-orange-500' : ''}
                                                ${action.color === 'purple' ? 'bg-purple-50 text-purple-500' : ''}                                                ${action.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' : ''}
                                                ${action.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : ''}                                            `}>
                                                <action.icon size={16} />
                                            </div>
                                            <span className="text-[11px] font-bold text-[#18181B] group-hover:text-[#18181B] transition-colors leading-tight">
                                                {action.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message Bubbles */}
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`flex gap-2.5 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Avatar */}
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'user'
                                    ? 'bg-[#E11D48] text-white'
                                    : 'bg-[#F4F4F5] text-[#71717A]'
                                    }`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[82%] group relative ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    {/* Tool badges */}
                                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-1.5">
                                            {msg.toolsUsed.map((tool, i) => (
                                                <span key={i} className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-full">
                                                    {TOOL_LABELS[tool] || tool}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-[#E11D48] text-white rounded-tr-md'
                                        : 'bg-[#FAFAFA] text-[#18181B] border border-[#E4E4E7] rounded-tl-md'
                                        }`}>
                                        {msg.role === 'assistant' ? (
                                            <div className="prose-sm max-w-none">
                                                {renderMarkdown(msg.content)}
                                            </div>
                                        ) : (
                                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>

                                    {/* Footer: time + copy + retry */}
                                    <div className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[10px] text-[#A1A1AA]">{formatTime(msg.timestamp)}</span>
                                        {msg.role === 'assistant' && (
                                            <>
                                                <button
                                                    onClick={() => handleCopy(msg)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#F4F4F5] rounded"
                                                    aria-label="Copy"
                                                    title="Copy"
                                                >
                                                    {copiedId === msg.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-[#A1A1AA]" />}
                                                </button>
                                                {msg.content.includes('âš ï¸') && (
                                                    <button
                                                        onClick={handleRetry}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#FFF1F2] rounded flex items-center gap-1 text-[10px] text-[#E11D48] font-medium"
                                                        title="Thá»­ láº¡i"
                                                    >
                                                        <RotateCcw size={11} /> Thá»­ láº¡i
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex gap-2.5 animate-fade-in">
                                <div className="w-7 h-7 rounded-lg bg-[#F4F4F5] flex items-center justify-center flex-shrink-0">
                                    <Bot size={14} className="text-[#A1A1AA]" />
                                </div>
                                <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl rounded-tl-md px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-[#E11D48] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-[#E11D48] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-[#E11D48] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-[10px] text-[#71717A] font-medium ml-1">
                                            {activeTools.length > 0
                                                ? activeTools.map(t => TOOL_LABELS[t] || t).join(' â†’ ')
                                                : 'Äang xá»­ lÃ½...'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Scroll-to-bottom button */}
                    {showScrollBtn && (
                        <button
                            onClick={() => scrollToBottom()}
                            className="absolute bottom-[76px] left-1/2 -translate-x-1/2 bg-white border border-[#E4E4E7] shadow-lg rounded-full p-2 z-10 hover:bg-[#FAFAFA] transition-all animate-fade-in"
                            aria-label="Scroll down"
                        >
                            <ArrowDown size={16} className="text-[#71717A]" />
                        </button>
                    )}

                    {/* â”€â”€â”€ Input Area â”€â”€â”€ */}
                    <div className="flex-shrink-0 border-t border-[#E4E4E7] bg-white px-4 py-3">
                        {/* Quick action chips (visible after first interaction) */}
                        {hasInteracted && messages.length > 0 && !isLoading && (
                            <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-hide">
                                {QUICK_ACTIONS.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleQuickAction(action.prompt)}
                                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAFAFA] border border-[#E4E4E7] rounded-full text-[10px] font-bold text-[#71717A] hover:text-[#18181B] hover:border-[#E4E4E7] transition-all whitespace-nowrap flex-shrink-0"
                                    >
                                        <action.icon size={11} />
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask VICO AI anything..."
                                rows={1}
                                disabled={isLoading}
                                className="flex-1 resize-none bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-[13px] text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48]/50 transition-all disabled:opacity-50 max-h-[120px]"
                                style={{ scrollbarWidth: 'none' }}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 bg-[#E11D48] hover:bg-red-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg flex-shrink-0"
                                aria-label="Send message"
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                            </button>
                        </div>
                        <p className="text-[9px] text-[#A1A1AA] text-center mt-2 font-medium">
                            VICO AI may not be accurate. Please verify important information.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};
