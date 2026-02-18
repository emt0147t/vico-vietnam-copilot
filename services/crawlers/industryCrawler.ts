import axios from 'axios';
import * as cheerio from 'cheerio';
import { generateResponse } from '../CopilotService'; // Hàm gọi Gemini bạn đã có

export const fetchIndustryReport = async () => {
  try {
    console.log("🏭 Đang đọc báo cáo từ GSO...");
    
    // 1. Vào trang chủ đề Công nghiệp của GSO
    const url = 'https://www.gso.gov.vn/chu-de/cong-nghiep/';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // 2. Lấy link bài viết mới nhất (Thường là bài đầu tiên trong list)
    const latestArticleLink = $('.list-news .item:first-child a').attr('href');
    
    if (!latestArticleLink) throw new Error("Không tìm thấy bài viết mới.");

    // 3. Vào bài viết đó lấy nội dung text
    const articleRes = await axios.get(latestArticleLink);
    const $$ = cheerio.load(articleRes.data);
    
    // Lấy toàn bộ text trong bài
    const content = $$('.article-content').text().trim().substring(0, 5000); // Lấy 5000 ký tự đầu

    console.log("📝 Đã lấy nội dung, đang gửi cho AI phân tích...");

    // 4. Dùng Gemini để biến Text thành Data
    const prompt = `
      Dưới đây là báo cáo công nghiệp mới nhất của Việt Nam. 
      Hãy trích xuất các số liệu sau dưới dạng JSON:
      1. Tốc độ tăng trưởng toàn ngành công nghiệp (IIP).
      2. 3 ngành có tốc độ tăng trưởng cao nhất.
      3. 3 ngành đang suy giảm.
      
      Nội dung báo cáo:
      ${content}
    `;

    const aiResult = await generateResponse(prompt); 
    // (Hàm generateResponse của bạn cần trả về text, bạn sẽ parse JSON ở đây)
    
    console.log("✅ AI Analysis:", aiResult);
    return aiResult;

  } catch (error) {
    console.error("❌ Lỗi Industry Crawler:", error);
  }
};