/**
 * Export utility — generates downloadable reports from page data.
 * Supports JSON and CSV formats with Vietnamese-friendly filenames.
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
    add(`BÁO CÁO THỊ TRƯỜNG — ${report.industry || 'N/A'}`);
    add(`Ngày tạo: ${new Date(report.generatedAt).toLocaleString('vi-VN')}`);
    add(`Nguồn dữ liệu: ${report.sources?.competitorsAnalyzed || 0} đối thủ, ${report.sources?.industryPeersFound?.toLocaleString() || 0} doanh nghiệp cùng ngành`);
    add('═══════════════════════════════════════════');

    // Executive Summary
    add('\n📋 TÓM TẮT ĐIỀU HÀNH');
    add('─────────────────────');
    if (report.executiveSummary) {
        add(report.executiveSummary);
    }

    // Market Size
    if (report.marketSize) {
        add('\n📊 QUY MÔ THỊ TRƯỜNG');
        add('─────────────────────');
        const ms = report.marketSize;
        if (ms.tam) add(`TAM (Toàn cầu): $${ms.tam}B`);
        if (ms.sam) add(`SAM (Việt Nam): $${ms.sam}B`);
        if (ms.som) add(`SOM (Khả thi): $${ms.som}B`);
        if (ms.cagr) add(`CAGR: ${ms.cagr}%`);
        if (ms.methodology) add(`Phương pháp: ${ms.methodology}`);
    }

    // Market Dynamics
    if (report.marketDynamics) {
        add('\n⚡ ĐỘNG LỰC THỊ TRƯỜNG');
        add('─────────────────────');
        const md = report.marketDynamics;
        if (md.drivers?.length) {
            add('\nĐộng lực tăng trưởng:');
            md.drivers.forEach((d: any) => add(`  • ${d.title}: ${d.description} [Tác động: ${d.impact}]`));
        }
        if (md.restraints?.length) {
            add('\nRào cản & Thách thức:');
            md.restraints.forEach((r: any) => add(`  • ${r.title}: ${r.description} [Tác động: ${r.impact}]`));
        }
        if (md.opportunities?.length) {
            add('\nCơ hội:');
            md.opportunities.forEach((o: any) => add(`  • ${o.title}: ${o.description} [Tác động: ${o.impact}]`));
        }
    }

    // Competitive Landscape
    if (report.competitiveLandscape) {
        add('\n🏢 BỨC TRANH CẠNH TRANH');
        add('─────────────────────');
        const cl = report.competitiveLandscape;
        if (cl.description) add(cl.description);
        if (cl.marketShare?.length) {
            add('\nThị phần:');
            cl.marketShare.forEach((c: any) => add(`  • ${c.name}: ${c.share}% (Tăng trưởng: ${c.growth}%)`));
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
        add('\n💰 DEALS & ĐẦU TƯ GẦN ĐÂY');
        add('─────────────────────');
        report.recentDeals.forEach((d: any) => {
            add(`  • [${d.type}] ${d.title} — ${d.value || 'N/A'} (${d.date})`);
        });
    }

    add('\n═══════════════════════════════════════════');
    add('Xuất bởi VICO — Vietnam Copilot');
    add('═══════════════════════════════════════════');

    downloadFile(lines.join('\n'), `VICO_Market_${report.industry || 'Report'}_${timestamp()}.txt`, 'text/plain');
}

// ─── Competitor Analysis Export ────────────────────────────

export function exportCompetitorReport(report: any) {
    if (!report) return;

    const lines: string[] = [];
    const add = (s: string) => lines.push(s);

    add('═══════════════════════════════════════════');
    add(`BÁO CÁO PHÂN TÍCH ĐỐI THỦ`);
    add(`Tổng đối thủ: ${report.totalCompetitors || 0}`);
    add(`Ngày tạo: ${new Date().toLocaleString('vi-VN')}`);
    add('═══════════════════════════════════════════');

    if (report.overview) {
        add('\n📋 TỔNG QUAN');
        add('─────────────────────');
        add(report.overview);
    }

    // Per-competitor details
    const competitors = report.competitors || [];
    competitors.forEach((comp: any, idx: number) => {
        add(`\n${'─'.repeat(50)}`);
        add(`🏢 ${idx + 1}. ${comp.name}`);
        add(`${'─'.repeat(50)}`);
        add(`Ngành: ${comp.industry || 'N/A'}`);
        add(`Tương đồng: ${comp.similarity ? (comp.similarity * 100).toFixed(0) + '%' : 'N/A'}`);
        add(`Nguồn: ${comp.source || 'N/A'}`);

        if (comp.firmographics) {
            const f = comp.firmographics;
            add(`\nThông tin doanh nghiệp:`);
            add(`  Doanh thu: ${f.revenue || 'N/A'} (${f.revenueGrowth ? f.revenueGrowth + '%' : 'N/A'} YoY)`);
            add(`  Nhân sự: ${f.headcount || 'N/A'} (${f.headcountGrowth ? f.headcountGrowth + '%' : 'N/A'} YoY)`);
            add(`  Trụ sở: ${f.hq || 'N/A'}`);
            if (f.website) add(`  Website: ${f.website}`);
        }

        if (comp.swot) {
            add(`\nSWOT:`);
            if (comp.swot.strengths?.length) add(`  Điểm mạnh: ${comp.swot.strengths.join('; ')}`);
            if (comp.swot.weaknesses?.length) add(`  Điểm yếu: ${comp.swot.weaknesses.join('; ')}`);
            if (comp.swot.opportunities?.length) add(`  Cơ hội: ${comp.swot.opportunities.join('; ')}`);
            if (comp.swot.threats?.length) add(`  Đe dọa: ${comp.swot.threats.join('; ')}`);
        }

        if (comp.positioning) {
            add(`  Vị thế: ${comp.positioning.quadrant} (Market share: ${comp.positioning.marketShare || 'N/A'}%)`);
        }

        if (comp.battlecard) {
            add(`\nBattlecard:`);
            if (comp.battlecard.whyWeWin?.length) add(`  Lý do ta thắng: ${comp.battlecard.whyWeWin.join('; ')}`);
            if (comp.battlecard.whyWeLose?.length) add(`  Lý do ta thua: ${comp.battlecard.whyWeLose.join('; ')}`);
        }
    });

    // CSV companion — competitor summary table
    if (competitors.length > 0) {
        const csvLines: string[] = [];
        csvLines.push('Tên,Ngành,Tương đồng,Vị thế,Thị phần,Doanh thu,Nhân sự,Trụ sở');
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
    add('Xuất bởi VICO — Vietnam Copilot');
    add('═══════════════════════════════════════════');

    downloadFile(lines.join('\n'), `VICO_Competitor_Report_${timestamp()}.txt`, 'text/plain');
}

// ─── Company News/Intelligence Export ──────────────────────

export function exportCompanyNews(companyName: string, data: any) {
    if (!data) return;

    const lines: string[] = [];
    const add = (s: string) => lines.push(s);

    add('═══════════════════════════════════════════');
    add(`TIN TỨC & PHÂN TÍCH — ${companyName}`);
    add(`Tổng bài: ${data.totalResults || data.news?.length || 0}`);
    add(`Cập nhật: ${new Date().toLocaleString('vi-VN')}`);
    add('═══════════════════════════════════════════');

    // Sentiment overview
    if (data.sentimentBreakdown) {
        add('\n📊 PHÂN TÍCH CẢM XÚC');
        add('─────────────────────');
        const sb = data.sentimentBreakdown;
        add(`  Tích cực: ${sb.positive || 0} | Trung lập: ${sb.neutral || 0} | Tiêu cực: ${sb.negative || 0}`);
    }

    // News items
    if (data.news?.length) {
        add('\n📰 TIN TỨC');
        add('─────────────────────');

        // CSV companion
        const csvLines: string[] = [];
        csvLines.push('Tiêu đề,Nguồn,Ngày,Mục,Cảm xúc,Link');

        data.news.forEach((item: any, idx: number) => {
            add(`\n${idx + 1}. ${item.title}`);
            add(`   Nguồn: ${item.source || 'N/A'} | ${item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : 'N/A'}`);
            add(`   Mục: ${item.category || 'N/A'} | Cảm xúc: ${item.sentiment || 'N/A'}`);
            if (item.summary) add(`   Tóm tắt: ${item.summary}`);
            if (item.url || item.link) add(`   Link: ${item.url || item.link}`);

            csvLines.push([
                escCsv(item.title),
                escCsv(item.source),
                escCsv(item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : ''),
                escCsv(item.category),
                escCsv(item.sentiment),
                escCsv(item.url || item.link || ''),
            ].join(','));
        });

        downloadFile(csvLines.join('\n'), `VICO_News_${companyName}_${timestamp()}.csv`, 'text/csv');
    }

    add('\n═══════════════════════════════════════════');
    add('Xuất bởi VICO — Vietnam Copilot');
    add('═══════════════════════════════════════════');

    downloadFile(lines.join('\n'), `VICO_News_${companyName}_${timestamp()}.txt`, 'text/plain');
}
