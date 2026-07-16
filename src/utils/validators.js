function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizePreferences(preferences) {
  if (!Array.isArray(preferences)) {
    return null;
  }

  const normalized = [];

  for (const preference of preferences) {
    if (!isNonEmptyString(preference)) {
      return null;
    }

    normalized.push(preference.trim().toLowerCase());
  }

  return normalized;
}

function validateSignup(body) {
  const errors = [];

  if (!isNonEmptyString(body.name)) {
    errors.push('Name is required');
  }

  if (!isNonEmptyString(body.email)) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    errors.push('Email must be valid');
  }

  if (!isNonEmptyString(body.password)) {
    errors.push('Password is required');
  } else if (body.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  const preferences = normalizePreferences(body.preferences || []);
  if (!preferences) {
    errors.push('Preferences must be an array of non-empty strings');
  }

  return {
    errors,
    value: {
      name: isNonEmptyString(body.name) ? body.name.trim() : body.name,
      email: isNonEmptyString(body.email) ? body.email.trim().toLowerCase() : body.email,
      password: body.password,
      preferences: preferences || [],
    },
  };
}

function validateLogin(body) {
  const errors = [];

  if (!isNonEmptyString(body.email)) {
    errors.push('Email is required');
  }

  if (!isNonEmptyString(body.password)) {
    errors.push('Password is required');
  }

  return {
    errors,
    value: {
      email: isNonEmptyString(body.email) ? body.email.trim().toLowerCase() : body.email,
      password: body.password,
    },
  };
}

function validatePreferences(body) {
  const preferences = normalizePreferences(body.preferences);

  if (!preferences) {
    return {
      errors: ['Preferences must be an array of non-empty strings'],
      value: null,
    };
  }

  return {
    errors: [],
    value: preferences,
  };
}

module.exports = {
  validateLogin,
  validatePreferences,
  validateSignup,
};
