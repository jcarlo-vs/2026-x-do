const { Router } = require('express');

function createUserRoutes(userService) {
  const router = Router();

  router.get('/', async (req, res) => {
    const users = await userService.getAll();
    res.json(users);
  });

  router.get('/:id', async (req, res) => {
    const user = await userService.getById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  });

  router.post('/', async (req, res) => {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  });

  router.delete('/:id', async (req, res) => {
    const deleted = await userService.deleteById(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  });

  return router;
}

module.exports = createUserRoutes;
