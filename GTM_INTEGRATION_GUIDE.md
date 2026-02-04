# 🔗 GTM Strategy Builder - Integration Guide

## Overview

This guide explains how to integrate the GTM Strategy Builder into the main VICO UI.

---

## 📁 File Structure

```
VICO GTM Strategy System
├── Data Models
│   └── data/gtmModels.ts (350 lines)
│       ├── GTMStrategy interface
│       ├── GTMRecommendation interface
│       ├── GTMPlan interface
│       ├── 6 EntrySrtegy enums
│       └── Financial projections
│
├── Service Layer
│   └── services/gtmStrategyService.ts (400 lines)
│       ├── generateGTMRecommendation()
│       ├── buildFullGTMStrategy()
│       ├── calculateFeasibility()
│       └── Helper functions
│
├── API Route
│   └── app/api/gtm/generate/route.ts (100 lines)
│       ├── POST /api/gtm/generate
│       └── GET /api/gtm/generate
│
└── UI Component
    └── components/GTMStrategyViewer.tsx (350 lines)
        ├── 4 Tabs (Overview, SWOT, Plan, Timeline)
        ├── Feasibility scoring visualization
        └── Metric cards display
```

---

## 🔧 Integration Steps

### Step 1: Check API Route

Verify the API route is working:

```bash
# Test POST request
curl -X POST http://localhost:3001/api/gtm/generate \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Vingroup", "targetMarkets": ["Vietnam"]}'

# Test GET request
curl http://localhost:3001/api/gtm/generate?company=Vingroup
```

### Step 2: Add GTM Tab to Main Navigation

In your main VICO component (e.g., `VicoUI.tsx` or `App.tsx`):

```typescript
import { GTMStrategyViewer } from "@/components/GTMStrategyViewer";

// Add to tabs/navigation
const tabs = [
  { id: "pulse", label: "Market Pulse", icon: "📊" },
  { id: "news", label: "News Intelligence", icon: "📰" },
  { id: "gtm", label: "GTM Strategy", icon: "🚀" },  // NEW
  { id: "company", label: "Companies", icon: "🏢" },
];

// Add to render
{activeTab === "gtm" && (
  <GTMStrategyPanel />
)}
```

### Step 3: Create GTM Panel Component

Create a new component `components/GTMStrategyPanel.tsx`:

```typescript
import React, { useState } from "react";
import { GTMStrategyViewer } from "./GTMStrategyViewer";

export function GTMStrategyPanel() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateGTM = async (companyName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gtm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          companyName,
          targetMarkets: ["Vietnam", "Southeast Asia"]
        }),
      });

      if (!response.ok) throw new Error("Failed to generate GTM");
      const data = await response.json();
      setRecommendation(data.recommendation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Company Search */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter company name..."
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={() => handleGenerateGTM(selectedCompany)}
          disabled={loading || !selectedCompany}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate GTM"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* GTM Strategy Viewer */}
      {recommendation && (
        <GTMStrategyViewer recommendation={recommendation} />
      )}
    </div>
  );
}
```

### Step 4: Test Integration

1. Start the backend:
```bash
npm run dev
```

2. Open browser to http://localhost:3000

3. Navigate to "GTM Strategy" tab

4. Enter a company name (e.g., "Vingroup", "Techcombank", "FPT Software")

5. Click "Generate GTM"

6. Review recommendation and analyze SWOT, Plan, Timeline

---

## 🔄 Data Flow

```
User Input (Company Name)
        ↓
POST /api/gtm/generate
        ↓
Validate & Query NewsDB
        ↓
Extract Market Signals
        ↓
Find Competitors
        ↓
Call Gemini API
        ↓
Generate GTM Recommendation
        ↓
Return: {recommendation, analysis}
        ↓
Display GTMStrategyViewer
        ↓
User Actions:
  - View Overview tab
  - Analyze SWOT
  - Review Plan details
  - Check Timeline
  - Build Full Strategy (optional)
```

---

## 🧪 Testing Guide

### Test Cases

1. **Valid Company**
   - Input: "Vingroup"
   - Expected: GTM recommendation displayed
   - Verify: All 4 tabs work, feasibility score ≥ 70

2. **Invalid Company**
   - Input: "NonexistentCompanyXYZ"
   - Expected: 404 error message
   - Verify: Error displayed, no crash

3. **Missing Market**
   - Input: "" (empty)
   - Expected: 400 validation error
   - Verify: Input validation working

4. **Feasibility Scoring**
   - Test: High ROI + Long timeline = Medium feasibility
   - Verify: Score correctly weighted (0-100 range)

5. **SWOT Display**
   - Test: Each quadrant shows 3-5 factors
   - Verify: Color coding (green=S/O, red=W/T)

6. **Financial Projections**
   - Test: 3-year forecast shown in timeline
   - Verify: Year 1 negative, Years 2-3 positive

### Performance Testing

```bash
# Generate multiple GTM strategies
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/gtm/generate \
    -H "Content-Type: application/json" \
    -d "{\"companyName\": \"TestCompany$i\"}" \
    2>/dev/null | jq .
done

# Measure response time
time curl -X POST http://localhost:3001/api/gtm/generate \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Vingroup"}'
```

---

## 🐛 Troubleshooting

### Issue: "Company not found"
**Solution:** Check company name spelling. Use exact name from companies.csv

### Issue: "API not responding"
**Solution:** Verify backend running on http://localhost:3001. Check MongoDB connection.

### Issue: "Gemini API error"
**Solution:** 
- Check API key in .env file
- Verify quota remaining
- Check API enablement in Google Cloud Console

### Issue: "Empty recommendation"
**Solution:** 
- Verify NewsDB has articles for company
- Check signal extraction logic
- Review Gemini prompt formatting

### Issue: "Slow response (>10s)"
**Solution:**
- Reduce news query results (limit to 50)
- Cache recommendations in MongoDB
- Pre-calculate feasibility scores

---

## 📊 Sample Test Data

Best companies to test:

1. **Vingroup** - 45+ news articles, clear signals
2. **FPT Software** - Tech sector, strong growth signals
3. **Techcombank** - Finance sector, M&A signals
4. **VietJet** - Aviation, expansion signals
5. **Viettel** - Telecom, partnership signals

---

## 🎯 Advanced Features (Roadmap)

### Phase 2: Strategy Persistence
- Save GTM strategies to MongoDB
- Retrieve saved strategies by ID
- Version tracking of recommendations
- Team sharing and collaboration

### Phase 3: Scenario Modeling
- Create multiple GTM scenarios
- Compare strategies side-by-side
- What-if analysis tools
- Financial simulation

### Phase 4: Execution Tracking
- Monitor GTM progress
- Track KPIs against projections
- Risk monitoring dashboard
- Milestone tracking

### Phase 5: Expert Integration
- Connect with GTM consultants
- Schedule expert reviews
- Get recommendations on strategies
- Access industry benchmarks

---

## 📝 API Reference

### Generate GTM Recommendation

**Endpoint:** `POST /api/gtm/generate`

**Request:**
```json
{
  "companyName": "Vingroup",
  "targetMarkets": ["Vietnam", "Southeast Asia"],
  "budget": 5000000  // Optional, in USD
}
```

**Response:**
```json
{
  "success": true,
  "recommendation": {
    "companyName": "Vingroup",
    "recommendedStrategy": "direct_sales",
    "rationale": "...",
    "feasibilityScore": 85,
    "estimatedROI": 150,
    "timeToMarket": 6,
    "requiredInvestment": 5,
    "nextSteps": [...]
  },
  "analysis": {
    "newsCount": 45,
    "topSignals": ["expansion", "partnership"],
    "competitors": ["Techcombank"]
  }
}
```

**Error Responses:**
- `400` - Invalid input (missing company name)
- `404` - Company not found in database
- `500` - Server error (Gemini API, MongoDB)

---

## 🔗 Related Documentation

- [GTM_STRATEGY_BUILDER_v2.md](GTM_STRATEGY_BUILDER_v2.md) - Feature overview
- [EXPANDED_SIGNALS_v2.md](EXPANDED_SIGNALS_v2.md) - Market signal detection
- [README.md](README.md) - Overall platform guide

