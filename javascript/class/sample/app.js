const express = require('express');
const Database = require('./db');
const User = require('./db-user.js');
const app = express();
app.use(express.json());

const createApp = async () => {
  const db = new Database();
  const dbConnection = await db.connect(['users', 'orders', 'products']);

  const user = dbConnection.getCollection('users');

  app.get('/users', async (req, res) => {
    const users = await user.find().toArray();
    res.json(users);
  });
};

app.listen(3000, async () => {
  await createApp();
  console.log('Server is running on port 3000');
});
