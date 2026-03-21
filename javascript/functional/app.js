const express = require('express');
const mongoose = require('mongoose');
const createUserService = require('./services/user.service');
const createUserRoutes = require('./routes/user.routes');

const app = express();
app.use(express.json());

async function start() {
  await mongoose.connect('mongodb://localhost:27017/myapp');
  console.log('Connected to MongoDB');

  const userService = createUserService();

  app.use('/users', createUserRoutes(userService));

  app.listen(3001, () => {
    console.log('Functional server running at http://localhost:3001');
  });
}

start().catch(console.error);
