const { MongoClient } = require('mongodb');

class Database {
  constructor(uri) {
    this.client = new MongoClient(uri);
    this.db = null;
  }

  async connect(dbName) {
    await this.client.connect();
    this.db = this.client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
  }

  getCollection(name) {
    return this.db.collection(name);
  }

  async disconnect() {
    await this.client.close();
  }
}

module.exports = Database;
