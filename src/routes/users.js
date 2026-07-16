const express = require('express');
const bcrypt = require('bcrypt');
const { authenticate, createToken } = require('../middleware/auth');
const {
  createUser,
  findUserByEmail,
  findUserById,
  updatePreferences,
} = require('../services/userStore');
const { validateLogin, validatePreferences, validateSignup } = require('../utils/validators');

const router = express.Router();
const SALT_ROUNDS = 10;

async function registerUser(req, res, next) {
  try {
    const { errors, value } = validateSignup(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    if (findUserByEmail(value.email)) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(value.password, SALT_ROUNDS);
    const createdUser = createUser({
      name: value.name,
      email: value.email,
      passwordHash,
      preferences: value.preferences,
    });

    if (!createdUser) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        preferences: createdUser.preferences,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function loginUser(req, res, next) {
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
}

function getPreferences(req, res, next) {
  try {
    const user = findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ preferences: user.preferences });
  } catch (error) {
    return next(error);
  }
}

function replacePreferences(req, res, next) {
  try {
    const { errors, value } = validatePreferences(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const preferences = updatePreferences(req.user.id, value);

    if (!preferences) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'Preferences updated successfully',
      preferences,
    });
  } catch (error) {
    return next(error);
  }
}

router.post('/register', registerUser);
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, replacePreferences);

module.exports = router;
