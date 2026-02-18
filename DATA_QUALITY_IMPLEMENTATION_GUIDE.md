# 🛠️ Hướng Dẫn Tích Hợp Data Quality System

## 📋 Tóm Tắt Các File Mới

| File | Mục Đích | Ưu Tiên |
|------|---------|--------|
| `RESEARCH_DATA_ACCURACY_STRATEGY.md` | Nghiên cứu & strategy toàn diện | 📖 Documentation |
| `services/dataQualityScore.ts` | Core scoring logic | 🔴 Critical |
| `services/realDataFirstAggregator.ts` | Data aggregation từ multiple sources | 🔴 Critical |
| `components/TrustedDataComponents.tsx` | UI components với trust indicators | 🟡 Important |

---

## 🔧 Bước Tích Hợp (6 Bước)

### Bước 1: Update Environment Variables

**File: `.env.local` hoặc `.env`**

```bash
# Prioritize real data
USE_REAL_DATA_FIRST=true
ENABLE_GENERATED_DATA=false

# Trust score thresholds
MIN_TRUST_SCORE_FOR_DISPLAY=0.50
STRICT_MODE=false  # Set true to reject all low-trust data

# Data freshness requirements
MAX_DATA_AGE_DAYS=365
WARN_DATA_AGE_DAYS=180

# API Keys (Free tier)
NEWSAPI_KEY=your_key_here
GNEWS_KEY=your_key_here

# Optional: Premium APIs
CRUNCHBASE_API_KEY=
CLEARBIT_API_KEY=
```

### Bước 2: Update Configuration

**File: `config/dataSourcesConfig.ts`**

Replace the old configuration:

```typescript
// BEFORE: Allows generated data as fallback
export const FALLBACK_STRATEGY = {
    useGenerated: true,  // ❌ BAD
    // ...
};

// AFTER: Rejects generated data
export const FALLBACK_STRATEGY = {
    useGenerated: false,  // ✅ Good
    requireRealDataOnly: true,
    fallbackBehavior: 'return_empty' | 'use_cached' | 'throw_error',
    
    // Data quality requirements
    minimumTrustScore: 0.50,
    requireCitations: true,
    detectConflicts: true
};
```

### Bước 3: Update API Responses

**File: `server.ts`** - Add metadata to all data endpoints

```typescript
// Example: Update competitor intelligence endpoint
app.post('/api/competitor-intelligence', async (req, res) => {
  try {
    const { userCompany, selectedCompetitors } = req.body;
    
    // Use real data aggregator
    const aggregator = new RealDataFirstAggregator();
    const competitors = await Promise.all(
      selectedCompetitors.map(c => aggregator.getCompanyRevenue(c.name))
    );
    
    // Return with metadata
    res.json({
      success: true,
      data: competitors,
      metadata: {
        // Thêm thông tin chất lượng dữ liệu
        dataQualityReport: {
          averageTrustScore: competitors.reduce((a, b) => a + b.primary.trustScore, 0) / competitors.length,
          dataFreshness: calculateFreshness(competitors),
          hasConflicts: competitors.some(c => c.conflictDetected),
          sourcesUsed: Array.from(new Set(competitors.map(c => c.primary.source)))
        },
        generatedData: 0,  // Always show when generated data is used
        realDataPercentage: 100
      }
    });
  } catch (error) {
    // No real data available - don't generate fallback
    res.status(400).json({
      error: 'No reliable data available',
      suggestion: 'Please manually verify company information'
    });
  }
});
```

### Bước 4: Replace Data Display Components

**Update existing components to use new TrustedDataComponents**

Example: `CompetitorAnalysisDashboard.tsx`

```typescript
// BEFORE
import { DataCard } from './components/DataCard';

// AFTER
import { DataCard as TrustedDataCard } from './components/TrustedDataComponents';

export const CompetitorAnalysisDashboard = () => {
  const [competitor] = useState<any>();
  
  return (
    <div>
      {/* OLD: No trust indicators
      <DataCard title="Revenue" value={competitor.revenue} />
      */}
      
      {/* NEW: With trust score, sources, and citations */}
      <TrustedDataCard
        title="Revenue"
        value={competitor.revenue.value}
        unit="USD"
        data={competitor.revenue}  // QualityTrackedData object
        onReportIssue={() => openFeedbackModal(competitor.name, 'revenue')}
      />
    </div>
  );
};
```

### Bước 5: Implement Data Validation

**Add validation to data import/ingestion**

```typescript
// services/dataValidator.ts - ADD THIS
import { DataValidator, ValidationIssue } from './dataQualityScore';

export async function validateImportedData(companies: any[]): Promise<{
  valid: any[];
  invalid: any[];
  issues: Map<string, ValidationIssue[]>;
}> {
  const validator = new DataValidator();
  const valid = [];
  const invalid = [];
  const issues = new Map();
  
  for (const company of companies) {
    const companyIssues = validator.validateCompanyData(company);
    
    if (companyIssues.some(i => i.severity === 'error')) {
      invalid.push(company);
      issues.set(company.name, companyIssues);
    } else {
      valid.push(company);
      if (companyIssues.length > 0) {
        issues.set(company.name, companyIssues);
      }
    }
  }
  
  // Report
  console.log(`✅ Valid: ${valid.length}, ⚠️ Warnings: ${issues.size}, ❌ Invalid: ${invalid.length}`);
  
  return { valid, invalid, issues };
}
```

### Bước 6: Create Data Quality Dashboard

**File: `components/DataQualityDashboard.tsx` (NEW)**

```typescript
import React, { useEffect, useState } from 'react';
import { TrustBadge, DataLineageViewer } from './TrustedDataComponents';
import { DataQualityScorer } from '../services/dataQualityScore';

export function DataQualityDashboard() {
  const [metrics, setMetrics] = useState({
    averageTrustScore: 0,
    realDataPercentage: 0,
    generatedDataOutliers: 0,
    dataFreshness: 0,
    conflictingDataPoints: 0
  });

  React.useEffect(() => {
    // Fetch data quality metrics from API
    fetch('/api/data-quality/metrics')
      .then(r => r.json())
      .then(data => setMetrics(data));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Data Quality Report</h1>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          label="Avg Trust Score"
          value={`${(metrics.averageTrustScore * 100).toFixed(0)}%`}
          color="blue"
        />
        <MetricCard
          label="Real Data"
          value={`${metrics.realDataPercentage}%`}
          color="green"
        />
        <MetricCard
          label="Conflicting Data"
          value={metrics.conflictingDataPoints}
          color="orange"
        />
        <MetricCard
          label="Data Freshness"
          value={`${metrics.dataFreshness} days`}
          color="blue"
        />
        <MetricCard
          label="⚠️ Anomalies"
          value={metrics.generatedDataOutliers}
          color="red"
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: any) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200'
  };
  
  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
```

---

## 🔌 Tích Hợp Từng API

### NewsAPI (Tin Tức)

**Already integrated, just ensure:**

```typescript
// services/dataFetchers/newsDataFetcher.ts - UPDATE
export class NewsDataFetcher {
  async getCompanyNews(companyName: string): Promise<QualityTrackedData[]> {
    // Return with trustScore metadata
    return articles.map(article => createQualityData(
      article,
      'newsapi',
      {
        lastUpdated: new Date(article.publishedAt),
        citations: [/* ... */]
      }
    ));
  }
}
```

### SEC EDGAR (US Companies)

**File: `services/dataFetchers/secEdgarFetcher.ts` (NEW)**

```typescript
import fetch from 'node-fetch';
import { createQualityData, VerificationStatus } from '../dataQualityScore';

export class SECEdgarFetcher {
  /**
   * Fetch company financials from SEC EDGAR
   * Works for: US public companies
   */
  async getCompanyFinancials(companyName: string) {
    // Search for company CIK
    const cikResponse = await fetch(
      `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(companyName)}&action=getcompany`
    );
    
    // Parse 10-K filing for revenue
    // Returns: revenue, assets, liabilities, equity
    
    return createQualityData(
      financialData,
      'sec',
      {
        verificationStatus: VerificationStatus.VERIFIED,  // Official source
        confidence: 1.0,
        citations: [{
          url: 'https://www.sec.gov/...',
          title: '10-K Annual Report',
          date: new Date(filingDate),
          documentType: 'filing',
          accessedDate: new Date()
        }]
      }
    );
  }
}
```

### Wikipedia (Context/Context)

**File: `services/dataFetchers/wikipediaFetcher.ts` (NEW)**

```typescript
export class WikipediaFetcher {
  async getIndustryContext(industry: string) {
    // Fetch industry Wikipedia page for context
    // No financials, just context for understanding market
    
    return createQualityData(
      { definition, history, majorPlayers },
      'wikipedia',
      {
        verificationStatus: VerificationStatus.UNVERIFIED,
        confidence: 0.7,  // Community maintained
      }
    );
  }
}
```

---

## 📊 Monitoring & Metrics

### Endpoint: GET `/api/data-quality/metrics`

```typescript
// server.ts - ADD THIS ENDPOINT
app.get('/api/data-quality/metrics', async (req, res) => {
  const stats = {
    // Overall scores
    averageTrustScore: calculateAverageTrust(),
    realDataPercentage: calculateRealDataPercentage(),
    
    // Data freshness
    dataUpdatedLastHours: 24,
    staledataPercentage: calculateStalePercentage(),
    
    // Quality issues
    conflictingDataPoints: countConflicts(),
    validationIssues: countValidationErrors(),
    
    // Source breakdown
    sourceBreakdown: {
      sec: 450,              // Number of SEC data points
      crunchbase: 320,
      newsapi: 1200,
      wikipedia: 150,
      generated: 0           // Should be 0!
    }
  };
  
  res.json(stats);
});
```

---

## ✅ Testing Checklist

- [ ] **Phase 1: Setup & Config**
  - [ ] Environment variables set correctly
  - [ ] Config updated to disable generated data
  - [ ] New TypeScript files compile without errors

- [ ] **Phase 2: Data Fetching**
  - [ ] NewsAPI integration working
  - [ ] Real data aggregator fetching data
  - [ ] Trust scores calculating correctly
  - [ ] No 'generated' data in responses

- [ ] **Phase 3: UI Components**
  - [ ] TrustBadge displays correctly
  - [ ] DataCard shows trust indicators
  - [ ] Citations linkable
  - [ ] Mobile responsive

- [ ] **Phase 4: End-to-End**
  - [ ] Search competitor: shows trust score
  - [ ] View market report: all data has sources
  - [ ] No "generated" label anywhere
  - [ ] User can report inaccuracies

---

## 🔍 Validation Testing

```bash
# Test API response format
curl -X POST http://localhost:3001/api/competitor-intelligence \
  -H "Content-Type: application/json" \
  -d '{
    "userCompany": {"name": "Test Co", "industry": "Tech"},
    "selectedCompetitors": [{"name": "Apple"}]
  }' | jq '.metadata'

# Expected output:
# {
#   "dataQualityReport": {
#     "averageTrustScore": 0.85,
#     "realDataPercentage": 100,
#     "sourcesUsed": ["sec", "newsapi"]
#   },
#   "generatedData": 0
# }
```

---

## 📈 Success Metrics

After implementation, track:

1. **Trust Score**: Average should be > 0.80
2. **Real Data %**: Should be > 90%
3. **Generated Data**: Should be 0%
4. **Data Freshness**: > 90% < 180 days old
5. **User Confidence**: Survey users about trust

---

## 🚀 Rollout Strategy

### Week 1: Foundation
- Deploy `dataQualityScore.ts`
- Update configuration
- Add metadata to APIs

### Week 2: Data Layer
- Deploy `realDataFirstAggregator.ts`
- Connect free APIs
- Test data quality

### Week 3-4: UI
- Deploy `TrustedDataComponents.tsx`
- Update existing components
- Test on staging

### Week 5: Monitor & Iterate
- Run data quality dashboard
- Get user feedback
- Fix edge cases

---

## 💡 Common Issues & Solutions

### Issue 1: "No real data found" errors too often

**Solution:**
- Expand free API coverage (add Wikipedia, web search)
- Increase cache TTL for stale-but-available data
- Add manual data entry workflow

### Issue 2: Users confused by trust scores

**Solution:**
- Add tooltips explaining what numbers mean
- Show "Why this is trusted" explanations
- Highlight most trusted sources in green

### Issue 3: API rate limits hit

**Solution:**
- Implement request queuing
- Increase cache TTL
- Evaluate premium APIs ROI

---

## 📞 Support & Questions

Create GitHub issues with:
- `[data-quality]` tag for issues
- `[api-integration]` for API-specific problems
- Document which endpoint/component is affected
