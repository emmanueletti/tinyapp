const users = require('../database/usersDataBase');

/**
 * Search through user database and finds the id of the user object that has the key:value passed in
 * Useful when you only know (for example) an existing email and would like to know the id of the account it belongs to
 * @param {string} key - key in user object you already know about
 * @param {string} value - value of the key you've provided
 * @returns user's id property || undefined if not found
 */
const findCorrespondingId = (key, value) => {
  for (const userKey in users) {
    if (users[userKey][key] === value) {
      return users[userKey].id;
    }
  }
  return undefined;
};

module.exports = findCorrespondingId;
