# 📊 Chiến Lược Cải Thiện Độ Chính Xác & Uy Tín Dữ Liệu

## 🔴 Vấn Đề Hiện Tại

Phân tích codebase cho thấy website hiện tại đang sử dụng **quá nhiều dữ liệu được tạo ra/synthetic**:

```
❌ Mục đích hành động
- `fallback: 'generated'` trong 20+ trường dữ liệu
- `useGenerated: true` cho phép AI tạo dữ liệu thay thế
- Simulated/mock data cho các công ty không tìm thấy
- Không phân biệt rõ: Real vs Generated vs Synthetic
```

### Tác Động Đến Người Dùng:
- ⚠️ Tin tưởng **giảm** khi nhận ra dữ liệu không chính xác
- 😕 Khó tin tưởng platform nếu không biết dữ liệu từ đâu
- 🔍 Không có cách verify information từ sources gốc
- 📉 UX kém nếu thấy quá nhiều dữ liệu "có thể"

---

## ✅ Chiến Lược Cải Thiện (3 Giai Đoạn)

### GIAI ĐOẠN 1: Tối Ưu Hóa Nguồn Dữ Liệu Thực (1-2 tuần)

#### 1.1 Nguồn Dữ Liệu Đáng Tin Cậy Toàn Cầu

| Nguồn | Loại | Chi Phí | Mục Đích | Chỉ Số Uy Tín |
|-------|------|--------|---------|--------------|
| **SEC EDGAR** | Tài chính | Free | Công ty Mỹ (10-K, 8-K) | ⭐⭐⭐⭐⭐ |
| **NewsAPI** | Tin tức | Free/Paid | Berita real-time từ 40K+ sources | ⭐⭐⭐⭐ |
| **GNews** | Tin tức | Free | Multi-language news search | ⭐⭐⭐⭐ |
| **Crunchbase** | Startup/Funding | Paid | Funding rounds, investors | ⭐⭐⭐⭐⭐ |
| **LinkedIn** | HR/People | API | Employee count, hiring trends | ⭐⭐⭐⭐ |
| **Wikipedia** | Market Data | Free | Industrial context, definitions | ⭐⭐⭐⭐ |
| **OpenLibra** | Financial | Free | Stock data, financials | ⭐⭐⭐⭐ |
| **SerpAPI** | Web Search | Paid | Real search results, rankings | ⭐⭐⭐⭐ |
| **Clearbit** | B2B Data | Free/Paid | Company profiles, technographics | ⭐⭐⭐⭐ |

#### 1.2 Nguồn Dữ Liệu Việt Nam (QUAN TRỌNG!)

| Nguồn | Loại | Chi Phí | Ưu Điểm |
|-------|------|--------|--------|
| **GSO (Tổng Cục Thống Kê)** | Chính thức | Free | Dữ liệu chính phủ, tin cậy nhất |
| **VNDC (Vietnam Digital)** | Market | Free | Xu hướng digital Vietnam |
| **Vietnamnet, VnExpress** | Media | Free/API | Tin tức, bình luận chất lượng |
| **TopDev, Techz** | Tech News | Free | Tin công nghệ Vietnam |
| **LinkedIn Vietnam** | HR Data | API | Công ty Việt: tuyển dụng, team size |
| **Facebook Pages** | Brand | API | Followers, engagement (brand health) |
| **Google Business** | Local | Scrape | Reviews, ratings địa phương |

#### 1.3 Thực Hiện: Crawling Strategy

```typescript
// NEW: Real Data Priority Layer
class RealDataFirstStrategy {
  async getCompanyData(company: string, industry: string) {
    const dataStack = [];
    
    // Tier 1: Official Government Sources (100% trust)
    if (isVietnamese) {
      const govData = await fetchGSO(company, industry);
      if (govData) dataStack.push({ data: govData, trust: 1.0, source: 'gso' });
    }
    
    // Tier 2: SEC for US companies (95% trust)
    if (isUSBased) {
      const secData = await fetchSEC(company);
      if (secData) dataStack.push({ data: secData, trust: 0.95, source: 'sec' });
    }
    
    // Tier 3: Verified APIs (85% trust)
    const crunchbase = await fetchCrunchbase(company);
    if (crunchbase) dataStack.push({ data: crunchbase, trust: 0.85, source: 'crunchbase' });
    
    // Tier 4: News & Media (70-80% trust based on source)
    const news = await fetchNews(company);
    dataStack.push({ data: news, trust: 0.75, source: 'newsapi', coverage: news.length });
    
    // ❌ DON'T INCLUDE: Generated Data
    // Return: Only real data, mark data source
    return dataStack.filter(d => d.trust >= threshold);
  }
}
```

---

### GIAI ĐOẠN 2: Data Quality & Trust Scoring (1 tuần)

#### 2.1 Trust Score System

```typescript
interface DataPoint {
  value: any;
  source: string;              // "SEC", "Crunchbase", "Manual Entry", "Generated"
  trustScore: number;          // 0.0 - 1.0
  confidence: number;          // 0.0 - 1.0 (data consistency)
  lastUpdated: Date;
  verificationStatus: 'verified' | 'unverified' | 'disputed' | 'generated';
  citations: string[];         // URLs, PDF links
}

// Trust Score Calculation
function calculateTrustScore(dataPoint: DataPoint): number {
  let score = 0;
  
  // Source reliability (60% weight)
  const sourceScores = {
    'SEC': 1.00,               // Official gov
    'Crunchbase': 0.85,        // Verified database
    'LinkedIn': 0.80,          // User-reported
    'NewsAPI': 0.70,           // Third-party aggregated
    'Wikipedia': 0.65,         // Community maintained
    'Manual Entry': 0.60,      // User input
    'Generated': 0.00           // NO TRUST for generated
  };
  
  score += (sourceScores[dataPoint.source] || 0.3) * 0.60;
  
  // Data freshness (20% weight)
  const daysSinceUpdate = (Date.now() - dataPoint.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 1 - (daysSinceUpdate / 365)) * 0.20;  // Max 365 days old
  
  // Consistency/Multiple sources (20% weight)
  score += (dataPoint.confidence) * 0.20;
  
  return Math.min(1.0, score);
}

// Data Verification Status
export enum VerificationStatus {
  VERIFIED = 'verified',       // Cross-verified from 2+ sources
  UNVERIFIED = 'unverified',   // From valid source but not cross-checked
  DISPUTED = 'disputed',       // Conflicting data from multiple sources
  GENERATED = 'generated'      // AI-generated (NO TRUST)
}
```

#### 2.2 Display Trust Indicators

```tsx
// UI Component: Trust Badge
interface TrustBadgeProps {
  score: 0.0; // 0-1.0
  source: string;
  lastUpdated: Date;
  showDetails?: boolean;
}

export function TrustBadge({ score, source, lastUpdated, showDetails = false }) {
  const trustColor = score >= 0.85 ? 'green' : 
                     score >= 0.70 ? 'yellow' : 
                     score >= 0.50 ? 'orange' : 'red';
  const trustText = score >= 0.85 ? 'Highly Trusted' : 
                    score >= 0.70 ? 'Trusted' : 
                    score >= 0.50 ? 'Moderate' : 'Low Trust';
  
  return (
    <div className={`trust-badge ${trustColor}`}>
      <Icon type={trustColor} />
      <span>{trustText}</span>
      {showDetails && (
        <>
          <span className="source">From: {source}</span>
          <span className="date">Updated: {formatDate(lastUpdated)}</span>
          <a href="#source-details">View Source →</a>
        </>
      )}
    </div>
  );
}

// Usage in Data Cards
export function DataCard({ title, value, data }) {
  return (
    <div className="data-card">
      <h3>{title}</h3>
      <div className="value">{value}</div>
      <TrustBadge 
        score={data.trustScore} 
        source={data.source}
        lastUpdated={data.lastUpdated}
        showDetails={true}
      />
      {data.verificationStatus === 'disputed' && (
        <Alert type="warning">
          Multiple conflicting sources found. View all →
        </Alert>
      )}
    </div>
  );
}
```

#### 2.3 Data Validation Rules

```typescript
// Detect impossible/unreasonable data
export class DataValidator {
  validateCompanyData(company: any): ValidationIssues[] {
    const issues = [];
    
    // Revenue sanity check
    if (company.revenue && company.revenue > 1_000_000_000_000) {
      issues.push({
        field: 'revenue',
        severity: 'ERROR',
        message: 'Revenue > $1 trillion - likely data error'
      });
    }
    
    // Headcount sanity check
    if (company.headcount === 0 && company.revenue > 100_000_000) {
      issues.push({
        field: 'headcount',
        severity: 'WARNING',
        message: '$100M+ revenue but 0 employees - data mismatch'
      });
    }
    
    // Founding date validation
    if (company.foundingYear > new Date().getFullYear()) {
      issues.push({
        field: 'foundingYear',
        severity: 'ERROR',
        message: 'Founding year in future'
      });
    }
    
    // Tech stack consistency
    if (!validateTechStackCompatibility(company.techStack)) {
      issues.push({
        field: 'techStack',
        severity: 'WARNING',
        message: 'Unusual tech stack combination - verify'
      });
    }
    
    return issues;
  }
}
```

---

### GIAI ĐOẠN 3: Transparent Data Sourcing (2 tuần)

#### 3.1 Data Lineage Tracking

```typescript
// Track every data point's origin
interface DataLineage {
  finalValue: any;
  history: {
    timestamp: Date;
    source: string;
    value: any;
    method: 'api' | 'manual' | 'calculation' | 'generated';
    user?: string;  // Who entered it
    confidence?: number;
  }[];
  conflicts?: {
    sources: string[];
    values: any[];
    resolution?: string;
  };
}

// Example: Competitor Revenue
// Revenue: $500M
// Lineage:
//   - 2024-01-15: SEC Filing 10-K = $485M → Yes, go to database
//   - 2024-01-10: Crunchbase estimate = $510M → Secondary
//   - 2023-12-20: Press release = $450M → Outdated?
// Trust Score: 0.92 (SEC official source, recent)

// UI: Show data history
export function DataLineageViewer({ lineage }) {
  return (
    <div className="lineage-viewer">
      <div className="current-value">
        <h3>Current Value: ${lineage.finalValue}M</h3>
        <TrustBadge score={0.92} />
      </div>
      
      <details>
        <summary>View Data History</summary>
        <ul>
          {lineage.history.map((entry, i) => (
            <li key={i}>
              <span className="date">{formatDate(entry.timestamp)}</span>
              <span className="source">{entry.source}</span>
              <span className="value">${entry.value}M</span>
              <span className={`confidence confidence-${entry.confidence}`}>
                {entry.confidence * 100}%
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
```

#### 3.2 Citation & Attribution

```typescript
// Every data point must have citations
interface DataWithCitation {
  value: string;
  citations: Citation[];
  canContribute: boolean;  // User can add data if missing
}

interface Citation {
  url: string;
  title: string;
  date: Date;
  excerpt: string;  // Quote from source
  accessedDate: Date;
}

// Render citations
export function CitationList({ citations }) {
  return (
    <div className="citations">
      <p>Sources:</p>
      <ol>
        {citations.map((cite, i) => (
          <li key={i}>
            <a href={cite.url} target="_blank">{cite.title}</a>
            <span className="date">({formatDate(cite.date)})</span>
          </li>
        ))}
      </ol>
      <button className="report-issue">Report inaccuracy</button>
    </div>
  );
}
```

#### 3.3 User Contribution System (Build Trust)

```typescript
// Allow users to verify/correct data
interface UserContribution {
  userId: string;
  companyId: string;
  field: string;
  value: any;
  source: string;           // URL, document, etc
  evidence: {
    screenshotUrl?: string;
    documentUrl?: string;
    description: string;
  };
  timestamp: Date;
  status: 'pending' | 'verified' | 'rejected';
  upvotes: number;
}

// Example: User found company revenue in official filing
// 1. User finds correct revenue: $250M (not $500M)
// 2. Uploads proof (SEC filing screenshot)
// 3. Community votes (other users verify)
// 4. System updates trust score & shows old value

// UI: Contribution Box
export function ContributionBox({ company, field }) {
  return (
    <div className="contribution-box">
      <h4>Help us improve this data</h4>
      <p>We found {company[field]} from {company.lastSource}</p>
      <p>Do you have better information?</p>
      <form onSubmit={submitContribution}>
        <input type="text" placeholder="Correct value" />
        <input type="url" placeholder="Source URL (required)" />
        <textarea placeholder="Why this is more accurate" />
        <button type="submit">Contribute</button>
      </form>
    </div>
  );
}
```

---

## 🎯 Phương Pháp Thực Hiện Cụ Thể

### Bước 1: Xây Dựng Data Quality Layer

```typescript
// NEW FILE: src/services/dataQualityScore.ts
export class DataQualityScorer {
  // Score từ 0-100
  score(dataPoint: DataPoint): number {
    let totalScore = 0;
    
    // 1. Source reliability (40 points)
    totalScore += this.scoreSource(dataPoint.source) * 40;
    
    // 2. Freshness (30 points)
    totalScore += this.scoreFreshness(dataPoint.lastUpdated) * 30;
    
    // 3. Cross-validation (20 points)
    totalScore += this.scoreCrossValidation(dataPoint) * 20;
    
    // 4. Consistency (10 points)
    totalScore += this.scoreConsistency(dataPoint) * 10;
    
    return Math.min(100, totalScore);
  }
}
```

### Bước 2: Chỉnh Sửa API Responses

```typescript
// MODIFY: server.ts - Add source attribution
app.get('/api/competitor/:id', async (req, res) => {
  const competitor = await getCompetitor(req.params.id);
  
  // Add metadata about data quality
  res.json({
    data: competitor,
    metadata: {
      dataQualityScore: calculateTrustScore(competitor),
      sources: {
        revenue: { source: 'SEC', trustLevel: 'verified' },
        headcount: { source: 'LinkedIn', trustLevel: 'unverified' },
        news: { source: 'NewsAPI', trustLevel: 'real-time' }
      },
      lastUpdated: competitor.lastUpdated,
      hasUserContributions: competitor.contributions?.length > 0
    }
  });
});
```

### Bước 3: UI Components with Trust Indicators

```typescript
// NEW FILE: src/components/TrustedDataCard.tsx
// Display data with trust score, source, and citations
// Replace current DataCard with this enhanced version
```

---

## 📈 Kết Quả Kỳ Vọng

| Metric | Trước | Sau | Lợi Ích |
|--------|-------|-----|---------|
| **Trust Score Trung Bình** | ~0.45 | ~0.85 | +89% uy tín |
| **% Real Data** | 20% | 90% | Giảm 70% data fake |
| **User Confidence** | 40% | 87% | Gấp 2x người dùng tin tưởng |
| **Data Freshness** | 30 days | <7 days | Cập nhật nhanh hơn |
| **Source Attribution** | None | 100% | Toàn bộ data có nguồn |

---

## 🔗 Danh Sách API & Nguồn (Chi Tiết)

### Miễn Phí - Tối Ưu

#### 1. **SEC EDGAR** (Mỹ)
```
Endpoint: https://www.sec.gov/cgi-bin/browse-edgar
Data: Revenue, Financials, Officers, Filings
Rate: Unlimited
Trust: ⭐⭐⭐⭐⭐ (Official US Government)
```

#### 2. **NewsAPI** (Tin Tức Toàn Cầu)
```
Free Tier: 100 requests/day
Endpoint: https://newsapi.org/v2
Data: Real-time news from 40k+ sources
Setup: 5 minutes (signup @ newsapi.org)
Trust: ⭐⭐⭐⭐ (Aggregated, high quality)
```

#### 3. **GNews** (Multi-Language)
```
Free Tier: 100 requests/day
Endpoint: https://gnews.io/api/v4
Data: Vietnamese + English news
Trust: ⭐⭐⭐⭐ (Google News feeds)
```

#### 4. **Wikipedia API** (Context)
```
Endpoint: https://en.wikipedia.org/w/api.php
Data: Company history, industry definitions
Rate: Unlimited
Trust: ⭐⭐⭐⭐ (Community vetted)
```

#### 5. **Google Business API** (Local)
```
Data: Reviews, ratings, business info
Purpose: Vietnamese company local presence
```

### Có Chi Phí Nhưng Rất Đáng (Seed Funding Priority)

#### 1. **Crunchbase API**
```
Cost: ~$999/month
Data: Funding, investors, company profiles
Trust: ⭐⭐⭐⭐⭐ (Industry standard for startups)
ROI: High - most requested data
```

#### 2. **Clearbit API**
```
Cost: Free tier available, paid @$50/month
Data: Company profiles, technographics
API: https://clearbit.com/api
Setup: 2 minutes
Trust: ⭐⭐⭐⭐
```

#### 3. **SerpAPI** (Web Scraping)
```
Cost: $50-200/month
Data: Real Google search results
Purpose: Verify public presence, market mentions
```

---

## 🚀 Roadmap Chi Tiết

### **Week 1-2: Data Quality Foundation**
- [ ] Implement `TrustScore` class
- [ ] Add `VerificationStatus` enum
- [ ] Create `DataValidator` for sanity checks
- [ ] Update API responses with metadata

### **Week 3: Free APIs Integration**
- [ ] Connect SEC EDGAR for US companies
- [ ] Integrate Wikipedia for context
- [ ] Add NewsAPI (already exists)
- [ ] Build news aggregation with source tracking

### **Week 4: UI Components**
- [ ] Create `TrustBadge` component
- [ ] Build `DataLineageViewer`
- [ ] Add `CitationList` for sources
- [ ] Implement `ContributionBox` for user data

### **Week 5: Testing & Optimization**
- [ ] Test data quality on 1000+ companies
- [ ] Refine trust scoring algorithm
- [ ] User feedback iterations

### **Week 6: Premium Integration (Optional)**
- [ ] Evaluate Crunchbase ROI
- [ ] Setup Clearbit API
- [ ] Create backup sources strategy

---

## 📝 Chỉ Số Giám Sát

Track these metrics để measure improvement:

```
Dashboard KPIs:
├─ Average Trust Score per page
├─ % Real Data vs Generated
├─ Data Freshness (% data < 7 days old)
├─ User Contributions per day
├─ API Uptime for each source
└─ Trust Score Improvement over time
```

---

## 🎓 Tài Liệu & Resources

1. **Hướng Dẫn SEC EDGAR**
   - https://www.sec.gov/cgi-bin/browse-edgar

2. **NewsAPI Documentation**
   - https://newsapi.org/docs

3. **GNews API Docs**
   - https://gnews.io/docs

4. **Crunchbase API** (Premium)
   - https://www.crunchbase.com/api

5. **Best Practices for Data Attribution**
   - https://www.trustradius.com/buyer-guide/b2b-data-quality

---

## 💡 Câu Hỏi Thường Gặp

**Q: What if API is blocked or returns error?**
A: Fall back to cached data, not generated data. Mark as "cached" in UI.

**Q: How to handle conflicting data from multiple sources?**
A: Show all versions, let user choose, mark as "disputed".

**Q: Performance impact of tracking all data lineage?**
A: Store lineage in separate collection, cache trust scores (24h TTL).

**Q: How to prevent user spam in contribution system?**
A: Reputation points system, require sources, community voting.

---

## 📞 Support & Implementation Help

Next steps:
1. Review this strategy with team
2. Prioritize: Which data category needs most trust first?
3. Start with Phase 1 (free APIs)
4. Measure and iterate

**Questions? Create GitHub issue with `[data-quality]` tag**
