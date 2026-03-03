/**
 * Premium HTML Export — Market & Industry Report
 * 
 * Generates a beautifully styled, self-contained HTML file with:
 * - VICO Executive Crimson branding
 * - Professional print-ready layout
 * - Interactive table of contents
 * - Visual charts representation (CSS-based)
 * - All data sections rendered
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

export function exportMarketReportHTML(report: any, companyName?: string) {
    if (!report) return;

    const industry = esc(report.industry || 'N/A');
    const market = esc(report.market || 'Vietnam');
    const generated = new Date(report.generatedAt).toLocaleString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const impactBadge = (impact: string) => {
        const colors: Record<string, string> = {
            High: 'background:#FEE2E2;color:#991B1B;',
            Medium: 'background:#FEF3C7;color:#92400E;',
            Low: 'background:#D1FAE5;color:#065F46;',
        };
        return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:10px;font-weight:700;${colors[impact] || 'background:#F4F4F5;color:#71717A;'}">${esc(impact)}</span>`;
    };

    const scoreDots = (score: number, max = 5) => {
        let html = '';
        for (let i = 1; i <= max; i++) {
            html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:3px;${i <= score ? 'background:#E11D48;' : 'background:#E4E4E7;'}"></span>`;
        }
        return html;
    };

    const barChart = (value: number, maxVal: number, color: string, label: string) => {
        const pct = Math.min(100, (value / maxVal) * 100);
        return `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <span style="width:140px;font-size:12px;color:#3F3F46;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(label)}</span>
                <div style="flex:1;height:14px;background:#F4F4F5;border-radius:8px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:${color};border-radius:8px;transition:width 0.3s;"></div>
                </div>
                <span style="width:50px;text-align:right;font-size:12px;font-weight:700;color:#18181B;">${value}%</span>
            </div>
        `;
    };

    // Build HTML sections
    let sectionsHtml = '';

    // ─── Executive Summary ───
    if (report.executiveSummary) {
        const es = report.executiveSummary;
        sectionsHtml += `
        <div class="section" id="exec-summary">
            <div class="section-header">
                <div class="section-icon" style="background:#FFF1F2;">📋</div>
                <h2>Executive Summary</h2>
            </div>
            <p style="color:#71717A;line-height:1.8;margin-bottom:20px;">${esc(es.overview)}</p>
            
            <div class="metric-grid">
                <div class="metric-card" style="border-left:4px solid #E11D48;">
                    <div class="metric-label">Market Size (SAM)</div>
                    <div class="metric-value" style="color:#E11D48;">${esc(report.marketSize?.sam)}</div>
                </div>
                <div class="metric-card" style="border-left:4px solid #059669;">
                    <div class="metric-label">CAGR</div>
                    <div class="metric-value" style="color:#059669;">${report.marketSize?.cagr || 0}%</div>
                </div>
                <div class="metric-card" style="border-left:4px solid #7C3AED;">
                    <div class="metric-label">Total Funding</div>
                    <div class="metric-value" style="color:#7C3AED;">${esc(report.funding?.totalValue)}</div>
                </div>
                <div class="metric-card" style="border-left:4px solid #D97706;">
                    <div class="metric-label">Industry Players</div>
                    <div class="metric-value" style="color:#D97706;">${(report.companyCount || 0).toLocaleString()}</div>
                </div>
            </div>
            
            ${es.keyInsights?.length ? `
            <div class="insight-box">
                <h4 style="font-size:13px;font-weight:700;color:#18181B;margin-bottom:12px;">💡 Key Insights</h4>
                ${es.keyInsights.map((i: string) => `<div class="insight-item">✓ ${esc(i)}</div>`).join('')}
            </div>` : ''}
            
            ${es.recommendations?.length ? `
            <div class="rec-box">
                <h4 style="font-size:13px;font-weight:700;color:#18181B;margin-bottom:12px;">🎯 Strategic Recommendations</h4>
                ${es.recommendations.map((r: string, idx: number) => `
                    <div class="rec-item">
                        <div class="rec-num">${idx + 1}</div>
                        <span>${esc(r)}</span>
                    </div>
                `).join('')}
            </div>` : ''}
        </div>`;
    }

    // ─── Market Size ───
    if (report.marketSize) {
        const ms = report.marketSize;
        sectionsHtml += `
        <div class="section" id="market-size">
            <div class="section-header">
                <div class="section-icon" style="background:#D1FAE5;">📊</div>
                <h2>Market Size & Forecast</h2>
            </div>
            
            <div class="funnel">
                <div class="funnel-layer" style="width:100%;background:linear-gradient(135deg,#E11D48,#BE123C);">
                    <span class="funnel-label">TAM — Total Addressable Market</span>
                    <span class="funnel-value">${esc(ms.tam)}</span>
                </div>
                <div class="funnel-layer" style="width:80%;background:linear-gradient(135deg,#F97316,#EA580C);">
                    <span class="funnel-label">SAM — Serviceable Available Market</span>
                    <span class="funnel-value">${esc(ms.sam)}</span>
                </div>
                <div class="funnel-layer" style="width:60%;background:linear-gradient(135deg,#059669,#047857);">
                    <span class="funnel-label">SOM — Serviceable Obtainable Market</span>
                    <span class="funnel-value">${esc(ms.som)}</span>
                </div>
            </div>
            
            <div class="metric-grid" style="margin-top:24px;">
                <div class="metric-card" style="border-left:4px solid #059669;">
                    <div class="metric-label">CAGR (${esc(ms.cagrPeriod)})</div>
                    <div class="metric-value" style="color:#059669;">${ms.cagr}%</div>
                </div>
                <div class="metric-card" style="border-left:4px solid #E11D48;">
                    <div class="metric-label">Current Size</div>
                    <div class="metric-value" style="color:#E11D48;">$${(ms.currentSize || 0).toFixed(1)}B</div>
                </div>
                <div class="metric-card" style="border-left:4px solid #7C3AED;">
                    <div class="metric-label">Forecast (5Y)</div>
                    <div class="metric-value" style="color:#7C3AED;">$${(ms.forecastSize || 0).toFixed(1)}B</div>
                </div>
            </div>
            
            ${ms.revenueHistory?.length ? `
            <h4 style="font-size:13px;font-weight:700;color:#18181B;margin:24px 0 12px;">Revenue Forecast (USD Billion)</h4>
            <div style="display:flex;align-items:flex-end;gap:12px;height:200px;padding:16px;background:#FAFAFA;border-radius:12px;">
                ${ms.revenueHistory.map((v: number, i: number) => {
                    const max = Math.max(...ms.revenueHistory);
                    const pct = (v / max) * 100;
                    const isCurrent = i === 3;
                    const isHistorical = i < 3;
                    const color = isCurrent ? 'linear-gradient(to top,#2563EB,#60A5FA)' : isHistorical ? '#D4D4D8' : 'linear-gradient(to top,#059669,#34D399)';
                    return `
                        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">
                            <span style="font-size:11px;font-weight:700;color:#18181B;">$${v.toFixed(1)}B</span>
                            <div style="width:100%;height:${pct}%;min-height:16px;background:${color};border-radius:6px 6px 0 0;"></div>
                            <span style="font-size:10px;color:${isCurrent ? '#E11D48' : '#71717A'};font-weight:${isCurrent ? '700' : '400'};">${esc(ms.years?.[i] || '')}</span>
                        </div>
                    `;
                }).join('')}
            </div>` : ''}
            
            ${ms.methodology ? `<p style="font-size:11px;color:#A1A1AA;margin-top:12px;font-style:italic;">Methodology: ${esc(ms.methodology)}</p>` : ''}
        </div>`;
    }

    // ─── Market Dynamics ───
    if (report.marketDynamics) {
        const md = report.marketDynamics;
        const renderDynamicsList = (items: any[], title: string, emoji: string, color: string) => {
            if (!items?.length) return '';
            return `
                <div class="dynamics-group">
                    <h4 style="font-size:13px;font-weight:700;color:${color};margin-bottom:12px;">${emoji} ${esc(title)} (${items.length})</h4>
                    ${items.map((item: any) => `
                        <div class="dynamics-item">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                                <strong style="font-size:13px;color:#18181B;">${esc(item.title)}</strong>
                                ${impactBadge(item.impact)}
                            </div>
                            <p style="font-size:12px;color:#71717A;line-height:1.6;">${esc(item.description)}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        };

        sectionsHtml += `
        <div class="section" id="dynamics">
            <div class="section-header">
                <div class="section-icon" style="background:#FEF3C7;">⚡</div>
                <h2>Market Dynamics</h2>
            </div>
            <div class="dynamics-grid">
                ${renderDynamicsList(md.drivers, 'Growth Drivers', '🚀', '#059669')}
                ${renderDynamicsList(md.restraints, 'Restraints & Challenges', '⚠️', '#991B1B')}
                ${renderDynamicsList(md.trends, 'Emerging Trends', '💡', '#7C3AED')}
            </div>
        </div>`;
    }

    // ─── Competitive Landscape ───
    if (report.competitiveLandscape) {
        const cl = report.competitiveLandscape;
        const shareColors = ['#E11D48', '#F97316', '#059669', '#D97706', '#7C3AED', '#A1A1AA'];
        const maxShare = Math.max(...(cl.marketShare?.map((c: any) => c.share) || [1]));

        sectionsHtml += `
        <div class="section" id="landscape">
            <div class="section-header">
                <div class="section-icon" style="background:#EDE9FE;">🏢</div>
                <h2>Competitive Landscape</h2>
            </div>
            
            ${cl.marketShare?.length ? `
            <h4 style="font-size:13px;font-weight:700;color:#18181B;margin-bottom:16px;">Market Share Distribution</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width:30%">Company</th>
                        <th style="width:35%">Market Share</th>
                        <th>Growth</th>
                        <th>Position</th>
                    </tr>
                </thead>
                <tbody>
                    ${cl.marketShare.map((c: any, i: number) => `
                        <tr>
                            <td>
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <div style="width:10px;height:10px;border-radius:50%;background:${shareColors[i % shareColors.length]};"></div>
                                    <strong>${esc(c.name)}</strong>
                                </div>
                            </td>
                            <td>
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <div style="flex:1;height:8px;background:#F4F4F5;border-radius:4px;overflow:hidden;">
                                        <div style="width:${(c.share / maxShare) * 100}%;height:100%;background:${shareColors[i % shareColors.length]};border-radius:4px;"></div>
                                    </div>
                                    <span style="font-weight:700;min-width:40px;text-align:right;">${c.share}%</span>
                                </div>
                            </td>
                            <td style="color:#059669;font-weight:600;">+${c.growth}%</td>
                            <td>${impactBadge(c.type)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>` : ''}
            
            ${cl.concentration ? `
            <div style="margin-top:24px;display:flex;gap:16px;flex-wrap:wrap;">
                <div class="metric-card" style="flex:1;min-width:140px;border-left:4px solid #D97706;text-align:center;">
                    <div class="metric-label">HHI Index</div>
                    <div class="metric-value" style="color:#D97706;">${cl.concentration.hhi}</div>
                </div>
                <div class="metric-card" style="flex:1;min-width:140px;border-left:4px solid #7C3AED;text-align:center;">
                    <div class="metric-label">CR4 (Top 4)</div>
                    <div class="metric-value" style="color:#7C3AED;">${cl.concentration.cr4}%</div>
                </div>
                <div class="metric-card" style="flex:1;min-width:140px;border-left:4px solid #18181B;text-align:center;">
                    <div class="metric-label">Concentration</div>
                    <div class="metric-value" style="color:#18181B;">${esc(cl.concentration.level)}</div>
                </div>
            </div>
            <p style="font-size:12px;color:#71717A;margin-top:12px;">${esc(cl.concentration.description)}</p>
            ` : ''}
        </div>`;
    }

    // ─── Porter's Five Forces ───
    if (report.portersForces) {
        const pf = report.portersForces;
        const forces = [
            { name: 'Supplier Power', key: 'supplierPower' },
            { name: 'Buyer Power', key: 'buyerPower' },
            { name: 'Threat of New Entrants', key: 'newEntrants' },
            { name: 'Threat of Substitutes', key: 'substitutes' },
            { name: 'Competitive Rivalry', key: 'rivalry' },
        ];

        sectionsHtml += `
        <div class="section" id="porters">
            <div class="section-header">
                <div class="section-icon" style="background:#DBEAFE;">🔬</div>
                <h2>Porter's Five Forces</h2>
            </div>
            <div class="forces-grid">
                ${forces.map(f => {
                    const data = (pf as any)[f.key];
                    if (!data) return '';
                    const scoreColor = data.score >= 4 ? '#991B1B' : data.score >= 3 ? '#D97706' : '#059669';
                    return `
                        <div class="force-card">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <strong style="font-size:13px;color:#18181B;">${esc(f.name)}</strong>
                                <span style="font-size:16px;font-weight:800;color:${scoreColor};">${data.score}/5</span>
                            </div>
                            <div style="margin-bottom:8px;">${scoreDots(data.score)}</div>
                            <p style="font-size:11px;color:#71717A;line-height:1.5;">${esc(data.description)}</p>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>`;
    }

    // ─── Deals & Investments ───
    if (report.funding) {
        const fd = report.funding;
        sectionsHtml += `
        <div class="section" id="deals">
            <div class="section-header">
                <div class="section-icon" style="background:#D1FAE5;">💰</div>
                <h2>Deals & Investments</h2>
            </div>
            
            <div class="metric-grid">
                <div class="metric-card" style="border-left:4px solid #059669;">
                    <div class="metric-label">Total Funding</div>
                    <div class="metric-value" style="color:#059669;">${esc(fd.totalValue)}</div>
                </div>
                <div class="metric-card" style="border-left:4px solid #E11D48;">
                    <div class="metric-label">Total Deals</div>
                    <div class="metric-value" style="color:#E11D48;">${fd.totalDeals}</div>
                </div>
                <div class="metric-card" style="border-left:4px solid #7C3AED;">
                    <div class="metric-label">YoY Growth</div>
                    <div class="metric-value" style="color:#7C3AED;">+${fd.yoyGrowth}%</div>
                </div>
                <div class="metric-card" style="border-left:4px solid #D97706;">
                    <div class="metric-label">Avg Deal Size</div>
                    <div class="metric-value" style="color:#D97706;">${esc(fd.avgDealSize)}</div>
                </div>
            </div>
            
            ${fd.topSectors?.length ? `
            <h4 style="font-size:13px;font-weight:700;color:#18181B;margin:24px 0 12px;">Funding by Sector</h4>
            ${fd.topSectors.map((s: any) => barChart(s.percentage, 100, '#E11D48', s.name)).join('')}
            ` : ''}
            
            ${fd.recentDeals?.length ? `
            <h4 style="font-size:13px;font-weight:700;color:#18181B;margin:24px 0 12px;">Recent Notable Deals</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Deal</th>
                        <th>Parties</th>
                        <th>Value</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${fd.recentDeals.map((d: any) => `
                        <tr>
                            <td>${impactBadge(d.type)}</td>
                            <td><strong>${esc(d.title)}</strong></td>
                            <td style="font-size:12px;color:#71717A;">${esc(d.parties)}</td>
                            <td style="font-weight:700;color:#059669;">${esc(d.value)}</td>
                            <td style="font-size:12px;color:#A1A1AA;">${esc(d.date)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>` : ''}
        </div>`;
    }

    // ─── Assemble full HTML ───
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VICO Market Report — ${industry}</title>
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
    
    .page {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px 32px;
    }
    
    /* Cover Header */
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
    .cover::after {
        content: '';
        position: absolute;
        bottom: -30px; left: 50%;
        width: 300px; height: 300px;
        border: 2px solid rgba(255,255,255,0.06);
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
        font-size: 32px;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 8px;
    }
    .cover-subtitle {
        font-size: 16px;
        opacity: 0.85;
        margin-bottom: 24px;
    }
    .cover-meta {
        display: flex;
        gap: 24px;
        font-size: 12px;
        opacity: 0.7;
    }
    
    /* Table of Contents */
    .toc {
        background: white;
        border: 1px solid #E4E4E7;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 32px;
    }
    .toc h3 {
        font-size: 14px;
        font-weight: 700;
        color: #18181B;
        margin-bottom: 12px;
    }
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
    .toc-list li a:hover {
        background: #FFF1F2;
        color: #E11D48;
    }
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
    
    /* Sections */
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
    
    /* Metric cards */
    .metric-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
    }
    .metric-card {
        background: #FAFAFA;
        border-radius: 12px;
        padding: 16px 20px;
    }
    .metric-label {
        font-size: 11px;
        font-weight: 600;
        color: #A1A1AA;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
    }
    .metric-value {
        font-size: 24px;
        font-weight: 800;
        line-height: 1.2;
    }
    
    /* Funnel */
    .funnel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 20px 0;
    }
    .funnel-layer {
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        color: white;
    }
    .funnel-layer:first-child { border-radius: 24px 24px 12px 12px; }
    .funnel-layer:last-child { border-radius: 12px 12px 24px 24px; }
    .funnel-label { font-size: 11px; opacity: 0.8; }
    .funnel-value { font-size: 20px; font-weight: 800; }
    
    /* Insights */
    .insight-box {
        background: #F0FDF4;
        border: 1px solid #BBF7D0;
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
    }
    .insight-item {
        font-size: 13px;
        color: #065F46;
        padding: 6px 0;
        border-bottom: 1px solid #D1FAE5;
    }
    .insight-item:last-child { border-bottom: none; }
    
    /* Recommendations */
    .rec-box {
        background: #FFF1F2;
        border: 1px solid #FFE4E6;
        border-radius: 12px;
        padding: 20px;
        margin-top: 16px;
    }
    .rec-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 8px 0;
        font-size: 13px;
        color: #18181B;
    }
    .rec-num {
        width: 24px; height: 24px;
        border-radius: 50%;
        background: #E11D48;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
    }
    
    /* Dynamics */
    .dynamics-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
    }
    .dynamics-group { margin-bottom: 8px; }
    .dynamics-item {
        background: #FAFAFA;
        border-radius: 10px;
        padding: 14px 18px;
        margin-bottom: 8px;
    }
    
    /* Forces grid */
    .forces-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
    }
    .force-card {
        background: #FAFAFA;
        border-radius: 12px;
        padding: 18px;
        border: 1px solid #E4E4E7;
    }
    
    /* Data tables */
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
        padding: 12px 14px;
        border-bottom: 1px solid #F4F4F5;
        vertical-align: middle;
    }
    .data-table tr:hover td {
        background: #FAFAFA;
    }
    
    /* Footer */
    .footer {
        text-align: center;
        padding: 32px 0;
        border-top: 2px solid #E4E4E7;
        margin-top: 32px;
    }
    .footer-brand {
        font-size: 14px;
        font-weight: 800;
        color: #E11D48;
        margin-bottom: 4px;
    }
    .footer-meta {
        font-size: 11px;
        color: #A1A1AA;
    }
    
    /* Print */
    @media print {
        body { background: white; }
        .page { padding: 0; max-width: 100%; }
        .cover { break-after: page; }
        .section { break-inside: avoid; }
        .toc-list li a { color: #18181B; }
    }
</style>
</head>
<body>
<div class="page">
    <!-- Cover -->
    <div class="cover">
        <div class="cover-brand">VICO Intelligence</div>
        <h1>Market & Industry Report</h1>
        <div class="cover-subtitle">${industry} — ${market}</div>
        <div class="cover-meta">
            <span>📅 ${generated}</span>
            <span>🏢 ${esc(companyName || 'N/A')}</span>
            <span>📊 ${(report.companyCount || 0).toLocaleString()} companies analyzed</span>
            <span>🔗 ${report.sources?.competitorsAnalyzed || 0} competitors</span>
        </div>
    </div>
    
    <!-- Table of Contents -->
    <div class="toc">
        <h3>📑 Table of Contents</h3>
        <ul class="toc-list">
            <li><a href="#exec-summary"><span class="toc-num">1</span> Executive Summary</a></li>
            <li><a href="#market-size"><span class="toc-num">2</span> Market Size & Forecast</a></li>
            <li><a href="#dynamics"><span class="toc-num">3</span> Market Dynamics</a></li>
            <li><a href="#landscape"><span class="toc-num">4</span> Competitive Landscape</a></li>
            <li><a href="#porters"><span class="toc-num">5</span> Porter's Five Forces</a></li>
            <li><a href="#deals"><span class="toc-num">6</span> Deals & Investments</a></li>
        </ul>
    </div>
    
    <!-- Report Sections -->
    ${sectionsHtml}
    
    <!-- Footer -->
    <div class="footer">
        <div class="footer-brand">VICO — Vietnam Copilot</div>
        <div class="footer-meta">
            Market Intelligence Report • Generated ${generated}<br>
            Data from ${report.sources?.industryPeersFound?.toLocaleString() || 0} industry peers & ${report.sources?.competitorsAnalyzed || 0} direct competitors
        </div>
    </div>
</div>
</body>
</html>`;

    downloadFile(html, `VICO_Market_Report_${report.industry || 'Market'}_${timestamp()}.html`, 'text/html');
}

/** Export as JSON (machine-readable) */
export function exportMarketReportJSON(report: any) {
    if (!report) return;
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VICO_Market_Report_${report.industry || 'Market'}_${timestamp()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
