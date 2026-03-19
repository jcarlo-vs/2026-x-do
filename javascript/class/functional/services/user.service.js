const User = require('../models/user.model');

function createUserService() {
  return {
    getAll: () => User.find(),

    getById: (id) => User.findById(id),

    create: (userData) => new User(userData).save(),

    deleteById: async (id) => {
      const result = await User.findByIdAndDelete(id);
      return result !== null;
    },
  };
}

module.exports = createUserService;
