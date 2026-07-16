const express = require('express');
const bcrypt = require('bcrypt');
const { authenticate, createToken } = require('../middleware/auth');
const { createUser, findUserByEmail, updatePreferences } = require('../services/userStore');
const { validateLogin, validatePreferences, validateSignup } = require('../utils/validators');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/signup', async (req, res, next) => {
  try {
    const { errors, value } = validateSignup(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    if (findUserByEmail(value.email)) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(value.password, SALT_ROUNDS);
    createUser({
      name: value.name,
      email: value.email,
      passwordHash,
      preferences: value.preferences,
    });

    return res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { errors, value } = validateLogin(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const user = findUserByEmail(value.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordsMatch = await bcrypt.compare(value.password, user.passwordHash);
    if (!passwordsMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.status(200).json({ token: createToken(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/preferences', authenticate, (req, res) => {
  const user = findUserByEmail(req.user.email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({ preferences: user.preferences });
});

router.put('/preferences', authenticate, (req, res) => {
  const { errors, value } = validatePreferences(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const preferences = updatePreferences(req.user.email, value);

  if (!preferences) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({
    message: 'Preferences updated successfully',
    preferences,
  });
});

module.exports = router;
