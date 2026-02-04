# ✅ Getting Started Checklist

## 🎯 VICO News Intelligence - Implementation Checklist

Complete this checklist to deploy the news intelligence features to your production environment.

---

## 📋 Phase 1: Prerequisites (Do First!)

### Environment Setup
- [ ] Verify Node.js v18+ installed: `node --version`
- [ ] Verify npm v9+ installed: `npm --version`
- [ ] Navigate to project directory: `cd d:\vico---vietnam-copilot`

### MongoDB Setup (Choose ONE)
**Option A: Local MongoDB**
- [ ] Download MongoDB Community Edition from mongodb.com
- [ ] Install MongoDB
- [ ] Start MongoDB: `mongod`
- [ ] Verify running: Open MongoDB Compass, connect to localhost:27017

**Option B: MongoDB Atlas (Cloud)**
- [ ] Sign up at mongodb.com/cloud
- [ ] Create free cluster (M0)
- [ ] Get connection string
- [ ] Add to `.env` as `MONGODB_URI`

### Gemini API Setup
- [ ] Go to https://aistudio.google.com/apikey
- [ ] Create new API key (or copy existing)
- [ ] Add to `.env` file

### Environment File
- [ ] Create/update `.env` file with:
  ```env
  API_KEY=sk-your-gemini-key-here
  MONGODB_URI=mongodb://localhost:27017
  # OR for MongoDB Atlas:
  # MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
  ```

### CSV File Verification
- [ ] Confirm CSV exists: `d:\Tong_Hop_Tin_Tuc_Final.csv`
- [ ] File size should be ~13.7 MB
- [ ] Contains 38,964+ articles
- [ ] No permission issues (readable)

---

## 📦 Phase 2: Dependencies & Installation

### Install NPM Packages
- [ ] Run: `npm install`
- [ ] Run: `npm install recharts`
- [ ] Verify packages installed: `npm list recharts`

### Verify Dependencies
- [ ] Check `package.json` has `recharts`: ✅
- [ ] Check `package.json` has import scripts: ✅
  - `"import-news": "tsx scripts/importNews.ts"`
  - `"import-news-sample": "tsx scripts/importNews.ts 5000"`

---

## 🧪 Phase 3: Testing & Validation

### MongoDB Connection
- [ ] Start MongoDB (if local)
- [ ] Run: `npm run server`
- [ ] Visit: `http://localhost:3001/api/health`
- [ ] Should show: `{"status":"active", ...}`

### CSV File Loading
- [ ] Run sample import: `npm run import-news-sample`
- [ ] Watch for progress output
- [ ] Should complete in ~20 minutes
- [ ] Check MongoDB for imported data:
  ```bash
  # In MongoDB Compass or mongosh:
  db.news.countDocuments()  # Should show 5000+
  ```

### API Testing
- [ ] Test stats endpoint:
  ```bash
  curl http://localhost:3001/api/news/stats
  ```
- [ ] Should return: `{"success":true,"stats":{...}}`

- [ ] Test search endpoint:
  ```bash
  curl -X POST http://localhost:3001/api/news/search \
    -H "Content-Type: application/json" \
    -d '{"type":"all","limit":5}'
  ```
- [ ] Should return: News items with signals, sentiment, summary

---

## 🎨 Phase 4: UI Integration

### Add Components to Your App

**Option 1: Homepage - Add Market Pulse**
- [ ] Open your home/dashboard page component
- [ ] Add import: `import MarketPulse from '@/components/MarketPulse';`
- [ ] Add component: `<MarketPulse maxItems={20} />`
- [ ] Test rendering and styling

**Option 2: Company Profile - Add News Section**
- [ ] Open company detail page component
- [ ] Add import: `import CompanyNewsSection from '@/components/CompanyNewsSection';`
- [ ] Add component: `<CompanyNewsSection companyName={company.name} />`
- [ ] Test with different companies

**Option 3: Analytics - Add Dashboard**
- [ ] Create new page: `pages/Analytics.tsx` (or similar)
- [ ] Add import: `import NewsStatsDashboard from '@/components/NewsStatsDashboard';`
- [ ] Add component: `<NewsStatsDashboard />`
- [ ] Test charts and statistics display

### Styling & Responsiveness
- [ ] Check components look good on mobile
- [ ] Verify colors are visible (sentiment indicators)
- [ ] Test hover states on cards
- [ ] Verify all buttons are clickable

---

## 🚀 Phase 5: Production Deployment

### Full News Import
- [ ] Ensure MongoDB has sufficient space (2GB+ free)
- [ ] Run full import: `npm run import-news`
- [ ] Monitor progress (should take 2-4 hours)
- [ ] Expected result: 39,000 articles with full enrichment

### Verify Production Data
- [ ] Check MongoDB count:
  ```bash
  db.news.countDocuments()  # Should show ~39,000
  ```
- [ ] Check signal distribution:
  ```bash
  curl http://localhost:3001/api/news/stats
  ```
- [ ] Verify API performance:
  ```bash
  curl -X POST http://localhost:3001/api/news/search \
    -H "Content-Type: application/json" \
    -d '{"type":"company","query":"FPT Software","limit":10}'
  ```

### Production Checklist
- [ ] All components rendering correctly
- [ ] APIs responding in <1 second
- [ ] No console errors
- [ ] News feed shows enriched data
- [ ] Company profiles show relevant news
- [ ] Dashboard displays statistics
- [ ] Search functionality working

---

## 📊 Phase 6: Monitoring & Maintenance

### Daily Tasks
- [ ] Monitor API response times
- [ ] Check for errors in logs
- [ ] Verify data freshness
- [ ] User feedback collection

### Weekly Tasks
- [ ] Review signal distribution (are signals being detected?)
- [ ] Check sentiment accuracy (does sentiment match reality?)
- [ ] Monitor database size
- [ ] Backup MongoDB data

### Monthly Tasks
- [ ] Re-import latest news from CSV
- [ ] Archive old articles if needed
- [ ] Review and optimize queries
- [ ] Update documentation
- [ ] Gather usage metrics

### Troubleshooting
If something breaks:
- [ ] Check `.env` variables
- [ ] Verify MongoDB is running
- [ ] Check MongoDB connection string
- [ ] Review error logs
- [ ] Test with sample data again
- [ ] Check API key validity
- [ ] Verify CSV file still exists and is readable

---

## 🎯 Phase 7: Optional Enhancements

Once basic features work, consider:

### Enhanced Features
- [ ] Add embedded search to company profiles
- [ ] Create trending news widget
- [ ] Build competitor alerts system
- [ ] Add email digest functionality
- [ ] Create custom signal rules
- [ ] Build export to PDF feature

### Performance Optimizations
- [ ] Add caching layer (Redis)
- [ ] Implement pagination for large results
- [ ] Add filtering by date range
- [ ] Create saved searches
- [ ] Add news category filters

### Analytics
- [ ] Build trend analysis reports
- [ ] Create market sentiment dashboard
- [ ] Track signal velocity
- [ ] Competitor benchmarking
- [ ] Export monthly reports

---

## ✅ Success Criteria

You'll know it's working when:

### Functionality ✅
- ✅ All 4 features working (Signals, Summary, Sentiment, Linking)
- ✅ 39,000 articles in database
- ✅ API endpoints responsive
- ✅ Components display correctly
- ✅ Search returns relevant results

### Performance ✅
- ✅ Homepage loads in <2 seconds
- ✅ Company profile loads in <1 second
- ✅ Search results appear in <500ms
- ✅ Dashboard renders in <3 seconds
- ✅ No timeout errors

### Data Quality ✅
- ✅ News has correct signal classifications
- ✅ Sentiments match article content
- ✅ Summaries are accurate and concise
- ✅ Company mentions are relevant
- ✅ Sources are properly attributed

### User Experience ✅
- ✅ UI is intuitive and clear
- ✅ Colors indicate sentiment clearly (green/red)
- ✅ Filtering by signal works smoothly
- ✅ Links to articles are functional
- ✅ Mobile-friendly responsive design

---

## 🆘 Quick Troubleshooting

### "MongoDB connection error"
- [ ] Is MongoDB running? `mongod`
- [ ] Is connection string correct in `.env`?
- [ ] Is port 27017 open?

### "API_KEY error"
- [ ] Check `.env` file exists
- [ ] Verify API_KEY is set
- [ ] API key should start with `sk-`
- [ ] Get new key from https://aistudio.google.com/apikey

### "CSV file not found"
- [ ] Verify file path: `d:\Tong_Hop_Tin_Tuc_Final.csv`
- [ ] Check file permissions (must be readable)
- [ ] Check disk space available

### "Import timeout"
- [ ] Check memory available (1GB+ needed)
- [ ] Try smaller batch: `npm run import-news-sample`
- [ ] Reduce concurrency in `scripts/importNews.ts` (change 3 to 2)

### "Component not rendering"
- [ ] Recharts installed? `npm list recharts`
- [ ] MongoDB has data? Check `/api/news/stats`
- [ ] Check browser console for errors
- [ ] Verify import statements are correct

---

## 📞 Getting Help

### Documentation to Read
1. Start: `NEWS_INTELLIGENCE_QUICKSTART.md`
2. Detailed: `NEWS_INTELLIGENCE_SETUP.md`
3. Architecture: `NEWS_INTELLIGENCE_REFERENCE_MAP.md`
4. Overview: `IMPLEMENTATION_SUMMARY.md`

### Code Comments
- Every TypeScript file has JSDoc comments
- Check function signatures for parameter types
- Review error messages - they're descriptive

### Test Commands
```bash
# Test MongoDB
mongosh  # Enter MongoDB shell
db.news.countDocuments()

# Test CSV loading
npm run import-news-sample

# Test API
curl http://localhost:3001/api/news/stats

# Run in dev mode
npm run dev
```

---

## 📅 Timeline Estimate

- **Phase 1: Setup** - 30 minutes
- **Phase 2: Installation** - 10 minutes
- **Phase 3: Testing** - 30 minutes (+ 20 min sample import)
- **Phase 4: UI Integration** - 1-2 hours
- **Phase 5: Production** - 4 hours (+ full import time)
- **Phase 6: Monitoring** - Ongoing
- **Phase 7: Enhancements** - As needed

**Total Initial Setup: 6-8 hours**
**Total Time to Production: Full day (can run overnight)**

---

## 🎉 Ready to Launch?

When all ✅ are checked, you're ready!

**Last verification:**
- [ ] MongoDB running: `mongod` or MongoDB Atlas connected
- [ ] `.env` file configured with API_KEY and MONGODB_URI
- [ ] CSV file exists: `d:\Tong_Hop_Tin_Tuc_Final.csv`
- [ ] Dependencies installed: `npm install recharts`
- [ ] Sample import successful: `npm run import-news-sample`
- [ ] APIs working: Tested `/api/news/stats`
- [ ] Components integrated: Added to your pages
- [ ] UI rendering: Components display correctly

**Then run:** `npm run dev` or `npm run server`

**Go live! 🚀**

---

## 📝 Notes & Observations

Keep track of:
- [ ] Setup date: ___________
- [ ] Completion date: ___________
- [ ] MongoDB location: ___________
- [ ] CSV file location: ___________
- [ ] API performance metrics: ___________
- [ ] User feedback: ___________
- [ ] Issues encountered: ___________
- [ ] Enhancements needed: ___________

---

**Congratulations! You now have enterprise-grade news intelligence for your VICO platform! 🎊**
