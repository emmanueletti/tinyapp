const users = require('../database/usersDataBase');

/**
 * Function searches through user database and finds the id of the user object that has the matching key:value passed in. Useful when a unique user idntifier is known, such as email, and oyu would like to know the coresponding id of the user with that email
 * @param {object} database - database object
 * @param {string} key - the known key string
 * @param {string} value - the known value of the key string
 * @returns user's id property || "null" if not found
 */
const findUserId = (database, key, value) => {
  for (const userKey in database) {
    if (database[userKey][key] === value) {
      return database[userKey].id;
    }
  }
  return null;
};

module.exports = findUserId;
