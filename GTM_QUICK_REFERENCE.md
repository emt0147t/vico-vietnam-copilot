# 🎯 GTM Strategy Builder - Quick Reference Card

## 📱 Where to Find It?

**Website:** http://localhost:3000
**Tab:** Left sidebar → 🚀 **GTM Strategy**
**Feature:** Generate Go-To-Market strategies for Vietnamese companies

---

## ⚡ 5-Step Quick Start

### 1️⃣ Open Website
```
http://localhost:3000
```

### 2️⃣ Navigate to GTM Tab
```
Left Sidebar → 🚀 GTM Strategy
```

### 3️⃣ Enter Company Name
```
Examples: Vingroup, FPT Software, Techcombank, VietJet
```

### 4️⃣ Generate Strategy
```
Click: "Generate GTM Strategy 📊"
Wait: 3-5 seconds
```

### 5️⃣ Review Results
```
Tab 1: Overview   - Strategy summary
Tab 2: SWOT       - Strengths/Weaknesses/Opportunities/Threats
Tab 3: Plan       - Execution details
Tab 4: Timeline   - 3 phases with milestones
```

---

## 🎯 What You Get

### Recommendation
- Entry Strategy (one of 6)
- Why it's best for this company
- ROI estimate
- Time to market
- Investment needed

### SWOT Analysis
- **Strengths** (green) - Competitive advantages
- **Weaknesses** (red) - Areas to improve
- **Opportunities** (blue) - Growth potential
- **Threats** (orange) - External risks

### Financial Model
- **Year 1:** $2M revenue, -12% margin
- **Year 2:** $7.5M revenue, +15% margin
- **Year 3:** $18M revenue, +32% margin

### Feasibility Score
- **80-100:** ✅ Highly Feasible (green)
- **60-79:** ⚠️ Moderately Feasible (yellow)
- **40-59:** 🔴 Challenging (orange)
- **0-39:** ❌ High Risk (red)

### Timeline
- **Phase 1 (Launch):** Month 1-3 objectives
- **Phase 2 (Expand):** Month 4-8 objectives
- **Phase 3 (Scale):** Month 9-12 objectives
- **Budget allocation** per phase

---

## 🔍 Test Companies

```
Vingroup          → Large conglomerate, 45+ articles
FPT Software      → Tech, 38+ articles
Techcombank       → Finance, 32+ articles
VietJet           → Aviation, 28+ articles
Viettel           → Telecom, 41+ articles
```

---

## 🔧 API Testing

### Generate Strategy
```bash
curl -X POST http://localhost:3001/api/gtm/generate \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Vingroup",
    "targetMarkets": ["Vietnam", "Southeast Asia"]
  }'
```

### Search Companies
```bash
curl "http://localhost:3001/api/gtm/generate?company=Vingroup"
```

---

## 📊 6 Entry Strategies

| Strategy | Timeline | Investment | Best For |
|----------|----------|-----------|----------|
| **Direct Sales** | 6-9 months | $5M | B2B Enterprise |
| **Channel Partner** | 4-6 months | $3-5M | Scale quickly |
| **Online** | 2-3 months | $1-2M | Quick launch |
| **Licensing** | 8-12 months | $2-4M | IP monetization |
| **Joint Venture** | 6-9 months | $8-10M | New market |
| **Acquisition** | 1-3 months | $10M+ | Fast growth |

---

## ✅ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Company not found" | Check spelling, must exist in database |
| "API not responding" | Verify backend running: `npm run dev` |
| "Gemini error" | Check .env has GOOGLE_GEMINI_KEY |
| "No news found" | Some companies may have few articles |
| "Slow response" | Normal for first request, cached after |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `GTM_QUICK_START.md` | Full getting started guide |
| `GTM_STRATEGY_BUILDER_v2.md` | Complete documentation |
| `GTM_INTEGRATION_GUIDE.md` | Integration instructions |
| `components/GTMStrategyPanel.tsx` | Search component |
| `components/GTMStrategyViewer.tsx` | Display component |
| `services/gtmStrategyService.ts` | Service logic |
| `app/api/gtm/generate/route.ts` | API endpoint |

---

## 🎓 Learning Path

```
Start Here
   ↓
Read GTM_QUICK_START.md (5 min)
   ↓
Try in browser (5 min)
   ↓
Read GTM_STRATEGY_BUILDER_v2.md (15 min)
   ↓
Test 5 companies (15 min)
   ↓
Expert! Ready to use
```

---

## 💡 Key Features

✨ AI-powered (Gemini)
✨ Fast (3-5 seconds)
✨ Data-driven (4,800+ articles)
✨ Comprehensive (SWOT + Finance + Risk)
✨ Beautiful UI (dark mode)
✨ Mobile optimized
✨ Production ready

---

## 🚀 Advanced Usage

### Build Full Strategy
Click "Build Full GTM Strategy" button for:
- Detailed marketing plan
- Sales strategy
- Partner strategy
- Product positioning
- Risk mitigation plan

### Compare Companies
Generate strategy for multiple companies to compare:
- Entry strategies
- Financial projections
- Feasibility scores
- Risk profiles

### Market Analysis
Search trends by industry:
- Competitors entering market
- Signal frequency patterns
- Growth opportunities
- Threats and risks

---

## 📊 Key Metrics

| Metric | Value |
|--------|-------|
| Companies indexed | 10,236 |
| News articles | 4,800+ |
| Signal types | 17 |
| Generation time | 3-5 seconds |
| Feasibility range | 0-100 |
| Entry strategies | 6 types |
| Financial years | 3 years |
| Risk types | 4-6 risks |

---

## 🔗 Quick Links

- **Website:** http://localhost:3000
- **Tab:** GTM Strategy (🚀 icon)
- **API:** http://localhost:3001/api/gtm/generate
- **Docs:** GTM_QUICK_START.md
- **Code:** components/GTMStrategyPanel.tsx

---

## ⚙️ System Requirements

✅ Node.js 16+
✅ MongoDB running
✅ Gemini API key in .env
✅ Backend running on :3001
✅ Frontend running on :3000

---

## 🎯 Success Indicators

- ✅ GTM tab appears in sidebar
- ✅ Company search works
- ✅ Recommendations generate (< 5 sec)
- ✅ All 4 tabs display content
- ✅ Feasibility score shows
- ✅ No console errors
- ✅ Dark mode toggles
- ✅ Mobile responsive

---

## 📞 Need Help?

**Issues:**
1. Check browser console (F12)
2. Check network tab for API errors
3. Read `GTM_QUICK_START.md`
4. Review `GTM_INTEGRATION_GUIDE.md`
5. Check MongoDB is running
6. Check Gemini API key valid

---

## 🎊 That's It!

**You're ready to use GTM Strategy Builder!**

Go to http://localhost:3000 now and try it! 🚀

---

*Last Updated: Today*
*Status: Production Ready ✅*
