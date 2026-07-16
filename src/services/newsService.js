const { normalizePreferencesInput } = require('../utils/validators');

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

const fallbackArticles = [
  {
    title: 'Technology teams focus on practical AI adoption',
    description: 'Organizations are looking for useful, workflow-level AI integrations.',
    source: 'Local fallback',
    url: 'https://example.com/technology-ai-adoption',
    category: 'technology',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Entertainment releases continue to blend games, comics, and films',
    description: 'Studios are building stories across multiple formats for engaged audiences.',
    source: 'Local fallback',
    url: 'https://example.com/entertainment-crossovers',
    category: 'movies',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Developers keep improving backend API security practices',
    description: 'Token-based authentication and clear validation remain important API habits.',
    source: 'Local fallback',
    url: 'https://example.com/backend-api-security',
    category: 'software',
    publishedAt: new Date().toISOString(),
  },
];

function createNewsApiError(message) {
  const error = new Error(message);
  error.status = 502;
  return error;
}

function normalizeServicePreferences(preferences) {
  const result = normalizePreferencesInput(preferences);

  if (result.errors.length > 0) {
    const error = new Error(result.errors.join(', '));
    error.status = 400;
    throw error;
  }

  return result.value;
}

function cacheKey(preferences) {
  const categories = preferences.categories.slice().sort().join(',');
  const languages = preferences.languages.slice().sort().join(',');
  return `${categories || 'top-headlines'}|${languages || 'en'}`;
}

function normalizeGNewsArticle(article) {
  return {
    title: article.title,
    description: article.description || article.content || '',
    source: article.source ? article.source.name : 'GNews',
    url: article.url,
    image: article.image,
    publishedAt: article.publishedAt,
  };
}

async function fetchFromGNews(preferences) {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return null;
  }

  const queryText = preferences.categories.join(' OR ') || 'top news';
  const query = encodeURIComponent(queryText);
  const language = encodeURIComponent(preferences.languages[0] || 'en');
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=${language}&max=10&apikey=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw createNewsApiError(`News provider request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.articles)) {
    throw createNewsApiError('News provider returned an invalid response');
  }

  return data.articles.map((article) => normalizeGNewsArticle(article));
}

function filterFallbackArticles(preferences) {
  if (!preferences.categories.length) {
    return fallbackArticles;
  }

  const matches = fallbackArticles.filter((article) => {
    const haystack = `${article.title} ${article.description} ${article.category}`.toLowerCase();
    return preferences.categories.some((category) => haystack.includes(category.toLowerCase()));
  });

  return matches.length ? matches : fallbackArticles;
}

async function getNewsForPreferences(preferences = []) {
  const normalizedPreferences = normalizeServicePreferences(preferences);
  const key = cacheKey(normalizedPreferences);
  const cached = cache.get(key);

  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return {
      articles: cached.articles,
      source: cached.source,
      cached: true,
    };
  }

  const externalArticles = await fetchFromGNews(normalizedPreferences);

  if (externalArticles) {
    cache.set(key, {
      articles: externalArticles,
      source: 'gnews',
      createdAt: Date.now(),
    });

    return {
      articles: externalArticles,
      source: 'gnews',
      cached: false,
    };
  }

  const articles = filterFallbackArticles(normalizedPreferences);
  cache.set(key, {
    articles,
    source: 'fallback',
    createdAt: Date.now(),
  });

  return {
    articles,
    source: 'fallback',
    cached: false,
  };
}

module.exports = {
  getNewsForPreferences,
};
