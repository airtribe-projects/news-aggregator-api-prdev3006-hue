const users = new Map();
let nextUserId = 1;

function createUser(user) {
  if (users.has(user.email)) {
    return null;
  }

  const createdUser = {
    ...user,
    id: String(nextUserId),
  };

  nextUserId += 1;
  users.set(createdUser.email, createdUser);
  return createdUser;
}

function findUserByEmail(email) {
  return users.get(email);
}

function findUserById(id) {
  return Array.from(users.values()).find((user) => user.id === id);
}

function updatePreferences(userId, preferences) {
  const user = findUserById(userId);
  if (!user) {
    return null;
  }

  user.preferences = preferences;
  return user.preferences;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updatePreferences,
};
