import puppeteer from 'puppeteer';

export const fetchSectorPE = async () => {
  console.log("📈 Đang mở trình duyệt vào CafeF...");
  
  const browser = await puppeteer.launch({ headless: true }); // Chạy ngầm
  const page = await browser.newPage();

  try {
    // Trang thống kê chỉ số ngành của CafeF (Ví dụ)
    // Lưu ý: URL này mang tính minh họa, bạn cần vào CafeF tìm link "Chỉ số ngành" chính xác
    await page.goto('https://s.cafef.vn/du-lieu.chn', { waitUntil: 'networkidle2' });

    // Giả sử CafeF có bảng P/E ngành. Ta dùng Selector để lấy.
    // Mẹo: Bấm F12 trên Chrome -> Chuột phải vào số P/E -> Copy Selector
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll('.table-sector tr'); // Selector giả định
      const sectors: any[] = [];

      rows.forEach((row) => {
        const cols = row.querySelectorAll('td');
        if (cols.length > 2) {
          sectors.push({
            name: cols[0].innerText.trim(), // Tên ngành
            pe: cols[2].innerText.trim(),   // P/E
            pb: cols[3].innerText.trim()    // P/B
          });
        }
      });
      return sectors;
    });

    console.log("✅ Dữ liệu Tài chính:", data);
    return data;

  } catch (error) {
    console.error("❌ Lỗi crawl CafeF:", error);
  } finally {
    await browser.close();
  }
};