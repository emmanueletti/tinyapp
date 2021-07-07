/**
 * Function use used within a HTTP route in express to send out HTTP 401 error status and message based on lack of user_id cookie and the user_id cookie not matching what is in database
 * @param {object} database - the user database object
 * @param {string} userID - the user id string
 * @param {object} response - the HTTP response object
 * @returns returns the command for express route to send a 401 status and message or returns null if non of the conditionals evaluate
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

module.exports = userIdAuthentication;
