// Authorized Users Configuration
// Access levels:
// 0 - Full access (chenzorama)
// 1 - Sounder access
// 2 - Limited access
// 3+ - No access

export const authorizedUsers = [
  {
    user: 'chenzorama',
    level: 0,
  },
  {
    user: 'lyesm1th',
    level: 1,
  },
];

// Helper function to get user access level
export const getUserAccessLevel = (username) => {
  const user = authorizedUsers.find((u) => u.user.toLowerCase() === username.toLowerCase());
  return user ? user.level : 3; // Default to level 3 (no access) if user not found
};

// Helper function to check if user has sounder access
export const hasSounderAccess = (username) => {
  const level = getUserAccessLevel(username);
  return level <= 1; // Level 0 and 1 have sounder access
};

// Helper function to check if user has full access
export const hasFullAccess = (username) => {
  const level = getUserAccessLevel(username);
  return level === 0;
};
