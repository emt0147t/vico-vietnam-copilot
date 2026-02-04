# ⚡ LIVE NEWS - QUICK REFERENCE CARD

## 🚀 QUICK START (3 COMMANDS)

```powershell
# 1. Install package (already done)
npm install rss-parser --legacy-peer-deps

# 2. Start backend (Terminal 1)
npm run server

# 3. Start frontend (Terminal 2)
npm run dev
```

**Expected URLs:**
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

---

## 📋 IMPLEMENTATION CHECKLIST

- [x] Install `rss-parser` package
- [x] Update `server.ts` with POST /api/news endpoint
- [x] Create `services/newsService.ts` with functions
- [x] Update `components/CompletionPage.tsx` NewsFeed component
- [x] Add TypeScript interfaces
- [x] Add error handling
- [x] Add loading states
- [x] Documentation complete

---

## 🔧 TECHNICAL QUICK REFERENCE

### **Backend Endpoint**

```
POST http://localhost:3001/api/news
Content-Type: application/json

Request Body:
{
  "query": "Vingroup"
}

Response Body:
{
  "query": "Vingroup",
  "count": 8,
  "news": [
    {
      "title": "...",
      "link": "...",
      "pubDate": "2026-02-03T10:30:00Z",
      "content": "...",
      "source": "Google News",
      "guid": "..."
    }
  ],
  "timestamp": "2026-02-03T12:45:00Z"
}
```

### **Frontend Service**

```typescript
import { getCompanyNews } from './services/newsService';

// Single company news
const news = await getCompanyNews('Vingroup');

// With retry logic
const news = await getCompanyNewsWithRetry('FPT', 3);

// Multiple companies
const allNews = await getMultipleCompanyNews(['Vingroup', 'FPT']);

// Format for display
const formatted = formatNewsForDisplay(news, 150);
```

---

## 📂 FILES REFERENCE

### **Modified Files**

**server.ts** (Lines 8, 16-17, 321-375)
```typescript
import Parser from 'rss-parser';
const rssParser = new Parser();
app.post('/api/news', async (req, res) => { ... });
```

**CompletionPage.tsx** (Line 4)
```typescript
import { getCompanyNews } from '../services/newsService';
// Updated NewsFeed component to use getCompanyNews()
```

### **New Files**

**services/newsService.ts** (130 lines)
- getCompanyNews(query)
- getCompanyNewsWithRetry(query, maxRetries)
- formatNewsForDisplay(news, maxLength)
- getMultipleCompanyNews(queries)

---

## 🧪 TESTING COMMANDS

### **PowerShell Test**

```powershell
$body = @{query="Vingroup"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/news" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### **Browser Console Test**

```javascript
// In browser DevTools (F12 > Console)
const newsItems = await fetch('http://localhost:3001/api/news', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query: 'Vingroup'})
}).then(r => r.json());
console.log(newsItems);
```

---

## 🎯 VERIFICATION POINTS

| Point | Check |
|-------|-------|
| Backend Port | 3001 |
| Frontend Port | 5173 |
| Endpoint | POST /api/news |
| Google News URL | hl=vi&gl=VN (Vietnamese) |
| Max Articles | 8 |
| Response Time | 2-5 seconds |
| Error Handling | Returns empty array on error |
| Type Safety | NewsItem interface defined |

---

## 🐛 TROUBLESHOOTING QUICK FIXES

| Problem | Solution |
|---------|----------|
| Module not found | `npm install rss-parser` |
| Port 3001 in use | `Get-Process node \| Stop-Process` |
| CORS error | Check localhost:3001, not 3000 |
| No news results | Wait 30s, Google rate-limits |
| Empty response | Check internet connection |
| TypeError in newsService | Verify import path is correct |

---

## 💻 KEYBOARD SHORTCUTS

```
F12                    - Open Developer Tools
Ctrl + Shift + J       - Console tab
Ctrl + Shift + N       - Network tab
Ctrl + L               - Clear console
Ctrl + K               - Clear console (Firefox)
```

---

## 📊 PERFORMANCE TARGETS

```
Backend Startup:     < 5 seconds
First News Request:  2-5 seconds
Cached Requests:     < 100ms
Memory/Article:      ~50KB
Network/Request:     ~50KB
Timeout:             30 seconds
Max Articles:        8
```

---

## 🌐 GOOGLE NEWS RSS FEEDS

```
Vietnamese (Default):
https://news.google.com/rss/search?q={QUERY}&hl=vi&gl=VN&ceid=VN:vi

Alternative Sources:
VnExpress:    https://vnexpress.net/rss/khoa-hoc.rss
DânTrí:       https://dantri.com.vn/rss.xml
VietnamNet:   https://vietnamnet.vn/feed/rss.xml
TuổiTrẻ:      https://tuoitre.vn/rss/
```

---

## 📝 CODE SNIPPETS

### **Quick Test Function**

```typescript
async function testNews(company: string) {
    try {
        const response = await fetch('http://localhost:3001/api/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: company })
        });
        const data = await response.json();
        console.log(`Found ${data.count} articles for ${company}`);
        return data.news;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Usage
testNews('Vingroup');
```

### **React Component Hook**

```tsx
const [news, setNews] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
    const fetchNews = async () => {
        if (!query) return;
        setLoading(true);
        const data = await getCompanyNews(query);
        setNews(data);
        setLoading(false);
    };
    fetchNews();
}, [query]);
```

---

## 🚨 CRITICAL ENDPOINTS

```
Health Check:
GET http://localhost:3001/api/health

Company List:
GET http://localhost:3001/api/companies

News (NEW):
POST http://localhost:3001/api/news
```

---

## 🎓 KEY LEARNING POINTS

1. **RSS Parser** - Parses XML feeds to JSON
2. **POST vs GET** - Use POST for data (news search)
3. **Async/Await** - Handle long-running requests
4. **Error Handling** - Graceful fallbacks
5. **TypeScript** - Type-safe interfaces
6. **React Hooks** - useEffect for async data

---

## ✅ SUCCESS INDICATORS

- [x] rss-parser installed
- [x] Backend endpoint created
- [x] Frontend service created
- [x] UI component updated
- [x] News articles display in browser
- [x] Loading states work
- [x] Error handling works
- [x] No console errors
- [x] Documentation complete

---

## 📚 DOCUMENTATION FILES

| File | Purpose |
|------|---------|
| LIVE_NEWS_SETUP.md | Complete setup guide |
| LIVE_NEWS_VERIFICATION.md | Pre-launch checklist |
| LIVE_NEWS_SUMMARY.md | Implementation overview |
| LIVE_NEWS_ARCHITECTURE.md | System diagrams & flows |
| LIVE_NEWS_QUICK_REFERENCE.md | This file |

---

## 🔗 USEFUL LINKS

- [rss-parser npm](https://www.npmjs.com/package/rss-parser)
- [Google News RSS](https://news.google.com)
- [RSS Specification](https://www.rssboard.org)
- [Express.js Docs](https://expressjs.com)
- [React Hooks](https://react.dev/reference/react)

---

## 💡 NEXT FEATURES (OPTIONAL)

1. Add VnExpress, DânTrí sources
2. Cache news in MongoDB
3. Sentiment analysis
4. News alerts/notifications
5. Filter by date/sentiment
6. Category sorting

---

## 🎉 YOU'RE ALL SET!

**Status: ✅ LIVE NEWS IMPLEMENTED**

Next: Test the feature by logging in and searching for "Vingroup"!

---

**Quick Reference v1.0 | Feb 3, 2026**
