/**
 * Premium HTML Export — Competitor Analysis Report
 *
 * Generates a beautifully styled, self-contained HTML file with:
 * - VICO Executive Crimson branding
 * - Professional print-ready layout
 * - Interactive table of contents
 * - Visual charts (CSS-based market share bars, growth/CSAT, quadrant map)
 * - Company cards, head-to-head table, tech stack, vulnerabilities
 * - Auto-date & metadata
 */

function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function timestamp(): string {
    return new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
}

function esc(s: unknown): string {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const ACCENT_COLORS = ['#E11D48', '#2563EB', '#059669', '#D97706', '#7C3AED'];

const QUADRANT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Leader: { bg: '#D1FAE5', text: '#065F46', border: '#BBF7D0' },
    Challenger: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
    Visionary: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    'Niche Player': { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' },
};

export interface CompetitorExportData {
    name: string;
    description?: string;
    intro?: string;
    sub_industry?: string;
    industry?: string;
    revenue?: string;
    headcount?: number;
    year?: number;
    total_funding?: string;
    website?: string;
    yoy_growth: string;
    csat_score: number;
    market_share_percentage: number;
    quadrant_position: string;
    products_new?: string;
    products?: string;
    tech_stack?: string[];
    target_audience?: string[];
    key_pain_points?: string[];
    recent_events?: string[];
    logoUrl?: string;
}

export function exportCompetitorReportHTML(companies: CompetitorExportData[]) {
    if (!companies || companies.length === 0) return;

    const generated = new Date().toLocaleString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const companyNames = companies.map(c => c.name.split('(')[0]?.trim() || c.name).join(' vs ');

    // ─── Build sections ───

    // 1. Company Overview Cards
    let cardsHtml = companies.map((c, idx) => {
        const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
        const qc = QUADRANT_COLORS[c.quadrant_position] || QUADRANT_COLORS['Leader']!;
        const shortN = c.name.split('(')[0]?.trim() || c.name;
        return `
        <div class="company-card" style="border-top: 4px solid ${color};">
            <div class="card-header">
                <div class="card-avatar" style="color:${color};border-color:${color};">${shortN.substring(0, 2).toUpperCase()}</div>
                <div>
                    <h3 style="font-size:16px;font-weight:800;color:#18181B;margin-bottom:2px;">${esc(shortN)}</h3>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <span class="badge" style="background:${qc.bg};color:${qc.text};border-color:${qc.border};">${esc(c.quadrant_position)}</span>
                        <span style="font-size:10px;color:#A1A1AA;">${esc(c.sub_industry || c.industry || 'Technology')}</span>
                    </div>
                </div>
            </div>
            <p style="font-size:12px;color:#71717A;line-height:1.6;margin-bottom:16px;">${esc(c.description || c.intro || '')}</p>
            <div class="mini-metrics">
                <div class="mini-metric">
                    <span class="mini-label">Revenue</span>
                    <span class="mini-value" style="color:${color};">${esc(c.revenue || 'N/A')}</span>
                </div>
                <div class="mini-metric">
                    <span class="mini-label">Headcount</span>
                    <span class="mini-value" style="color:${color};">${c.headcount ? c.headcount.toLocaleString() : 'N/A'}</span>
                </div>
                <div class="mini-metric">
                    <span class="mini-label">Growth</span>
                    <span class="mini-value" style="color:#059669;">${esc(c.yoy_growth)}</span>
                </div>
                <div class="mini-metric">
                    <span class="mini-label">CSAT</span>
                    <span class="mini-value" style="color:#E11D48;">${c.csat_score}/100</span>
                </div>
            </div>
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px;">
                <div style="font-size:12px;color:#71717A;">Market Share: <strong style="color:#18181B;">${c.market_share_percentage}%</strong></div>
                ${c.total_funding ? `<div style="font-size:12px;color:#71717A;">Funding: <strong style="color:#18181B;">${esc(c.total_funding)}</strong></div>` : ''}
                <div style="font-size:12px;color:#71717A;">Founded: <strong style="color:#18181B;">${c.year || 'N/A'}</strong></div>
                ${c.website ? `<div style="font-size:12px;color:#71717A;">Web: <strong style="color:#18181B;">${esc(c.website)}</strong></div>` : ''}
            </div>
        </div>`;
    }).join('');

    // 2. Head-to-Head Table
    const metrics = [
        { label: 'Revenue', render: (c: CompetitorExportData) => c.revenue || 'N/A' },
        { label: 'Headcount', render: (c: CompetitorExportData) => c.headcount ? c.headcount.toLocaleString() : 'N/A' },
        { label: 'Founded', render: (c: CompetitorExportData) => String(c.year || 'N/A') },
        { label: 'Total Funding', render: (c: CompetitorExportData) => c.total_funding || 'N/A' },
        { label: 'YoY Growth', render: (c: CompetitorExportData) => c.yoy_growth },
        { label: 'CSAT Score', render: (c: CompetitorExportData) => `${c.csat_score}/100` },
        { label: 'Market Share', render: (c: CompetitorExportData) => `${c.market_share_percentage}%` },
        { label: 'Quadrant', render: (c: CompetitorExportData) => c.quadrant_position },
        { label: 'Industry', render: (c: CompetitorExportData) => c.sub_industry || c.industry || 'Technology' },
        { label: 'Website', render: (c: CompetitorExportData) => c.website || 'N/A' },
    ];

    const tableHeaderCells = companies.map((c, idx) => {
        const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
        const shortN = c.name.split('(')[0]?.trim() || c.name;
        return `<th style="text-align:center;"><span style="color:${color};font-weight:700;">${esc(shortN)}</span></th>`;
    }).join('');

    const tableRows = metrics.map(m => {
        const cells = companies.map(c => `<td style="text-align:center;font-weight:600;">${esc(m.render(c))}</td>`).join('');
        return `<tr><td style="font-weight:700;color:#71717A;">${esc(m.label)}</td>${cells}</tr>`;
    }).join('');

    // 3. Market Share Bars
    const maxShare = Math.max(...companies.map(c => c.market_share_percentage), 1);
    const shareBars = [...companies].sort((a, b) => b.market_share_percentage - a.market_share_percentage).map((c) => {
        const origIdx = companies.indexOf(c);
        const color = ACCENT_COLORS[origIdx % ACCENT_COLORS.length];
        const pct = (c.market_share_percentage / maxShare) * 100;
        const shortN = c.name.split('(')[0]?.trim() || c.name;
        return `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <span style="width:120px;font-size:12px;font-weight:600;color:${color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(shortN)}</span>
            <div style="flex:1;height:20px;background:#F4F4F5;border-radius:10px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:${color};border-radius:10px;"></div>
            </div>
            <span style="width:50px;text-align:right;font-size:13px;font-weight:800;color:#18181B;">${c.market_share_percentage}%</span>
        </div>`;
    }).join('');

    // 4. Growth vs CSAT
    const maxGrowth = Math.max(...companies.map(c => parseFloat(c.yoy_growth.replace(/[^0-9.\-]/g, '')) || 0), 1);
    const growthCsatHtml = companies.map((c, idx) => {
        const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
        const growth = parseFloat(c.yoy_growth.replace(/[^0-9.\-]/g, '')) || 0;
        const growthPct = (growth / maxGrowth) * 100;
        const csatPct = (c.csat_score / 100) * 100;
        const shortN = c.name.split('(')[0]?.trim() || c.name;
        return `
        <div style="margin-bottom:16px;">
            <div style="font-size:13px;font-weight:700;color:${color};margin-bottom:8px;">${esc(shortN)}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="width:60px;font-size:10px;color:#A1A1AA;">Growth</span>
                <div style="flex:1;height:14px;background:#F4F4F5;border-radius:8px;overflow:hidden;">
                    <div style="width:${growthPct}%;height:100%;background:${color};border-radius:8px;"></div>
                </div>
                <span style="width:60px;text-align:right;font-size:12px;font-weight:700;color:#059669;">${esc(c.yoy_growth)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <span style="width:60px;font-size:10px;color:#A1A1AA;">CSAT</span>
                <div style="flex:1;height:14px;background:#F4F4F5;border-radius:8px;overflow:hidden;">
                    <div style="width:${csatPct}%;height:100%;background:#2563EB;border-radius:8px;"></div>
                </div>
                <span style="width:60px;text-align:right;font-size:12px;font-weight:700;color:#2563EB;">${c.csat_score}/100</span>
            </div>
        </div>`;
    }).join('');

    // 5. Product Portfolio
    const productHtml = companies.map((c, idx) => {
        const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
        const products = (c.products_new || c.products || '').split(',').map(p => p.trim()).filter(Boolean);
        const shortN = c.name.split('(')[0]?.trim() || c.name;
        return `
        <div class="product-col">
            <h4 style="font-size:13px;font-weight:700;color:${color};margin-bottom:10px;">🛒 ${esc(shortN)}</h4>
            ${products.slice(0, 8).map(p => `
                <div style="display:flex;align-items:start;gap:6px;margin-bottom:6px;">
                    <div style="width:6px;height:6px;border-radius:50%;background:${color};margin-top:5px;flex-shrink:0;"></div>
                    <span style="font-size:12px;color:#18181B;">${esc(p)}</span>
                </div>
            `).join('')}
            ${(c.target_audience && c.target_audience.length > 0) ? `
                <div style="margin-top:12px;padding-top:10px;border-top:1px solid #E4E4E7;">
                    <div style="font-size:10px;font-weight:700;color:#A1A1AA;text-transform:uppercase;margin-bottom:6px;">Target Audience</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">
                        ${c.target_audience.slice(0, 4).map(a => `<span style="display:inline-block;padding:2px 8px;border-radius:6px;background:#F4F4F5;border:1px solid #E4E4E7;font-size:10px;color:#18181B;">${esc(a)}</span>`).join('')}
                    </div>
                </div>` : ''}
        </div>`;
    }).join('');

    // 6. Tech Stack Matrix
    const allTechs = Array.from(new Set(companies.flatMap(c => c.tech_stack || []))).sort();
    const techRows = allTechs.map(tech => {
        const cells = companies.map((c, idx) => {
            const has = (c.tech_stack || []).some(t => t.toLowerCase() === tech.toLowerCase());
            const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            return `<td style="text-align:center;">${has ? `<span style="color:${color};font-weight:700;">✓</span>` : '<span style="color:#D4D4D8;">—</span>'}</td>`;
        }).join('');
        return `<tr><td style="font-size:12px;font-weight:500;color:#18181B;">${esc(tech)}</td>${cells}</tr>`;
    }).join('');

    // 7. Vulnerabilities
    const vulnHtml = companies.map((c, idx) => {
        const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
        const shortN = c.name.split('(')[0]?.trim() || c.name;
        return `
        <div class="vuln-col">
            <h4 style="font-size:13px;font-weight:700;color:${color};margin-bottom:10px;">⚠️ ${esc(shortN)}</h4>
            ${(c.key_pain_points || []).slice(0, 5).map(p => `
                <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:10px 14px;margin-bottom:6px;">
                    <span style="font-size:12px;color:#18181B;">${esc(p)}</span>
                </div>
            `).join('')}
        </div>`;
    }).join('');

    // 8. Recent Events
    const eventsHtml = companies.map((c, idx) => {
        const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
        const shortN = c.name.split('(')[0]?.trim() || c.name;
        return `
        <div class="event-col">
            <h4 style="font-size:13px;font-weight:700;color:${color};margin-bottom:10px;">🚀 ${esc(shortN)}</h4>
            ${(c.recent_events || []).slice(0, 5).map(e => `
                <div style="background:#FAFAFA;border:1px solid #E4E4E7;border-radius:8px;padding:10px 14px;margin-bottom:6px;">
                    <div style="display:flex;align-items:start;gap:6px;">
                        <div style="width:6px;height:6px;border-radius:50%;background:${color};margin-top:5px;flex-shrink:0;"></div>
                        <span style="font-size:12px;color:#18181B;">${esc(e)}</span>
                    </div>
                </div>
            `).join('')}
        </div>`;
    }).join('');

    // ─── Assemble full HTML ───
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VICO Competitor Analysis — ${esc(companyNames)}</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #FAFAFA;
        color: #18181B;
        line-height: 1.6;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    
    .page { max-width: 960px; margin: 0 auto; padding: 40px 32px; }
    
    /* Cover */
    .cover {
        background: linear-gradient(135deg, #E11D48 0%, #BE123C 50%, #991B1B 100%);
        border-radius: 16px;
        padding: 48px 40px;
        color: white;
        margin-bottom: 32px;
        position: relative;
        overflow: hidden;
    }
    .cover::before {
        content: '';
        position: absolute;
        top: -50px; right: -50px;
        width: 200px; height: 200px;
        border: 2px solid rgba(255,255,255,0.1);
        border-radius: 50%;
    }
    .cover-brand {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 4px;
        text-transform: uppercase;
        opacity: 0.7;
        margin-bottom: 16px;
    }
    .cover h1 {
        font-size: 30px;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 8px;
    }
    .cover-subtitle {
        font-size: 15px;
        opacity: 0.85;
        margin-bottom: 24px;
    }
    .cover-meta {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        font-size: 12px;
        opacity: 0.7;
    }
    
    /* TOC */
    .toc {
        background: white;
        border: 1px solid #E4E4E7;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 32px;
    }
    .toc h3 { font-size: 14px; font-weight: 700; color: #18181B; margin-bottom: 12px; }
    .toc-list {
        list-style: none;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
    .toc-list li a {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #71717A;
        text-decoration: none;
        padding: 8px 12px;
        border-radius: 8px;
        transition: all 0.15s;
    }
    .toc-list li a:hover { background: #FFF1F2; color: #E11D48; }
    .toc-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px; height: 22px;
        border-radius: 6px;
        background: #F4F4F5;
        color: #71717A;
        font-size: 11px;
        font-weight: 700;
    }
    
    /* Section */
    .section {
        background: white;
        border: 1px solid #E4E4E7;
        border-radius: 16px;
        padding: 32px;
        margin-bottom: 24px;
        page-break-inside: avoid;
    }
    .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #F4F4F5;
    }
    .section-icon {
        width: 40px; height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
    }
    .section-header h2 {
        font-size: 20px;
        font-weight: 800;
        color: #18181B;
    }
    
    /* Company cards */
    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
    }
    .company-card {
        background: #FAFAFA;
        border: 1px solid #E4E4E7;
        border-radius: 12px;
        padding: 20px;
    }
    .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
    }
    .card-avatar {
        width: 44px; height: 44px;
        border-radius: 10px;
        border: 2px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 800;
        background: white;
        flex-shrink: 0;
    }
    .badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        border: 1px solid;
    }
    .mini-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
    .mini-metric {
        background: white;
        border-radius: 8px;
        padding: 10px;
        text-align: center;
        border: 1px solid #E4E4E7;
    }
    .mini-label { display: block; font-size: 10px; color: #A1A1AA; }
    .mini-value { display: block; font-size: 18px; font-weight: 800; margin-top: 2px; }
    
    /* Data table */
    .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
    }
    .data-table th {
        text-align: left;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #A1A1AA;
        padding: 10px 14px;
        border-bottom: 2px solid #E4E4E7;
    }
    .data-table td {
        padding: 10px 14px;
        border-bottom: 1px solid #F4F4F5;
        vertical-align: middle;
        font-size: 13px;
    }
    .data-table tr:hover td { background: #FAFAFA; }
    
    /* Product / Vuln / Events columns  */
    .multi-col {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
    }
    
    /* Footer */
    .footer {
        text-align: center;
        padding: 32px 0;
        border-top: 2px solid #E4E4E7;
        margin-top: 32px;
    }
    .footer-brand { font-size: 14px; font-weight: 800; color: #E11D48; margin-bottom: 4px; }
    .footer-meta { font-size: 11px; color: #A1A1AA; }
    
    @media print {
        body { background: white; }
        .page { padding: 0; max-width: 100%; }
        .cover { break-after: page; }
        .section { break-inside: avoid; }
    }
</style>
</head>
<body>
<div class="page">
    <!-- Cover -->
    <div class="cover">
        <div class="cover-brand">VICO Intelligence</div>
        <h1>Competitor Analysis Report</h1>
        <div class="cover-subtitle">${esc(companyNames)}</div>
        <div class="cover-meta">
            <span>📅 ${generated}</span>
            <span>🏢 ${companies.length} companies compared</span>
            <span>📊 Vietnamese Tech Sector</span>
        </div>
    </div>
    
    <!-- TOC -->
    <div class="toc">
        <h3>📑 Table of Contents</h3>
        <ul class="toc-list">
            <li><a href="#overview"><span class="toc-num">1</span> Company Overview</a></li>
            <li><a href="#head2head"><span class="toc-num">2</span> Head-to-Head Comparison</a></li>
            <li><a href="#share"><span class="toc-num">3</span> Market Share</a></li>
            <li><a href="#growth"><span class="toc-num">4</span> Growth vs. CSAT</a></li>
            <li><a href="#products"><span class="toc-num">5</span> Product Portfolio</a></li>
            <li><a href="#tech"><span class="toc-num">6</span> Technology Stack</a></li>
            <li><a href="#events"><span class="toc-num">7</span> Recent Events</a></li>
            <li><a href="#vulns"><span class="toc-num">8</span> Vulnerabilities</a></li>
        </ul>
    </div>
    
    <!-- 1. Company Overview -->
    <div class="section" id="overview">
        <div class="section-header">
            <div class="section-icon" style="background:#FFF1F2;">🏢</div>
            <h2>Company Overview</h2>
        </div>
        <div class="cards-grid">
            ${cardsHtml}
        </div>
    </div>
    
    <!-- 2. Head-to-Head -->
    <div class="section" id="head2head">
        <div class="section-header">
            <div class="section-icon" style="background:#EDE9FE;">🏆</div>
            <h2>Head-to-Head Comparison</h2>
        </div>
        <table class="data-table">
            <thead><tr><th>Metric</th>${tableHeaderCells}</tr></thead>
            <tbody>${tableRows}</tbody>
        </table>
    </div>
    
    <!-- 3. Market Share -->
    <div class="section" id="share">
        <div class="section-header">
            <div class="section-icon" style="background:#DBEAFE;">📊</div>
            <h2>Market Share Comparison</h2>
        </div>
        ${shareBars}
    </div>
    
    <!-- 4. Growth vs CSAT -->
    <div class="section" id="growth">
        <div class="section-header">
            <div class="section-icon" style="background:#D1FAE5;">📈</div>
            <h2>Growth vs. Customer Satisfaction</h2>
        </div>
        ${growthCsatHtml}
        <div style="display:flex;gap:24px;justify-content:center;margin-top:16px;">
            <div style="display:flex;align-items:center;gap:6px;"><div style="width:12px;height:12px;border-radius:3px;background:#059669;"></div><span style="font-size:10px;color:#71717A;">YoY Growth</span></div>
            <div style="display:flex;align-items:center;gap:6px;"><div style="width:12px;height:12px;border-radius:3px;background:#2563EB;"></div><span style="font-size:10px;color:#71717A;">CSAT Score</span></div>
        </div>
    </div>

    <!-- 5. Products -->
    <div class="section" id="products">
        <div class="section-header">
            <div class="section-icon" style="background:#FFF7ED;">📦</div>
            <h2>Product & Service Portfolio</h2>
        </div>
        <div class="multi-col">
            ${productHtml}
        </div>
    </div>
    
    <!-- 6. Tech Stack -->
    <div class="section" id="tech">
        <div class="section-header">
            <div class="section-icon" style="background:#ECFEFF;">⚡</div>
            <h2>Technology Stack Comparison</h2>
        </div>
        <table class="data-table">
            <thead><tr><th>Technology</th>${companies.map((c, idx) => {
                const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                const shortN = c.name.split('(')[0]?.trim() || c.name;
                return `<th style="text-align:center;"><span style="color:${color};">${esc(shortN)}</span></th>`;
            }).join('')}</tr></thead>
            <tbody>${techRows}</tbody>
        </table>
    </div>
    
    <!-- 7. Recent Events -->
    <div class="section" id="events">
        <div class="section-header">
            <div class="section-icon" style="background:#FFF1F2;">🚀</div>
            <h2>Recent Events & Milestones</h2>
        </div>
        <div class="multi-col">
            ${eventsHtml}
        </div>
    </div>
    
    <!-- 8. Vulnerabilities -->
    <div class="section" id="vulns">
        <div class="section-header">
            <div class="section-icon" style="background:#FEF3C7;">🛡️</div>
            <h2>Competitive Vulnerabilities</h2>
        </div>
        <div class="multi-col">
            ${vulnHtml}
        </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <div class="footer-brand">VICO — Vietnam Copilot</div>
        <div class="footer-meta">
            Competitor Analysis Report • Generated ${generated}<br>
            ${companies.length} companies compared • Vietnamese Tech Sector Intelligence
        </div>
    </div>
</div>
</body>
</html>`;

    downloadFile(html, `VICO_Competitor_Report_${timestamp()}.html`, 'text/html');
}

/** Export competitor data as JSON */
export function exportCompetitorReportJSON(companies: CompetitorExportData[]) {
    if (!companies || companies.length === 0) return;
    const data = {
        reportType: 'Competitor Analysis',
        generatedAt: new Date().toISOString(),
        companiesCount: companies.length,
        companies: companies.map(c => ({
            name: c.name,
            industry: c.sub_industry || c.industry,
            quadrant: c.quadrant_position,
            marketShare: c.market_share_percentage,
            revenue: c.revenue,
            headcount: c.headcount,
            yoyGrowth: c.yoy_growth,
            csatScore: c.csat_score,
            founded: c.year,
            funding: c.total_funding,
            website: c.website,
            products: (c.products_new || c.products || '').split(',').map(p => p.trim()).filter(Boolean),
            techStack: c.tech_stack || [],
            targetAudience: c.target_audience || [],
            vulnerabilities: c.key_pain_points || [],
            recentEvents: c.recent_events || [],
        })),
    };
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `VICO_Competitor_Report_${timestamp()}.json`, 'application/json');
}

/** Export competitor data as plain text (enhanced from original) */
export function exportCompetitorReportTXT(companies: CompetitorExportData[]) {
    if (!companies || companies.length === 0) return;

    const lines: string[] = [];
    const add = (s: string) => lines.push(s);

    add('═══════════════════════════════════════════════════════════');
    add(`  VICO — COMPETITOR ANALYSIS REPORT`);
    add(`  ${companies.map(c => c.name.split('(')[0]?.trim()).join(' vs ')}`);
    add(`  Generated: ${new Date().toLocaleString('vi-VN')}`);
    add('═══════════════════════════════════════════════════════════');

    companies.forEach((c, idx) => {
        add('');
        add(`${'─'.repeat(55)}`);
        add(`  🏢 ${idx + 1}. ${c.name}`);
        add(`${'─'.repeat(55)}`);
        add(`  Quadrant:     ${c.quadrant_position}`);
        add(`  Industry:     ${c.sub_industry || c.industry || 'Technology'}`);
        add(`  Revenue:      ${c.revenue || 'N/A'}`);
        add(`  Headcount:    ${c.headcount ? c.headcount.toLocaleString() : 'N/A'}`);
        add(`  Founded:      ${c.year || 'N/A'}`);
        add(`  Funding:      ${c.total_funding || 'N/A'}`);
        add(`  YoY Growth:   ${c.yoy_growth}`);
        add(`  CSAT Score:   ${c.csat_score}/100`);
        add(`  Market Share: ${c.market_share_percentage}%`);
        add(`  Website:      ${c.website || 'N/A'}`);

        const products = (c.products_new || c.products || '').split(',').map(p => p.trim()).filter(Boolean);
        if (products.length > 0) {
            add('');
            add('  📦 Products:');
            products.slice(0, 8).forEach(p => add(`    • ${p}`));
        }

        if (c.tech_stack && c.tech_stack.length > 0) {
            add('');
            add('  ⚡ Tech Stack:');
            add(`    ${c.tech_stack.join(', ')}`);
        }

        if (c.key_pain_points && c.key_pain_points.length > 0) {
            add('');
            add('  ⚠️ Vulnerabilities:');
            c.key_pain_points.slice(0, 5).forEach(p => add(`    • ${p}`));
        }

        if (c.recent_events && c.recent_events.length > 0) {
            add('');
            add('  🚀 Recent Events:');
            c.recent_events.slice(0, 5).forEach(e => add(`    • ${e}`));
        }
    });

    add('');
    add('═══════════════════════════════════════════════════════════');
    add('  Exported by VICO — Vietnam Copilot');
    add('═══════════════════════════════════════════════════════════');

    const content = lines.join('\n');
    downloadFile(content, `VICO_Competitor_Report_${timestamp()}.txt`, 'text/plain');
}
