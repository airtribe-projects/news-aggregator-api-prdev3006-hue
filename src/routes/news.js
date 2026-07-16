const express = require('express');
const { authenticate } = require('../middleware/auth');
const { findUserById } = require('../services/userStore');
const { getNewsForPreferences } = require('../services/newsService');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (
      !user.preferences
      || !Array.isArray(user.preferences.categories)
      || user.preferences.categories.length === 0
    ) {
      return res.status(400).json({ error: 'Please set preferences before requesting news' });
    }

    const result = await getNewsForPreferences(user.preferences);

    if (!result || !Array.isArray(result.articles)) {
      return res.status(502).json({ error: 'News provider returned an invalid response' });
    }

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
