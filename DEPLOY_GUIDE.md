# 🚀 Hướng Dẫn Deploy VICO lên Domain Chính Thức

## Tổng Quan

| Thành phần | Công nghệ |
|---|---|
| Frontend | React + Vite (build thành static files) |
| Backend | Express.js (Node.js) |
| Database | PostgreSQL (Supabase) + MongoDB |
| Hosting | Railway.app |
| Domain | Custom domain (mua riêng) |

---

## Bước 1: Mua Domain

### Nhà cung cấp khuyên dùng (cho Việt Nam)

| Nhà cung cấp | Giá .com/năm | Ghi chú |
|---|---|---|
| [Namecheap](https://namecheap.com) | ~$9/năm | Phổ biến quốc tế, DNS miễn phí |
| [Cloudflare Registrar](https://dash.cloudflare.com) | ~$9/năm | Giá gốc, có CDN miễn phí |
| [Tên Miền Việt Nam (.vn)](https://vnnic.vn) | ~300k-500k VNĐ/năm | Domain .vn cho thị trường VN |
| [Inet.vn](https://inet.vn) | ~250k VNĐ/năm (.com) | Nhà cung cấp Việt Nam |
| [MatBao.net](https://matbao.net) | ~250k VNĐ/năm (.com) | Nhà cung cấp Việt Nam |

### Gợi ý tên miền
- `vico.vn` / `vico.com.vn` — thương hiệu chính
- `vicoai.com` — nếu muốn domain quốc tế
- `vico-intelligence.com` — mô tả rõ sản phẩm

---

## Bước 2: Deploy lên Railway

### 2.1. Tạo tài khoản Railway

1. Truy cập [railway.app](https://railway.app)
2. Đăng nhập bằng tài khoản GitHub
3. Chọn plan **Hobby** ($5/tháng) hoặc **Pro** ($20/tháng) — cần plan trả phí để dùng custom domain

### 2.2. Tạo Project mới

1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Chọn repo `vico---vietnam-copilot`
4. Railway sẽ tự detect `railway.toml` và bắt đầu build

### 2.3. Cấu hình Environment Variables

Trong Railway Dashboard → Project → **Variables**, thêm:

```env
# BẮT BUỘC
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# TÙY CHỌN
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vico
SKIP_VECTOR_SEEDING=true
NODE_ENV=production

# SAU KHI CÓ DOMAIN (Bước 3)
CUSTOM_DOMAIN=yourdomain.com
VITE_APP_URL=https://yourdomain.com

# CLERK AUTH (nếu dùng)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

### 2.4. Kiểm tra Deploy thành công

- Railway cung cấp URL tạm: `https://vico-xxx.up.railway.app`
- Truy cập URL đó để kiểm tra app hoạt động
- Kiểm tra `/api/health` trả về OK

---

## Bước 3: Kết Nối Custom Domain

### 3.1. Thêm Domain trong Railway

1. Mở Railway Dashboard → Project → **Settings** → **Networking**
2. Click **"+ Custom Domain"**
3. Nhập domain: `yourdomain.com` (hoặc `app.yourdomain.com`)
4. Railway sẽ hiện thông tin DNS cần cấu hình:
   - **Type**: CNAME
   - **Name**: `@` hoặc subdomain
   - **Value**: `xxx.up.railway.app`

### 3.2. Cấu hình DNS tại nhà cung cấp domain

#### Nếu dùng root domain (yourdomain.com):

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `@` | `xxx.up.railway.app` | Auto |

> ⚠️ Một số nhà cung cấp không hỗ trợ CNAME cho root domain. Trong trường hợp đó, dùng subdomain (ví dụ: `app.yourdomain.com`) hoặc dùng Cloudflare làm DNS proxy.

#### Nếu dùng subdomain (app.yourdomain.com):

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `app` | `xxx.up.railway.app` | Auto |

### 3.3. Cấu hình với Cloudflare (Khuyên dùng)

Cloudflare cung cấp CDN miễn phí + SSL + DDoS protection:

1. Đăng ký [Cloudflare](https://dash.cloudflare.com)
2. Thêm domain → Cloudflare sẽ scan DNS records
3. Đổi nameservers tại nhà cung cấp domain sang Cloudflare
4. Thêm DNS record:

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `@` | `xxx.up.railway.app` | ✅ Proxied |
| CNAME | `www` | `yourdomain.com` | ✅ Proxied |

5. SSL/TLS → chọn **Full (strict)**
6. Bật **Always Use HTTPS**

### 3.4. Cập nhật Environment Variables trên Railway

Sau khi DNS propagate (5-30 phút):

```env
CUSTOM_DOMAIN=yourdomain.com
VITE_APP_URL=https://yourdomain.com
```

Railway sẽ tự động re-deploy khi thay đổi env vars.

---

## Bước 4: SSL Certificate (HTTPS)

- **Railway**: Tự động cấp SSL certificate miễn phí (Let's Encrypt) khi custom domain được verify
- **Cloudflare**: Cung cấp SSL certificate riêng nếu dùng proxy

Không cần cấu hình thêm — Railway xử lý tự động.

---

## Bước 5: Cập nhật Clerk Auth (nếu dùng)

Nếu app dùng Clerk authentication, cần cập nhật domain trong Clerk Dashboard:

1. Truy cập [clerk.com](https://clerk.com) → Dashboard
2. Vào **Domains** → thêm `yourdomain.com`
3. Cập nhật **Publishable Key** nếu cần

---

## Bước 6: Kiểm Tra Sau Deploy

### Checklist

- [ ] Truy cập `https://yourdomain.com` — trang chủ hiển thị
- [ ] Truy cập `https://yourdomain.com/api/health` — trả về OK
- [ ] Đăng nhập (Clerk) hoạt động
- [ ] Chat AI (Gemini) hoạt động
- [ ] Dữ liệu công ty hiển thị
- [ ] News feed load được
- [ ] HTTPS redirect hoạt động (http → https)

### Test nhanh bằng command line

```powershell
# Kiểm tra health endpoint
Invoke-RestMethod -Uri "https://yourdomain.com/api/health"

# Kiểm tra HTTPS redirect
Invoke-WebRequest -Uri "http://yourdomain.com" -MaximumRedirection 0 -ErrorAction SilentlyContinue | Select-Object StatusCode
```

---

## Cấu Trúc Deploy

```
GitHub Push → Railway Auto-Build → npm install + vite build → npx tsx server.ts
                                                                    ↓
                                                            Express serves:
                                                            - /api/*  → Backend API
                                                            - /*      → React SPA (dist/)
```

---

## Chi Phí Ước Tính (tháng)

| Dịch vụ | Chi phí |
|---|---|
| Railway Hobby | $5/tháng |
| Domain .com | ~$0.75/tháng ($9/năm) |
| Cloudflare (Free) | $0 |
| Supabase (Free tier) | $0 |
| MongoDB Atlas (Free tier) | $0 |
| **Tổng** | **~$5.75/tháng (~140k VNĐ)** |

---

## Xử Lý Sự Cố

### Domain chưa trỏ đúng
```bash
# Kiểm tra DNS propagation
nslookup yourdomain.com
# Hoặc dùng: https://dnschecker.org
```

### Railway build fail
- Kiểm tra logs trong Railway Dashboard → Deployments
- Đảm bảo tất cả env vars đã được set
- Thử: Railway CLI `railway logs`

### 502/503 Error
- Kiểm tra `/api/health` endpoint
- Xem logs: Railway Dashboard → Deployments → View Logs
- Đảm bảo `PORT` không bị override (Railway tự set)

---

## Tóm Tắt Các Bước

1. **Mua domain** tại Namecheap/Cloudflare/Inet.vn
2. **Tạo project** trên Railway, kết nối GitHub repo
3. **Set environment variables** trên Railway
4. **Thêm custom domain** trong Railway Settings
5. **Cấu hình DNS** tại nhà cung cấp domain (CNAME → Railway)
6. **Kiểm tra** trang web hoạt động trên domain mới
7. **(Tùy chọn)** Thêm Cloudflare cho CDN + DDoS protection
