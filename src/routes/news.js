const express = require('express');
const { authenticate } = require('../middleware/auth');
const { findUserByEmail } = require('../services/userStore');
const { getNewsForPreferences } = require('../services/newsService');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = findUserByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await getNewsForPreferences(user.preferences);

    return res.status(200).json({
      news: result.articles,
      meta: {
        preferences: user.preferences,
        source: result.source,
        cached: result.cached,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
