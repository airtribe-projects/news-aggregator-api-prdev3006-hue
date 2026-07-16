const users = new Map();

function createUser(user) {
  users.set(user.email, user);
  return user;
}

function findUserByEmail(email) {
  return users.get(email);
}

function updatePreferences(email, preferences) {
  const user = findUserByEmail(email);
  if (!user) {
    return null;
  }

  user.preferences = preferences;
  return user.preferences;
}

module.exports = {
  createUser,
  findUserByEmail,
  updatePreferences,
};
