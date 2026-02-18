import { fetchMacroEconomics } from '../services/crawlers/macroCrawler';
import { fetchSectorPE } from '../services/crawlers/financeCrawler';
// import { fetchIndustryReport } from '../services/crawlers/industryCrawler'; // Tạm tắt nếu chưa setup API Key AI
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Bắt đầu quá trình Crawl dữ liệu thị trường...");

  try {
    // --- 1. XỬ LÝ MACRO DATA (World Bank) ---
    const macroData = await fetchMacroEconomics();
    if (macroData && macroData.length > 0) {
      console.log(`💾 Đang lưu ${macroData.length} chỉ số Vĩ mô...`);
      
      // Xóa dữ liệu cũ để tránh trùng lặp (Tùy chọn)
      await prisma.marketData.deleteMany({ where: { type: 'MACRO' } });

      for (const item of macroData) {
        await prisma.marketData.create({
          data: {
            type: 'MACRO',
            key: item.indicator, // Tên chỉ số (GDP, CPI...)
            value: String(item.value),
            unit: item.unit,
            source: 'WorldBank'
          }
        });
      }
    }

    // --- 2. XỬ LÝ FINANCE DATA (CafeF) ---
    const financeData = await fetchSectorPE();
    if (financeData && financeData.length > 0) {
      console.log(`💾 Đang lưu ${financeData.length} chỉ số Tài chính ngành...`);
      
      await prisma.marketData.deleteMany({ where: { type: 'FINANCE' } });

      for (const item of financeData) {
        await prisma.marketData.create({
          data: {
            type: 'FINANCE',
            key: item.name, // Tên ngành
            value: item.pe, // Chỉ số P/E
            unit: 'P/E Ratio',
            source: 'CafeF'
          }
        });
      }
    }

    // --- 3. XỬ LÝ INDUSTRY (AI) ---
    // (Bật lại phần này khi bạn đã chắc chắn hàm fetchIndustryReport chạy ngon)
    /*
    const industryData = await fetchIndustryReport();
    if (industryData) {
       // Code lưu dữ liệu AI ở đây...
    }
    */

    console.log("✅ HOÀN TẤT! Dữ liệu đã được cập nhật vào Database.");

  } catch (error) {
    console.error("❌ Lỗi trong quá trình chạy script:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();