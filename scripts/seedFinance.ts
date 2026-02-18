import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🏦 Đang nạp dữ liệu Tài chính mẫu...");

  // Dữ liệu P/E trung bình ngành (Số liệu tham khảo thị trường hiện tại)
  const financeData = [
    { key: "Banking (Ngân hàng)", value: "9.5" },
    { key: "Real Estate (Bất động sản)", value: "18.2" },
    { key: "Technology (Công nghệ)", value: "22.4" },
    { key: "Consumer Goods (Tiêu dùng)", value: "14.8" },
    { key: "Steel & Materials (Thép)", value: "8.9" },
    { key: "Oil & Gas (Dầu khí)", value: "11.2" }
  ];

  // Xóa dữ liệu cũ của Finance
  await prisma.marketData.deleteMany({ where: { type: 'FINANCE' } });

  // Lưu dữ liệu mới
  for (const item of financeData) {
    await prisma.marketData.create({
      data: {
        type: 'FINANCE',
        key: item.key,
        value: item.value,
        unit: 'P/E Ratio',
        source: 'CafeF (Estimated)'
      }
    });
  }

  console.log("✅ Đã nạp xong 6 ngành trọng điểm!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());