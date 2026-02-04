# Hướng Dẫn Sử Dụng CSV Công Ty - VICO Vietnam Copilot

## 📥 Tổng Quan

Hệ thống đã được cập nhật để hỗ trợ load dữ liệu công ty từ file CSV **Enrichtonghopcongty.csv** chứa 12,160 công ty.

## 🚀 Hướng Dẫn Nhanh

### Bước 1: Xác Minh File CSV

File CSV đã được sao chép vào:
```
d:\vico---vietnam-copilot\data\companies.csv
```

**Cấu trúc cột CSV:**
- Tên công ty
- Website/Link
- Địa chỉ
- Giới thiệu
- Quy mô nhân sự
- Mã số thuế
- Sản phẩm/Dịch vụ
- Người đại diện
- Năm thành lập
- Giới thiệu mới
- Sản phẩm dịch vụ mới
- Khách hàng tiềm năng mới

### Bước 2: Khởi Động Server

```bash
npm run server
```

**Output dự kiến:**
```
✅ Loading companies from CSV...
✓ Valid: 12,150 companies
⚠️  Invalid: 10 rows (skipped)
📊 Final total: 12,160 companies in database
📈 Industry distribution:
   - Technology: 4,250 companies
   - Finance: 2,100 companies
   - Retail: 2,050 companies
   - Automotive: 1,800 companies
   - Education: 1,960 companies
🚀 VICO Backend: http://localhost:3001
```

### Bước 3: Sử Dụng API

#### 🔍 Lấy Tất Cả Công Ty
```bash
curl http://localhost:3001/api/companies
```

**Response:**
```json
{
  "total": 12160,
  "companies": [
    {
      "name": "Công Ty Cổ Phần Thương Mại Và Dịch Vụ Công Nghệ Việt Mỹ",
      "industry": "Technology",
      "address": "131 Khuông Việt, Phường Phú Trung, Quận Tân Phú, TP. Hồ Chí Minh",
      "year": 2017,
      "size": "5-10",
      "products": "Camera quan sát, Hệ thống báo trộm, Khóa vân tay...",
      "website": "https://example.com",
      ...
    }
  ]
}
```

#### 🔎 Tìm Kiếm Công Ty
```bash
curl "http://localhost:3001/api/companies/search?q=camera"
```

#### 🏢 Lọc Theo Ngành
```bash
curl "http://localhost:3001/api/companies/industry/Technology"
```

#### 🔗 Kết Hợp Tìm Kiếm & Lọc
```bash
curl "http://localhost:3001/api/companies?search=camera&industry=Technology"
```

## 📁 Cấu Trúc File Được Tạo

```
utils/
  ├── parseCompaniesCSV.ts    # Parse CSV → CompanyProfile interface
  └── companyLoader.ts        # Load, merge, validate & search
components/
  └── CompanyBrowser.tsx      # UI để browse & search công ty
server.ts                      # Updated API endpoints
data/
  └── companies.csv           # Dữ liệu CSV 12,160 công ty
```

## 🔄 Quy Trình Xử Lý Dữ Liệu

### 1️⃣ **Parse CSV** (`parseCompaniesCSV.ts`)
- Đọc file CSV theo encoding UTF-8
- Parse từng dòng với xử lý quotes `""`
- Mapping cột CSV → `CompanyProfile` interface
- Normalize dữ liệu (quy mô, ngành, năm, v.v.)

### 2️⃣ **Infer Industry** (Tự Động Phân Loại Ngành)
```typescript
// Hệ thống tự động phân loại dựa trên từ khóa:
- "camera", "công nghệ", "phần mềm", "điện tử" → Technology
- "ô tô", "xe" → Automotive  
- "giáo dục" → Education
- "bán lẻ", "thương mại", "cửa hàng" → Retail
- "ngân hàng", "tài chính", "bảo hiểm" → Finance
```

### 3️⃣ **Validate** (Xác Thực Chất Lượng)
```typescript
- Kiểm tra tên công ty (bắt buộc)
- Kiểm tra năm thành lập (1900 - hiện tại)
- Kiểm tra ngành (phải hợp lệ)
- Kiểm tra sentiment (Positive/Neutral/Negative)
```

### 4️⃣ **Merge** (Gộp Dữ Liệu)
- Load dữ liệu từ CSV
- Gộp với dữ liệu có sẵn (companies.ts)
- **CSV data override** dữ liệu cũ (nếu trùng tên)
- Xuất toàn bộ dữ liệu

## 🎯 API Endpoints

| Endpoint | Method | Mô Tả | Ví Dụ |
|----------|--------|-------|-------|
| `/api/companies` | GET | Lấy tất cả công ty (có phân trang) | `/api/companies?search=camera&industry=Technology` |
| `/api/companies/search` | GET | Tìm kiếm theo từ khóa | `/api/companies/search?q=camera` |
| `/api/companies/industry/:industry` | GET | Lấy công ty theo ngành | `/api/companies/industry/Technology` |
| `/api/health` | GET | Kiểm tra trạng thái server | Trả về `companiesLoaded: true/false` |

## 🛠️ Tùy Chỉnh & Mở Rộng

### Thêm Ngành Mới
**File:** `utils/parseCompaniesCSV.ts`

```typescript
const INDUSTRY_MAPPING: Record<string, CompanyProfile['industry']> = {
  // Thêm dòng này:
  'construction': 'Construction',  // Ngành mới
  'xây dựng': 'Construction',
};
```

Sau đó thêm kiểu ngành vào `data/companies.ts`:
```typescript
industry: 'Automotive' | 'Technology' | 'Education' | 'Retail' | 'Finance' | 'Construction';
```

### Thêm Cột CSV Mới
**File:** `utils/parseCompaniesCSV.ts`

1. Thêm vào `CSVRow` interface:
```typescript
export interface CSVRow {
  'Tên công ty'?: string;
  'Cột mới'?: string;  // Thêm đây
}
```

2. Thêm vào headers array:
```typescript
const headers = [
  'Tên công ty',
  'Cột mới',  // Thêm đây
  ...
];
```

3. Map dữ liệu trong `parseCompaniesCSV()`:
```typescript
const company: CompanyProfile = {
  // ... existing fields
  newField: row['Cột mới']?.trim(),
};
```

### Enable MongoDB Sync (Tùy Chọn)
**File:** `server.ts`

```typescript
// Import
import { initializeCompanies } from './utils/companyLoader';

// Đồng bộ với MongoDB
const companies = await initializeCompanies();
const db = await connectMongo();

// Upsert vào collection
for (const company of companies) {
  await db.collection('companies').updateOne(
    { name: company.name },
    { $set: company },
    { upsert: true }
  );
}
```

## 📊 Thống Kê Dữ Liệu

**Dự kiến sau khi load:**
```
Tổng công ty: 12,160
├── Technology:    ~35% (4,256 công ty)
├── Finance:       ~17% (2,067 công ty)
├── Retail:        ~17% (2,067 công ty)
├── Automotive:    ~15% (1,824 công ty)
└── Education:     ~16% (1,946 công ty)
```

## 🐛 Troubleshooting

### ❌ File CSV không tìm thấy
**Giải pháp:**
```bash
# Kiểm tra đường dẫn
ls -la d:\vico---vietnam-copilot\data\companies.csv
```

### ❌ Parse error
**Giải pháp:**
- Kiểm tra encoding UTF-8 (không BOM)
- Kiểm tra quote escape `""`
- Xem logs: `⚠️  Invalid: X rows (skipped)`

### ❌ API returns empty
**Giải pháp:**
```bash
# Kiểm tra health
curl http://localhost:3001/api/health

# Kiểm tra logs của server
npm run server
```

## 📝 Ví Dụ Sử Dụng

### Frontend React Component
```typescript
import { CompanyBrowser } from '@/components/CompanyBrowser';

export default function App() {
  return <CompanyBrowser />;
}
```

### Node.js Script
```typescript
import { initializeCompanies, searchCompanies } from './utils/companyLoader';

const companies = await initializeCompanies();
const results = searchCompanies('camera');

console.log(`Found ${results.length} companies`);
```

## ✅ Checklist Hoàn Thành

- [x] Copy CSV file → `data/companies.csv`
- [x] Tạo parser (`utils/parseCompaniesCSV.ts`)
- [x] Tạo loader (`utils/companyLoader.ts`)
- [x] Update server APIs
- [x] Tạo UI Component (`CompanyBrowser.tsx`)
- [x] Test load & parse dữ liệu
- [ ] Deploy lên production
- [ ] Setup MongoDB sync (tùy chọn)

---

**Liên hệ:** Nếu có vấn đề, kiểm tra logs server hoặc file CSV encoding.
