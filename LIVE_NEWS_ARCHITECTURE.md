# 🎯 LIVE NEWS FEATURE - COMPLETE ARCHITECTURE DIAGRAM

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VICO APPLICATION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  FRONTEND (React - localhost:5173)                               │ │
│  ├──────────────────────────────────────────────────────────────────┤ │
│  │                                                                  │ │
│  │  CompletionPage.tsx                                              │ │
│  │  ├─ Wizard component (user input)                               │ │
│  │  ├─ GTM Strategy Panel                                          │ │
│  │  └─ NewsFeed Component 🆕                                       │ │
│  │     ├─ Loading spinner (2-5 sec)                                │ │
│  │     ├─ Error handling                                           │ │
│  │     └─ Article display (title, date, link, source)             │ │
│  │                                                                  │ │
│  │  services/newsService.ts 🆕                                     │ │
│  │  ├─ getCompanyNews(query)                                       │ │
│  │  ├─ getCompanyNewsWithRetry(query, maxRetries)                 │ │
│  │  ├─ formatNewsForDisplay(news, maxLength)                       │ │
│  │  └─ getMultipleCompanyNews(queries)                             │ │
│  │                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                             │                                          │
│                             │ fetch('POST /api/news', { query })      │
│                             ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  BACKEND (Node.js + Express - localhost:3001)                   │ │
│  ├──────────────────────────────────────────────────────────────────┤ │
│  │                                                                  │ │
│  │  server.ts 🆕 POST /api/news                                    │ │
│  │  ├─ Input: { query: "Vingroup" }                               │ │
│  │  ├─ Create Google News RSS URL                                  │ │
│  │  │  └─ hl=vi&gl=VN (Vietnamese language)                       │ │
│  │  ├─ const rssParser = new Parser()                              │ │
│  │  ├─ feed = await rssParser.parseURL(feedUrl)                   │ │
│  │  ├─ Clean data (title, link, date, content, source)            │ │
│  │  └─ Output: { query, count, news[], timestamp }                │ │
│  │                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                             │                                          │
│                             │ GET https://news.google.com/rss/...    │
│                             ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  GOOGLE NEWS RSS FEED (External API)                            │ │
│  ├──────────────────────────────────────────────────────────────────┤ │
│  │                                                                  │ │
│  │  Query: search?q=Vingroup&hl=vi&gl=VN&ceid=VN:vi              │ │
│  │  Returns: RSS XML with latest Vietnamese articles              │ │
│  │                                                                  │ │
│  │  Sample Response:                                               │ │
│  │  <rss>                                                           │ │
│  │    <item>                                                        │ │
│  │      <title>Vingroup công bố kết quả kinh doanh</title>        │ │
│  │      <link>https://vnexpress.net/...</link>                    │ │
│  │      <pubDate>Mon, 3 Feb 2026 10:30:00</pubDate>               │ │
│  │      <description>Tập đoàn Vingroup ngày 3/2...</description>  │ │
│  │    </item>                                                      │ │
│  │    ...                                                           │ │
│  │  </rss>                                                          │ │
│  │                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 REQUEST/RESPONSE FLOW

```
USER INTERACTION
    │
    ▼
CompletionPage loads "Vingroup"
    │
    ├─ State: loading = true
    │
    ▼
NewsFeed useEffect triggers
    │
    ▼
getCompanyNews("Vingroup") called
    │
    ▼
fetch('http://localhost:3001/api/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Vingroup' })
})
    │
    ▼ [Network Request]
    │
Backend server.ts POST /api/news handler
    │
    ├─ Extract: query = "Vingroup"
    │
    ├─ Validate: if (!query) return error
    │
    ├─ Create URL:
    │  https://news.google.com/rss/search?q=Vingroup&hl=vi&gl=VN&ceid=VN:vi
    │
    ├─ Call: await rssParser.parseURL(feedUrl)
    │  └─ Fetches from Google News
    │
    ├─ Process: feed.items.slice(0, 8).map(...)
    │  └─ Extract: title, link, pubDate, content, source
    │
    ▼
Return JSON Response:
{
  "query": "Vingroup",
  "count": 8,
  "news": [
    {
      "title": "Vingroup công bố kết quả kinh doanh quý 4 2025",
      "link": "https://...",
      "pubDate": "2026-02-03T10:30:00.000Z",
      "content": "Tập đoàn Vingroup ngày 3/2 công bố kết quả kinh doanh...",
      "source": "Viet Times",
      "guid": "..."
    },
    ... (7 more articles)
  ],
  "timestamp": "2026-02-03T12:45:33.123Z"
}
    │
    ▼ [Network Response]
    │
Frontend receives response
    │
    ├─ State: loading = false
    ├─ State: news = data.news (8 articles)
    ├─ State: count = data.count
    │
    ▼
NewsFeed Component Re-renders
    │
    ├─ Show: "📰 Tin tức mới nhất từ Google News"
    │
    ├─ For each article:
    │  ├─ Display title (clickable)
    │  ├─ Display date (formatted)
    │  ├─ Display source (Google News)
    │  ├─ Display content snippet
    │  └─ Add external link icon
    │
    ▼
USER SEES RESULTS
    │
    ├─ Can read article titles
    ├─ Can click links to open full articles
    ├─ Can see source (Google News, etc.)
    └─ Can see publication date
```

---

## 📦 DATA STRUCTURES

### **NewsItem Interface**

```typescript
interface NewsItem {
    title: string;        // Article headline
    link: string;         // URL to full article
    pubDate: string;      // ISO 8601 date format
    content: string;      // Preview/snippet
    source: string;       // Source name (publisher)
    guid?: string;        // Unique identifier (optional)
}
```

### **API Request/Response**

**Request:**
```json
{
  "query": "Vingroup"
}
```

**Response:**
```json
{
  "query": "Vingroup",
  "count": 8,
  "news": [
    {
      "title": "...",
      "link": "...",
      "pubDate": "2026-02-03T10:30:00.000Z",
      "content": "...",
      "source": "Google News",
      "guid": "..."
    }
  ],
  "timestamp": "2026-02-03T12:45:33.123Z"
}
```

---

## 🧩 COMPONENT DEPENDENCY TREE

```
App.tsx
└─ CompletionPage.tsx
   ├─ NewsStatsDashboard
   ├─ GTMStrategyPanel
   ├─ ExpandedSignals
   ├─ CompanyNewsSection
   └─ NewsFeed 🆕 (UPDATED)
      │
      ├─ Loader2 (loading spinner)
      ├─ Newspaper (icon)
      ├─ Calendar (date icon)
      ├─ ExternalLink (link icon)
      │
      └─ newsService.ts 🆕
         ├─ getCompanyNews(query)
         ├─ getCompanyNewsWithRetry(query, maxRetries)
         ├─ formatNewsForDisplay(news, maxLength)
         └─ getMultipleCompanyNews(queries)
            │
            └─ fetch('http://localhost:3001/api/news', ...)
               │
               └─ Backend API Response

Server.ts (Backend)
└─ POST /api/news 🆕
   ├─ Input validation
   ├─ rss-parser
   │  └─ Google News RSS
   │     ├─ VN Language Filter (hl=vi)
   │     ├─ VN Country Filter (gl=VN)
   │     └─ VN Edition (ceid=VN:vi)
   │
   └─ Response with 8 articles
```

---

## ⏱️ TIMING DIAGRAM

```
User Action                   Frontend                 Backend              Google
    │                            │                        │                   News
    │                            │                        │                    │
    ├─ Searches "Vingroup" ──────┤                        │                    │
    │                            │                        │                    │
    │                            ├─ getCompanyNews() ──────┤                    │
    │                            │  (loading=true)         │                    │
    │                            │                        ├─ Parse URL         │
    │                            │                        ├─ Validate          │
    │                            │                        │                    │
    │                            │                        ├─ Fetch RSS ────────┤
    │                            │                        │  (2-5 sec)         │
    │                            │                        │                    │
    │                            │                        │◄─── XML Feed ──────┤
    │                            │                        │                    │
    │                            │                        ├─ Parse items       │
    │                            │                        ├─ Extract data      │
    │                            │                        ├─ Slice 8 items     │
    │                            │                        │                    │
    │                            │◄─── JSON Response ────┤                    │
    │                            │  (count, news[])       │                    │
    │                            │                        │                    │
    │                            ├─ Update state          │                    │
    │                            ├─ Re-render             │                    │
    │                            │                        │                    │
    ├─ See news articles ◄──────┤                        │                    │
    │  - Title                   │                        │                    │
    │  - Date                    │                        │                    │
    │  - Source                  │                        │                    │
    │  - Link                    │                        │                    │
    │                            │                        │                    │
    └─ Click link ──────────────────────────────────────────► Open Article
        (opens in new tab)
```

---

## 🔁 ERROR HANDLING FLOW

```
getCompanyNews("Vingroup")
    │
    ├─ Try {
    │   │
    │   ├─ Validate query
    │   │  └─ if (!query) return []
    │   │
    │   ├─ fetch(localhost:3001/api/news)
    │   │
    │   ├─ Check response.ok
    │   │  ├─ if (ok) parse JSON
    │   │  └─ if (!ok) catch error
    │   │
    │   └─ Return data.news || []
    │
    ├─ Catch (error) {
    │   ├─ Log: "News Service Error: ..."
    │   ├─ Return: [] (empty array)
    │   └─ No crash 🎉
    │
    └─ Return NewsItem[]
```

**Graceful Degradation:**
- Backend down → Returns []
- Google News blocked → Returns []
- Network error → Returns []
- Invalid query → Returns []
- No articles found → Returns []
- **Result: UI never crashes** ✅

---

## 📊 IMPLEMENTATION METRICS

### **Code Changes**

| File | Type | Change | Lines |
|------|------|--------|-------|
| server.ts | Update | Add rss-parser import + endpoint | +55 |
| newsService.ts | Create | New service file | 130 |
| CompletionPage.tsx | Update | Use live news | +3 import |
| **Total** | | | **~190 lines** |

### **Performance**

| Metric | Value |
|--------|-------|
| First request | 2-5 seconds |
| Max articles | 8 |
| Memory per request | ~50KB |
| Network per request | ~50KB |
| Error fallback | Instant (empty array) |
| Timeout | 30 seconds |

---

## 🎓 KEY CONCEPTS USED

1. **RSS Parser** - Parses XML RSS feeds into JavaScript objects
2. **Async/Await** - Non-blocking API calls
3. **Error Handling** - Try/catch with graceful fallbacks
4. **React Hooks** - useEffect, useState for async data
5. **TypeScript Interfaces** - Type-safe data structures
6. **Frontend Service Layer** - Abstraction for API calls
7. **Backend API Design** - RESTful endpoint design
8. **Data Transformation** - RSS → JSON conversion

---

## 🔐 SECURITY CONSIDERATIONS

```
┌─ PUBLIC DATA (No Auth Needed)
│  └─ Google News RSS (public)
│
├─ FRONTEND
│  └─ No sensitive data passed
│
└─ BACKEND
   ├─ Input sanitization: URL.encode(query)
   ├─ Error isolation: Errors don't expose internals
   ├─ Rate limiting: Inherent (Google limits requests)
   └─ CORS: Protected (only from localhost)
```

---

## ✅ VERIFICATION CHECKLIST VISUAL

```
Installation
├─ [✅] rss-parser installed
├─ [✅] server.ts updated
├─ [✅] newsService.ts created
└─ [✅] CompletionPage updated

Testing
├─ [  ] Backend starts
├─ [  ] API endpoint responds
├─ [  ] Frontend loads
├─ [  ] News articles appear
├─ [  ] Loading state works
└─ [  ] Error handling works

Verification
├─ [  ] No console errors
├─ [  ] No CORS errors
├─ [  ] Articles are real
├─ [  ] Links work
├─ [  ] Dates are correct
└─ [  ] Performance is good
```

---

## 🎯 SUCCESS INDICATORS

✅ **Backend:**
- Server starts without errors
- API endpoint responds to POST requests
- Returns valid JSON with count > 0

✅ **Frontend:**
- NewsFeed component displays
- Shows loading spinner initially
- Articles appear after 2-5 seconds
- No console errors

✅ **User Experience:**
- News appears for searched companies
- Articles have proper formatting
- Links open in new tabs
- Graceful handling of no results

---

## 📞 QUICK DEBUG CHECKLIST

```
Issue: No news appearing
├─ Check: Backend running? (http://localhost:3001/api/health)
├─ Check: Frontend calling right URL? (localhost:3001, not 3000)
├─ Check: Browser console errors? (F12)
└─ Check: Backend console logs? (Look for 📰)

Issue: Empty articles
├─ Check: Google News not blocked? (Try again after 30s)
├─ Check: Query valid? (Not empty string)
├─ Check: Network connection? (Internet active)
└─ Check: Try different company name?

Issue: CORS error
├─ Check: Backend has cors() enabled? (line 21 in server.ts)
├─ Check: Frontend URL correct? (localhost:3001)
└─ Check: POST method used? (Not GET)
```

---

## 🚀 DEPLOYMENT DIAGRAM

```
Development Environment
├─ Backend: localhost:3001
├─ Frontend: localhost:5173 (Vite dev)
└─ Data: Google News RSS (live)

Production Environment (Future)
├─ Backend: example.com/api
├─ Frontend: example.com
├─ Data: Google News RSS (live)
└─ Cache: MongoDB (optional)
```

---

**Architecture Complete ✅**  
**All diagrams and flows documented 🎯**  
**Ready for implementation 🚀**
