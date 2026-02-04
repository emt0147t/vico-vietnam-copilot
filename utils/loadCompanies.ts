
/* 
[VICO ARCHITECTURE FIX] 
File này trước đây chứa logic kết nối trực tiếp đến MongoDB.
Vì MongoDB driver không chạy được trên trình duyệt (thiếu net, tls, dns),
chúng ta chuyển sang sử dụng API call thông qua fetch().
*/

/* [VICO OLD CODE]
import { connectMongo } from './connect';
export async function loadCompanies() {
  const db = await connectMongo();
  return db.collection("companies").find({}).toArray();
}
*/

/**
 * Hàm dự phòng để tránh lỗi import ở các file khác.
 * Thực tế việc lấy dữ liệu hiện tại được xử lý trong RagService.ts bằng fetch().
 */
export async function loadCompanies() {
    console.warn("⚠️ VICO NOTICE: Direct DB access from frontend is disabled for security and stability.");
    return [];
}
