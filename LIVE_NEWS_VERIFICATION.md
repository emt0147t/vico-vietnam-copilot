# ✅ LIVE NEWS FEATURE - VERIFICATION CHECKLIST

## 📋 Installation Verification

- [x] **npm package installed**: `rss-parser`
  ```powershell
  npm list rss-parser
  # Output: rss-parser@latest
  ```

- [x] **Backend endpoint created**: `POST /api/news`
  - Location: `server.ts` line 321-375
  - Port: `localhost:3001`
  - Status: Ready

- [x] **Frontend service created**: `services/newsService.ts`
  - Functions: getCompanyNews, getCompanyNewsWithRetry, formatNewsForDisplay, getMultipleCompanyNews
  - Status: Ready

- [x] **UI Component updated**: `NewsFeed` in `CompletionPage.tsx`
  - Imports live news service
  - Displays real articles from Google News
  - Shows loading states and error handling
  - Status: Ready

---

## 🧪 Pre-Launch Testing Checklist

### **Before Running**

- [ ] Close any existing backend servers (Port 3001 check)
  ```powershell
  Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
  ```

- [ ] Verify `server.ts` has rss-parser import:
  ```bash
  grep "import Parser from 'rss-parser'" server.ts
  ```

- [ ] Verify `newsService.ts` exists:
  ```bash
  ls services/newsService.ts
  ```

- [ ] Verify `CompletionPage.tsx` imports newsService:
  ```bash
  grep "import { getCompanyNews }" components/CompletionPage.tsx
  ```

### **Step 1: Start Backend**

```powershell
# Terminal 1
cd d:\vico---vietnam-copilot
npm run server

# EXPECTED OUTPUT:
# ✅ Companies initialized successfully
# ✅ Vector database seeding completed
# 🚀 VICO Backend: http://localhost:3001
```

**Verification:**
- [ ] Server starts without errors
- [ ] No port conflicts
- [ ] "VICO Backend: http://localhost:3001" appears

### **Step 2: Test API Endpoint**

```powershell
# Terminal 2 (while server is running)
$body = @{query="Vingroup"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/news" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Verification:**
- [ ] Returns HTTP 200
- [ ] Has `count` > 0
- [ ] Has `news` array
- [ ] Articles have `title`, `link`, `pubDate`, `content`

**Server Console Should Show:**
```
📰 Đang tìm tin tức cho: "Vingroup"
✅ Tìm thấy 8 bài viết về "Vingroup"
```

### **Step 3: Start Frontend**

```powershell
# Terminal 3
cd d:\vico---vietnam-copilot
npm run dev

# EXPECTED OUTPUT:
# VITE v6.2.0  ready in XXX ms
#
#  ➜  Local:   http://localhost:5173/
#  ➜  press h + enter to show help
```

**Verification:**
- [ ] Frontend starts without errors
- [ ] Browser opens to localhost:5173
- [ ] Landing page loads

### **Step 4: Test Full Feature**

1. **Login**
   - [ ] Navigate to login page
   - [ ] Email: `demo@vico.com`
   - [ ] Password: `password`
   - [ ] Click "Authorize Access"

2. **Wait for Company Load**
   - [ ] CompletionPage displays
   - [ ] Company data loads
   - [ ] Vector seeding completes (shows progress in bottom-right)

3. **Search for Company**
   - [ ] Scroll down to see "NewsFeed" section
   - [ ] Should see: "📰 Tin tức mới nhất từ Google News"
   - [ ] Articles should be loading (spinner visible)
   - [ ] Wait 2-5 seconds for results

4. **Verify Articles**
   - [ ] Articles display with titles
   - [ ] Articles have "Calendar" date icons
   - [ ] Source shows "Google News"
   - [ ] Links open in new tabs when clicked

### **Step 5: Check Browser Console**

```javascript
// Press F12 to open DevTools → Console tab
// Look for these messages:
✅ Fetched 8 news items for "Vingroup"
// No errors should be present
```

---

## 🔧 Troubleshooting

### **Issue: API returns empty news**

**Check:**
1. Backend server is running (http://localhost:3001)
2. Internet connection is active
3. Google News is not blocking requests (try again after 30 seconds)

**Fix:**
```powershell
# Test backend directly
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
# Should return status: "active"
```

### **Issue: Port 3001 already in use**

**Check:**
```powershell
Get-NetTcpConnection -LocalPort 3001 -ErrorAction SilentlyContinue
```

**Fix:**
```powershell
# Kill process using port 3001
Get-Process node | Stop-Process -Force
# Or manually find and kill in Task Manager
```

### **Issue: rss-parser module not found**

**Fix:**
```powershell
npm install rss-parser --legacy-peer-deps
npm list rss-parser  # Verify installation
```

### **Issue: CORS error in browser console**

**Check:**
- Frontend is calling `localhost:3001` (not `localhost:3000`)
- Backend has `cors()` enabled

**Fix:**
Verify in `CompletionPage.tsx`:
```typescript
const response = await fetch('http://localhost:3001/api/news', {
```

### **Issue: News shows but then disappears**

**Cause:** Component remounting or state not persisting

**Check:** Browser console for React warnings
**Fix:** Might need to adjust useEffect dependency array

---

## 📊 Performance Verification

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Backend startup | <5 seconds | — | |
| First news request | 2-5 seconds | — | |
| Articles load | <10 total | — | |
| Memory usage | <100MB | — | |
| CPU usage | <10% | — | |

---

## 🎯 Success Criteria

Your implementation is successful when:

1. ✅ Backend server starts on port 3001
2. ✅ API endpoint `/api/news` responds to POST requests
3. ✅ Frontend loads without errors
4. ✅ User can login with demo credentials
5. ✅ News articles appear in CompletionPage for searched companies
6. ✅ Articles have valid titles, dates, and links
7. ✅ No console errors when fetching news
8. ✅ Clicking article links opens them in new tab
9. ✅ Loading spinner shows while fetching
10. ✅ Empty news handled gracefully (no crash)

---

## 🚀 Launch Checklist

Before declaring success:

- [ ] All 10 success criteria met
- [ ] Tested with 3+ companies (Vingroup, FPT, Viettel)
- [ ] Browser console is clean (no errors)
- [ ] Backend console shows correct logs
- [ ] Articles are actual Google News results (not fake/mock)
- [ ] Date formats are readable
- [ ] Links open correctly in new tabs
- [ ] Restart backend → News still works
- [ ] Restart frontend → News still works
- [ ] Tested on different browsers (Chrome, Firefox, Edge)

---

## 📝 Notes

- **First request takes 2-5 seconds** because Google News feed is slow
- **Google News may rate-limit** after many requests (wait 30 seconds)
- **News is fetched on-demand**, not cached to database
- **Backend must be running** for news feature to work
- **Internet connection required** (fetches from Google servers)

---

**When all checks pass → Feature is READY FOR PRODUCTION ✅**
