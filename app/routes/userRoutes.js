const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const usersFilePath = path.join(__dirname, '../../data/users.json');

router.get('/profile/:id', async (req, res) => {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data).users;
    const user = users.find(u => u.id === req.params.id);
    if (!user) throw new Error('User not found');
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;