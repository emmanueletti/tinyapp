const express = require('express');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const { urlDatabase, users } = require('./database');
const { getUserByEmail, generateRandomString, urlsForUser, checkEmailExists, userIdAuthentication } = require('./helpers');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

/* MIDDLE WARE */
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1'],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

/* ROUTES */

// Root - GET /
app.get('/', (req, res) => {
  res.redirect('/login');
});

/* CORE B.R.E.A.D / C.R.U.D FUNCTIONALITY */

// BROWSE FEATURE - gets all the urls of a user - GET /urls
app.get('/urls', (req, res) => {
  const userID = req.session['user_id'];

  // authenticate presense of, or validity of, user_id from obtained from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // filter urls to just the ones belonging to userID
  const templateVars = {
    userID,
    urls: urlsForUser(urlDatabase, userID),
  };

  return res.render('urls_index', templateVars);
});

// FUNCTIONALITY - get Form to Add new URL - GET /urls/new
// important for this route to be above GET /urls/:shortURL
app.get('/urls/new', (req, res) => {
  const userID = req.session['user_id'];

  // check if user is not logged in
  if (!userID) {
    return res.redirect('/login');
  }

  return res.render('urls_new.ejs', { userID });
});

// READ FEATURE - gets the detailed info of a specific shortURL - GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session['user_id'];
  const shortURL = req.params.shortURL;

  // authenticate presense of, or validity of, user_id from obtained from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // check if requested short link is in database
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('<h2> ERROR: This link does not exist </h2>');
  }

  // check if user cookie id does not match the user id of the requested short link
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send('<h2> ERROR: You do not own this link </h2>');
  }

  const templateVars = {
    shortURL,
    userID,
    longURL: urlDatabase[shortURL].longURL,
  };

  return res.render('urls_show.ejs', templateVars);
});

// EDIT FEATURE - update the longURL of a specific shortURL - POST /urls/:shortURL/update
app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session['user_id'];
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;

  // authenticate presense of, or validity of, user_id from obtained from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // check if request is accessing shortlink with user id that does not matches user_id cookie
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send('<h2> ERROR: Cannot Edit - You do not own this link </h2>');
  }

  // change the longURL property of the shortURL object
  urlDatabase[shortURL].longURL = longURL;

  // POST => GET => Redirect pattern
  // send user to urls
  return res.redirect('/urls');
});

// ADD FEATURE - create a new shortURL - POST /urls
app.post('/urls', (req, res) => {
  const userID = req.session['user_id'];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  // authenticate presense of, or validity of, user_id from obtained from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // create new URL in database
  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
});

// DELETE FEATURE - deletes a shortURL from database - POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session['user_id'];
  const shortURL = req.params.shortURL;

  // authenticate presense of, or validity of, user_id from obtained from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // check if request is accessing shortlink with user id that does not matches user_id cookie
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send('<h2> ERROR: Cannot Edit - You do not own this link </h2>');
  }

  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

// FUNCTIONALITY - visiting a site using the shortlink - GET /u/:shortURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  // check if link exists does not exist
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('<h2> ERROR: link does not exist </h2');
  }

  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(`${longURL}`);
});

// FUNCTIONALITY - clearing cookies - POST /logout
app.post('/logout', (req, res) => {
  // destroy cookie session
  req.session = null;

  // redirect to login page
  res.redirect('/urls');
});

// FUNCTIONALITY - get the registeration form - GET /register
app.get('/register', (req, res) => {
  const userID = req.session['user_id'];

  // check if user is stil l logged in
  if (userID) {
    res.redirect('/urls');
  }

  res.render('urls_register', { userID });
});

// FUNCTIONALITY - create new account - POST /register
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();

  // check if invalid email and passwords have been sent
  if (!email || !password) {
    return res.status(400).send('<h2> ERROR: Please provide a valid email and password </h2');
  }

  // check if email already exists in database
  if (checkEmailExists(users, email)) {
    return res.status(400).send('<h2> ERROR: Account already exists </h2>');
  }

  // create new user in database
  // naming "id" instead of "userID" to use destructuring
  users[id] = { id, email, hashedPassword };

  // set secure cookie
  req.session['user_id'] = id;

  // redirect to /urls
  res.redirect('/urls');
});

// FUNCTIONALITY - get login form - GET /login
app.get('/login', (req, res) => {
  const userID = req.session['user_id'];

  // check if user is already logged in
  if (userID) {
    res.redirect('/urls');
  }

  res.render('urls_login', { userID });
});

// FUNCTIONALITY - "login" by adding cookie user_id - POST /login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check if invalid email and passwords have been sent
  if (!email || !password) {
    return res.status(400).send('<h2> Please provide a valid email and password </h2');
  }

  // check if email does not exist in database
  if (!checkEmailExists(users, email)) {
    return res.status(403).send('<h2> ERROR: Email does not exist </h2>');
  }

  const user = getUserByEmail(email, users);
  const userID = user.id;
  const hashedPassword = users[userID].hashedPassword;

  // check if password is incorrect
  if (!bcrypt.compareSync(password, hashedPassword)) {
    return res.status(403).send('<h2> ERROR: Password is incorrrect </h2>');
  }

  // set secure session in req object
  req.session['user_id'] = userID;

  // redirect to /url
  return res.redirect('/urls');
});

// turn on server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
