
/* 
[VICO ARCHITECTURE FIX] 
This file previously contained direct MongoDB connection logic.
Since MongoDB driver cannot run in the browser (missing net, tls, dns),
we switched to using API calls via fetch().
*/

/* [VICO OLD CODE]
import { connectMongo } from './connect';
export async function loadCompanies() {
  const db = await connectMongo();
  return db.collection("companies").find({}).toArray();
}
*/

/**
 * Fallback function to prevent import errors in other files.
 * In practice, data fetching is currently handled in RagService.ts via fetch().
 */
export async function loadCompanies() {
    console.warn("⚠️ VICO NOTICE: Direct DB access from frontend is disabled for security and stability.");
    return [];
}
