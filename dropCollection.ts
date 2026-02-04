import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017");

(async () => {
  try {
    const db = client.db("vico_intelligence");
    await db.collection("news").drop();
    console.log("✅ Collection 'news' dropped successfully");
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
