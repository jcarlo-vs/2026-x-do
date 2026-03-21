const { MongoClient } = require('mongodb');

class Database {
  constructor(uri = 'mongodb://localhost:27017', dbName = 'myapp') {
    this.uri = uri;
    this.dbName = dbName;
    this.client = new MongoClient(this.uri);
    this.db = null;
    this.collections = {};
    console.log('Connecting Database');
  }

  async connect(collectionNames = []) {
    await this.client.connect();
    this.db = this.client.db(this.dbName);

    for (const name of collectionNames) {
      this.collections[name] = this.db.collection(name);
    }

    console.log('Database Connected');
    return this;
  }

  getCollection(name) {
    if (!this.collections[name]) {
      throw new Error(
        `Collection "${name}" not registered. Pass it in connect().`,
      );
    }
    return this.collections[name];
  }

  logCollections() {
    console.log('Registered Collections:', this.collections);
  }

  async disconnect() {
    await this.client.close();
    console.log('Database Disconnected');
  }
}

module.exports = Database;
