
// [VICO NEW ARCHITECTURE]
// This file is only allowed to run in Node.js environment (Server)
// The 'mongodb' library will crash if run in the browser.

import { MongoClient, Db } from 'mongodb';

// [VICO OLD CODE] - Passwords should not be exposed in code
/* 
const MONGO_URI = 'mongodb+srv://thinv04012003_db_user:Thi04012003@cluster0.7rhap1z.mongodb.net/?appName=Cluster0';
*/

// [VICO SECURITY FIX] - Prioritize loading from environment variables
const MONGO_URI = process.env.MONGO_URI || 'Please configure MONGO_URI in .env';
const DB_NAME = 'vico-db';

let db: Db;

export async function connectMongo(): Promise<Db> {
  // Check if running in browser
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
