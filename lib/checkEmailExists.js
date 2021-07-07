const users = require('./usersDataBase');

const checkEmailExists = (email) => {
  for (const userKey in users) {
    if (users[userKey].email === email) {
      return true;
    }
  }
  return false;
};

module.exports = checkEmailExists;
