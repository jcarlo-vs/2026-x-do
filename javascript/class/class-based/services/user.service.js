const User = require('../models/user.model');

class UserService {
  async getAll() {
    return User.find();
  }

  async getById(id) {
    return User.findById(id);
  }

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async deleteById(id) {
    const result = await User.findByIdAndDelete(id);
    return result !== null;
  }
}

module.exports = UserService;
