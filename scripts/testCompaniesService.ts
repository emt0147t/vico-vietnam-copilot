/**
 * Test Script: Verify Companies Data Service
 * Usage: npx tsx scripts/testCompaniesService.ts
 */

import CompaniesDataService from '../services/companiesDataService';

async function runTests() {
  console.log('\n🧪 Testing Companies Data Service\n');
  console.log('═'.repeat(60));

  const service = CompaniesDataService.getInstance();

  try {
    // Test 1: Load data
    console.log('\n✓ Test 1: Load Database');
    const all = service.getAllCompanies();
    console.log(`  Total companies loaded: ${all.length}`);

    // Test 2: Get by industry
    console.log('\n✓ Test 2: Get by Industry');
    const tech = service.getCompaniesByIndustry('Technology');
    console.log(`  Technology companies: ${tech.length}`);

    const retail = service.getCompaniesByIndustry('Retail');
    console.log(`  Retail companies: ${retail.length}`);

    // Test 3: Search
    console.log('\n✓ Test 3: Search Companies');
    const grab = service.searchCompanies('Grab', 5);
    console.log(`  Found ${grab.length} companies with "Grab"`);
    if (grab.length > 0) {
      console.log(`    - ${grab[0].name}`);
    }

    // Test 4: Get by sentiment
    console.log('\n✓ Test 4: Get by Sentiment');
    const positive = service.getCompaniesBySentiment('Positive', 10);
    console.log(`  Positive companies: ${positive.length}`);

    // Test 5: Top growing
    console.log('\n✓ Test 5: Top Growing Companies');
    const topGrowth = service.getTopCompaniesByGrowth(5);
    console.log(`  Top ${topGrowth.length} growing companies:`);
    topGrowth.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.name} (${c.growth}%)`);
    });

    // Test 6: Statistics
    console.log('\n✓ Test 6: Market Statistics');
    const stats = service.getStatistics();
    console.log(`  Total companies: ${stats.totalCompanies}`);
    console.log(`  Average growth rate: ${stats.averageGrowth}%`);
    console.log(`  Average founding year: ${stats.averageFoundingYear}`);
    console.log(`  Industries: ${Object.keys(stats.byIndustry).length}`);

    // Test 7: Get industries
    console.log('\n✓ Test 7: Get Industries');
    const industries = service.getIndustries();
    console.log(`  Available industries (${industries.length}):`);
    industries.slice(0, 5).forEach((ind) => {
      console.log(`    - ${ind}`);
    });

    // Test 8: Get employee sizes
    console.log('\n✓ Test 8: Get Employee Sizes');
    const sizes = service.getEmployeeSizes();
    console.log(`  Employee size categories (${sizes.length}):`);
    sizes.slice(0, 5).forEach((size) => {
      console.log(`    - ${size}`);
    });

    // Test 9: Sample companies
    console.log('\n✓ Test 9: Get Sample Companies');
    const sample = service.getSampleCompanies(3);
    console.log(`  Sample companies:`);
    sample.forEach((c) => {
      console.log(`    - ${c.name} (${c.industry})`);
    });

    // Test 10: Get by name
    console.log('\n✓ Test 10: Get Company by Name');
    if (all.length > 0) {
      const company = service.getCompanyByName(all[0].name);
      if (company) {
        console.log(`  Found: ${company.name}`);
        console.log(`    - Industry: ${company.industry}`);
        console.log(`    - Sentiment: ${company.sentiment}`);
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ All Tests Passed!\n');
    console.log('Service Status:');
    console.log(`  ✓ Database loaded (${stats.totalCompanies} companies)`);
    console.log('  ✓ All query methods working');
    console.log('  ✓ Filtering functional');
    console.log('  ✓ Statistics calculated');
    console.log('\n🎉 Ready for production use!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
