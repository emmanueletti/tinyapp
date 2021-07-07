const urlDatabase = require('./urlDatabase');

// filter url database
/**
 * When passed in a user id, function will filter url database to just the url child objects with matching userID
 * @param {string} id - the unique string id of a user
 * @returns object
 */
const urlsForUser = (id) => {
  const filteredDataBase = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      filteredDataBase[key] = urlDatabase[key];
    }
  }
  return filteredDataBase;
};

module.exports = urlsForUser;
