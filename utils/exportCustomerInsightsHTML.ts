/**
 * Premium HTML Export — Customer Insights Report
 *
 * Generates a beautifully styled, self-contained HTML file with:
 * - VICO Executive Crimson branding
 * - Executive summary, firmographics, buyer personas
 * - Buying triggers, detailed pain points, GTM channels
 * - Vietnam market notes
 * - Print-ready layout
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

function ts(): string {
    return new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
}

function esc(s: unknown): string {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
    critical: { bg: '#FEE2E2', text: '#991B1B' },
    high:     { bg: '#FEF3C7', text: '#92400E' },
    medium:   { bg: '#DBEAFE', text: '#1E40AF' },
    low:      { bg: '#F4F4F5', text: '#71717A' },
};

export interface CustomerExportInsights {
    executive_summary: string;
    positioning_statement: string;
    firmographics: {
        industry_vertical: string;
        employee_count: string;
        estimated_revenue: string;
        ownership: string;
        tech_maturity: string;
        geographic_focus: string[];
    };
    buyer_personas: {
        title: string;
        department: string;
        seniority: string;
        decision_role: string;
        quote_snippet?: string;
        kpis: string[];
        pain_points: string[];
        preferred_channels: string[];
        vietnam_behavior?: string;
    }[];
    buying_triggers: {
        event: string;
        urgency: string;
        category: string;
        description: string;
        vietnam_context?: string;
    }[];
    pain_points_detailed: {
        title: string;
        severity: string;
        description: string;
        current_workaround: string;
        cost_of_inaction: string;
    }[];
    recommended_channels: string[];
    vietnam_market_notes: string[];
}

// ─────────────────────────────────────────────────
// HTML EXPORT
// ─────────────────────────────────────────────────

export function exportCustomerInsightsHTML(companyName: string, data: CustomerExportInsights) {
    if (!data) return;

    const generated = new Date().toLocaleString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const sevBadge = (sev: string) => {
        const sc = SEVERITY_COLORS[sev] || SEVERITY_COLORS['low']!;
        return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:10px;font-weight:700;background:${sc.bg};color:${sc.text};">${esc(sev).toUpperCase()}</span>`;
    };

    // ─ Executive Summary ─
    const execHtml = `
    <div class="section" id="exec-summary">
        <div class="section-header">
            <div class="section-icon" style="background:#FFF1F2;">📋</div>
            <h2>Executive Summary</h2>
        </div>
        <p style="color:#71717A;line-height:1.8;margin-bottom:20px;font-size:14px;">${esc(data.executive_summary)}</p>
        <div style="background:linear-gradient(135deg,#FFF1F2,#FEF3C7);border:1px solid #FFE4E6;border-radius:12px;padding:20px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span style="font-size:16px;">🎯</span>
                <strong style="color:#18181B;">Positioning Statement</strong>
            </div>
            <p style="font-size:14px;color:#18181B;font-style:italic;line-height:1.6;">"${esc(data.positioning_statement)}"</p>
        </div>
        <div class="metric-grid">
            <div class="metric-card" style="border-left:4px solid #2563EB;">
                <div class="metric-label">Industry</div>
                <div class="metric-value" style="color:#2563EB;font-size:16px;">${esc(data.firmographics.industry_vertical)}</div>
            </div>
            <div class="metric-card" style="border-left:4px solid #7C3AED;">
                <div class="metric-label">Employees</div>
                <div class="metric-value" style="color:#7C3AED;font-size:16px;">${esc(data.firmographics.employee_count)}</div>
            </div>
            <div class="metric-card" style="border-left:4px solid #059669;">
                <div class="metric-label">Revenue</div>
                <div class="metric-value" style="color:#059669;font-size:16px;">${esc(data.firmographics.estimated_revenue)}</div>
            </div>
            <div class="metric-card" style="border-left:4px solid #D97706;">
                <div class="metric-label">Ownership</div>
                <div class="metric-value" style="color:#D97706;font-size:16px;">${esc(data.firmographics.ownership)}</div>
            </div>
            <div class="metric-card" style="border-left:4px solid #E11D48;">
                <div class="metric-label">Tech Maturity</div>
                <div class="metric-value" style="color:#E11D48;font-size:16px;">${esc(data.firmographics.tech_maturity)}</div>
            </div>
            <div class="metric-card" style="border-left:4px solid #0891B2;">
                <div class="metric-label">Markets</div>
                <div class="metric-value" style="color:#0891B2;font-size:16px;">${esc(data.firmographics.geographic_focus.join(', '))}</div>
            </div>
        </div>
    </div>`;

    // ─ Buyer Personas ─
    const personasHtml = `
    <div class="section" id="personas">
        <div class="section-header">
            <div class="section-icon" style="background:#EDE9FE;">👤</div>
            <h2>Buyer Personas (${data.buyer_personas.length})</h2>
        </div>
        ${data.buyer_personas.map((p, idx) => `
        <div class="persona-card">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FFF1F2,#FEF3C7);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#E11D48;">${idx + 1}</div>
                <div>
                    <strong style="font-size:15px;color:#18181B;">${esc(p.title)}</strong>
                    <div style="font-size:12px;color:#71717A;margin-top:2px;">${esc(p.department)} · ${esc(p.seniority)} · <span style="background:#F0FDF4;color:#059669;padding:1px 8px;border-radius:999px;font-size:10px;font-weight:700;">${esc(p.decision_role)}</span></div>
                </div>
            </div>
            ${p.quote_snippet ? `<div style="background:#FFF1F2;border-left:4px solid #E11D48;padding:12px 16px;border-radius:0 10px 10px 0;margin-bottom:16px;">
                <p style="font-size:13px;font-style:italic;color:#71717A;">"${esc(p.quote_snippet)}"</p>
            </div>` : ''}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                <div style="background:#F0FDF4;border-radius:10px;padding:14px;">
                    <div style="font-size:10px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">KPIs They Track</div>
                    ${p.kpis.map(k => `<div style="font-size:12px;color:#71717A;padding:3px 0;">✓ ${esc(k)}</div>`).join('')}
                </div>
                <div style="background:#FEF2F2;border-radius:10px;padding:14px;">
                    <div style="font-size:10px;font-weight:700;color:#991B1B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Pain Points</div>
                    ${p.pain_points.map(pp => `<div style="font-size:12px;color:#71717A;padding:3px 0;">⚠ ${esc(pp)}</div>`).join('')}
                </div>
            </div>
            <div style="margin-bottom:${p.vietnam_behavior ? '12px' : '0'};">
                <div style="font-size:10px;font-weight:700;color:#71717A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Preferred Channels</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${p.preferred_channels.map(ch => `<span style="display:inline-block;padding:4px 12px;border-radius:8px;background:#F4F4F5;border:1px solid #E4E4E7;font-size:11px;color:#71717A;">${esc(ch)}</span>`).join('')}
                </div>
            </div>
            ${p.vietnam_behavior ? `<div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:12px 16px;">
                <div style="font-size:10px;font-weight:700;color:#92400E;margin-bottom:4px;">🇻🇳 Vietnam-specific Behavior</div>
                <p style="font-size:12px;color:#71717A;">${esc(p.vietnam_behavior)}</p>
            </div>` : ''}
        </div>`).join('')}
    </div>`;

    // ─ Buying Triggers ─
    const triggersHtml = `
    <div class="section" id="triggers">
        <div class="section-header">
            <div class="section-icon" style="background:#FEF3C7;">⚡</div>
            <h2>Buying Triggers (${data.buying_triggers.length})</h2>
        </div>
        ${data.buying_triggers.map(t => `
        <div style="background:#FAFAFA;border:1px solid #E4E4E7;border-radius:12px;padding:20px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                <strong style="font-size:14px;color:#18181B;">${esc(t.event)}</strong>
                ${sevBadge(t.urgency)}
                <span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:10px;font-weight:600;background:#F4F4F5;color:#71717A;">${esc(t.category)}</span>
            </div>
            <p style="font-size:13px;color:#71717A;line-height:1.6;">${esc(t.description)}</p>
            ${t.vietnam_context ? `<div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:10px 14px;margin-top:10px;">
                <span style="font-size:10px;font-weight:700;color:#92400E;">🇻🇳 Vietnam Context:</span>
                <p style="font-size:12px;color:#71717A;margin-top:4px;">${esc(t.vietnam_context)}</p>
            </div>` : ''}
        </div>`).join('')}
    </div>`;

    // ─ Pain Points Detailed ─
    const painHtml = `
    <div class="section" id="pain-points">
        <div class="section-header">
            <div class="section-icon" style="background:#FEE2E2;">🔴</div>
            <h2>Pain Points — Detailed Analysis (${data.pain_points_detailed.length})</h2>
        </div>
        ${data.pain_points_detailed.map(pp => {
            const sc = SEVERITY_COLORS[pp.severity] || SEVERITY_COLORS['medium']!;
            return `
        <div style="background:#FAFAFA;border-left:4px solid ${sc.text};border-radius:0 12px 12px 0;padding:20px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <strong style="font-size:14px;color:#18181B;">${esc(pp.title)}</strong>
                ${sevBadge(pp.severity)}
            </div>
            <p style="font-size:13px;color:#71717A;line-height:1.6;margin-bottom:14px;">${esc(pp.description)}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="background:white;border:1px solid #E4E4E7;border-radius:10px;padding:14px;">
                    <div style="font-size:10px;font-weight:700;color:#A1A1AA;text-transform:uppercase;margin-bottom:4px;">Current Workaround</div>
                    <p style="font-size:12px;color:#71717A;">${esc(pp.current_workaround)}</p>
                </div>
                <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:14px;">
                    <div style="font-size:10px;font-weight:700;color:#991B1B;text-transform:uppercase;margin-bottom:4px;">Cost of Inaction</div>
                    <p style="font-size:12px;color:#991B1B;font-weight:600;">${esc(pp.cost_of_inaction)}</p>
                </div>
            </div>
        </div>`;
        }).join('')}
    </div>`;

    // ─ GTM Channels ─
    const channelsHtml = `
    <div class="section" id="channels">
        <div class="section-header">
            <div class="section-icon" style="background:#EDE9FE;">📢</div>
            <h2>Recommended GTM Channels</h2>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${data.recommended_channels.map((ch, i) => `
            <div style="display:flex;align-items:center;gap:12px;background:#FAFAFA;border:1px solid #E4E4E7;border-radius:10px;padding:14px;">
                <div style="width:32px;height:32px;border-radius:8px;background:#EDE9FE;color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">${i + 1}</div>
                <span style="font-size:13px;font-weight:600;color:#18181B;">${esc(ch)}</span>
            </div>`).join('')}
        </div>
    </div>`;

    // ─ Vietnam Market Notes ─
    const vnHtml = `
    <div class="section" id="vn-notes">
        <div class="section-header">
            <div class="section-icon" style="background:#FEF3C7;">🇻🇳</div>
            <h2>Vietnam Market Intelligence</h2>
        </div>
        ${data.vietnam_market_notes.map((note, i) => `
        <div style="display:flex;align-items:start;gap:12px;margin-bottom:10px;">
            <div style="width:24px;height:24px;border-radius:50%;background:#FFF1F2;color:#E11D48;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">${i + 1}</div>
            <p style="font-size:13px;color:#71717A;line-height:1.6;">${esc(note)}</p>
        </div>`).join('')}
    </div>`;

    // ─ Full HTML ─
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VICO Customer Insights — ${esc(companyName)}</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FAFAFA;color:#18181B;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{max-width:920px;margin:0 auto;padding:40px 32px;}
    .cover{background:linear-gradient(135deg,#E11D48 0%,#BE123C 50%,#991B1B 100%);border-radius:16px;padding:48px 40px;color:white;margin-bottom:32px;position:relative;overflow:hidden;}
    .cover::before{content:'';position:absolute;top:-50px;right:-50px;width:200px;height:200px;border:2px solid rgba(255,255,255,0.1);border-radius:50%;}
    .cover-brand{font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;opacity:0.7;margin-bottom:16px;}
    .cover h1{font-size:30px;font-weight:800;line-height:1.2;margin-bottom:8px;}
    .cover-subtitle{font-size:15px;opacity:0.85;margin-bottom:24px;}
    .cover-meta{display:flex;gap:20px;flex-wrap:wrap;font-size:12px;opacity:0.7;}
    .toc{background:white;border:1px solid #E4E4E7;border-radius:12px;padding:24px;margin-bottom:32px;}
    .toc h3{font-size:14px;font-weight:700;color:#18181B;margin-bottom:12px;}
    .toc-list{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:8px;}
    .toc-list li a{display:flex;align-items:center;gap:8px;font-size:13px;color:#71717A;text-decoration:none;padding:8px 12px;border-radius:8px;}
    .toc-list li a:hover{background:#FFF1F2;color:#E11D48;}
    .toc-num{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;background:#F4F4F5;color:#71717A;font-size:11px;font-weight:700;}
    .section{background:white;border:1px solid #E4E4E7;border-radius:16px;padding:32px;margin-bottom:24px;page-break-inside:avoid;}
    .section-header{display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #F4F4F5;}
    .section-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
    .section-header h2{font-size:20px;font-weight:800;color:#18181B;}
    .metric-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;}
    .metric-card{background:#FAFAFA;border-radius:12px;padding:16px 20px;}
    .metric-label{font-size:11px;font-weight:600;color:#A1A1AA;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;}
    .metric-value{font-weight:800;line-height:1.2;}
    .persona-card{background:#FAFAFA;border:1px solid #E4E4E7;border-radius:14px;padding:24px;margin-bottom:16px;}
    .footer{text-align:center;padding:32px 0;border-top:2px solid #E4E4E7;margin-top:32px;}
    .footer-brand{font-size:14px;font-weight:800;color:#E11D48;margin-bottom:4px;}
    .footer-meta{font-size:11px;color:#A1A1AA;}
    @media print{body{background:white;}.page{padding:0;max-width:100%;}.cover{break-after:page;}.section{break-inside:avoid;}}
</style>
</head>
<body>
<div class="page">
    <div class="cover">
        <div class="cover-brand">VICO Intelligence</div>
        <h1>Customer Insights Report</h1>
        <div class="cover-subtitle">${esc(companyName)}</div>
        <div class="cover-meta">
            <span>📅 ${generated}</span>
            <span>🏢 ${esc(data.firmographics.industry_vertical)}</span>
            <span>👤 ${data.buyer_personas.length} Buyer Personas</span>
            <span>⚡ ${data.buying_triggers.length} Buying Triggers</span>
        </div>
    </div>
    <div class="toc">
        <h3>📑 Table of Contents</h3>
        <ul class="toc-list">
            <li><a href="#exec-summary"><span class="toc-num">1</span> Executive Summary</a></li>
            <li><a href="#personas"><span class="toc-num">2</span> Buyer Personas</a></li>
            <li><a href="#triggers"><span class="toc-num">3</span> Buying Triggers</a></li>
            <li><a href="#pain-points"><span class="toc-num">4</span> Pain Points</a></li>
            <li><a href="#channels"><span class="toc-num">5</span> GTM Channels</a></li>
            <li><a href="#vn-notes"><span class="toc-num">6</span> Vietnam Market Notes</a></li>
        </ul>
    </div>
    ${execHtml}
    ${personasHtml}
    ${triggersHtml}
    ${painHtml}
    ${channelsHtml}
    ${vnHtml}
    <div class="footer">
        <div class="footer-brand">VICO — Vietnam Copilot</div>
        <div class="footer-meta">
            Customer Insights Report • ${esc(companyName)} • Generated ${generated}
        </div>
    </div>
</div>
</body>
</html>`;

    downloadFile(html, `VICO_Customer_Insights_${companyName.replace(/\s+/g, '_')}_${ts()}.html`, 'text/html');
}

// ─────────────────────────────────────────────────
// JSON EXPORT
// ─────────────────────────────────────────────────

export function exportCustomerInsightsJSON(companyName: string, data: CustomerExportInsights) {
    if (!data) return;
    const payload = { reportType: 'Customer Insights', company: companyName, generatedAt: new Date().toISOString(), ...data };
    downloadFile(JSON.stringify(payload, null, 2), `VICO_Customer_Insights_${companyName.replace(/\s+/g, '_')}_${ts()}.json`, 'application/json');
}

// ─────────────────────────────────────────────────
// TXT EXPORT
// ─────────────────────────────────────────────────

export function exportCustomerInsightsTXT(companyName: string, data: CustomerExportInsights) {
    if (!data) return;
    const l: string[] = [];
    const add = (s: string) => l.push(s);

    add('═══════════════════════════════════════════════════════');
    add(`  VICO — CUSTOMER INSIGHTS REPORT`);
    add(`  ${companyName}`);
    add(`  Generated: ${new Date().toLocaleString('vi-VN')}`);
    add('═══════════════════════════════════════════════════════');

    add('\n📋 EXECUTIVE SUMMARY');
    add('─────────────────────');
    add(data.executive_summary);
    add(`\n🎯 Positioning: "${data.positioning_statement}"`);

    add('\n📊 FIRMOGRAPHICS');
    add('─────────────────────');
    add(`  Industry:      ${data.firmographics.industry_vertical}`);
    add(`  Employees:     ${data.firmographics.employee_count}`);
    add(`  Revenue:       ${data.firmographics.estimated_revenue}`);
    add(`  Ownership:     ${data.firmographics.ownership}`);
    add(`  Tech Maturity: ${data.firmographics.tech_maturity}`);
    add(`  Markets:       ${data.firmographics.geographic_focus.join(', ')}`);

    add('\n👤 BUYER PERSONAS');
    add('─────────────────────');
    data.buyer_personas.forEach((p, i) => {
        add(`\n  ${i + 1}. ${p.title}`);
        add(`     Department: ${p.department} | Seniority: ${p.seniority} | Role: ${p.decision_role}`);
        if (p.quote_snippet) add(`     Quote: "${p.quote_snippet}"`);
        add(`     KPIs: ${p.kpis.join('; ')}`);
        add(`     Pain Points: ${p.pain_points.join('; ')}`);
        add(`     Channels: ${p.preferred_channels.join(', ')}`);
        if (p.vietnam_behavior) add(`     VN Behavior: ${p.vietnam_behavior}`);
    });

    add('\n⚡ BUYING TRIGGERS');
    add('─────────────────────');
    data.buying_triggers.forEach(t => {
        add(`\n  • ${t.event} [${t.urgency.toUpperCase()}] (${t.category})`);
        add(`    ${t.description}`);
        if (t.vietnam_context) add(`    🇻🇳 ${t.vietnam_context}`);
    });

    add('\n🔴 PAIN POINTS (DETAILED)');
    add('─────────────────────');
    data.pain_points_detailed.forEach(pp => {
        add(`\n  • ${pp.title} [${pp.severity.toUpperCase()}]`);
        add(`    ${pp.description}`);
        add(`    Workaround: ${pp.current_workaround}`);
        add(`    Cost of Inaction: ${pp.cost_of_inaction}`);
    });

    add('\n📢 GTM CHANNELS');
    add('─────────────────────');
    data.recommended_channels.forEach((ch, i) => add(`  ${i + 1}. ${ch}`));

    add('\n🇻🇳 VIETNAM MARKET NOTES');
    add('─────────────────────');
    data.vietnam_market_notes.forEach((n, i) => add(`  ${i + 1}. ${n}`));

    add('\n═══════════════════════════════════════════════════════');
    add('  Exported by VICO — Vietnam Copilot');
    add('═══════════════════════════════════════════════════════');

    downloadFile(l.join('\n'), `VICO_Customer_Insights_${companyName.replace(/\s+/g, '_')}_${ts()}.txt`, 'text/plain');
}
