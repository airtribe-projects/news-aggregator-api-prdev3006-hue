function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeStringArray(values, fieldName, errors) {
  if (!Array.isArray(values)) {
    errors.push(`${fieldName} must be an array of non-empty strings`);
    return null;
  }

  const normalized = [];

  for (const value of values) {
    if (!isNonEmptyString(value)) {
      errors.push(`${fieldName} must contain only non-empty strings`);
      return null;
    }

    normalized.push(value.trim().toLowerCase());
  }

  return normalized;
}

function normalizePreferencesInput(input, options = {}) {
  const errors = [];

  if (input === undefined) {
    if (options.allowOmitted) {
      return {
        errors,
        value: {
          categories: [],
          languages: ['en'],
        },
      };
    }

    return {
      errors: ['Preferences are required'],
      value: null,
    };
  }

  if (Array.isArray(input)) {
    const categories = normalizeStringArray(input, 'Preferences', errors);

    return {
      errors,
      value: errors.length ? null : { categories, languages: ['en'] },
    };
  }

  if (!input || typeof input !== 'object') {
    return {
      errors: ['Preferences must be an object with categories and languages'],
      value: null,
    };
  }

  const categoriesInput = input.categories === undefined ? [] : input.categories;
  const languageInput = input.languages !== undefined
    ? input.languages
    : input.language !== undefined
      ? [input.language]
      : ['en'];
  const categories = normalizeStringArray(categoriesInput, 'Categories', errors);
  const languages = normalizeStringArray(languageInput, 'Languages', errors);

  return {
    errors,
    value: errors.length ? null : { categories, languages },
  };
}

function validateSignup(body) {
  const errors = [];

  if (!isNonEmptyString(body.name)) {
    errors.push('Name is required');
  }

  if (!isNonEmptyString(body.email)) {
    errors.push('Email is required');
  } else if (!isValidEmail(body.email.trim())) {
    errors.push('Email must be valid');
  }

  if (!isNonEmptyString(body.password)) {
    errors.push('Password is required');
  } else if (body.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  const preferencesResult = normalizePreferencesInput(body.preferences, { allowOmitted: true });
  errors.push(...preferencesResult.errors);

  return {
    errors,
    value: {
      name: isNonEmptyString(body.name) ? body.name.trim() : body.name,
      email: isNonEmptyString(body.email) ? body.email.trim().toLowerCase() : body.email,
      password: body.password,
      preferences: preferencesResult.value,
    },
  };
}

function validateLogin(body) {
  const errors = [];

  if (!isNonEmptyString(body.email)) {
    errors.push('Email is required');
  } else if (!isValidEmail(body.email.trim())) {
    errors.push('Email must be valid');
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
  const preferencesInput = body.preferences !== undefined ? body.preferences : body;
  const preferences = normalizePreferencesInput(preferencesInput);

  if (preferences.errors.length > 0) {
    return {
      errors: preferences.errors,
      value: null,
    };
  }

  return {
    errors: [],
    value: preferences.value,
  };
}

module.exports = {
  normalizePreferencesInput,
  validateLogin,
  validatePreferences,
  validateSignup,
};
