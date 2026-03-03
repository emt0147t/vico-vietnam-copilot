/**
 * Export utility — generates downloadable reports from page data.
 * Supports JSON and CSV formats with UTF-8-friendly filenames.
 */

// ─── Generic helpers ───────────────────────────────────────

function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8` }); // BOM for Excel UTF-8
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

function escCsv(val: unknown): string {
    const s = String(val ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
}

// ─── Market Intelligence Export ────────────────────────────

export function exportMarketReport(report: any) {
    if (!report) return;

    const lines: string[] = [];
    const add = (s: string) => lines.push(s);

    add('═══════════════════════════════════════════');
    add(`MARKET REPORT — ${report.industry || 'N/A'}`);
    add(`Generated: ${new Date(report.generatedAt).toLocaleString('en-US')}`);
    add(`Data sources: ${report.sources?.competitorsAnalyzed || 0} competitors, ${report.sources?.industryPeersFound?.toLocaleString() || 0} industry peers`);
    add('═══════════════════════════════════════════');

    // Executive Summary
    add('\n📋 EXECUTIVE SUMMARY');
    add('─────────────────────');
    if (report.executiveSummary) {
        add(report.executiveSummary);
    }

    // Market Size
    if (report.marketSize) {
        add('\n📊 MARKET SIZE');
        add('─────────────────────');
        const ms = report.marketSize;
        if (ms.tam) add(`TAM (Global): $${ms.tam}B`);
        if (ms.sam) add(`SAM (Vietnam): $${ms.sam}B`);
        if (ms.som) add(`SOM (Serviceable): $${ms.som}B`);
        if (ms.cagr) add(`CAGR: ${ms.cagr}%`);
        if (ms.methodology) add(`Methodology: ${ms.methodology}`);
    }

    // Market Dynamics
    if (report.marketDynamics) {
        add('\n⚡ MARKET DYNAMICS');
        add('─────────────────────');
        const md = report.marketDynamics;
        if (md.drivers?.length) {
            add('\nGrowth drivers:');
            md.drivers.forEach((d: any) => add(`  • ${d.title}: ${d.description} [Impact: ${d.impact}]`));
        }
        if (md.restraints?.length) {
            add('\nBarriers & Challenges:');
            md.restraints.forEach((r: any) => add(`  • ${r.title}: ${r.description} [Impact: ${r.impact}]`));
        }
        if (md.opportunities?.length) {
            add('\nOpportunities:');
            md.opportunities.forEach((o: any) => add(`  • ${o.title}: ${o.description} [Impact: ${o.impact}]`));
        }
    }

    // Competitive Landscape
    if (report.competitiveLandscape) {
        add('\n🏢 COMPETITIVE LANDSCAPE');
        add('─────────────────────');
        const cl = report.competitiveLandscape;
        if (cl.description) add(cl.description);
        if (cl.marketShare?.length) {
            add('\nMarket share:');
            cl.marketShare.forEach((c: any) => add(`  • ${c.name}: ${c.share}% (Growth: ${c.growth}%)`));
        }
    }

    // Porter's Five Forces
    if (report.portersFiveForces) {
        add("\n🔬 PORTER'S FIVE FORCES");
        add('─────────────────────');
        const pf = report.portersFiveForces;
        Object.entries(pf).forEach(([key, val]: [string, any]) => {
            if (val && typeof val === 'object' && val.level) {
                add(`  ${key}: ${val.level}/5 — ${val.description || ''}`);
            }
        });
    }

    // PESTLE
    if (report.pestleAnalysis) {
        add('\n🌍 PESTLE ANALYSIS');
        add('─────────────────────');
        const pa = report.pestleAnalysis;
        Object.entries(pa).forEach(([key, items]: [string, any]) => {
            if (Array.isArray(items) && items.length) {
                add(`\n${key.toUpperCase()}:`);
                items.forEach((item: any) => add(`  • ${item.factor || item.title || item}: ${item.impact || ''}`));
            }
        });
    }

    // Deals
    if (report.recentDeals?.length) {
        add('\n💰 DEALS & RECENT INVESTMENTS');
        add('─────────────────────');
        report.recentDeals.forEach((d: any) => {
            add(`  • [${d.type}] ${d.title} — ${d.value || 'N/A'} (${d.date})`);
        });
    }

    add('\n═══════════════════════════════════════════');
    add('Exported by VICO — Vietnam Copilot');
    add('═══════════════════════════════════════════');

    downloadFile(lines.join('\n'), `VICO_Market_${report.industry || 'Report'}_${timestamp()}.txt`, 'text/plain');
}

// ─── Competitor Analysis Export ────────────────────────────

export function exportCompetitorReport(report: any) {
    if (!report) return;

    const lines: string[] = [];
    const add = (s: string) => lines.push(s);

    add('═══════════════════════════════════════════');
    add(`COMPETITOR ANALYSIS REPORT`);
    add(`Total competitors: ${report.totalCompetitors || 0}`);
    add(`Generated: ${new Date().toLocaleString('en-US')}`);
    add('═══════════════════════════════════════════');

    if (report.overview) {
        add('\n📋 OVERVIEW');
        add('─────────────────────');
        add(report.overview);
    }

    // Per-competitor details
    const competitors = report.competitors || [];
    competitors.forEach((comp: any, idx: number) => {
        add(`\n${'─'.repeat(50)}`);
        add(`🏢 ${idx + 1}. ${comp.name}`);
        add(`${'─'.repeat(50)}`);
        add(`Industry: ${comp.industry || 'N/A'}`);
        add(`Similarity: ${comp.similarity ? (comp.similarity * 100).toFixed(0) + '%' : 'N/A'}`);
        add(`Source: ${comp.source || 'N/A'}`);

        if (comp.firmographics) {
            const f = comp.firmographics;
            add(`\nCompany information:`);
            add(`  Revenue: ${f.revenue || 'N/A'} (${f.revenueGrowth ? f.revenueGrowth + '%' : 'N/A'} YoY)`);
            add(`  Headcount: ${f.headcount || 'N/A'} (${f.headcountGrowth ? f.headcountGrowth + '%' : 'N/A'} YoY)`);
            add(`  Headquarters: ${f.hq || 'N/A'}`);
            if (f.website) add(`  Website: ${f.website}`);
        }

        if (comp.swot) {
            add(`\nSWOT:`);
            if (comp.swot.strengths?.length) add(`  Strengths: ${comp.swot.strengths.join('; ')}`);
            if (comp.swot.weaknesses?.length) add(`  Weaknesses: ${comp.swot.weaknesses.join('; ')}`);
            if (comp.swot.opportunities?.length) add(`  Opportunities: ${comp.swot.opportunities.join('; ')}`);
            if (comp.swot.threats?.length) add(`  Threats: ${comp.swot.threats.join('; ')}`);
        }

        if (comp.positioning) {
            add(`  Position: ${comp.positioning.quadrant} (Market share: ${comp.positioning.marketShare || 'N/A'}%)`);
        }

        if (comp.battlecard) {
            add(`\nBattlecard:`);
            if (comp.battlecard.whyWeWin?.length) add(`  Why we win: ${comp.battlecard.whyWeWin.join('; ')}`);
            if (comp.battlecard.whyWeLose?.length) add(`  Why we lose: ${comp.battlecard.whyWeLose.join('; ')}`);
        }
    });

    // CSV companion — competitor summary table
    if (competitors.length > 0) {
        const csvLines: string[] = [];
        csvLines.push('Name,Industry,Similarity,Position,Market Share,Revenue,Headcount,Headquarters');
        competitors.forEach((c: any) => {
            csvLines.push([
                escCsv(c.name),
                escCsv(c.industry),
                escCsv(c.similarity ? (c.similarity * 100).toFixed(0) + '%' : 'N/A'),
                escCsv(c.positioning?.quadrant),
                escCsv(c.positioning?.marketShare ? c.positioning.marketShare + '%' : 'N/A'),
                escCsv(c.firmographics?.revenue),
                escCsv(c.firmographics?.headcount),
                escCsv(c.firmographics?.hq),
            ].join(','));
        });
        downloadFile(csvLines.join('\n'), `VICO_Competitors_${timestamp()}.csv`, 'text/csv');
    }

    add('\n═══════════════════════════════════════════');
    add('Exported by VICO — Vietnam Copilot');
    add('═══════════════════════════════════════════');

    downloadFile(lines.join('\n'), `VICO_Competitor_Report_${timestamp()}.txt`, 'text/plain');
}

// ─── Company News/Intelligence Export ──────────────────────

export function exportCompanyNews(companyName: string, data: any) {
    if (!data) return;

    const lines: string[] = [];
    const add = (s: string) => lines.push(s);

    add('═══════════════════════════════════════════');
    add(`NEWS & ANALYSIS — ${companyName}`);
    add(`Total articles: ${data.totalResults || data.news?.length || 0}`);
    add(`Updated: ${new Date().toLocaleString('en-US')}`);
    add('═══════════════════════════════════════════');

    // Sentiment overview
    if (data.sentimentBreakdown) {
        add('\n📊 SENTIMENT ANALYSIS');
        add('─────────────────────');
        const sb = data.sentimentBreakdown;
        add(`  Positive: ${sb.positive || 0} | Neutral: ${sb.neutral || 0} | Negative: ${sb.negative || 0}`);
    }

    // News items
    if (data.news?.length) {
        add('\n📰 NEWS');
        add('─────────────────────');

        // CSV companion
        const csvLines: string[] = [];
        csvLines.push('Title,Source,Date,Category,Sentiment,Link');

        data.news.forEach((item: any, idx: number) => {
            add(`\n${idx + 1}. ${item.title}`);
            add(`   Source: ${item.source || 'N/A'} | ${item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US') : 'N/A'}`);
            add(`   Category: ${item.category || 'N/A'} | Sentiment: ${item.sentiment || 'N/A'}`);
            if (item.summary) add(`   Summary: ${item.summary}`);
            if (item.url || item.link) add(`   Link: ${item.url || item.link}`);

            csvLines.push([
                escCsv(item.title),
                escCsv(item.source),
                escCsv(item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US') : ''),
                escCsv(item.category),
                escCsv(item.sentiment),
                escCsv(item.url || item.link || ''),
            ].join(','));
        });

        downloadFile(csvLines.join('\n'), `VICO_News_${companyName}_${timestamp()}.csv`, 'text/csv');
    }

    add('\n═══════════════════════════════════════════');
    add('Exported by VICO — Vietnam Copilot');
    add('═══════════════════════════════════════════');

    downloadFile(lines.join('\n'), `VICO_News_${companyName}_${timestamp()}.txt`, 'text/plain');
}
