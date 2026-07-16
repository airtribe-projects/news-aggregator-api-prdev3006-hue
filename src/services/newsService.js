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

function cacheKey(preferences) {
  return preferences.slice().sort().join('|') || 'top-headlines';
}

function normalizeGNewsArticle(article, category) {
  return {
    title: article.title,
    description: article.description || article.content || '',
    source: article.source ? article.source.name : 'GNews',
    url: article.url,
    image: article.image,
    category,
    publishedAt: article.publishedAt,
  };
}

async function fetchFromGNews(preferences) {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return null;
  }

  const query = encodeURIComponent(preferences.join(' OR ') || 'top news');
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=10&apikey=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GNews request failed with status ${response.status}`);
  }

  const data = await response.json();
  return (data.articles || []).map((article) => normalizeGNewsArticle(article, preferences[0] || 'general'));
}

function filterFallbackArticles(preferences) {
  if (!preferences.length) {
    return fallbackArticles;
  }

  const matches = fallbackArticles.filter((article) => {
    const haystack = `${article.title} ${article.description} ${article.category}`.toLowerCase();
    return preferences.some((preference) => haystack.includes(preference.toLowerCase()));
  });

  return matches.length ? matches : fallbackArticles;
}

async function getNewsForPreferences(preferences = []) {
  const key = cacheKey(preferences);
  const cached = cache.get(key);

  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return {
      articles: cached.articles,
      source: cached.source,
      cached: true,
    };
  }

  try {
    const externalArticles = await fetchFromGNews(preferences);

    if (externalArticles && externalArticles.length > 0) {
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
  } catch (error) {
    console.warn(error.message);
  }

  const articles = filterFallbackArticles(preferences);
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
