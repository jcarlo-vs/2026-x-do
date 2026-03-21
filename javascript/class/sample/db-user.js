class User {
  dbConnection;
  constructor(dbConnection) {
    this.dbConnection = dbConnection;
  }

  getAllUsers() {
    return this.dbConnection.collection('users').find().toArray();
  }
}

module.exports = User;
