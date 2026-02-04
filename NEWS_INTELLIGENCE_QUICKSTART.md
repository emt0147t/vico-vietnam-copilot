# 🚀 News Intelligence Implementation - Quick Start

## What's New?

Your VICO platform now has **4 powerful AI-driven news features**:

### 1. 📊 **Market Pulse**
- News automatically classified into market signals:
  - 💰 Funding/Investment deals
  - 🤝 M&A (Mergers & Acquisitions)
  - 🚀 Product Launches
  - ⚖️ Legal/Regulatory changes
  - 👥 Personnel changes
  - 🤲 Partnerships
  - 📈 Earnings reports
  - 🌍 Business expansion

### 2. 📝 **AI Summarization**
- Gemini AI summarizes long articles into **3 bullet points**
- Executives get key insights in 5 seconds
- 38,964 Vietnamese articles ready to summarize

### 3. 😊 **Sentiment Analysis**
- Auto-detects article tone:
  - 🟢 **Positive** (Green) - Good news for company
  - 🔴 **Negative** (Red) - Challenges/issues
  - ⚪ **Neutral** (Gray) - Informational

### 4. 🔗 **Smart Entity Linking**
- System auto-detects company mentions in news
- Creates links between companies and articles
- Example: Article mentions "FPT Software" → automatically linked

---

## Files Created (15 files)

### Core Models & Data
- ✅ `data/newsModels.ts` - Data structures
- ✅ `utils/newsLoader.ts` - CSV parser

### AI Services
- ✅ `services/newsEnrichmentService.ts` - Signal/Sentiment/Summary/Linking

### Database
- ✅ `utils/newsDatabase.ts` - MongoDB integration

### APIs
- ✅ `app/api/news/search/route.ts` - Search endpoint
- ✅ `app/api/news/import/route.ts` - Import endpoint
- ✅ `app/api/news/stats/route.ts` - Statistics endpoint

### UI Components
- ✅ `components/MarketPulse.tsx` - News feed
- ✅ `components/NewsStatsDashboard.tsx` - Analytics dashboard
- ✅ `components/CompanyNewsSection.tsx` - Company profile integration

### Scripts & Docs
- ✅ `scripts/importNews.ts` - Import command
- ✅ `NEWS_INTELLIGENCE_SETUP.md` - Full documentation
- ✅ `NEWS_INTELLIGENCE_QUICKSTART.md` - This file!

---

## Quick Setup (5 Steps)

### Step 1: Install Recharts
```bash
npm install recharts
```

### Step 2: Verify CSV File
Check that this file exists: `d:\Tong_Hop_Tin_Tuc_Final.csv`
- Size: ~13.7 MB
- Articles: ~39,000
- Format: CSV with columns: Tiêu đề (Title), Link, Nội dung (Content)

### Step 3: Set Environment Variables
Add/update in `.env`:
```env
API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://localhost:27017
```

**MongoDB Setup:**
- **Local**: Download from mongodb.com, run `mongod`
- **Cloud**: Use MongoDB Atlas (free tier available)

### Step 4: Import News
```bash
# Import first 5,000 articles (test run - 20 minutes)
npm run import-news-sample

# Or import all 39,000 (1-2 hours)
npm run import-news
```

Watch the progress:
```
📰 Loading news from d:\Tong_Hop_Tin_Tuc_Final.csv
📝 Progress: 5000/5000 (100%)
✅ News loading complete
🤖 Enriching: 5000/5000 (100%)
✅ Enrichment complete
📝 Saving to MongoDB...
✅ Saved 5000 articles

✨ Import complete! Ready for production.
```

### Step 5: Use in Your App

**Option A: Show All Market News**
```tsx
import MarketPulse from '@/components/MarketPulse';

export default function NewsPage() {
  return <MarketPulse maxItems={50} />;
}
```

**Option B: Show News for Specific Company** (in Company Profile)
```tsx
import CompanyNewsSection from '@/components/CompanyNewsSection';

export default function CompanyProfile({ company }) {
  return (
    <div>
      <h1>{company.name}</h1>
      <CompanyNewsSection companyName={company.name} />
    </div>
  );
}
```

**Option C: Show Analytics Dashboard**
```tsx
import NewsStatsDashboard from '@/components/NewsStatsDashboard';

export default function Analytics() {
  return <NewsStatsDashboard />;
}
```

---

## Testing

### Test API Endpoints

**1. Search for company news:**
```bash
curl -X POST http://localhost:3001/api/news/search \
  -H "Content-Type: application/json" \
  -d '{
    "type": "company",
    "query": "FPT Software",
    "limit": 5
  }'
```

**2. Get market statistics:**
```bash
curl http://localhost:3001/api/news/stats
```

**3. Filter by signal:**
```bash
curl -X POST http://localhost:3001/api/news/search \
  -H "Content-Type: application/json" \
  -d '{
    "type": "signal",
    "query": "funding",
    "limit": 10
  }'
```

---

## Performance Timeline

| Task | Duration | Status |
|------|----------|--------|
| Load 5,000 articles | 1 min | ⚡ Fast |
| Enrich (Signals + Sentiment + Summary) | 15 min | 🤖 AI processing |
| Save to MongoDB | 1 min | 💾 Database |
| **Total: 5,000 articles** | **17 min** | ✅ Ready |
| **Total: 39,000 articles** | **2 hours** | ✅ Complete |

---

## Usage Examples

### Search by Company
Find all news mentioning a company:
```
POST /api/news/search
{
  "type": "company",
  "query": "VinFast",
  "limit": 10
}
```

Response shows:
```json
{
  "title": "VinFast raises $1B in Series C",
  "signals": ["funding", "partnership"],
  "sentiment": "positive",
  "summary": "• VinFast secures $1B\n• Expands EV market\n• Strengthens balance",
  "mentionedCompanies": ["VinFast", "Goldman Sachs"]
}
```

### Filter by Market Signal
Find all funding news:
```
POST /api/news/search
{
  "type": "signal",
  "query": "funding",
  "limit": 20
}
```

### Filter by Sentiment
Find all negative news (to watch for risks):
```
POST /api/news/search
{
  "type": "sentiment",
  "query": "negative",
  "limit": 15
}
```

---

## Common Questions

### Q: How long does import take?
- **5,000 articles**: 15-20 min
- **39,000 articles**: 1.5-2 hours
- Can be done overnight or in chunks

### Q: What if import fails?
- Check MongoDB is running: `mongod`
- Check `.env` has `API_KEY`
- Check CSV file exists
- Try smaller batch: `npm run import-news-sample`

### Q: Can I import more news later?
Yes! Just run import again. It will:
- Skip duplicates (by link)
- Add new articles
- Keep existing data

### Q: How often should I update?
- **Daily**: Run import for new articles
- **Weekly**: Review statistics dashboard
- **Monthly**: Clean up old articles (if needed)

### Q: Can I customize signal types?
Yes! Edit `data/newsModels.ts` → `SIGNAL_KEYWORDS`
Add new types or keywords for your specific needs.

---

## Next Steps

1. ✅ Install Recharts: `npm install recharts`
2. ✅ Verify MongoDB is running
3. ✅ Run initial import: `npm run import-news-sample`
4. ✅ Test API: POST `/api/news/search`
5. ✅ Add component to your app
6. ✅ Monitor at `/api/news/stats`
7. ✅ Customize signal types if needed

---

## File Structure

```
vico-vietnam-copilot/
├── data/
│   ├── newsModels.ts          ✅ NEW - Data types
│   └── news.ts                (existing)
├── utils/
│   ├── newsLoader.ts          ✅ NEW - CSV parser
│   ├── newsDatabase.ts        ✅ NEW - MongoDB
│   └── ...
├── services/
│   ├── newsEnrichmentService.ts ✅ NEW - AI enrichment
│   └── ...
├── app/api/news/
│   ├── search/route.ts        ✅ NEW - API
│   ├── import/route.ts        ✅ NEW - API
│   └── stats/route.ts         ✅ NEW - API
├── components/
│   ├── MarketPulse.tsx        ✅ NEW - News feed
│   ├── NewsStatsDashboard.tsx ✅ NEW - Analytics
│   ├── CompanyNewsSection.tsx ✅ NEW - Company profile
│   └── ...
├── scripts/
│   └── importNews.ts          ✅ NEW - Import tool
├── NEWS_INTELLIGENCE_SETUP.md ✅ NEW - Full docs
└── package.json               ✅ UPDATED
```

---

## API Reference

### POST /api/news/search
Search news by company, signal, sentiment, or embedding.

**Request:**
```json
{
  "type": "company|signal|sentiment|embedding|all",
  "query": "search term or array",
  "limit": 10,
  "minSimilarity": 0.5
}
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "results": [...]
}
```

### POST /api/news/import
Import and enrich news from CSV.

**Request:**
```json
{
  "maxRows": 5000,
  "startRow": 0
}
```

**Response:**
```json
{
  "success": true,
  "imported": 5000,
  "newTotal": 38000
}
```

### GET /api/news/stats
Get market statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalNews": 39000,
    "signals": {"funding": 2500, ...},
    "sentiments": {"positive": 15000, ...}
  }
}
```

---

## Support & Troubleshooting

### MongoDB not running?
```bash
# Windows
# Download MongoDB Community Edition
# Run: mongod

# Or use MongoDB Atlas (cloud)
# Sign up at mongodb.com/cloud
```

### API_KEY error?
Add to `.env`:
```env
API_KEY=sk-XXXXXXXXXXXXXXXXXX
```

Get from: https://aistudio.google.com/apikey

### CSV not found?
Ensure file exists: `d:\Tong_Hop_Tin_Tuc_Final.csv`

### Import timeout?
Reduce batch size in `scripts/importNews.ts`:
```typescript
concurrency: 2  // was 3
```

---

## Success Metrics

After implementation, you should see:
- ✅ 39,000+ articles in database
- ✅ All articles have signal classifications
- ✅ All articles have sentiment scores
- ✅ All articles have 3-bullet summaries
- ✅ Company mentions linked automatically
- ✅ <500ms query response time
- ✅ /api/news/stats showing market trends

---

**Ready to go live? Start with Step 1! 🚀**
