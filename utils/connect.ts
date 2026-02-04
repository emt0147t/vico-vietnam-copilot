
// [VICO NEW ARCHITECTURE]
// File này chỉ được phép chạy ở môi trường Node.js (Server)
// Thư viện 'mongodb' sẽ gây lỗi crash nếu chạy trên trình duyệt.

import { MongoClient, Db } from 'mongodb';

// [VICO OLD CODE] - Không nên để lộ mật khẩu trong code
/* 
const MONGO_URI = 'mongodb+srv://thinv04012003_db_user:Thi04012003@cluster0.7rhap1z.mongodb.net/?appName=Cluster0';
*/

// [VICO SECURITY FIX] - Ưu tiên lấy từ biến môi trường
const MONGO_URI = process.env.MONGO_URI || 'Vui lòng cấu hình MONGO_URI trong .env';
const DB_NAME = 'vico-db';

let db: Db;

export async function connectMongo(): Promise<Db> {
  // Kiểm tra nếu đang chạy ở trình duyệt
  if (typeof window !== 'undefined') {
    throw new Error("CRITICAL: connectMongo cannot run in the browser. Use API endpoints instead.");
  }

  if (db) return db;

  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("✅ VICO: Connected to MongoDB via Server");
    return db;
  } catch (error) {
    console.error("❌ VICO: MongoDB Connection Failed", error);
    throw error;
  }
}
