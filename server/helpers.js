/**
 * Function searches through user database and finds the id of the user object that has the matching email passed in.
 * @param {string} email - user's email
 * @param {object} database - database object
 * @returns user's id || "null" if not found
 */
const getUserByEmail = (email, database) => {
  for (const userKey in database) {
    if (database[userKey].email === email) {
      return database[userKey];
    }
  }
  return undefined;
};

/**
 * Function generates a random string of 6 chars
 * @returns returns a random string of 6 chars
 */
const generateRandomString = () => {
  let output = '';
  // generate 6 random value betweena ascii a(65) and z(122)
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * (122 - 97) + 97);
    output += String.fromCharCode(randomNum);
  }
  return output;
};

/**
 * When passed in a user id, function will filter url database to just the url child objects with  matching userID
 * @param {object} database - databse object
 * @param {string} id - the unique string id of a user
 * @returns object
 */
const urlsForUser = (database, id) => {
  const filteredDataBase = {};
  for (const key in database) {
    if (database[key].userID === id) {
      filteredDataBase[key] = database[key];
    }
  }
  return filteredDataBase;
};

/**
 * Function checks passed database for any user objects with the email string passed in as a variable
 * @param {object} database
 * @param {string} email
 * @returns returns true if email is found in the database or false if email is not found
 */
const checkEmailExists = (database, email) => {
  for (const userKey in database) {
    if (database[userKey].email === email) {
      return true;
    }
  }
  return false;
};

/**
 * Function use used within a HTTP route in express to send out HTTP 401 error status and message based on lack of user_id cookie and the user_id cookie not matching what is in database
 * @param {object} database - the user database object
 * @param {string} userID - the user id string
 * @param {object} response - the HTTP response object
 * @returns returns the command for express route to send a 401 status and message or returns null if none of the conditionals evaluate
 */
const userIdAuthentication = (database, userID, response) => {
  // check if userID is a truthy value
  if (!userID) {
    return response.status(401).send('<h2> Please Log In </h2>');
  }

  // check if userID can be found in the database
  if (!database[userID]) {
    return response.status(401).send('<h2> Unknown User ID: Please Log In </h2>');
  }

  return null;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, checkEmailExists, userIdAuthentication };
