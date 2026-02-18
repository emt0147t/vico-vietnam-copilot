# 🔧 Troubleshooting Guide - Data Quality Implementation

## Common Issues & Solutions

---

## Issue 1: "NEWSAPI_KEY not set" or API keys not working

### ❌ Problem
```
❌ NEWSAPI_KEY not set
❌ GNews API returning 403 Unauthorized
```

### ✅ Solution

**Step 1: Verify .env.local exists**
```bash
ls -la .env.local
# Should show: -rw-r--r-- ... .env.local
```

**Step 2: Check API keys are correct**
```bash
# Print env vars (don't commit this!)
cat .env.local | grep "NEWSAPI_KEY\|GNEWS_KEY"

# Should show:
# NEWSAPI_KEY=abc123xyz789
# GNEWS_KEY=def456uvw012
```

**Step 3: Verify keys are active**

For NewsAPI:
```bash
curl "https://newsapi.org/v2/everything?q=test&apiKey=YOUR_KEY" \
  | grep -o '"status":"ok"'
# Should return: "status":"ok"
```

For GNews:
```bash
curl "https://gnews.io/api/v4/search?q=test&token=YOUR_TOKEN" \
  | grep -o '"status":"ok"'
# Should return: "status":"ok"
```

**Step 4: Restart server**
```bash
npm run dev  # Client
npm run server  # Backend (separate terminal)
```

---

## Issue 2: TypeScript compilation errors

### ❌ Problem
```
❌ error TS2314: Type 'QualityTrackedData' requires 3 type parameters
❌ error TS7006: Parameter 'data' implicitly has an 'any' type
```

### ✅ Solution

**Step 1: Check file imports**
```typescript
// ❌ WRONG
import { QualityTrackedData } from './services/dataQualityScore';

// ✅ CORRECT - full import path
import { 
  QualityTrackedData,
  DataQualityScorer,
  VerificationStatus
} from '../services/dataQualityScore';
```

**Step 2: Rebuild TypeScript**
```bash
npm run build
# If still errors, try:
rm -rf dist/
npm run build
```

**Step 3: Clear node_modules if needed**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Issue 3: "No real data available" errors too often

### ❌ Problem
User gets "No real data available" message on every search

### ✅ Solution

**Check 1: Are APIs working?**
```bash
# Test each API directly
curl "https://newsapi.org/v2/everything?q=Apple&apiKey=YOUR_KEY" | head -20
curl "https://gnews.io/api/v4/search?q=Apple&token=YOUR_TOKEN" | head -20

# Both should return articles array
```

**Check 2: Are API calls being made?**
Add logging to `realDataFirstAggregator.ts`:

```typescript
async getCompanyRevenue(companyName: string) {
  console.log(`[DEBUG] Fetching revenue for: ${companyName}`);
  
  // Each attempt should log
  try {
    const secData = await this.fetchSECRevenue(companyName);
    console.log(`[DEBUG] SEC result:`, secData ? 'Found' : 'Not found');
  } catch (e) {
    console.error(`[DEBUG] SEC error:`, e.message);
  }
  
  // If no data found
  throw new Error(`No real data found for ${companyName}`);
}
```

**Check 3: API rate limits hit?**
```
NewsAPI: 100 requests/day (free tier)
GNews: 100 requests/day (free tier)

Solution: Lower request frequency or upgrade to paid plan
```

**Check 4: Company not found in any source?**
This is expected for small/private companies. Solution:
- Allow manual data entry
- Show "Help us find this company's data" message
- Accept user contributions

---

## Issue 4: Data conflicts (multiple sources disagree)

### ❌ Problem
```
Conflict detected!
- SEC: Revenue = $485B
- NewsAPI: Revenue = $490B
- Crunchbase: Revenue = $500B
```

### ✅ Solution

**Option 1: Prioritize by trust score**
```typescript
// SEC (official) = highest trust
// Crunchbase (verified) = medium trust
// NewsAPI (aggregated news) = lower trust

// Show SEC value by default, but allow user to see all versions
```

**Step 1: Display conflict to user**
```tsx
{data.conflictDetected && (
  <Alert type="warning">
    Multiple conflicting sources found:
    <ul>
      <li>SEC: $485B</li>
      <li>NewsAPI: $490B</li>
      <li>Crunchbase: $500B</li>
    </ul>
    <button>Which source is most reliable?</button>
  </Alert>
)}
```

**Step 2: Log for manual review**
Conflicts should be logged for later investigation:
```
2024-02-13 10:24:15 CONFLICT: Apple revenue
  SEC: $485B (Jan 15) - trust: 0.99
  NewsAPI: $490B (Jan 10) - trust: 0.75
  Action needed: Verify which is correct
```

---

## Issue 5: Stale data appearing (older than 30 days)

### ❌ Problem
```
⚠️ Data is 95 days old - should be refreshed
```

### ✅ Solution

**Check 1: Verify cache TTL settings**
```typescript
// In config/dataSourcesConfig.ts

maxDataAge: {
  financial: 90 * 24 * 60 * 60 * 1000,  // 90 days
  trends: 7 * 24 * 60 * 60 * 1000,      // 7 days
  news: 24 * 60 * 60 * 1000,            // 1 day
  techStack: 30 * 24 * 60 * 60 * 1000   // 30 days
}

// SHOULD BE for data quality:
// Financial: 30 days max
// Trends: 7 days max
// News: 1 day max
```

**Check 2: Force refresh**
```typescript
// Add this to clear stale cache
async function refreshStalData() {
  const staleThreshold = 30 * 24 * 60 * 60 * 1000;  // 30 days
  
  const now = Date.now();
  const companies = await getCompanies();
  
  for (const company of companies) {
    const dataAge = now - company.lastUpdated.getTime();
    if (dataAge > staleThreshold) {
      console.log(`Refreshing stale data for ${company.name}`);
      // Re-fetch from APIs
    }
  }
}

// Run periodically:
setInterval(refreshStaleData, 24 * 60 * 60 * 1000);  // Daily
```

---

## Issue 6: Performance slow due to API calls

### ❌ Problem
```
❌ Response time: 5-10 seconds (too slow)
❌ Multiple API requests blocking user
```

### ✅ Solution

**Solution 1: Implement caching**
```typescript
class CachedDataAggregator {
  private cache = new Map<string, {
    data: any;
    expiresAt: Date;
  }>();
  
  async getCompanyRevenue(company: string) {
    // Check cache first
    const cached = this.cache.get(company);
    if (cached && cached.expiresAt > new Date()) {
      return cached.data;  // Return instantly
    }
    
    // Fetch fresh if expired
    const data = await this.fetchFromAPIs(company);
    
    // Cache for next time
    this.cache.set(company, {
      data,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    return data;
  }
}
```

**Solution 2: Parallel requests**
```typescript
// ❌ SLOW - Sequential
const sec = await this.fetchSECRevenue(company);
const cb = await this.fetchCrunchbaseRevenue(company);
const news = await this.fetchNewsRevenue(company);

// ✅ FAST - Parallel
const [sec, cb, news] = await Promise.allSettled([
  this.fetchSECRevenue(company),
  this.fetchCrunchbaseRevenue(company),
  this.fetchNewsRevenue(company)
]);
```

**Solution 3: Lazy loading**
```typescript
// Load data in background while showing cached version
const cachedData = getCachedData(company);  // Instant
return cachedData;

// Meanwhile, in background:
setTimeout(() => {
  const freshData = fetchFreshData(company);  // Update cache
}, 100);
```

---

## Issue 7: Generated data still appearing in responses

### ❌ Problem
```
❌ Response contains generated:true fields
❌ Trust score = 0 for some data points
```

### ✅ Solution

**Check 1: Configuration**
```typescript
// File: config/dataSourcesConfig.ts

// ❌ WRONG
export const FALLBACK_STRATEGY = {
  useGenerated: true,  // BAD!
};

// ✅ CORRECT
export const FALLBACK_STRATEGY = {
  useGenerated: false,  // GOOD!
  requireRealDataOnly: true,
};
```

**Check 2: Server responses**
```typescript
// Add validation middleware
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = (data) => {
    // Check for generated data
    if (JSON.stringify(data).includes('generated')) {
      console.error('⚠️ GENERATED DATA IN RESPONSE:', req.path);
    }
    return originalJson(data);
  };
  next();
});
```

**Check 3: Remove all mock/simulated data**
```typescript
// ❌ DELETE THIS
const getSimulatedNews = () => {
  return { title: 'Mock news', ... };
};

// Replace with:
const getNews = () => {
  // Only fetch real data
  if (!apiKey) return [];  // Return empty, not mocked
  // Fetch from API
};
```

---

## Issue 8: "Trust score calculation seems wrong"

### ❌ Problem
```
❌ SEC data showing trust = 0.5 (should be ~1.0)
❌ NewsAPI showing trust = 0.1 (should be ~0.75)
```

### ✅ Solution

**Check 1: Source trust scores**
```typescript
// File: services/dataQualityScore.ts

const SOURCE_TRUST_SCORES: Record<DataSource, number> = {
  'sec': 1.00,           // ✅ Official
  'crunchbase': 0.85,    // ✅ Verified DB
  'newsapi': 0.75,       // ✅ Aggregated news
  'linkedin': 0.80,      // ✅ User data
  'wikipedia': 0.70,     // 🟡 Community
  'generated': 0.00      // ❌ AI-generated
};

// If scores seem wrong, adjust these weights
```

**Check 2: Freshness calculation**
```typescript
private static calculateFreshnessScore(lastUpdated: Date): number {
  const ageDays = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  
  if (ageDays <= 7) return 1.0;        // ✅ Current
  if (ageDays <= 30) return 0.9;       // 🟡 OK
  if (ageDays <= 90) return 0.7;       // 🟡 Aging
  if (ageDays <= 365) return 0.4;      // ⚠️ Old
  return 0.1;                           // ❌ Very stale
}
```

**Check 3: Add logging**
```typescript
const trustScore = DataQualityScorer.calculateTrustScore(data);

console.log(`Trust calculation for ${data.source}:`);
console.log(`  Base source score: ${SOURCE_TRUST_SCORES[data.source]} (50% weight)`);
console.log(`  Freshness score: ${freshnessScore} (25% weight)`);
console.log(`  Verification score: ${verificationScore} (15% weight)`);
console.log(`  Confidence score: ${data.confidence} (10% weight)`);
console.log(`  Final trust: ${trustScore}`);
```

---

## Issue 9: API rate limits exceeded

### ❌ Problem
```
❌ 429 Too Many Requests
❌ API keys temporarily disabled
```

### ✅ Solution

**Check rate limits:**
```
NewsAPI: 100 requests/day (free)
GNews: 100 requests/day (free)
SEC EDGAR: Unlimited (but respect robots.txt)
```

**Implement rate limiting:**
```typescript
class RateLimitedAggregator {
  private requestCounts = new Map<string, number>();
  private resetTime = Date.now() + 24 * 60 * 60 * 1000;
  
  canMakeRequest(api: string): boolean {
    if (Date.now() > this.resetTime) {
      this.requestCounts.clear();
      this.resetTime = Date.now() + 24 * 60 * 60 * 1000;
    }
    
    const count = this.requestCounts.get(api) || 0;
    return count < 100;  // NewsAPI limit
  }
  
  async fetchData(api: string) {
    if (!this.canMakeRequest(api)) {
      console.warn(`Rate limit for ${api} reached`);
      return null;  // Don't make request
    }
    
    const count = this.requestCounts.get(api) || 0;
    this.requestCounts.set(api, count + 1);
    
    // Make API call
  }
}
```

**Permanent solution: Upgrade APIs**
- NewsAPI Pro: $40/month (5000 requests/day)
- GNews Pro: Similar pricing
- Consider if data quality improvement justifies cost

---

## Issue 10: User contributions not working

### ❌ Problem
```
❌ POST /api/data-quality/report-issue returns 404
❌ User contribution form not submitting
```

### ✅ Solution

**Check 1: Endpoint exists**
```bash
# Test endpoint
curl -X POST http://localhost:3001/api/data-quality/report-issue \
  -H "Content-Type: application/json" \
  -d '{"company": "Apple", "field": "revenue"}'
# Should return 200 OK, not 404
```

**Check 2: Database schema**
```prisma
// schema.prisma - Make sure this exists
model DataContribution {
  id        String   @id @default(cuid())
  company   String
  field     String
  value     String
  sourceUrl String
  evidence  String
  userId    String
  status    String   @default("pending")
  votes     Int      @default(0)
  createdAt DateTime @default(now())
}
```

**Check 3: Endpoint implementation**
```typescript
// server.ts
app.post('/api/data-quality/report-issue', async (req, res) => {
  try {
    const { company, field, sourceUrl } = req.body;
    
    // TODO: Save to database
    // const contribution = await prisma.dataContribution.create({...})
    
    res.json({ success: true, contributionId: '...' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```

---

## Quick Diagnostic Script

Run this to diagnose issues:

```bash
#!/bin/bash

echo "🔍 Data Quality System Diagnostic"
echo "===================================="
echo ""

echo "1. Environment:"
grep "USE_REAL_DATA_FIRST\|ENABLE_GENERATED\|NEWSAPI_KEY" .env.local || echo "❌ .env.local missing"
echo ""

echo "2. Files:"
for file in services/dataQualityScore.ts services/realDataFirstAggregator.ts components/TrustedDataComponents.tsx; do
  [ -f "$file" ] && echo "✅ $file" || echo "❌ $file missing"
done
echo ""

echo "3. API connectivity:"
curl -s "https://newsapi.org/v2/everything?q=test&apiKey=$NEWSAPI_KEY" | head -5 && echo "✅ NewsAPI OK" || echo "❌ NewsAPI failed"
curl -s "https://gnews.io/api/v4/search?q=test&token=$GNEWS_KEY" | head -5 && echo "✅ GNews OK" || echo "❌ GNews failed"
echo ""

echo "4. TypeScript compilation:"
npm run build 2>&1 | tail -5
echo ""

echo "5. Server startup:"
npm run server &
sleep 3
curl -s http://localhost:3001/api/data-quality/metrics | head -20
pkill -f "npm run server"
```

---

## Additional Resources

- **Main Guide:** RESEARCH_DATA_ACCURACY_STRATEGY.md
- **Quick Start:** QUICK_START_VIETNAMESE.md
- **Server Mods:** SERVER_MODIFICATIONS_GUIDE.ts
- **Examples:** EXAMPLE_COMPONENT_USAGE.tsx
- **Setup:** setup-data-quality.sh

---

## Need Help?

1. Check this troubleshooting guide first
2. Review log messages for specific errors
3. Run diagnostic script above
4. Create GitHub issue with:
   - Error message
   - Which phase you're in
   - What you tried so far
   - Steps to reproduce
