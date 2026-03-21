const { MongoClient } = require('mongodb');

function createDatabase(uri) {
  const client = new MongoClient(uri);
  let db = null;

  return {
    connect: async (dbName) => {
      await client.connect();
      db = client.db(dbName);
      console.log(`Connected to MongoDB: ${dbName}`);
    },

    getCollection: (name) => db.collection(name),

    disconnect: () => client.close(),
  };
}

module.exports = createDatabase;
