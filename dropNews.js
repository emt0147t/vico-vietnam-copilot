const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");
(async () => {
  try {
    const db = client.db("vico_intelligence");
    const result = await db.collection("news").deleteMany({});
    console.log("Deleted " + result.deletedCount + " documents");
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
