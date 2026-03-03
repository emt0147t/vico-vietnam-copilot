
import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Upload, Trash2, CheckCircle, Cpu, 
  Terminal, RefreshCw, Search, Eye, Newspaper,
  FileText, Sparkles, Loader2, Link as LinkIcon, Calendar,
  Building, Cloud, HardDrive
} from 'lucide-react';
import { RagService } from '../services/ragLayer';
import { loadFromDB, clearStore } from '../utils/db';
import { parseCSV } from '../utils/vectorUtils';
import { Badge } from './VicoUI';

export const DataPipeline: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ingest' | 'explorer' | 'logs'>('ingest');
    const [ingestMode, setIngestMode] = useState<'company' | 'news'>('company');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);
    const [status, setStatus] = useState<'idle' | 'review' | 'processing' | 'complete'>('idle');
    const [pendingData, setPendingData] = useState<any[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [vectors, setVectors] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isServerConnected, setIsServerConnected] = useState(false);

    useEffect(() => { 
        forceRefresh(); 
        checkServer();
    }, []);

    const checkServer = async () => {
        try {
            const res = await fetch('/api/health');
            if (res.ok) setIsServerConnected(true);
        } catch { setIsServerConnected(false); }
    };

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);

    const forceRefresh = async () => {
        setIsSyncing(true);
        try {
            const data = await loadFromDB('vectors');
            setVectors(data);
            addLog(`📡 Local DB: Found ${data.length} records.`);
        } catch (e: any) {
            addLog(`❌ Error: ${e.message}`);
        } finally { setIsSyncing(false); }
    };

    const processBatch = async (items: any[]) => {
        const testConn = await RagService.testConnection();
        if (!testConn.success) {
            addLog("⚠️ ERROR: API Connection failed.");
            return;
        }

        setStatus('processing');
        setTotalItems(items.length);
        setProcessedCount(0);
        addLog(`🚀 Starting to ingest ${items.length} records...`);
        addLog(isServerConnected ? "ℹ️ Mode: Cloud Sync (Server)" : "ℹ️ Mode: Local Storage (Browser)");
        
        const BATCH_SIZE = 5; 
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const chunk = items.slice(i, i + BATCH_SIZE);
            const validRecords: any[] = [];

            await Promise.all(chunk.map(async (item) => {
                try {
                    const normalizedItem: any = {};
                    Object.keys(item).forEach(key => { normalizedItem[key.toLowerCase().trim()] = item[key]; });

                    let combinedText = "";
                    let metadata: any = {};

                    if (ingestMode === 'news') {
                        const title = normalizedItem['title'] || normalizedItem['tiêu đề'] || "";
                        const content = normalizedItem['content'] || normalizedItem['nội dung'] || "";
                        const link = normalizedItem['link'] || normalizedItem['url'] || "";
                        combinedText = `News: ${title}. Content: ${content}`.trim();
                        metadata = {
                            title,
                            content,
                            link,
                            type: 'news_article',
                            date: normalizedItem['date'] || normalizedItem['ngày'] || new Date().toLocaleDateString('vi-VN')
                        };
                    } else {
                        const name = normalizedItem['company name'] || normalizedItem['name'] || normalizedItem['tên công ty'] || normalizedItem['tên'] || "N/A";
                        const intro = normalizedItem['new intro'] || normalizedItem['intro'] || normalizedItem['giới thiệu mới'] || normalizedItem['giới thiệu'] || "";
                        const prods = normalizedItem['new products/services'] || normalizedItem['products/services'] || normalizedItem['sản phẩm dịch vụ mới'] || normalizedItem['sản phẩm/dịch vụ'] || "";
                        combinedText = `Company: ${name}. Description: ${intro}. Products: ${prods}`.trim();
                        metadata = {
                            title: name,
                            intro_new: intro,
                            products_new: prods,
                            type: 'company_profile',
                            size: normalizedItem['headcount'] || normalizedItem['quy mô nhân sự'] || "N/A",
                            year: normalizedItem['founded year'] || normalizedItem['năm thành lập'] || "N/A"
                        };
                    }

                    if (combinedText.length > 10) {
                        // If using server, we send raw text and let server embed. 
                        // But current RagService.embedText is client-side unless modified deeply.
                        // We will rely on RagService.insertVectorBatch to handle the routing.
                        validRecords.push({
                            id: `vico_${ingestMode}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            text: combinedText,
                            metadata
                        });
                    }
                } catch (e) { console.error(e); }
            }));

            if (validRecords.length > 0) await RagService.insertVectorBatch(validRecords);
            setProcessedCount(prev => Math.min(prev + BATCH_SIZE, items.length));
            setProgress(Math.round(((i + BATCH_SIZE) / items.length) * 100));
            if (i + BATCH_SIZE < items.length) await new Promise(r => setTimeout(r, 2000));
        }

        setStatus('complete');
        addLog(`✅ Complete.`);
        forceRefresh();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = parseCSV(e.target?.result as string);
                setPendingData(data);
                setStatus('review');
                addLog(`🔍 Detected ${data.length} data rows.`);
            } catch (err: any) { addLog(`❌ CSV Error: ${err.message}`); }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
            <div className="flex bg-white p-10 rounded-[2.5rem] border shadow-xl justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-[#18181B] uppercase tracking-tighter flex items-center gap-3">
                        <Database className="text-[#E11D48]" /> Knowledge Pipeline
                    </h2>
                    <p className="text-[#71717A] font-bold uppercase tracking-widest text-[10px] mt-2">Strategic Knowledge Base Management</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border ${isServerConnected ? 'bg-green-50 text-green-600 border-green-200' : 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]'}`}>
                        {isServerConnected ? <Cloud size={14} /> : <HardDrive size={14} />}
                        {isServerConnected ? "Cloud Database Connected" : "Local Browser Storage"}
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="bg-[#F4F4F5] p-1.5 rounded-2xl flex border">
                    <button onClick={() => setActiveTab('ingest')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ingest' ? 'bg-[#E11D48] text-white shadow-lg' : 'text-[#A1A1AA]'}`}><Upload size={14}/> Ingest Data</button>
                    <button onClick={() => setActiveTab('explorer')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'explorer' ? 'bg-[#E11D48] text-white shadow-lg' : 'text-[#A1A1AA]'}`}><Eye size={14}/> Explorer</button>
                    <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-[#E11D48] text-white shadow-lg' : 'text-[#A1A1AA]'}`}><Terminal size={14}/> Logs</button>
                </div>
            </div>

            {activeTab === 'ingest' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex gap-4 mb-4">
                            <button onClick={() => setIngestMode('company')} className={`flex-1 py-4 rounded-2xl border-2 font-black uppercase text-xs tracking-widest transition-all ${ingestMode === 'company' ? 'border-[#E11D48] bg-red-50 text-[#E11D48]' : 'border-transparent bg-white text-[#A1A1AA]'}`}>
                                Companies
                            </button>
                            <button onClick={() => setIngestMode('news')} className={`flex-1 py-4 rounded-2xl border-2 font-black uppercase text-xs tracking-widest transition-all ${ingestMode === 'news' ? 'border-[#E11D48] bg-red-50 text-[#E11D48]' : 'border-transparent bg-white text-[#A1A1AA]'}`}>
                                News
                            </button>
                        </div>

                        {status === 'review' ? (
                            <div className="bg-white border-2 border-[#E11D48] rounded-[2.5rem] p-12 text-center">
                                <CheckCircle className="mx-auto text-green-500 mb-6" size={60} />
                                <h3 className="text-2xl font-black uppercase mb-2">Data Ready</h3>
                                <p className="text-[#71717A] text-sm mb-10">Received {pendingData.length} records.</p>
                                <div className="flex gap-4">
                                    <button onClick={() => setStatus('idle')} className="flex-1 py-4 border border-[#E4E4E7] rounded-2xl font-black uppercase text-[10px] text-[#A1A1AA]">Cancel</button>
                                    <button onClick={() => processBatch(pendingData)} className="flex-[2] py-4 bg-[#E11D48] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Start Vectorize</button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-[#E4E4E7] rounded-[3rem] p-24 text-center group hover:border-[#E11D48] transition-all relative">
                                {ingestMode === 'news' ? <Newspaper size={80} className="mx-auto text-[#A1A1AA] mb-8" /> : <Database size={80} className="mx-auto text-[#A1A1AA] mb-8" />}
                                <h3 className="text-2xl font-black uppercase mb-4">Ingest CSV {ingestMode === 'news' ? 'News' : 'Companies'}</h3>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".csv" />
                                <button onClick={() => fileInputRef.current?.click()} className="px-12 py-4 bg-[#E11D48] text-white font-black uppercase rounded-2xl shadow-xl text-xs tracking-widest">Choose .csv file</button>
                                
                                {status === 'processing' && (
                                    <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center rounded-[3rem]">
                                        <Loader2 className="animate-spin text-[#E11D48] mb-6" size={48} />
                                        <div className="text-2xl font-black">{progress}%</div>
                                        <div className="text-[10px] font-black uppercase text-[#A1A1AA] mt-2">Processing Batch...</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="bg-[#FAFAFA] rounded-[2.5rem] p-8 border border-[#E4E4E7] h-[450px] flex flex-col">
                        <div className="flex items-center justify-between mb-6 text-[10px] font-black uppercase text-[#71717A] tracking-widest">
                            <span className="flex items-center gap-2"><Terminal size={14}/> System Logs</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-[10px] font-mono text-green-500/80">
                            {logs.map((l, i) => <div key={i} className="border-l border-green-900/30 pl-3">{'>'} {l}</div>)}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'explorer' && (
                <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b bg-[#FAFAFA]/50 flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={18} />
                            <input 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                placeholder="Search vectors..." 
                                className="w-full pl-12 pr-4 py-3 bg-white border rounded-xl outline-none font-bold text-sm" 
                            />
                        </div>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                        {isServerConnected && <div className="p-4 bg-blue-50 text-blue-600 text-xs font-bold text-center">Connected to Cloud Database. Viewing Local Cache Only.</div>}
                        <table className="w-full text-left">
                            <thead className="bg-[#FAFAFA] text-[10px] font-black uppercase text-[#A1A1AA] sticky top-0 z-10">
                                <tr>
                                    <th className="px-10 py-5">Type</th>
                                    <th className="px-10 py-5">Content</th>
                                    <th className="px-10 py-5">Meta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {vectors.filter(v => v.metadata.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(v => (
                                    <tr key={v.id} className="hover:bg-[#FAFAFA]">
                                        <td className="px-10 py-8">
                                            <Badge variant={v.metadata.type === 'news_article' ? 'info' : 'danger'}>{v.metadata.type}</Badge>
                                        </td>
                                        <td className="px-10 py-8 text-[11px] text-[#71717A] line-clamp-2 max-w-md">{v.text}</td>
                                        <td className="px-10 py-8 text-[10px] font-bold">{v.metadata.title}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
