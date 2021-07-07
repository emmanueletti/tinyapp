const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const findUserId = require('./lib/findUserId');
const urlDatabase = require('./database/urlDatabase');
const users = require('./database/usersDataBase');
const generateRandomString = require('./lib/generateRandomString');
const urlsForUser = require('./lib/urlsForUser');
const checkEmailExists = require('./lib/checkEmailExists');
const userIdAuthentication = require('./lib/userIdAuthentication');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

/* MIDDLE WARE */
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ROUTES */

// Homepage GET /
app.get('/', (req, res) => {
  res.redirect('/login');
});

/* CORE B.R.E.A.D / C.R.U.D FUNCTIONALITY */

// Browse Feature - gets all the urls of a user - GET /urls
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];

  /// authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // filter urls to just the ones belonging to userID
  const templateVars = {
    userID,
    urls: urlsForUser(userID),
  };

  return res.render('urls_index', templateVars);
});

// Form to Add new URL - important to be above GET /urls/:shortURL - GET /urls/new
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];

  // authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  return res.render('urls_new.ejs', { userID });
});

// Read Feature - gets the detailed info of a specific shortURL - GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const shortURL = req.params.shortURL;

  // authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // check if requested short link is in database
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('<h2> This link does not exist </h2>');
  }

  // check if user cookie id matches the user id of the requested short link
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send('<h2> You do not own this link </h2>');
  }

  const templateVars = {
    shortURL,
    userID,
    longURL: urlDatabase[shortURL].longURL,
  };

  return res.render('urls_show.ejs', templateVars);
});

// Edit Feature - updatea the longURL of a specific shortURL - POST /urls/:shortURL/update
app.post('/urls/:shortURL/update', (req, res) => {
  const userID = req.cookies['user_id'];
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;

  // authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // check if request is accessing shortlink with user id that matches user_id cookie
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send('<h2> Cannot Edit: You do not own this link </h2>');
  }

  // change the longURL property of the shortURL object
  urlDatabase[shortURL].longURL = longURL;

  // POST => GET => Redirect pattern
  // send user to urls
  return res.redirect('/urls');
});

// Add Feature - create a new shortURL - POST /urls
app.post('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  // authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // create new URL in database
  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
});

// Delete Feature - deletes a shortURL from database - POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.cookies['user_id'];
  const shortURL = req.params.shortURL;

  // authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // check if request is accessing shortlink with user id that matches user_id cookie
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send('<h2> Cannot Edit: You do not own this link </h2>');
  }

  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

// Functionality - visiting a site using the shortlink - GET /u/:shortURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  // check if link exists
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('<h2>Error: link does not exist</h2');
  }

  res.redirect(`${longURL}`);
});

// Functionality - clearing cookies - POST /logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id').redirect('/login');
});

// Functionality - get the registeration form - GET /register
app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];

  // check if user is stil l logged in
  if (userID) {
    res.status(400).send('<h1> Please Log out first </h2>');
  }

  res.render('urls_register', { userID });
});

// Functionality - create new account - POST /register
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();

  // check that valid email and passwords have been sent
  if (!email || !password) {
    return res.status(400).send('<h2> Please provide a valid email and password </h2');
  }

  // check if email already exists
  if (checkEmailExists(email)) {
    return res.status(400).send('<h2> Account already exists </h2>');
  }

  // create new user in database
  // naming "id" instead of "userID" to use destructuring
  users[id] = { id, email, password };

  // set cookie and redirect
  res.cookie('user_id', id).redirect('/urls');
});

// Functionality - get login form - GET /login
app.get('/login', (req, res) => {
  const userID = req.cookies['user_id'];

  // check if user is already logged in
  if (userID) {
    res.redirect('/urls');
  }

  res.render('urls_login', { userID });
});

// Funcitonality - "login" by adding cookie user_id - POST /login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check that valid email and passwords have been sent
  if (!email || !password) {
    return res.status(400).send('<h2> Please provide a valid email and password </h2');
  }

  // check if account exists
  if (!checkEmailExists(email)) {
    return res.status(403).send('<h2> Email does not exist </h2>');
  }

  const userID = findUserId(users, 'email', email);

  // check if password is correct
  if (users[userID].password !== password) {
    return res.status(403).send('<h2> Password is incorrrect </h2>');
  }

  // set cookie and redirect to /url
  return res.cookie('user_id', userID).redirect('/urls');
});

// turn on server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
