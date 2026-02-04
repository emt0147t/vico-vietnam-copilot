import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017");

(async () => {
  try {
    const db = client.db("vico_intelligence");
    const collection = db.collection("news");
    
    // Drop all indexes except the default _id index
    await collection.dropIndexes();
    console.log("✅ All indexes dropped");
    
    // Delete all documents
    const result = await collection.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} documents`);
    
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
