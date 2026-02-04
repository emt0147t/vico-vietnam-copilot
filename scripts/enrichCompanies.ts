#!/usr/bin/env node

/**
 * Enrichment Script
 * Run: npx ts-node scripts/enrichCompanies.ts
 * 
 * This script enriches all 10,000+ companies from CSV with:
 * - Vietnamese embeddings (dangvantuan/vietnamese-embedding)
 * - Strategic context
 * - Similar competitors (top 10 for each company)
 */

import { enrichAllCsvCompanies } from '../utils/enrichCsvCompanies';

async function main() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║       CSV Companies Enrichment Script                        ║
║                                                               ║
║  This will enrich all 10,000+ companies with:                ║
║  ✓ Vietnamese embeddings (88.33% accuracy)                   ║
║  ✓ Strategic context (auto-generated)                        ║
║  ✓ Similar competitors (top 10 per company)                  ║
║                                                               ║
║  Estimated time: 15-30 minutes                               ║
║  Memory required: ~500MB - 1GB                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);

    try {
        await enrichAllCsvCompanies();
        console.log('\n✅ Enrichment completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Enrichment failed:', error);
        process.exit(1);
    }
}

main();
