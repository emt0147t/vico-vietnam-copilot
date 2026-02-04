import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017");

(async () => {
  try {
    const db = client.db("vico_intelligence");
    await db.dropDatabase();
    console.log("✅ Database 'vico_intelligence' dropped successfully");
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
